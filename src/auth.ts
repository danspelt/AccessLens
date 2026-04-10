import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import Resend from 'next-auth/providers/resend';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { authConfig } from './auth.config';
import getClientPromise from '@/lib/db/mongoClient';
import { getCollection } from '@/lib/db/mongoClient';
import { verifyPassword } from '@/lib/auth/authHelpers';
import { ObjectId } from 'mongodb';
import type { AccountType, BusinessSubscriptionStatus, User } from '@/models/User';

async function loadAccountFlagsForToken(
  sub: string | undefined
): Promise<{ accountType: AccountType; businessSubscriptionStatus: BusinessSubscriptionStatus }> {
  if (!sub) {
    return { accountType: 'reviewer', businessSubscriptionStatus: 'none' };
  }
  try {
    const users = await getCollection<User>('users');
    const u = await users.findOne({ _id: new ObjectId(sub) });
    if (!u) {
      return { accountType: 'reviewer', businessSubscriptionStatus: 'none' };
    }
    const accountType = u.accountType ?? 'reviewer';
    const businessSubscriptionStatus =
      u.businessSubscriptionStatus ?? (accountType === 'business' ? 'pending' : 'none');
    return { accountType, businessSubscriptionStatus };
  } catch {
    return { accountType: 'reviewer', businessSubscriptionStatus: 'none' };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(getClientPromise(), {
    databaseName: process.env.MONGODB_DB,
  }),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email?.toLowerCase(),
          image: profile.picture,
        };
      },
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const users = await getCollection('users');
        const user = await users.findOne({
          email: (credentials.email as string).toLowerCase(),
        });
        if (!user || !user.passwordHash) return null;
        const valid = await verifyPassword(
          credentials.password as string,
          user.passwordHash as string,
        );
        if (!valid) return null;
        return {
          id: user._id.toString(),
          email: user.email as string,
          name: user.name as string,
        };
      },
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.RESEND_FROM_EMAIL || 'AccessLens <noreply@example.com>',
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, ...rest }) {
      const base = await authConfig.callbacks.jwt({ token, user, ...rest });
      if (user?.id) {
        base.id = user.id;
      }
      const sub = base.sub ?? (user?.id as string | undefined);
      const flags = await loadAccountFlagsForToken(sub);
      base.accountType = flags.accountType;
      base.businessSubscriptionStatus = flags.businessSubscriptionStatus;
      return base;
    },
    async session({ session, token, ...rest }) {
      const s = await authConfig.callbacks.session({ session, token, ...rest });
      if (token?.id) {
        s.user.id = token.id as string;
      }
      s.user.accountType = (token.accountType as AccountType) ?? 'reviewer';
      s.user.businessSubscriptionStatus =
        (token.businessSubscriptionStatus as BusinessSubscriptionStatus) ?? 'none';
      return s;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      const { ObjectId } = await import('mongodb');
      const users = await getCollection('users');
      await users.updateOne(
        { _id: new ObjectId(user.id) },
        {
          $set: {
            role: 'user',
            badges: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      );
    },
  },
});
