import { Suspense } from 'react';
import { isGoogleAuthConfigured } from '@/lib/auth/providers';
import { SignupClient } from './SignupClient';

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-4rem)] bg-slate-50" />}>
      <SignupClient googleEnabled={isGoogleAuthConfigured()} />
    </Suspense>
  );
}
