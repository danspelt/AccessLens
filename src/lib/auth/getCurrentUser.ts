import { auth } from '@/auth';
import { getCollection } from '../db/mongoClient';
import { User } from '@/models/User';
import { ObjectId } from 'mongodb';

export async function getCurrentUser(): Promise<User | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  try {
    const usersCollection = await getCollection<User>('users');
    const user = await usersCollection.findOne({
      _id: new ObjectId(session.user.id),
    });
    return user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}
