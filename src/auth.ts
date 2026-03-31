import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import Resend from 'next-auth/providers/resend';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { authConfig } from './auth.config';
import getClientPromise from '@/lib/db/mongoClient';
import { getCollection } from '@/lib/db/mongoClient';
import { verifyPassword } from '@/lib/auth/authHelpers';

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
