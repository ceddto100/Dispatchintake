import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { URGENCY_LABEL, type IntakeUrgency } from '@/types/intake';

const TONES: Record<IntakeUrgency, BadgeTone> = {
  low: 'slate',
  normal: 'blue',
  high: 'amber',
  critical: 'red',
};

export function UrgencyBadge({ urgency }: { urgency: IntakeUrgency }) {
  return <Badge tone={TONES[urgency]}>{URGENCY_LABEL[urgency]}</Badge>;
}
