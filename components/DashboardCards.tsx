import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

export function MetricCard({
  label,
  value,
  accent,
  hint,
  icon,
}: {
  label: string;
  value: number | string;
  accent?: 'brand' | 'amber' | 'green' | 'red' | 'violet';
  hint?: string;
  icon?: ReactNode;
}) {
  const ring =
    accent === 'brand'
      ? 'from-brand-500/20 to-brand-500/0 text-brand-700 dark:text-brand-300'
      : accent === 'amber'
      ? 'from-amber-400/25 to-amber-400/0 text-amber-700 dark:text-amber-300'
      : accent === 'green'
      ? 'from-emerald-400/25 to-emerald-400/0 text-emerald-700 dark:text-emerald-300'
      : accent === 'red'
      ? 'from-red-400/25 to-red-400/0 text-red-700 dark:text-red-300'
      : accent === 'violet'
      ? 'from-violet-400/25 to-violet-400/0 text-violet-700 dark:text-violet-300'
      : 'from-slate-400/20 to-slate-400/0 text-slate-700 dark:text-slate-300';

  return (
    <Card className="relative overflow-hidden">
      <div className={cn('pointer-events-none absolute -right-6 -top-8 h-32 w-32 rounded-full bg-gradient-to-br blur-2xl', ring)} />
      <div className="relative flex items-start justify-between gap-3 px-5 py-5">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-white/50">
            {label}
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-ink dark:text-white">
            {value}
          </div>
          {hint ? (
            <div className="mt-1 text-xs text-ink-muted dark:text-white/50">{hint}</div>
          ) : null}
        </div>
        {icon ? (
          <div className="rounded-xl bg-white p-2 text-ink-muted shadow-sm dark:bg-white/5 dark:text-white/70">
            {icon}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
