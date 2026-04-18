import { Card, CardBody, CardHeader, CardTitle, CardSubtitle } from '@/components/ui/Card';
import { UrgencyBadge } from '@/components/UrgencyBadge';
import { formatDate } from '@/lib/formatters';
import type { DispatchIntake } from '@/types/intake';

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wider text-ink-faint dark:text-white/40">
        {label}
      </div>
      <div className="mt-1 text-sm text-ink dark:text-white/90">
        {value || <span className="text-ink-faint dark:text-white/40">—</span>}
      </div>
    </div>
  );
}

export function IntakeDetails({ intake }: { intake: DispatchIntake }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Load Details</CardTitle>
          <CardSubtitle>Captured from the caller during the voice intake.</CardSubtitle>
        </div>
        <UrgencyBadge urgency={intake.urgency} />
      </CardHeader>
      <CardBody className="grid gap-5 sm:grid-cols-2">
        <Field label="Pickup location" value={intake.pickup_location} />
        <Field label="Delivery location" value={intake.delivery_location} />
        <Field label="Load type" value={intake.load_type} />
        <Field label="Trailer type" value={intake.trailer_type} />
        <Field label="Weight" value={intake.weight} />
        <Field label="Pickup date" value={formatDate(intake.pickup_date)} />
        <div className="sm:col-span-2">
          <Field
            label="Special instructions"
            value={
              intake.special_instructions ? (
                <span className="whitespace-pre-wrap">{intake.special_instructions}</span>
              ) : null
            }
          />
        </div>
      </CardBody>
    </Card>
  );
}
