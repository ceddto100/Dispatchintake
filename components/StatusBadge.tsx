import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { STATUS_LABEL, type IntakeStatus } from '@/types/intake';

const TONES: Record<IntakeStatus, BadgeTone> = {
  new: 'blue',
  incomplete: 'amber',
  contacted: 'violet',
  quoted: 'sky',
  booked: 'green',
  closed_lost: 'slate',
};

export function StatusBadge({ status }: { status: IntakeStatus }) {
  return (
    <Badge tone={TONES[status]} dot>
      {STATUS_LABEL[status]}
    </Badge>
  );
}
