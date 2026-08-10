'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import {
  Eye,
  EyeOff,
  Users,
  Building2,
  Check,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Alert } from '@/components/ui/Alert';
import { AuthCanvas } from '@/components/auth/AuthCanvas';
import type { AccountType } from '@/models/User';
import { SIGNUP_INTENT_STORAGE_KEY } from '@/lib/signupIntent';

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function SignupClient({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [step, setStep] = useState<1 | 2>(1);
  const [accountType, setAccountType] = useState<AccountType | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function selectType(type: AccountType) {
    setAccountType(type);
    setStep(2);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accountType) return;
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, accountType }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Sign up failed.');
        return;
      }

      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError('Account created but sign-in failed. Please sign in with your new password.');
        router.push(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        return;
      }
      router.push(result.url || callbackUrl);
      router.refresh();
    } catch {
      setError('Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle(intent: AccountType) {
    setGoogleLoading(true);
    setError(null);
    try {
      if (typeof window !== 'undefined') {
        if (intent === 'business') {
          sessionStorage.setItem(SIGNUP_INTENT_STORAGE_KEY, 'business');
        } else {
          sessionStorage.removeItem(SIGNUP_INTENT_STORAGE_KEY);
        }
      }
      await signIn('google', { callbackUrl: '/signup/oauth-complete' });
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <AuthCanvas>
      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-12 px-5 py-12 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-10 lg:py-16 xl:max-w-[90rem]">
        <div className="order-2 motion-safe:animate-fade-up lg:order-1">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/25 bg-gradient-to-br from-primary-500/40 via-primary-700/50 to-slate-950/80 p-10 shadow-sheet ring-1 ring-white/20 backdrop-blur-md">
            <Image
              src="/icon.png"
              alt=""
              width={96}
              height={96}
              className="h-24 w-24 rounded-3xl shadow-btn-primary ring-2 ring-white/30"
              priority
            />
            <p className="mt-6 font-display text-2xl font-bold text-white">
              Map accessibility together
            </p>
            <p className="mt-2 text-primary-100/95">
              Create an account to review businesses, report barriers, and help everyone navigate the city.
            </p>
          </div>
          <p className="mt-6 text-base leading-relaxed text-slate-300 sm:text-lg">
            Choose how you&apos;ll use AccessLens — community reviewers help everyone navigate with
            real experiences; business accounts list their venues on the map (paid billing coming soon).
          </p>
        </div>

        <div className="order-1 motion-safe:animate-fade-up [animation-delay:60ms] lg:order-2">
          <div className="mb-8 text-center lg:text-left">
            <Image
              src="/icon.png"
              alt=""
              width={64}
              height={64}
              className="mx-auto mb-5 h-16 w-16 rounded-2xl shadow-btn-primary ring-2 ring-white/30 lg:mx-0"
              priority
            />
            <p className="font-display text-sm font-semibold tracking-[0.18em] text-primary-200 uppercase">
              AccessLens
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Join AccessLens
            </h1>
            <p className="mt-3 text-lg text-slate-200/90 sm:text-xl">
              Map accessibility in Victoria, BC — together.
            </p>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <p className="text-lg font-semibold text-white sm:text-xl">How will you use AccessLens?</p>
              <div className="grid gap-6 sm:grid-cols-1">
                <button
                  type="button"
                  onClick={() => selectType('reviewer')}
                  className="group flex w-full flex-col rounded-3xl border border-white/50 bg-gradient-to-b from-white to-slate-50 p-7 text-left shadow-sheet ring-1 ring-white/40 transition-all hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 sm:p-8"
                >
                  <div className="flex items-start gap-4">
                    <span className="orb-3d flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-primary-700">
                      <Users className="h-7 w-7" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-lg font-semibold text-slate-900 sm:text-xl">
                        Community reviewer
                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                          Free
                        </span>
                      </p>
                      <ul className="mt-3 space-y-2.5 text-base text-slate-600 sm:text-lg">
                        <li className="flex items-center gap-3">
                          <Check className="h-5 w-5 shrink-0 text-green-600" aria-hidden="true" />
                          Browse and explore places
                        </li>
                        <li className="flex items-center gap-3">
                          <Check className="h-5 w-5 shrink-0 text-green-600" aria-hidden="true" />
                          Write reviews and add feedback
                        </li>
                        <li className="flex items-center gap-3">
                          <Check className="h-5 w-5 shrink-0 text-green-600" aria-hidden="true" />
                          Add places to the map
                        </li>
                      </ul>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => selectType('business')}
                  className="group flex w-full flex-col rounded-3xl border border-white/50 bg-gradient-to-b from-white to-slate-50 p-7 text-left shadow-sheet ring-1 ring-white/40 transition-all hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 sm:p-8"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-amber-50 to-amber-100 text-amber-800 shadow-chip-icon ring-1 ring-amber-200/80">
                      <Building2 className="h-7 w-7" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-lg font-semibold text-slate-900 sm:text-xl">
                        Business
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900">
                          <Sparkles className="h-4 w-4" aria-hidden="true" />
                          Paid (soon)
                        </span>
                      </p>
                      <p className="mt-2 text-sm text-amber-800/90 sm:text-base">
                        Subscription billing is not connected yet — your account is marked pending until
                        payment launches.
                      </p>
                      <ul className="mt-3 space-y-2.5 text-base text-slate-600 sm:text-lg">
                        <li className="flex items-center gap-3">
                          <Check className="h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
                          List and manage your places
                        </li>
                        <li className="flex items-center gap-2 text-slate-500">
                          <span className="ml-8 text-sm sm:text-base">
                            Reviews and issue reports are for community accounts.
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </button>
              </div>
              <p className="text-center text-base text-slate-300 sm:text-lg">
                Already have an account?{' '}
                <Link
                  href={`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                  className="rounded font-medium text-primary-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}

          {step === 2 && accountType && (
            <div className="rounded-3xl border border-white/40 bg-gradient-to-b from-white to-slate-50 p-8 shadow-sheet ring-1 ring-white/50 sm:p-10">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setAccountType(null);
                  setError(null);
                }}
                className="mb-5 inline-flex items-center gap-2 rounded text-base font-medium text-slate-600 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                Back
              </button>

              <p className="mb-5 text-base text-slate-600 sm:text-lg">
                Signing up as{' '}
                <strong className="text-slate-900">
                  {accountType === 'reviewer' ? 'community reviewer' : 'business'}
                </strong>
                .
              </p>

              <div className="space-y-8">
                {error && <Alert variant="error">{error}</Alert>}

                {googleEnabled ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="h-14 w-full text-lg"
                      onClick={() => handleGoogle(accountType)}
                      disabled={googleLoading}
                      loading={googleLoading}
                    >
                      {!googleLoading && <GoogleIcon className="h-6 w-6" />}
                      Continue with Google
                    </Button>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200" />
                      </div>
                      <div className="relative flex justify-center text-base">
                        <span className="bg-white px-4 text-slate-500">or sign up with email</span>
                      </div>
                    </div>
                  </>
                ) : null}

                <form onSubmit={handleSubmit} noValidate className="space-y-6" aria-label="Create account form">
                  <div>
                    <Label htmlFor="name" required className="text-base">
                      Your name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      autoComplete="name"
                      autoFocus
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Smith"
                      required
                      className="mt-2 min-h-[3.25rem] px-4 py-3 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" required className="text-base">
                      Email address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="mt-2 min-h-[3.25rem] px-4 py-3 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password" required className="text-base">
                      Password
                    </Label>
                    <div className="relative mt-2">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        required
                        minLength={8}
                        className="min-h-[3.25rem] px-4 py-3 pr-12 text-base"
                        aria-describedby="password-hint"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center rounded-r-xl px-4 text-slate-400 transition-colors hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" aria-hidden="true" />
                        ) : (
                          <Eye className="h-5 w-5" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                    <p id="password-hint" className="mt-2 text-sm text-slate-500">
                      At least 8 characters
                    </p>
                  </div>

                  <Button type="submit" loading={loading} size="lg" className="h-14 w-full text-lg">
                    Create account
                  </Button>
                </form>

                <p className="text-center text-base text-slate-600 sm:text-lg">
                  Already have an account?{' '}
                  <Link
                    href={`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                    className="rounded font-medium text-primary-600 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          )}

          <p className="mt-8 text-center text-sm text-slate-400 sm:text-base lg:text-left">
            By signing up, you agree to contribute accessibility information in good faith.
          </p>
        </div>
      </div>
    </AuthCanvas>
  );
}
