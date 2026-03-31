import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <DashboardShell userName={session.user.name || session.user.email || 'Account'}>
      {children}
    </DashboardShell>
  );
}
