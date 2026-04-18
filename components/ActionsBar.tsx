'use client';

import { useState, useTransition } from 'react';
import { Card, CardBody, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { StatusBadge } from '@/components/StatusBadge';
import { IconCheck } from '@/components/icons';
import { INTAKE_STATUSES, STATUS_LABEL, type DispatchIntake, type IntakeStatus } from '@/types/intake';
import { assignIntake, updateIntakeStatus } from '@/lib/actions';
import type { Profile } from '@/types/profile';

const QUICK_ACTIONS: { status: IntakeStatus; label: string }[] = [
  { status: 'contacted', label: 'Mark contacted' },
  { status: 'quoted', label: 'Mark quoted' },
  { status: 'booked', label: 'Mark booked' },
  { status: 'incomplete', label: 'Mark incomplete' },
  { status: 'closed_lost', label: 'Closed lost' },
];

export function ActionsBar({
  intake,
  profiles,
  canAct,
}: {
  intake: DispatchIntake;
  profiles: Profile[];
  canAct: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [justDid, setJustDid] = useState<string | null>(null);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, label: string) {
    setError(null);
    setJustDid(null);
    startTransition(async () => {
      const res = await fn();
      if (res.ok) setJustDid(label);
      else setError(res.error ?? 'Action failed');
    });
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Actions</CardTitle>
          <CardSubtitle>Move this intake through your pipeline.</CardSubtitle>
        </div>
        <StatusBadge status={intake.intake_status} />
      </CardHeader>
      <CardBody className="space-y-5">
        <fieldset disabled={!canAct || pending} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.map((a) => (
              <Button
                key={a.status}
                variant={a.status === intake.intake_status ? 'secondary' : 'outline'}
                onClick={() => run(() => updateIntakeStatus(intake.id, { intake_status: a.status }), a.label)}
              >
                {a.label}
              </Button>
            ))}
          </div>

          <div>
            <div className="mb-1.5 text-xs font-medium text-ink-muted dark:text-white/60">
              Status
            </div>
            <Select
              value={intake.intake_status}
              onChange={(e) =>
                run(
                  () => updateIntakeStatus(intake.id, { intake_status: e.target.value as IntakeStatus }),
                  'Status updated',
                )
              }
            >
              {INTAKE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <div className="mb-1.5 text-xs font-medium text-ink-muted dark:text-white/60">
              Assigned to
            </div>
            <Select
              value={intake.assigned_to ?? ''}
              onChange={(e) =>
                run(
                  () => assignIntake(intake.id, e.target.value || null),
                  e.target.value ? 'Assignment updated' : 'Unassigned',
                )
              }
            >
              <option value="">Unassigned</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name ?? p.email}
                </option>
              ))}
            </Select>
          </div>

          <Button variant="ghost" disabled title="Placeholder — wire up email/SMS later">
            Send follow-up (coming soon)
          </Button>
        </fieldset>

        {error ? <div className="text-xs text-red-600">{error}</div> : null}
        {justDid ? (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            <IconCheck className="h-3.5 w-3.5" />
            {justDid}
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}
