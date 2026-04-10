import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

export function DashboardShell({
  children,
  userName,
}: {
  children: ReactNode;
  userName: string;
}) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-app-canvas">
      <div className="w-full px-3 sm:px-6 lg:px-10 py-6">
        <div className="flex gap-6">
          <aside className="hidden lg:block w-80 shrink-0">
            <Sidebar userName={userName} />
          </aside>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

