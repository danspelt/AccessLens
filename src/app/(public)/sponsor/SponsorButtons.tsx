'use client';

import { useState } from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';
import type { SponsorTier } from '@/lib/sponsorship';

export function SponsorButton({ tier }: { tier: SponsorTier }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function checkout() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) throw new Error(data.error || 'Checkout is unavailable.');
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout is unavailable.');
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={checkout}
        disabled={busy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 text-base font-semibold text-white shadow-md transition-colors hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-60"
      >
        {busy ? (
          <RefreshCw className="h-5 w-5 animate-spin" aria-hidden="true" />
        ) : (
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        )}
        {busy ? 'Opening checkout…' : 'Sponsor with Stripe'}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
