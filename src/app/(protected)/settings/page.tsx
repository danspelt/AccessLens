import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { getCollection } from '@/lib/db/mongoClient';
import { User } from '@/models/User';
import SettingsClient from './settingsClient';

export const metadata: Metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const usersCollection = await getCollection<User>('users');
  const fresh = await usersCollection.findOne({ _id: user._id });

  const prefs = {
    theme: fresh?.theme || 'system',
    accentColor: fresh?.accentColor || '#0284c7',
    fontScale: fresh?.fontScale || 'md',
    highContrast: fresh?.highContrast ?? false,
    reduceMotion: fresh?.reduceMotion ?? false,
    dyslexiaFont: fresh?.dyslexiaFont ?? false,
    contentDensity: fresh?.contentDensity ?? 'comfortable',
    lineHeight: fresh?.lineHeight ?? 'normal',
    units: fresh?.units ?? 'metric',
    mapAutoLoad: fresh?.mapAutoLoad ?? true,
    profileVisibility: fresh?.profileVisibility ?? 'public',
    emailNotifications: fresh?.emailNotifications ?? false,
  };

  return <SettingsClient initial={prefs} />;
}

