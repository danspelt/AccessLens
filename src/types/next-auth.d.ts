import type { AccountType, BusinessSubscriptionStatus } from '@/models/User';
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      accountType: AccountType;
      businessSubscriptionStatus: BusinessSubscriptionStatus;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    accountType?: AccountType;
    businessSubscriptionStatus?: BusinessSubscriptionStatus;
  }
}
