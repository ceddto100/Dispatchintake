import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Card, CardBody, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/StatusBadge';
import { UrgencyBadge } from '@/components/UrgencyBadge';
import { IntakeDetails } from '@/components/IntakeDetails';
import { AISummaryPanel } from '@/components/AISummaryPanel';
import { TranscriptPanel } from '@/components/TranscriptPanel';
import { NotesPanel } from '@/components/NotesPanel';
import { ActivityLog } from '@/components/ActivityLog';
import { ActionsBar } from '@/components/ActionsBar';
import { IconChevron, IconMail, IconPhone } from '@/components/icons';
import { getCurrentUser } from '@/lib/auth';
import { getIntake, listActivity, listNotes, listProfiles } from '@/lib/queries';
import { can } from '@/lib/permissions';
import { formatDateTime, formatPhone, initials } from '@/lib/formatters';

export const dynamic = 'force-dynamic';

export default async function IntakeDetailPage({ params }: { params: { id: string } }) {
  const intake = await getIntake(params.id);
  if (!intake) notFound();

  const [{ profile, isDemo }, notes, activity, profiles] = await Promise.all([
    getCurrentUser(),
    listNotes(params.id),
    listActivity(params.id),
    listProfiles(),
  ]);

  const assignee = intake.assigned_to ? profiles.find((p) => p.id === intake.assigned_to) : null;
  const canWriteNotes = can(profile?.role, 'notes.write');
  const canStatus = can(profile?.role, 'intake.status');

  return (
    <>
      <Header
        title={intake.caller_name ?? 'Unknown caller'}
        subtitle={intake.company_name ?? 'No company captured'}
        profile={profile}
        isDemo={isDemo}
        right={
          <Link
            href="/intakes"
            className="inline-flex items-center gap-1 rounded-full border border-surface-border bg-white px-3 py-1.5 text-xs font-medium text-ink-muted hover:bg-surface-muted dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10"
          >
            <IconChevron className="h-3.5 w-3.5 rotate-180" />
            All intakes
          </Link>
        }
      />

      <div className="space-y-6 px-6 py-6">
        <Card>
          <CardBody className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-200">
                {initials(intake.caller_name ?? intake.company_name ?? '?')}
              </span>
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-lg font-semibold text-ink dark:text-white">
                    {intake.caller_name ?? 'Unknown caller'}
                  </h2>
                  <StatusBadge status={intake.intake_status} />
                  <UrgencyBadge urgency={intake.urgency} />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted dark:text-white/60">
                  {intake.caller_phone ? (
                    <span className="inline-flex items-center gap-1">
                      <IconPhone className="h-3.5 w-3.5" />
                      {formatPhone(intake.caller_phone)}
                    </span>
                  ) : null}
                  {intake.caller_email ? (
                    <span className="inline-flex items-center gap-1">
                      <IconMail className="h-3.5 w-3.5" />
                      {intake.caller_email}
                    </span>
                  ) : null}
                  <span>Received {formatDateTime(intake.created_at)}</span>
                  {intake.elevenlabs_call_id ? (
                    <Badge tone="slate">Call {intake.elevenlabs_call_id}</Badge>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="text-right text-xs text-ink-muted dark:text-white/50">
              <div>
                Assigned to{' '}
                <span className="font-medium text-ink dark:text-white">
                  {assignee?.full_name ?? assignee?.email ?? 'Unassigned'}
                </span>
              </div>
              <div className="mt-1">Source: {intake.source}</div>
            </div>
          </CardBody>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <AISummaryPanel intake={intake} />
            <IntakeDetails intake={intake} />
            <TranscriptPanel transcript={intake.transcript} />
            <NotesPanel intakeId={intake.id} notes={notes} canWrite={canWriteNotes} />
          </div>

          <div className="space-y-6">
            <ActionsBar intake={intake} profiles={profiles} canAct={canStatus} />

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Integration</CardTitle>
                  <CardSubtitle>Upstream identifiers from Make.com.</CardSubtitle>
                </div>
              </CardHeader>
              <CardBody className="space-y-3 text-xs">
                <Row label="ElevenLabs call id" value={intake.elevenlabs_call_id} mono />
                <Row label="Make execution id" value={intake.make_execution_id} mono />
                <Row label="Call timestamp" value={formatDateTime(intake.call_timestamp)} />
                <Row label="Source" value={intake.source} />
              </CardBody>
            </Card>

            <ActivityLog items={activity} />
          </div>
        </div>
      </div>
    </>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-ink-muted dark:text-white/50">{label}</span>
      <span
        className={
          mono
            ? 'font-mono text-[11px] text-ink dark:text-white/85'
            : 'text-ink dark:text-white/85'
        }
      >
        {value ?? '—'}
      </span>
    </div>
  );
}
