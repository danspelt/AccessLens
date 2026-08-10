import Image from 'next/image';
import { Suspense } from 'react';
import { isGoogleAuthConfigured, isResendAuthConfigured } from '@/lib/auth/providers';
import { SignInForm } from '@/components/auth/SignInForm';
import { AuthCanvas } from '@/components/auth/AuthCanvas';

export default function SignInPage() {
  const googleEnabled = isGoogleAuthConfigured();
  const resendEnabled = isResendAuthConfigured();

  return (
    <AuthCanvas className="items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="motion-safe:animate-fade-up w-full max-w-md">
        <div className="mb-8 text-center">
          <Image
            src="/icon.png"
            alt=""
            width={56}
            height={56}
            className="mx-auto mb-4 h-14 w-14 rounded-2xl shadow-btn-primary ring-2 ring-white/30"
            priority
          />
          <p className="font-display text-sm font-semibold tracking-[0.18em] text-primary-200 uppercase">
            AccessLens
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white drop-shadow-sm sm:text-4xl">
            Welcome back
          </h1>
          <p className="mt-2 text-slate-200/90 drop-shadow-sm">
            Sign in with your AccessLens email and password
          </p>
        </div>
        <div className="rounded-2xl border border-white/40 bg-gradient-to-b from-white to-slate-50 p-8 shadow-sheet ring-1 ring-white/50 backdrop-blur-md motion-safe:animate-fade-up [animation-delay:80ms]">
          <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-slate-100" />}>
            <SignInForm googleEnabled={googleEnabled} resendEnabled={resendEnabled} />
          </Suspense>
        </div>
      </div>
    </AuthCanvas>
  );
}
