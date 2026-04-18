import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/StatusBadge';
import { UrgencyBadge } from '@/components/UrgencyBadge';
import { EmptyState } from '@/components/EmptyState';
import { IconChevron, IconInbox } from '@/components/icons';
import { formatRelative, initials, truncate } from '@/lib/formatters';
import type { DispatchIntake } from '@/types/intake';
import type { Profile } from '@/types/profile';

export function IntakeTable({
  intakes,
  profiles,
}: {
  intakes: DispatchIntake[];
  profiles: Profile[];
}) {
  if (!intakes.length) {
    return (
      <EmptyState
        icon={<IconInbox className="h-5 w-5" />}
        title="No intakes match your filters"
        description="Adjust your filters or wait for new calls to come in."
      />
    );
  }

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border/80 bg-surface-muted/40 text-left text-xs uppercase tracking-wider text-ink-muted dark:border-white/5 dark:bg-white/[0.03] dark:text-white/50">
              <th className="px-5 py-3 font-medium">Received</th>
              <th className="px-5 py-3 font-medium">Caller / Company</th>
              <th className="px-5 py-3 font-medium">Pickup</th>
              <th className="px-5 py-3 font-medium">Delivery</th>
              <th className="px-5 py-3 font-medium">Urgency</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Assigned</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {intakes.map((i) => {
              const assignee = i.assigned_to ? profileMap.get(i.assigned_to) : null;
              return (
                <tr
                  key={i.id}
                  className="group border-b border-surface-border/60 last:border-b-0 hover:bg-surface-muted/40 dark:border-white/5 dark:hover:bg-white/[0.03]"
                >
                  <td className="px-5 py-3.5 align-top">
                    <div className="text-ink dark:text-white">{formatRelative(i.created_at)}</div>
                    <div className="text-xs text-ink-faint dark:text-white/40">
                      {i.source === 'elevenlabs_dispatch_agent' ? 'Voice · Make.com' : i.source}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 align-top">
                    <div className="font-medium text-ink dark:text-white">
                      {i.caller_name ?? 'Unknown caller'}
                    </div>
                    <div className="text-xs text-ink-muted dark:text-white/50">
                      {i.company_name ?? 'No company'}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 align-top text-ink dark:text-white/90">
                    {truncate(i.pickup_location, 28)}
                  </td>
                  <td className="px-5 py-3.5 align-top text-ink dark:text-white/90">
                    {truncate(i.delivery_location, 28)}
                  </td>
                  <td className="px-5 py-3.5 align-top">
                    <UrgencyBadge urgency={i.urgency} />
                  </td>
                  <td className="px-5 py-3.5 align-top">
                    <StatusBadge status={i.intake_status} />
                  </td>
                  <td className="px-5 py-3.5 align-top">
                    {assignee ? (
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-[10px] font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-200">
                          {initials(assignee.full_name ?? assignee.email)}
                        </span>
                        <span className="text-xs text-ink dark:text-white/80">
                          {assignee.full_name ?? assignee.email}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-ink-faint dark:text-white/40">Unassigned</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 align-top text-right">
                    <Link
                      href={`/intakes/${i.id}`}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-brand-600 opacity-0 group-hover:opacity-100 dark:text-brand-300"
                    >
                      Open
                      <IconChevron className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
