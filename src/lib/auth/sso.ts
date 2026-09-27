import type { OIDCConfig } from 'next-auth/providers';

/** Part of the registered callback URL (/api/auth/callback/sso) — changing it breaks the IdP registration. */
export const SSO_PROVIDER_ID = 'sso';

export type SsoProfile = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  preferred_username?: string;
  picture?: string;
};

type Env = Record<string, string | undefined>;

export function isSsoConfigured(env: Env = process.env): boolean {
  return Boolean(env.SSO_ISSUER && env.SSO_CLIENT_ID && env.SSO_CLIENT_SECRET);
}

export function ssoDisplayName(env: Env = process.env): string {
  return env.SSO_DISPLAY_NAME?.trim() || 'single sign-on';
}

/** Accounts are linked by `sub`, but an unverified email must never create or reach an account. */
export function isVerifiedSsoProfile(profile: unknown): boolean {
  if (!profile || typeof profile !== 'object') return false;
  const p = profile as Partial<SsoProfile>;
  return typeof p.sub === 'string' && p.sub.length > 0 && typeof p.email === 'string' && p.email_verified === true;
}

export function buildSsoProvider(env: Env = process.env): OIDCConfig<SsoProfile> {
  return {
    id: SSO_PROVIDER_ID,
    name: ssoDisplayName(env),
    type: 'oidc',
    issuer: env.SSO_ISSUER,
    clientId: env.SSO_CLIENT_ID,
    clientSecret: env.SSO_CLIENT_SECRET,
    checks: ['pkce', 'state', 'nonce'],
    authorization: { params: { scope: 'openid email profile' } },
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name ?? profile.preferred_username ?? null,
        email: profile.email?.toLowerCase() ?? null,
        image: profile.picture ?? null,
      };
    },
    // Store only the (provider, sub) link; AccessLens never calls the IdP API with these tokens.
    account() {
      return {};
    },
  };
}

/** Same-origin relative paths only, so ?callbackUrl= cannot become an open redirect. */
export function safeCallbackPath(value: string | null | undefined, fallback = '/dashboard'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return fallback;
  }
  return value;
}
