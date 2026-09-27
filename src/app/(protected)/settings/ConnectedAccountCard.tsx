'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { CheckCircle2, KeyRound } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SSO_PROVIDER_ID } from '@/lib/auth/sso';

export function ConnectedAccountCard({ ssoName, linked }: { ssoName: string; linked: boolean }) {
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    setLoading(true);
    // Signing in while already signed in makes Auth.js link the account to this user.
    await signIn(SSO_PROVIDER_ID, { callbackUrl: '/settings' });
  }

  return (
    <Card padding="md">
      <h2 className="text-lg font-semibold text-slate-900">Sign-in methods</h2>
      {linked ? (
        <p className="mt-2 flex items-center gap-2 text-sm text-slate-700">
          <CheckCircle2 className="h-4 w-4 text-green-700" aria-hidden="true" />
          Your account is connected to {ssoName}.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-slate-600">
            Connect {ssoName} to sign in to AccessLens and other participating sites with one account.
            Your AccessLens password keeps working.
          </p>
          <Button type="button" variant="outline" className="mt-4" onClick={handleConnect} loading={loading}>
            {!loading && <KeyRound className="h-4 w-4" aria-hidden="true" />}
            Connect {ssoName}
          </Button>
        </>
      )}
    </Card>
  );
}
