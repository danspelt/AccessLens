'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QrCode, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
            <QrCode className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
            Update your accessibility info
          </h1>
          <p className="mt-3 leading-relaxed text-slate-600">
            Enter the six-digit code from the QR card our student ambassadors left at your business.
            No account or password required.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <form onSubmit={handleSubmit} className="rounded-2xl panel-surface p-6 shadow-card space-y-5">
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
              Found on your pamphlet or door hanger
            </p>
          </div>
          <Button type="submit" size="lg" loading={loading} className="w-full">
            Continue
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </form>
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
