export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { getCollection } from '@/lib/db/mongoClient';
import { User } from '@/models/User';
import { SSO_PROVIDER_ID, isSsoConfigured, ssoDisplayName } from '@/lib/auth/sso';
import SettingsClient from './settingsClient';
import { ConnectedAccountCard } from './ConnectedAccountCard';

export const metadata: Metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/signin');

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

  if (!isSsoConfigured()) return <SettingsClient initial={prefs} />;

  const accounts = await getCollection('accounts');
  const ssoLinked = Boolean(await accounts.findOne({ userId: user._id, provider: SSO_PROVIDER_ID }));

  return (
    <div className="space-y-4">
      <SettingsClient initial={prefs} />
      <ConnectedAccountCard ssoName={ssoDisplayName()} linked={ssoLinked} />
    </div>
  );
}

