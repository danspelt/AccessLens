'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { MapPin, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Alert } from '@/components/ui/Alert';

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Sign up failed.');
        return;
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Account created but sign-in failed. Please sign in manually.');
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    setError(null);
    await signIn('google', { callbackUrl: '/dashboard' });
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600">
            <MapPin className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Join AccessLens</h1>
          <p className="mt-2 text-slate-600">Help map accessibility in Victoria, BC</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
          <div className="space-y-6">
            {error && <Alert variant="error">{error}</Alert>}

            {/* Google sign-up */}
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleGoogle}
              disabled={googleLoading}
              loading={googleLoading}
            >
              {!googleLoading && <GoogleIcon className="h-5 w-5" />}
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-3 text-slate-500">or sign up with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5" aria-label="Create account form">
              <div>
                <Label htmlFor="name" required>Your name</Label>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Smith"
                  required
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="email" required>Email address</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="password" required>Password</Label>
                <div className="relative mt-1.5">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    required
                    minLength={8}
                    className="pr-10"
                    aria-describedby="password-hint"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                <p id="password-hint" className="mt-1 text-xs text-slate-500">
                  At least 8 characters
                </p>
              </div>

              <Button type="submit" loading={loading} size="lg" className="w-full">
                Create Account
              </Button>
            </form>

            <p className="text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary-600 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded">
                Sign in
              </Link>
            </p>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-slate-500">
          By signing up, you agree to contribute accessibility information in good faith.
        </p>
      </div>
    </div>
  );
}
