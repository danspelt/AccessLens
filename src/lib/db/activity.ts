import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db/mongoClient';
import { Activity, ActivityType } from '@/models/Activity';

export async function logActivity(input: {
  userId: string;
  type: ActivityType;
  entityType: Activity['entityType'];
  entityId: string;
  message: string;
  metadata?: Activity['metadata'];
}) {
  const activities = await getCollection<Activity>('activities');
  await activities.insertOne({
    userId: new ObjectId(input.userId),
    type: input.type,
    entityType: input.entityType,
    entityId: new ObjectId(input.entityId),
    message: input.message,
    metadata: input.metadata,
    createdAt: new Date(),
  } as unknown as Activity);
}

