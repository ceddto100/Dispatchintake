import { z } from 'zod';
import { INTAKE_STATUSES, URGENCY_LEVELS } from '@/types/intake';

/**
 * Make.com webhook payload schema.
 * Every field is tolerant — the voice agent may not capture everything.
 */
export const webhookIntakeSchema = z
  .object({
    caller_name: z.string().trim().max(200).optional().nullable(),
    caller_phone: z.string().trim().max(50).optional().nullable(),
    caller_email: z.string().trim().max(200).optional().nullable(),
    company_name: z.string().trim().max(200).optional().nullable(),

    pickup_location: z.string().trim().max(300).optional().nullable(),
    delivery_location: z.string().trim().max(300).optional().nullable(),
    load_type: z.string().trim().max(120).optional().nullable(),
    trailer_type: z.string().trim().max(120).optional().nullable(),
    weight: z.string().trim().max(60).optional().nullable(),
    pickup_date: z.string().trim().max(40).optional().nullable(),

    urgency: z
      .enum(URGENCY_LEVELS as [string, ...string[]])
      .optional()
      .nullable(),

    special_instructions: z.string().trim().max(4000).optional().nullable(),
    call_summary: z.string().trim().max(8000).optional().nullable(),
    transcript: z.string().trim().max(200_000).optional().nullable(),
    recommended_action: z.string().trim().max(2000).optional().nullable(),
    missing_fields: z.union([z.array(z.string()), z.string()]).optional().nullable(),
    priority_score: z.number().int().min(0).max(100).optional().nullable(),

    call_timestamp: z.string().trim().max(60).optional().nullable(),
    source: z.string().trim().max(120).optional().nullable(),
    elevenlabs_call_id: z.string().trim().max(200).optional().nullable(),
    make_execution_id: z.string().trim().max(200).optional().nullable(),

    intake_status: z
      .enum(INTAKE_STATUSES as [string, ...string[]])
      .optional()
      .nullable(),
  })
  .passthrough();

export type WebhookIntakeInput = z.infer<typeof webhookIntakeSchema>;

export const noteSchema = z.object({
  note_text: z.string().trim().min(1, 'Note cannot be empty').max(4000),
});

export const statusUpdateSchema = z.object({
  intake_status: z.enum(INTAKE_STATUSES as [string, ...string[]]),
});

export const assignmentSchema = z.object({
  // Tolerant: accepts UUID in prod, accepts synthetic ids in demo mode.
  assigned_to: z.string().min(1).nullable(),
});

/** Best-effort ISO date parse — returns null if unparseable. */
export function safeIsoDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Parse free-form "pickup_date" strings — returns a YYYY-MM-DD or null. */
export function safePickupDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

/** Normalize missing_fields into a clean string[]. */
export function normalizeMissingFields(
  input: string[] | string | null | undefined,
): string[] | null {
  if (!input) return null;
  if (Array.isArray(input)) {
    return input.map((s) => String(s).trim()).filter(Boolean);
  }
  // support comma-separated string from Make
  return input
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
