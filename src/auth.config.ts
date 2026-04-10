import type { NextAuthConfig } from 'next-auth';
import type { AccountType, BusinessSubscriptionStatus } from '@/models/User';

/**
 * Edge-compatible Auth.js config (no Node.js-only imports).
 * Used by middleware and extended by the full auth.ts config.
 */
export const authConfig = {
  /**
   * Required behind reverse proxies (Coolify, Traefik, nginx): the incoming Host
   * (e.g. sslip.io preview URL) must be accepted or Auth.js throws UntrustedHost.
   * Disable with AUTH_TRUST_HOST=false only if you set a fixed AUTH_URL and trust nothing else.
   */
  trustHost:
    process.env.AUTH_TRUST_HOST === 'false' || process.env.AUTH_TRUST_HOST === '0'
      ? false
      : true,
  /** Edge middleware + Node auth: use AUTH_SECRET (or legacy NEXTAUTH_SECRET). */
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  providers: [],
  pages: {
    signIn: '/signin',
    verifyRequest: '/signin?verify=1',
  },
  session: { strategy: 'jwt' as const },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      session.user.accountType = (token.accountType as AccountType | undefined) ?? 'reviewer';
      session.user.businessSubscriptionStatus =
        (token.businessSubscriptionStatus as BusinessSubscriptionStatus | undefined) ?? 'none';
      return session;
    },
  },
} satisfies NextAuthConfig;
