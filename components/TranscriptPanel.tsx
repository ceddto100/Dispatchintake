import { Card, CardBody, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card';

export function TranscriptPanel({ transcript }: { transcript: string | null }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Call Transcript</CardTitle>
          <CardSubtitle>Captured by the ElevenLabs voice agent.</CardSubtitle>
        </div>
      </CardHeader>
      <CardBody>
        {transcript ? (
          <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap rounded-xl bg-surface-muted/60 p-4 font-mono text-xs leading-relaxed text-ink dark:bg-white/[0.03] dark:text-white/85">
            {transcript}
          </pre>
        ) : (
          <div className="rounded-xl border border-dashed border-surface-border p-6 text-center text-xs text-ink-muted dark:border-white/10 dark:text-white/60">
            No transcript was captured for this call.
          </div>
        )}
      </CardBody>
    </Card>
  );
}
