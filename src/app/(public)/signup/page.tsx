'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Alert } from '@/components/ui/Alert';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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
      router.push('/dashboard');
    } catch {
      setError('Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
          <form onSubmit={handleSubmit} noValidate className="space-y-5" aria-label="Create account form">
            {error && <Alert variant="error">{error}</Alert>}

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
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                required
                minLength={8}
                className="mt-1.5"
                aria-describedby="password-hint"
              />
              <p id="password-hint" className="mt-1 text-xs text-slate-500">
                At least 8 characters
              </p>
            </div>

            <Button type="submit" loading={loading} size="lg" className="w-full">
              Create Account
            </Button>

            <p className="text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary-600 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded">
                Sign in
              </Link>
            </p>
          </form>
        </div>
        <p className="mt-4 text-center text-xs text-slate-500">
          By signing up, you agree to contribute accessibility information in good faith.
        </p>
      </div>
    </div>
  );
}
