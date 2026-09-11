'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QrCode, ArrowRight, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Alert } from '@/components/ui/Alert';
import { normalizeAccessCode, isValidAccessCodeFormat } from '@/lib/access/codeFormat';

export default function UpdateAccessibilityEntryPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalized = normalizeAccessCode(code);
    if (!isValidAccessCodeFormat(normalized)) {
      setError('Enter the 6-digit code from your AccessLens card');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const verifyRes = await fetch(`/api/business/access/${normalized}/verify`, {
        method: 'POST',
      });
      const data = await verifyRes.json();
      if (!verifyRes.ok) {
        setError(data.error || 'Code not found');
        return;
      }
      router.push(`/update-accessibility/${normalized}`);
    } catch {
      setError('Could not verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white">
        <div
          className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-white/5 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-lg px-5 py-14 sm:px-6 sm:py-16">
          <p className="font-display text-sm font-semibold tracking-[0.22em] text-primary-200 uppercase">
            AccessLens
          </p>
          <div className="mt-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white shadow-orb ring-1 ring-white/25 backdrop-blur-sm">
            <QrCode className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Update your accessibility info
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-primary-100">
            Enter the six-digit code from your QR card. No account or password required.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-lg px-5 py-10 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl panel-surface p-6 shadow-card sm:p-8">
          {error ? <Alert variant="error">{error}</Alert> : null}
          <div>
            <Label htmlFor="access-code" className="text-base">
              Business access code
            </Label>
            <Input
              id="access-code"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              className="mt-2 text-center text-2xl font-mono tracking-[0.3em]"
              autoComplete="one-time-code"
              aria-describedby="code-hint"
            />
            <p id="code-hint" className="mt-2 text-sm text-slate-500">
              On your pamphlet or door hanger
            </p>
          </div>
          <Button type="submit" size="lg" loading={loading} className="w-full">
            Continue
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </form>

        <div className="mt-8 flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" aria-hidden="true" />
          <p>
            Works on any phone or tablet. Prefer a full account?{' '}
            <Link href="/signup" className="font-semibold text-primary-700 hover:underline">
              Join as a business partner
            </Link>
            .
          </p>
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Looking for places to visit?{' '}
          <Link href="/explore" className="font-semibold text-primary-600 hover:underline">
            Explore the map
          </Link>
        </p>
      </div>
    </div>
  );
}
