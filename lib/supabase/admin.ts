import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { env } from '@/lib/env';

/**
 * Service-role client for server-side ingestion and privileged writes
 * (webhook route, system-level activity logs). Never import this into a client component.
 */
export function createSupabaseAdminClient() {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new Error('Supabase admin client requires SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient<Database>(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
