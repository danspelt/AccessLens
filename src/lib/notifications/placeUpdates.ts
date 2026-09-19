import { ObjectId } from 'mongodb';
import { Resend } from 'resend';
import { getCollection } from '@/lib/db/mongoClient';
import type { Follow } from '@/models/Follow';
import type { Notification } from '@/models/Notification';
import type { Place } from '@/models/Place';
import type { User } from '@/models/User';

export const MEANINGFUL_PLACE_FIELDS = [
  'name', 'category', 'address', 'city', 'province', 'description', 'website', 'phone',
  'checklist', 'accessibilityScore', 'accessibilityNotes', 'photoUrls', 'accessibilityProfile',
  'verificationLevel', 'partnerLabel', 'status',
] as const;

export function meaningfulPlaceChanges(before: Partial<Place>, update: Record<string, unknown>): string[] {
  return MEANINGFUL_PLACE_FIELDS.filter((field) => {
    if (!(field in update)) return false;
    return JSON.stringify(before[field]) !== JSON.stringify(update[field]);
  });
}

export interface EmailMessage { to: string; subject: string; text: string }
export type EmailSender = (message: EmailMessage) => Promise<void>;

export function buildPlaceUpdateEmail(place: Pick<Place, 'name'>, to: string): EmailMessage {
  return {
    to,
    subject: `${place.name} accessibility information was updated`,
    text: `${place.name}'s public accessibility information changed. View the latest details in AccessLens.`,
  };
}

export function updateEmailEnabled(user: Pick<User, 'email' | 'emailNotifications'>): boolean {
  return user.emailNotifications === true && Boolean(user.email);
}

export async function deliverWithoutLosingNotification(
  message: EmailMessage,
  sendEmail: EmailSender,
  recordStatus: (status: 'sent' | 'failed', error?: string) => Promise<void>
): Promise<void> {
  try {
    await sendEmail(message);
    await recordStatus('sent');
  } catch (error) {
    await recordStatus('failed', error instanceof Error ? error.message.slice(0, 200) : 'Delivery failed');
  }
}

export async function resendEmail(message: EmailMessage): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'AccessLens <noreply@localhost>',
    ...message,
  });
  if (result.error) throw new Error(result.error.message);
}

export async function notifyPlaceFollowers({
  place, actorUserId, changedFields, sendEmail = resendEmail,
}: {
  place: Pick<Place, '_id' | 'name'>;
  actorUserId: ObjectId;
  changedFields: string[];
  sendEmail?: EmailSender;
}): Promise<number> {
  if (changedFields.length === 0) return 0;
  const follows = await getCollection<Follow>('follows');
  const notifications = await getCollection<Notification>('notifications');
  const users = await getCollection<User>('users');
  const followers = await follows.find({ entityType: 'place', entityId: place._id, userId: { $ne: actorUserId } }).toArray();
  if (followers.length === 0) return 0;
  const followerUsers = await users.find(
    { _id: { $in: followers.map((follow) => follow.userId) } },
    { projection: { email: 1, emailNotifications: 1 } }
  ).toArray();
  const usersById = new Map(followerUsers.map((user) => [user._id.toString(), user]));
  const now = new Date();
  const bucket = now.toISOString().slice(0, 16);
  let created = 0;
  for (const follow of followers) {
    const user = usersById.get(follow.userId.toString());
    if (!user) continue;
    const dedupeKey = `place:${place._id}:updated:${bucket}:${follow.userId}`;
    const emailRequested = updateEmailEnabled(user);
    const insert = await notifications.updateOne(
      { dedupeKey },
      { $setOnInsert: {
        userId: follow.userId, type: 'place_updated', entityType: 'place', entityId: place._id,
        title: `${place.name} was updated`,
        message: 'Public accessibility information for this place has changed.',
        href: `/places/${place._id}`, dedupeKey, readAt: null,
        emailStatus: emailRequested ? 'pending' : 'not_requested', createdAt: now,
      } },
      { upsert: true }
    );
    if (!insert.upsertedCount) continue;
    created += 1;
    if (emailRequested) {
      await deliverWithoutLosingNotification(buildPlaceUpdateEmail(place, user.email), sendEmail, async (status, error) => {
        await notifications.updateOne({ dedupeKey }, { $set: { emailStatus: status, ...(error ? { emailError: error } : {}) } });
      });
    }
  }
  return created;
}
