import { Card, CardBody, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { IconSpark } from '@/components/icons';
import type { DispatchIntake } from '@/types/intake';

export function AISummaryPanel({ intake }: { intake: DispatchIntake }) {
  const missing = intake.missing_fields ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconSpark className="h-4 w-4 text-brand-600 dark:text-brand-300" />
          <div>
            <CardTitle>AI Summary</CardTitle>
            <CardSubtitle>Synthesized by the voice agent and Make.com.</CardSubtitle>
          </div>
        </div>
        {typeof intake.priority_score === 'number' ? (
          <Badge tone={intake.priority_score >= 80 ? 'red' : intake.priority_score >= 60 ? 'amber' : 'blue'}>
            Priority {intake.priority_score}
          </Badge>
        ) : null}
      </CardHeader>
      <CardBody className="space-y-5">
        <section>
          <div className="text-xs font-medium uppercase tracking-wider text-ink-faint dark:text-white/40">
            Call summary
          </div>
          <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-ink dark:text-white/90">
            {intake.call_summary ?? 'No summary was generated for this call.'}
          </p>
        </section>

        {intake.recommended_action ? (
          <section className="rounded-xl border border-brand-100 bg-brand-50 p-3 dark:border-brand-500/20 dark:bg-brand-500/10">
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
              Recommended next step
            </div>
            <p className="mt-1 text-sm text-brand-900 dark:text-brand-100">
              {intake.recommended_action}
            </p>
          </section>
        ) : null}

        {missing.length ? (
          <section>
            <div className="text-xs font-medium uppercase tracking-wider text-ink-faint dark:text-white/40">
              Missing fields
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {missing.map((f) => (
                <Badge key={f} tone="amber">
                  {f.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </section>
        ) : null}
      </CardBody>
    </Card>
  );
}
