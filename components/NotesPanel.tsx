'use client';

import { useState, useTransition } from 'react';
import { Card, CardBody, CardHeader, CardTitle, CardSubtitle } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/EmptyState';
import { addNote } from '@/lib/actions';
import { formatRelative, initials } from '@/lib/formatters';
import type { InternalNote } from '@/types/note';

export function NotesPanel({
  intakeId,
  notes,
  canWrite,
}: {
  intakeId: string;
  notes: InternalNote[];
  canWrite: boolean;
}) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!text.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await addNote(intakeId, { note_text: text });
      if (!res.ok) setError(res.error ?? 'Could not save note');
      else setText('');
    });
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Internal Notes</CardTitle>
          <CardSubtitle>Visible to your team only.</CardSubtitle>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        {canWrite ? (
          <div className="space-y-2">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a quick note — what did the customer say, next step, blockers…"
            />
            {error ? <div className="text-xs text-red-600">{error}</div> : null}
            <div className="flex justify-end">
              <Button onClick={submit} loading={pending} disabled={!text.trim()}>
                Add note
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-surface-border p-3 text-xs text-ink-muted dark:border-white/10 dark:text-white/60">
            You have read-only access for this workspace.
          </div>
        )}

        {notes.length === 0 ? (
          <EmptyState title="No notes yet" description="Start the thread with what you know." />
        ) : (
          <ul className="space-y-3">
            {notes.map((n) => {
              const name = n.author?.full_name ?? n.author?.email ?? 'Teammate';
              return (
                <li
                  key={n.id}
                  className="flex gap-3 rounded-xl border border-surface-border/80 bg-surface-muted/40 p-3 dark:border-white/5 dark:bg-white/[0.03]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[11px] font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-200">
                    {initials(name)}
                  </span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-medium text-ink dark:text-white">{name}</span>
                      <span className="text-ink-faint dark:text-white/40">
                        {formatRelative(n.created_at)}
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap text-sm text-ink dark:text-white/90">
                      {n.note_text}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
