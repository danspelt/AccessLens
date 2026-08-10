import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import type { UserRole } from '@/models/User';

export function DashboardShell({
  children,
  userName,
  userRole = 'user',
}: {
  children: ReactNode;
  userName: string;
  userRole?: UserRole;
}) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-app-canvas">
      <div className="w-full px-3 py-8 sm:px-6 lg:px-10">
        <div className="flex gap-8 lg:gap-10">
          <aside className="hidden w-80 shrink-0 motion-safe:animate-enter-left lg:block">
            <Sidebar userName={userName} userRole={userRole} />
          </aside>
          <div className="min-w-0 flex-1 rounded-[1.75rem] border border-white/70 bg-white/55 p-4 shadow-inset-well ring-1 ring-slate-900/[0.04] motion-safe:animate-fade-up sm:p-6 [animation-delay:70ms]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

