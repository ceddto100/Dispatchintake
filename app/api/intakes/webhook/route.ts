import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { env, isDemoMode } from '@/lib/env';
import {
  normalizeMissingFields,
  safeIsoDate,
  safePickupDate,
  webhookIntakeSchema,
} from '@/lib/validators';
import { MOCK_ACTIVITY, MOCK_INTAKES } from '@/lib/mockData';
import type { IntakeStatus, IntakeUrgency } from '@/types/intake';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function unauthorized(reason: string) {
  return NextResponse.json({ ok: false, error: reason }, { status: 401 });
}

function badRequest(reason: string, details?: unknown) {
  return NextResponse.json({ ok: false, error: reason, details }, { status: 400 });
}

export async function POST(request: NextRequest) {
  // --- auth ---
  if (env.makeWebhookSecret) {
    const header = request.headers.get('x-webhook-secret') ?? '';
    const bearer = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
    const provided = header || bearer;
    if (!provided || provided !== env.makeWebhookSecret) {
      return unauthorized('Invalid or missing webhook secret');
    }
  }

  // --- parse body ---
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return badRequest('Invalid JSON body');
  }

  const parsed = webhookIntakeSchema.safeParse(raw);
  if (!parsed.success) {
    return badRequest('Invalid payload', parsed.error.flatten());
  }
  const p = parsed.data;

  const urgency: IntakeUrgency = ((): IntakeUrgency => {
    const u = (p.urgency ?? '').toLowerCase();
    if (u === 'low' || u === 'normal' || u === 'high' || u === 'critical') return u;
    return 'normal';
  })();

  const intake = {
    caller_name: p.caller_name ?? null,
    caller_phone: p.caller_phone ?? null,
    caller_email: p.caller_email ?? null,
    company_name: p.company_name ?? null,
    pickup_location: p.pickup_location ?? null,
    delivery_location: p.delivery_location ?? null,
    load_type: p.load_type ?? null,
    trailer_type: p.trailer_type ?? null,
    weight: p.weight ?? null,
    pickup_date: safePickupDate(p.pickup_date ?? null),
    urgency,
    special_instructions: p.special_instructions ?? null,
    call_summary: p.call_summary ?? null,
    transcript: p.transcript ?? null,
    recommended_action: p.recommended_action ?? null,
    missing_fields: normalizeMissingFields(p.missing_fields),
    priority_score: p.priority_score ?? null,
    intake_status: (p.intake_status as IntakeStatus) ?? 'new',
    source: p.source ?? 'elevenlabs_dispatch_agent',
    elevenlabs_call_id: p.elevenlabs_call_id ?? null,
    make_execution_id: p.make_execution_id ?? null,
    call_timestamp: safeIsoDate(p.call_timestamp ?? null),
  };

  // --- demo mode: mutate in-memory store so the UI stays coherent ---
  if (isDemoMode()) {
    const id = `intake-${Math.random().toString(36).slice(2, 10)}`;
    const now = new Date().toISOString();
    MOCK_INTAKES.unshift({
      id,
      created_at: now,
      updated_at: now,
      company_id: null,
      assigned_to: null,
      ...intake,
    });
    MOCK_ACTIVITY.unshift({
      id: `act-${Math.random().toString(36).slice(2, 10)}`,
      intake_id: id,
      action_type: 'intake_created',
      action_detail: { source: intake.source },
      created_at: now,
      actor: null,
      actor_label: 'Make.com · Webhook',
    });
    return NextResponse.json({ ok: true, id, demo: true }, { status: 201 });
  }

  // --- real write via service role ---
  let supabase: ReturnType<typeof createSupabaseAdminClient>;
  try {
    supabase = createSupabaseAdminClient();
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 },
    );
  }

  const { data: inserted, error } = await supabase
    .from('dispatch_intakes')
    .insert(intake as any)
    .select('id')
    .single();

  if (error || !inserted) {
    return NextResponse.json(
      { ok: false, error: error?.message ?? 'Insert failed' },
      { status: 500 },
    );
  }

  await supabase.from('activity_logs').insert({
    intake_id: inserted.id,
    action_type: 'intake_created',
    action_detail: {
      source: intake.source,
      make_execution_id: intake.make_execution_id,
      elevenlabs_call_id: intake.elevenlabs_call_id,
    } as any,
    actor_label: 'Make.com · Webhook',
  });

  return NextResponse.json({ ok: true, id: inserted.id }, { status: 201 });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: '/api/intakes/webhook',
    method: 'POST',
    secured: Boolean(env.makeWebhookSecret),
    accepts: 'application/json',
  });
}
