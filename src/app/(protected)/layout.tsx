import { redirect } from 'next/navigation';
import { ObjectId } from 'mongodb';
import { auth } from '@/auth';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { getCollection } from '@/lib/db/mongoClient';
import { User } from '@/models/User';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/signin');
  }

  const users = await getCollection<User>('users');
  const dbUser = session.user.id
    ? await users.findOne({ _id: new ObjectId(session.user.id) }, { projection: { role: 1 } })
    : null;

  return (
    <DashboardShell
      userName={session.user.name || session.user.email || 'Account'}
      userRole={dbUser?.role ?? 'user'}
    >
      {children}
    </DashboardShell>
  );
}
