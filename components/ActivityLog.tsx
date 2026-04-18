import { Card, CardBody, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/EmptyState';
import { formatRelative } from '@/lib/formatters';
import { STATUS_LABEL, type IntakeStatus } from '@/types/intake';
import type { ActivityLog as Activity, ActivityType } from '@/types/activity';

const TITLES: Record<ActivityType, string> = {
  intake_created: 'Intake created',
  status_changed: 'Status changed',
  assignment_changed: 'Assignment changed',
  note_added: 'Note added',
  webhook_received: 'Webhook received',
  notification_sent: 'Notification sent',
  field_updated: 'Field updated',
};

function describe(a: Activity): string {
  if (a.action_type === 'status_changed' && a.action_detail) {
    const d = a.action_detail as { from?: IntakeStatus; to?: IntakeStatus };
    const from = d.from ? STATUS_LABEL[d.from] : '—';
    const to = d.to ? STATUS_LABEL[d.to] : '—';
    return `${from} → ${to}`;
  }
  if (a.action_type === 'assignment_changed' && a.action_detail) {
    const to = (a.action_detail as { to?: string | null }).to;
    return to ? `Assigned to ${to}` : 'Unassigned';
  }
  if (a.action_type === 'note_added' && a.action_detail) {
    return String((a.action_detail as { preview?: string }).preview ?? '');
  }
  if (a.action_type === 'intake_created') return 'Created from voice intake.';
  if (a.action_type === 'webhook_received') return 'Payload received from Make.com.';
  if (a.action_type === 'notification_sent') return 'Notification dispatched.';
  if (a.action_type === 'field_updated') return 'Record updated.';
  return '';
}

export function ActivityLog({ items }: { items: Activity[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Activity</CardTitle>
          <CardSubtitle>Every change tracked for audit.</CardSubtitle>
        </div>
      </CardHeader>
      <CardBody>
        {items.length === 0 ? (
          <EmptyState title="No activity yet" description="Status changes and notes show up here." />
        ) : (
          <ol className="relative space-y-4 border-l border-surface-border pl-4 dark:border-white/10">
            {items.map((a) => (
              <li key={a.id} className="relative">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-brand-500 dark:border-ink-soft" />
                <div className="flex items-baseline justify-between gap-3">
                  <div className="text-sm font-medium text-ink dark:text-white">
                    {TITLES[a.action_type]}
                  </div>
                  <div className="text-xs text-ink-faint dark:text-white/40">
                    {formatRelative(a.created_at)}
                  </div>
                </div>
                <div className="text-xs text-ink-muted dark:text-white/60">
                  {describe(a)}
                  {a.actor_label ? (
                    <span className="ml-1 text-ink-faint dark:text-white/40">· {a.actor_label}</span>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardBody>
    </Card>
  );
}
