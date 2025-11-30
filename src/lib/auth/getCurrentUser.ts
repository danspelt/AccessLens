import { getSession } from './session';
import { getCollection } from '../db/mongoClient';
import { User } from '@/models/User';
import { ObjectId } from 'mongodb';

/**
 * Get the current authenticated user from session
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  
  if (!session.userId) {
    return null;
  }

  try {
    const usersCollection = await getCollection<User>('users');
    const user = await usersCollection.findOne({ _id: new ObjectId(session.userId) });
    return user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

