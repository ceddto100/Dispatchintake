'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import { isDemoMode } from '@/lib/env';
import { MOCK_ACTIVITY, MOCK_INTAKES, MOCK_NOTES } from '@/lib/mockData';
import { assignmentSchema, noteSchema, statusUpdateSchema } from '@/lib/validators';
import type { IntakeStatus } from '@/types/intake';

export interface ActionResult {
  ok: boolean;
  error?: string;
}

function randomId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

async function logActivity(intakeId: string, payload: {
  action_type: import('@/types/activity').ActivityType;
  action_detail?: Record<string, unknown>;
  actor?: string | null;
  actor_label?: string | null;
}) {
  if (isDemoMode()) {
    MOCK_ACTIVITY.unshift({
      id: randomId('act'),
      intake_id: intakeId,
      action_type: payload.action_type,
      action_detail: payload.action_detail ?? null,
      created_at: new Date().toISOString(),
      actor: payload.actor ?? null,
      actor_label: payload.actor_label ?? null,
    });
    return;
  }
  const supabase = createSupabaseServerClient();
  await supabase.from('activity_logs').insert({
    intake_id: intakeId,
    action_type: payload.action_type,
    action_detail: (payload.action_detail ?? null) as any,
    actor: payload.actor ?? null,
    actor_label: payload.actor_label ?? null,
  });
}

export async function updateIntakeStatus(
  intakeId: string,
  input: { intake_status: IntakeStatus },
): Promise<ActionResult> {
  const parsed = statusUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Invalid status' };

  const { profile } = await getCurrentUser();

  if (isDemoMode()) {
    const intake = MOCK_INTAKES.find((i) => i.id === intakeId);
    if (!intake) return { ok: false, error: 'Not found' };
    const previous = intake.intake_status;
    intake.intake_status = parsed.data.intake_status;
    intake.updated_at = new Date().toISOString();
    await logActivity(intakeId, {
      action_type: 'status_changed',
      action_detail: { from: previous, to: parsed.data.intake_status },
      actor: profile?.id ?? null,
      actor_label: profile?.full_name ?? profile?.email ?? 'You',
    });
    revalidatePath(`/intakes/${intakeId}`);
    revalidatePath('/intakes');
    revalidatePath('/dashboard');
    return { ok: true };
  }

  const supabase = createSupabaseServerClient();
  const { data: current } = await supabase
    .from('dispatch_intakes')
    .select('intake_status')
    .eq('id', intakeId)
    .maybeSingle();

  const { error } = await supabase
    .from('dispatch_intakes')
    .update({ intake_status: parsed.data.intake_status })
    .eq('id', intakeId);
  if (error) return { ok: false, error: error.message };

  await logActivity(intakeId, {
    action_type: 'status_changed',
    action_detail: { from: current?.intake_status ?? null, to: parsed.data.intake_status },
    actor: profile?.id ?? null,
    actor_label: profile?.full_name ?? profile?.email ?? null,
  });

  revalidatePath(`/intakes/${intakeId}`);
  revalidatePath('/intakes');
  revalidatePath('/dashboard');
  return { ok: true };
}

export async function assignIntake(
  intakeId: string,
  assignedTo: string | null,
): Promise<ActionResult> {
  const parsed = assignmentSchema.safeParse({ assigned_to: assignedTo });
  if (!parsed.success && assignedTo !== null) {
    return { ok: false, error: 'Invalid assignee id' };
  }

  const { profile } = await getCurrentUser();

  if (isDemoMode()) {
    const intake = MOCK_INTAKES.find((i) => i.id === intakeId);
    if (!intake) return { ok: false, error: 'Not found' };
    intake.assigned_to = assignedTo;
    intake.updated_at = new Date().toISOString();
    await logActivity(intakeId, {
      action_type: 'assignment_changed',
      action_detail: { to: assignedTo },
      actor: profile?.id ?? null,
      actor_label: profile?.full_name ?? profile?.email ?? 'You',
    });
    revalidatePath(`/intakes/${intakeId}`);
    revalidatePath('/intakes');
    return { ok: true };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from('dispatch_intakes')
    .update({ assigned_to: assignedTo })
    .eq('id', intakeId);
  if (error) return { ok: false, error: error.message };

  await logActivity(intakeId, {
    action_type: 'assignment_changed',
    action_detail: { to: assignedTo },
    actor: profile?.id ?? null,
    actor_label: profile?.full_name ?? profile?.email ?? null,
  });
  revalidatePath(`/intakes/${intakeId}`);
  revalidatePath('/intakes');
  return { ok: true };
}

export async function addNote(intakeId: string, input: { note_text: string }): Promise<ActionResult> {
  const parsed = noteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const { profile } = await getCurrentUser();

  if (isDemoMode()) {
    const note = {
      id: randomId('note'),
      intake_id: intakeId,
      note_text: parsed.data.note_text,
      created_at: new Date().toISOString(),
      created_by: profile?.id ?? null,
      author: profile ? { full_name: profile.full_name, email: profile.email } : null,
    };
    MOCK_NOTES.unshift(note);
    await logActivity(intakeId, {
      action_type: 'note_added',
      action_detail: { preview: parsed.data.note_text.slice(0, 160) },
      actor: profile?.id ?? null,
      actor_label: profile?.full_name ?? profile?.email ?? 'You',
    });
    revalidatePath(`/intakes/${intakeId}`);
    return { ok: true };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from('internal_notes').insert({
    intake_id: intakeId,
    note_text: parsed.data.note_text,
    created_by: profile?.id ?? null,
  });
  if (error) return { ok: false, error: error.message };

  await logActivity(intakeId, {
    action_type: 'note_added',
    action_detail: { preview: parsed.data.note_text.slice(0, 160) },
    actor: profile?.id ?? null,
    actor_label: profile?.full_name ?? profile?.email ?? null,
  });
  revalidatePath(`/intakes/${intakeId}`);
  return { ok: true };
}

export async function signOut() {
  if (isDemoMode()) redirect('/login');
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/login');
}
