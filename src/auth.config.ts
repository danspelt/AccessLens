import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-compatible Auth.js config (no Node.js-only imports).
 * Used by middleware and extended by the full auth.ts config.
 */
export const authConfig = {
  providers: [],
  pages: {
    signIn: '/login',
    verifyRequest: '/login?verify=1',
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
      return session;
    },
  },
} satisfies NextAuthConfig;
