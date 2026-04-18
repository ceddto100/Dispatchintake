'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { IconDashboard, IconInbox, IconSettings, IconTruck } from '@/components/icons';
import { env } from '@/lib/env';

const ITEMS = [
  { href: '/dashboard', label: 'Dashboard', Icon: IconDashboard },
  { href: '/intakes', label: 'Intakes', Icon: IconInbox },
  { href: '/settings', label: 'Settings', Icon: IconSettings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-surface-border bg-white/80 backdrop-blur dark:border-white/5 dark:bg-ink md:flex md:flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-surface-border px-4 dark:border-white/5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-white dark:bg-brand-600">
          <IconTruck className="h-4 w-4" />
        </span>
        <div>
          <div className="text-sm font-semibold text-ink dark:text-white">{env.appBrand}</div>
          <div className="text-[10px] uppercase tracking-wider text-ink-faint dark:text-white/40">
            Ops Console
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-ink text-white shadow-sm dark:bg-white/10'
                  : 'text-ink-muted hover:bg-surface-muted hover:text-ink dark:text-white/70 dark:hover:bg-white/5 dark:hover:text-white',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-surface-border p-3 text-[11px] text-ink-faint dark:border-white/5 dark:text-white/40">
        <div className="flex items-center justify-between">
          <span>v0.1</span>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            Live
          </span>
        </div>
      </div>
    </aside>
  );
}
