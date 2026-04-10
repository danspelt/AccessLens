'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { SIGNUP_INTENT_STORAGE_KEY } from '@/lib/signupIntent';

export default function SignupOAuthCompletePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<'checking' | 'working' | 'done'>('checking');

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const sessionRes = await fetch('/api/auth/session', { credentials: 'same-origin' });
        const session = await sessionRes.json();
        if (cancelled) return;

        if (!session?.user?.id) {
          router.replace('/signin');
          return;
        }

        setPhase('working');
        const raw =
          typeof window !== 'undefined' ? sessionStorage.getItem(SIGNUP_INTENT_STORAGE_KEY) : null;
        const accountType = raw === 'business' ? 'business' : 'reviewer';

        const res = await fetch('/api/auth/complete-signup-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ accountType }),
        });
        const data = await res.json().catch(() => ({}));

        if (cancelled) return;

        if (!res.ok) {
          if (res.status === 403 && String(data.error || '').includes('already set')) {
            sessionStorage.removeItem(SIGNUP_INTENT_STORAGE_KEY);
            setPhase('done');
            router.replace('/dashboard');
            return;
          }
          setError((data.error as string) || 'Could not complete signup.');
          setPhase('done');
          return;
        }

        sessionStorage.removeItem(SIGNUP_INTENT_STORAGE_KEY);
        setPhase('done');
        router.replace('/dashboard');
        router.refresh();
      } catch {
        if (!cancelled) {
          setError('Something went wrong. Please try again.');
          setPhase('done');
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600">
          <MapPin className="h-6 w-6 text-white" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-semibold text-slate-900">Finishing your account</h1>
        <p className="mt-2 text-sm text-slate-600">
          {phase !== 'done' && !error ? 'Setting up your AccessLens profile…' : null}
        </p>
        {error && (
          <Alert variant="error" className="mt-6 text-left">
            {error}
          </Alert>
        )}
      </div>
    </div>
  );
}
