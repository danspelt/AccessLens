import type { Metadata } from 'next';
import { Suspense } from 'react';
import { isGoogleAuthConfigured } from '@/lib/auth/providers';
import { SignupClient } from './SignupClient';

export const metadata: Metadata = { title: 'Create an account' };

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-4rem)] bg-auth-canvas" />}>
      <SignupClient googleEnabled={isGoogleAuthConfigured()} />
    </Suspense>
  );
}
