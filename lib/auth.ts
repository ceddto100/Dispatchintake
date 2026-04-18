import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isDemoMode } from '@/lib/env';
import type { Profile, UserRole } from '@/types/profile';

const DEMO_PROFILE: Profile = {
  id: 'demo-user',
  full_name: 'Demo Dispatcher',
  email: 'demo@dispatch.local',
  role: 'admin',
  avatar_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export async function getCurrentUser(): Promise<{
  userId: string | null;
  profile: Profile | null;
  isDemo: boolean;
}> {
  if (isDemoMode()) {
    return { userId: DEMO_PROFILE.id, profile: DEMO_PROFILE, isDemo: true };
  }

  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { userId: null, profile: null, isDemo: false };

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .maybeSingle();

  return {
    userId: data.user.id,
    profile: (profile as Profile) ?? {
      id: data.user.id,
      email: data.user.email ?? null,
      full_name: data.user.user_metadata?.full_name ?? null,
      role: 'dispatcher' as UserRole,
      avatar_url: null,
      created_at: data.user.created_at,
      updated_at: new Date().toISOString(),
    },
    isDemo: false,
  };
}
