import { Header } from '@/components/Header';
import { Card, CardBody, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { IconPhone, IconWebhook, IconSettings, IconUser } from '@/components/icons';
import { getCurrentUser } from '@/lib/auth';
import { listProfiles } from '@/lib/queries';
import { env, isDemoMode, isSupabaseConfigured } from '@/lib/env';
import { ROLE_LABEL } from '@/types/profile';
import { INTAKE_STATUSES, STATUS_LABEL } from '@/types/intake';

export const metadata = { title: 'Settings' };
export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const [{ profile, isDemo }, profiles] = await Promise.all([
    getCurrentUser(),
    listProfiles(),
  ]);

  const supabaseOk = isSupabaseConfigured();
  const webhookSecretSet = Boolean(env.makeWebhookSecret);
  const demo = isDemoMode();

  return (
    <>
      <Header
        title="Settings"
        subtitle="Integrations, roles, and platform configuration."
        profile={profile}
        isDemo={isDemo}
      />

      <div className="space-y-6 px-6 py-6">
        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <IconWebhook className="h-4 w-4 text-ink-muted" />
                <div>
                  <CardTitle>Make.com webhook</CardTitle>
                  <CardSubtitle>Ingestion endpoint for voice intakes.</CardSubtitle>
                </div>
              </div>
              <Badge tone={webhookSecretSet ? 'green' : 'amber'}>
                {webhookSecretSet ? 'Secret set' : 'Secret missing'}
              </Badge>
            </CardHeader>
            <CardBody className="space-y-3 text-sm">
              <Row label="Endpoint" value="/api/intakes/webhook" mono />
              <Row label="Method" value="POST" />
              <Row
                label="Auth header"
                value="x-webhook-secret: <MAKE_WEBHOOK_SECRET>"
                mono
              />
              <Row
                label="Payload example"
                value={`{
  "caller_name": "John Smith",
  "caller_phone": "5551234567",
  "pickup_location": "Atlanta, GA",
  "delivery_location": "Nashville, TN",
  "urgency": "high",
  "call_summary": "...",
  "transcript": "..."
}`}
                mono
                block
              />
              <p className="rounded-lg border border-dashed border-surface-border p-3 text-xs text-ink-muted dark:border-white/10 dark:text-white/60">
                Point your Make.com HTTP module here. The endpoint normalizes missing fields,
                writes to Supabase, and creates an <code>intake_created</code> activity event.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <IconPhone className="h-4 w-4 text-ink-muted" />
                <div>
                  <CardTitle>ElevenLabs voice agent</CardTitle>
                  <CardSubtitle>Structured capture from inbound calls.</CardSubtitle>
                </div>
              </div>
              <Badge tone="blue">Upstream only</Badge>
            </CardHeader>
            <CardBody className="space-y-3 text-sm">
              <p className="text-ink-muted dark:text-white/70">
                The voice agent is configured in ElevenLabs and fires Make.com on call end.
                Configure your agent prompts and handoff logic in that dashboard — this app treats
                ElevenLabs as an upstream source of truth.
              </p>
              <Row
                label="Expected fields"
                value={[
                  'caller_name',
                  'caller_phone',
                  'caller_email',
                  'company_name',
                  'pickup_location',
                  'delivery_location',
                  'load_type',
                  'trailer_type',
                  'weight',
                  'pickup_date',
                  'urgency',
                  'special_instructions',
                  'call_summary',
                  'transcript',
                  'call_timestamp',
                ].join(', ')}
                mono
                block
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <IconSettings className="h-4 w-4 text-ink-muted" />
                <div>
                  <CardTitle>Environment</CardTitle>
                  <CardSubtitle>Runtime configuration detected.</CardSubtitle>
                </div>
              </div>
              <Badge tone={demo ? 'amber' : 'green'}>{demo ? 'Demo mode' : 'Live'}</Badge>
            </CardHeader>
            <CardBody className="space-y-3 text-sm">
              <Row label="Supabase URL" value={env.supabaseUrl || '—'} mono />
              <Row label="Supabase anon key" value={supabaseOk ? 'configured' : 'missing'} />
              <Row
                label="Service role key"
                value={env.supabaseServiceRoleKey ? 'configured' : 'missing'}
              />
              <Row label="Webhook secret" value={webhookSecretSet ? 'configured' : 'missing'} />
              <p className="rounded-lg border border-dashed border-surface-border p-3 text-xs text-ink-muted dark:border-white/10 dark:text-white/60">
                When any Supabase variable is missing, the app automatically runs in demo mode so
                you can explore the UI without a backend.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Notification preferences</CardTitle>
                <CardSubtitle>Placeholders — wire to email / Slack later.</CardSubtitle>
              </div>
              <Badge tone="slate">Coming soon</Badge>
            </CardHeader>
            <CardBody className="space-y-3">
              {[
                { label: 'New intake received', value: 'Email + in-app' },
                { label: 'Urgent intake (high/critical)', value: 'SMS + email' },
                { label: 'Assignment changed', value: 'In-app' },
                { label: 'Note added', value: 'In-app' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-lg border border-surface-border/80 bg-surface-muted/40 px-3 py-2 text-sm dark:border-white/5 dark:bg-white/[0.03]"
                >
                  <span className="text-ink dark:text-white">{item.label}</span>
                  <span className="text-xs text-ink-muted dark:text-white/60">{item.value}</span>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Default statuses</CardTitle>
                <CardSubtitle>Used across the intake pipeline.</CardSubtitle>
              </div>
            </CardHeader>
            <CardBody className="flex flex-wrap gap-2">
              {INTAKE_STATUSES.map((s) => (
                <Badge key={s} tone="slate">
                  {STATUS_LABEL[s]}
                </Badge>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <IconUser className="h-4 w-4 text-ink-muted" />
                <div>
                  <CardTitle>Team & roles</CardTitle>
                  <CardSubtitle>Read-only list from profiles table.</CardSubtitle>
                </div>
              </div>
            </CardHeader>
            <CardBody className="divide-y divide-surface-border/70 text-sm dark:divide-white/5">
              {profiles.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <div className="font-medium text-ink dark:text-white">
                      {p.full_name ?? p.email}
                    </div>
                    <div className="text-xs text-ink-muted dark:text-white/60">{p.email}</div>
                  </div>
                  <Badge tone="blue">{ROLE_LABEL[p.role]}</Badge>
                </div>
              ))}
            </CardBody>
          </Card>
        </section>
      </div>
    </>
  );
}

function Row({
  label,
  value,
  mono,
  block,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
  block?: boolean;
}) {
  return (
    <div
      className={
        block
          ? 'space-y-1.5'
          : 'flex items-start justify-between gap-3'
      }
    >
      <span className="text-xs font-medium uppercase tracking-wider text-ink-faint dark:text-white/40">
        {label}
      </span>
      <span
        className={
          (mono ? 'font-mono text-xs ' : 'text-sm ') +
          (block
            ? 'block whitespace-pre-wrap rounded-lg bg-surface-muted/60 p-3 text-ink dark:bg-white/[0.03] dark:text-white/85'
            : 'text-right text-ink dark:text-white/85')
        }
      >
        {value ?? '—'}
      </span>
    </div>
  );
}
