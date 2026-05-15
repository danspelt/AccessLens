import { ObjectId } from 'mongodb';
import { auth } from '@/auth';
import { getCollection } from '@/lib/db/mongoClient';
import { User } from '@/models/User';

export async function requireAdmin(): Promise<
  { ok: true; user: User } | { ok: false; status: number; error: string }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, status: 401, error: 'Authentication required' };
  }

  const usersCollection = await getCollection<User>('users');
  const user = await usersCollection.findOne({ _id: new ObjectId(session.user.id) });
  if (!user || user.role !== 'admin') {
    return { ok: false, status: 403, error: 'Admin access required' };
  }

  return { ok: true, user };
}
