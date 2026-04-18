import Link from 'next/link';
import { Header } from '@/components/Header';
import { MetricCard } from '@/components/DashboardCards';
import { IntakeTable } from '@/components/IntakeTable';
import { Card, CardBody, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { ActivityLog } from '@/components/ActivityLog';
import { UrgencyBadge } from '@/components/UrgencyBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { IconInbox, IconAlert, IconCheck, IconClock, IconPhone, IconTruck } from '@/components/icons';
import { getCurrentUser } from '@/lib/auth';
import { getDashboardMetrics, listProfiles } from '@/lib/queries';
import { URGENCY_LABEL, URGENCY_LEVELS } from '@/types/intake';

export const metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [{ profile, isDemo }, metrics, profiles] = await Promise.all([
    getCurrentUser(),
    getDashboardMetrics(),
    listProfiles(),
  ]);

  const maxUrgency = Math.max(1, ...URGENCY_LEVELS.map((u) => metrics.byUrgency[u] ?? 0));

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Live view of inbound voice intakes and team activity."
        profile={profile}
        isDemo={isDemo}
      />
      <div className="space-y-6 px-6 py-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <MetricCard
            label="New today"
            value={metrics.newToday}
            accent="brand"
            hint="Intakes received since midnight"
            icon={<IconPhone className="h-4 w-4" />}
          />
          <MetricCard
            label="Incomplete"
            value={metrics.incomplete}
            accent="amber"
            hint="Missing fields — need callback"
            icon={<IconAlert className="h-4 w-4" />}
          />
          <MetricCard
            label="Contacted today"
            value={metrics.contactedToday}
            accent="violet"
            hint="Moved to contacted today"
            icon={<IconClock className="h-4 w-4" />}
          />
          <MetricCard
            label="Booked"
            value={metrics.booked}
            accent="green"
            hint="Loads won (all time)"
            icon={<IconCheck className="h-4 w-4" />}
          />
          <MetricCard
            label="Urgent open"
            value={metrics.urgentOpen}
            accent="red"
            hint="High / critical, still open"
            icon={<IconAlert className="h-4 w-4" />}
          />
          <MetricCard
            label="Total open"
            value={metrics.totalOpen}
            accent="brand"
            hint="Not booked or closed lost"
            icon={<IconInbox className="h-4 w-4" />}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-ink dark:text-white">
                  Recent intakes
                </h2>
                <p className="text-xs text-ink-muted dark:text-white/50">
                  Latest voice intakes from the ElevenLabs agent.
                </p>
              </div>
              <Link
                href="/intakes"
                className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-300"
              >
                View all →
              </Link>
            </div>
            <IntakeTable intakes={metrics.recentIntakes} profiles={profiles} />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Urgency breakdown</CardTitle>
                  <CardSubtitle>Distribution across open & closed intakes.</CardSubtitle>
                </div>
              </CardHeader>
              <CardBody className="space-y-3">
                {URGENCY_LEVELS.map((u) => {
                  const count = metrics.byUrgency[u] ?? 0;
                  const pct = Math.round((count / maxUrgency) * 100);
                  return (
                    <div key={u} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <UrgencyBadge urgency={u} />
                        <span className="text-ink-muted dark:text-white/60">
                          {count} · {URGENCY_LABEL[u]}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-surface-muted dark:bg-white/5">
                        <div
                          className="h-full rounded-full bg-brand-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Pipeline</CardTitle>
                  <CardSubtitle>Open intakes by status.</CardSubtitle>
                </div>
              </CardHeader>
              <CardBody className="grid grid-cols-2 gap-3">
                {(
                  ['new', 'incomplete', 'contacted', 'quoted', 'booked', 'closed_lost'] as const
                ).map((s) => (
                  <div
                    key={s}
                    className="flex items-center justify-between rounded-lg border border-surface-border/80 bg-surface-muted/40 px-3 py-2 dark:border-white/5 dark:bg-white/[0.03]"
                  >
                    <StatusBadge status={s} />
                    <span className="text-sm font-semibold text-ink dark:text-white">
                      {metrics.byStatus[s] ?? 0}
                    </span>
                  </div>
                ))}
              </CardBody>
            </Card>

            <ActivityLog items={metrics.recentActivity} />
          </div>
        </section>

        <section>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <IconTruck className="h-4 w-4 text-ink-muted" />
                <div>
                  <CardTitle>Ingestion pipeline</CardTitle>
                  <CardSubtitle>Inbound call → voice agent → Make.com → Supabase → this app.</CardSubtitle>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <ol className="grid gap-3 md:grid-cols-5">
                {[
                  { n: '1', t: 'Inbound call', d: 'Customer dials the published intake line.' },
                  { n: '2', t: 'ElevenLabs agent', d: 'Captures structured fields and transcript.' },
                  { n: '3', t: 'Make.com webhook', d: 'Normalizes, routes, posts to this app.' },
                  { n: '4', t: 'Supabase', d: 'Stores intake, notes, activity log.' },
                  { n: '5', t: 'Ops console', d: 'Your team works the queue right here.' },
                ].map((s) => (
                  <li
                    key={s.n}
                    className="rounded-xl border border-surface-border/80 bg-surface-muted/40 p-3 dark:border-white/5 dark:bg-white/[0.03]"
                  >
                    <div className="text-xs font-semibold text-brand-600 dark:text-brand-300">
                      Step {s.n}
                    </div>
                    <div className="mt-1 text-sm font-medium text-ink dark:text-white">
                      {s.t}
                    </div>
                    <div className="mt-0.5 text-xs text-ink-muted dark:text-white/60">
                      {s.d}
                    </div>
                  </li>
                ))}
              </ol>
            </CardBody>
          </Card>
        </section>
      </div>
    </>
  );
}
