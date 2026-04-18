import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isDemoMode } from '@/lib/env';
import {
  MOCK_ACTIVITY,
  MOCK_INTAKES,
  MOCK_NOTES,
  MOCK_PROFILES,
} from '@/lib/mockData';
import type { DispatchIntake, IntakeStatus, IntakeUrgency } from '@/types/intake';
import type { InternalNote } from '@/types/note';
import type { ActivityLog } from '@/types/activity';
import type { Profile } from '@/types/profile';

export interface IntakeFilters {
  search?: string;
  statuses?: IntakeStatus[];
  urgencies?: IntakeUrgency[];
  assignedTo?: string | 'unassigned' | 'any';
  company?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export interface IntakeListResult {
  data: DispatchIntake[];
  count: number;
}

function normalizeMissing(v: unknown): string[] | null {
  if (!v) return null;
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === 'string') {
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      /* ignore */
    }
  }
  return null;
}

function castIntake(row: Record<string, unknown>): DispatchIntake {
  return {
    ...(row as DispatchIntake),
    missing_fields: normalizeMissing(row.missing_fields),
  };
}

function applyFilters(list: DispatchIntake[], f: IntakeFilters): DispatchIntake[] {
  let out = [...list];
  if (f.search) {
    const q = f.search.toLowerCase();
    out = out.filter((i) =>
      [i.caller_name, i.caller_phone, i.caller_email, i.company_name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }
  if (f.statuses?.length) out = out.filter((i) => f.statuses!.includes(i.intake_status));
  if (f.urgencies?.length) out = out.filter((i) => f.urgencies!.includes(i.urgency));
  if (f.assignedTo && f.assignedTo !== 'any') {
    if (f.assignedTo === 'unassigned') out = out.filter((i) => !i.assigned_to);
    else out = out.filter((i) => i.assigned_to === f.assignedTo);
  }
  if (f.company) {
    const q = f.company.toLowerCase();
    out = out.filter((i) => (i.company_name ?? '').toLowerCase().includes(q));
  }
  if (f.from) out = out.filter((i) => i.created_at >= f.from!);
  if (f.to) out = out.filter((i) => i.created_at <= f.to!);
  return out.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export async function listIntakes(filters: IntakeFilters = {}): Promise<IntakeListResult> {
  const { limit = 50, offset = 0 } = filters;

  if (isDemoMode()) {
    const filtered = applyFilters(MOCK_INTAKES, filters);
    return { data: filtered.slice(offset, offset + limit), count: filtered.length };
  }

  const supabase = createSupabaseServerClient();
  let q = supabase
    .from('dispatch_intakes')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters.statuses?.length) q = q.in('intake_status', filters.statuses);
  if (filters.urgencies?.length) q = q.in('urgency', filters.urgencies);
  if (filters.assignedTo && filters.assignedTo !== 'any') {
    if (filters.assignedTo === 'unassigned') q = q.is('assigned_to', null);
    else q = q.eq('assigned_to', filters.assignedTo);
  }
  if (filters.from) q = q.gte('created_at', filters.from);
  if (filters.to) q = q.lte('created_at', filters.to);
  if (filters.company) q = q.ilike('company_name', `%${filters.company}%`);
  if (filters.search) {
    const s = filters.search.replace(/[%,]/g, '');
    q = q.or(
      `caller_name.ilike.%${s}%,caller_phone.ilike.%${s}%,caller_email.ilike.%${s}%,company_name.ilike.%${s}%`,
    );
  }

  const { data, count, error } = await q;
  if (error) throw error;
  return {
    data: (data ?? []).map((r) => castIntake(r as Record<string, unknown>)),
    count: count ?? 0,
  };
}

export async function getIntake(id: string): Promise<DispatchIntake | null> {
  if (isDemoMode()) return MOCK_INTAKES.find((i) => i.id === id) ?? null;
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('dispatch_intakes')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return data ? castIntake(data as Record<string, unknown>) : null;
}

export async function listNotes(intakeId: string): Promise<InternalNote[]> {
  if (isDemoMode()) {
    return MOCK_NOTES.filter((n) => n.intake_id === intakeId).sort((a, b) =>
      a.created_at < b.created_at ? 1 : -1,
    );
  }
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('internal_notes')
    .select('*, author:profiles!created_by(full_name,email)')
    .eq('intake_id', intakeId)
    .order('created_at', { ascending: false });
  return (data ?? []) as unknown as InternalNote[];
}

export async function listActivity(intakeId: string): Promise<ActivityLog[]> {
  if (isDemoMode()) {
    return MOCK_ACTIVITY.filter((a) => a.intake_id === intakeId).sort((a, b) =>
      a.created_at < b.created_at ? 1 : -1,
    );
  }
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('intake_id', intakeId)
    .order('created_at', { ascending: false });
  return (data ?? []) as ActivityLog[];
}

export async function listProfiles(): Promise<Profile[]> {
  if (isDemoMode()) return MOCK_PROFILES;
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name', { ascending: true });
  return (data ?? []) as Profile[];
}

export interface DashboardMetrics {
  newToday: number;
  incomplete: number;
  contactedToday: number;
  booked: number;
  urgentOpen: number;
  totalOpen: number;
  byStatus: Record<IntakeStatus, number>;
  byUrgency: Record<IntakeUrgency, number>;
  recentIntakes: DispatchIntake[];
  recentActivity: ActivityLog[];
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [{ data: intakes }, activity] = await Promise.all([
    listIntakes({ limit: 500 }),
    isDemoMode()
      ? Promise.resolve(
          [...MOCK_ACTIVITY].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, 10),
        )
      : (async () => {
          const supabase = createSupabaseServerClient();
          const { data } = await supabase
            .from('activity_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
          return (data ?? []) as ActivityLog[];
        })(),
  ]);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startIso = startOfToday.toISOString();

  const byStatus: Record<IntakeStatus, number> = {
    new: 0,
    incomplete: 0,
    contacted: 0,
    quoted: 0,
    booked: 0,
    closed_lost: 0,
  };
  const byUrgency: Record<IntakeUrgency, number> = {
    low: 0,
    normal: 0,
    high: 0,
    critical: 0,
  };

  let newToday = 0;
  let contactedToday = 0;
  for (const i of intakes) {
    byStatus[i.intake_status] = (byStatus[i.intake_status] ?? 0) + 1;
    byUrgency[i.urgency] = (byUrgency[i.urgency] ?? 0) + 1;
    if (i.created_at >= startIso) newToday++;
    if (i.updated_at >= startIso && i.intake_status === 'contacted') contactedToday++;
  }

  const urgentOpen = intakes.filter(
    (i) =>
      (i.urgency === 'high' || i.urgency === 'critical') &&
      !['booked', 'closed_lost'].includes(i.intake_status),
  ).length;

  const totalOpen = intakes.filter(
    (i) => !['booked', 'closed_lost'].includes(i.intake_status),
  ).length;

  return {
    newToday,
    incomplete: byStatus.incomplete,
    contactedToday,
    booked: byStatus.booked,
    urgentOpen,
    totalOpen,
    byStatus,
    byUrgency,
    recentIntakes: intakes.slice(0, 6),
    recentActivity: activity,
  };
}
