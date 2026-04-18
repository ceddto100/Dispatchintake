import { Sidebar } from '@/components/Sidebar';
import type { ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface-muted text-ink dark:bg-ink dark:text-white">
      <Sidebar />
      <main className="flex min-h-screen flex-1 flex-col">{children}</main>
    </div>
  );
}
