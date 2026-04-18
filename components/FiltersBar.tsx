'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { IconSearch } from '@/components/icons';
import { INTAKE_STATUSES, URGENCY_LEVELS, STATUS_LABEL, URGENCY_LABEL } from '@/types/intake';
import type { Profile } from '@/types/profile';
import { useTransition } from 'react';

export function FiltersBar({ profiles }: { profiles: Profile[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    next.delete('offset');
    startTransition(() => router.replace(`/intakes?${next.toString()}`));
  }

  const search = params.get('q') ?? '';
  const status = params.get('status') ?? '';
  const urgency = params.get('urgency') ?? '';
  const assignee = params.get('assignee') ?? '';
  const from = params.get('from') ?? '';
  const to = params.get('to') ?? '';

  return (
    <div className="grid gap-3 rounded-2xl border border-surface-border bg-white px-4 py-3 shadow-card dark:border-white/10 dark:bg-ink-soft/80 md:grid-cols-[2fr_1fr_1fr_1.2fr_1fr_1fr_auto]">
      <div className="relative">
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <Input
          placeholder="Search name, phone, email, company…"
          defaultValue={search}
          onChange={(e) => setParam('q', e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={status} onChange={(e) => setParam('status', e.target.value)}>
        <option value="">All statuses</option>
        {INTAKE_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </Select>

      <Select value={urgency} onChange={(e) => setParam('urgency', e.target.value)}>
        <option value="">All urgencies</option>
        {URGENCY_LEVELS.map((u) => (
          <option key={u} value={u}>
            {URGENCY_LABEL[u]}
          </option>
        ))}
      </Select>

      <Select value={assignee} onChange={(e) => setParam('assignee', e.target.value)}>
        <option value="">Any assignee</option>
        <option value="unassigned">Unassigned</option>
        {profiles.map((p) => (
          <option key={p.id} value={p.id}>
            {p.full_name ?? p.email}
          </option>
        ))}
      </Select>

      <Input
        type="date"
        defaultValue={from}
        onChange={(e) => setParam('from', e.target.value)}
      />
      <Input
        type="date"
        defaultValue={to}
        onChange={(e) => setParam('to', e.target.value)}
      />

      <Button
        variant="outline"
        loading={pending}
        onClick={() => startTransition(() => router.replace('/intakes'))}
      >
        Clear
      </Button>
    </div>
  );
}
