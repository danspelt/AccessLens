import Image from 'next/image';
import { Suspense } from 'react';
import { isGoogleAuthConfigured, isResendAuthConfigured } from '@/lib/auth/providers';
import { SignInForm } from '@/components/auth/SignInForm';

export default function SignInPage() {
  const googleEnabled = isGoogleAuthConfigured();
  const resendEnabled = isResendAuthConfigured();

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] w-full items-center justify-center overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
      <div
        className="absolute inset-0 z-0 bg-gradient-to-br from-primary-800 via-primary-900 to-slate-950"
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <Image
            src="/icon.png"
            alt=""
            width={56}
            height={56}
            className="mx-auto mb-4 h-14 w-14 rounded-2xl shadow-btn-primary ring-2 ring-white/30"
            priority
          />
          <h1 className="font-display text-3xl font-bold tracking-tight text-white drop-shadow-sm">Welcome back</h1>
          <p className="mt-2 text-slate-100 drop-shadow-sm">Sign in with your AccessLens email and password</p>
        </div>
        <div className="rounded-2xl border border-white/30 bg-white/95 p-8 shadow-card ring-1 ring-white/50 backdrop-blur-md">
          <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-slate-100" />}>
            <SignInForm googleEnabled={googleEnabled} resendEnabled={resendEnabled} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
