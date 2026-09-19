import { describe, expect, it } from 'vitest';
import { buildPlaceUpdateEmail, deliverWithoutLosingNotification, meaningfulPlaceChanges, updateEmailEnabled } from './placeUpdates';

describe('meaningfulPlaceChanges', () => {
  it('includes public accessibility changes', () => {
    expect(meaningfulPlaceChanges({ name: 'Library', checklist: { elevator: false } }, { checklist: { elevator: true } })).toEqual(['checklist']);
  });

  it('ignores identical values and routine metadata', () => {
    expect(meaningfulPlaceChanges({ name: 'Library' }, { name: 'Library', updatedAt: new Date(), viewCount: 8 })).toEqual([]);
  });

  it('does not include private or moderation-only fields', () => {
    expect(meaningfulPlaceChanges({}, { businessContact: { email: 'private@example.com' }, accessCode: 'secret', moderationNotes: 'private' })).toEqual([]);
  });
});

describe('email preference and durability', () => {
  it('requires explicit opt-in independently of in-app notification creation', () => {
    expect(updateEmailEnabled({ email: 'user@example.com', emailNotifications: true })).toBe(true);
    expect(updateEmailEnabled({ email: 'user@example.com', emailNotifications: false })).toBe(false);
    expect(updateEmailEnabled({ email: '', emailNotifications: true })).toBe(false);
  });

  it('records delivery failure instead of throwing away the durable notification', async () => {
    const statuses: string[] = [];
    await deliverWithoutLosingNotification(
      { to: 'user@example.com', subject: 'Update', text: 'Safe copy' },
      async () => { throw new Error('provider unavailable'); },
      async (status, error) => { statuses.push(`${status}:${error}`); }
    );
    expect(statuses).toEqual(['failed:provider unavailable']);
  });
});

describe('buildPlaceUpdateEmail', () => {
  it('contains only privacy-safe public copy', () => {
    const email = buildPlaceUpdateEmail({ name: 'Central Library' }, 'follower@example.com');
    expect(email).toEqual({
      to: 'follower@example.com',
      subject: 'Central Library accessibility information was updated',
      text: "Central Library's public accessibility information changed. View the latest details in AccessLens.",
    });
    expect(JSON.stringify(email)).not.toMatch(/accessCode|moderation|businessContact/i);
  });
});
