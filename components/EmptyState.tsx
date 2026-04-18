import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-surface-border bg-surface-muted/40 px-6 py-12 text-center dark:border-white/10 dark:bg-white/[0.02]',
        className,
      )}
    >
      {icon ? (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink-muted shadow-sm dark:bg-white/5 dark:text-white/70">
          {icon}
        </div>
      ) : null}
      <div className="space-y-1">
        <div className="text-sm font-semibold text-ink dark:text-white">{title}</div>
        {description ? (
          <div className="text-xs text-ink-muted dark:text-white/60">{description}</div>
        ) : null}
      </div>
      {action}
    </div>
  );
}
