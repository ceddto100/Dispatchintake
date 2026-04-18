export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  makeWebhookSecret: process.env.MAKE_WEBHOOK_SECRET ?? '',
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'Dispatch Intake',
  appBrand: process.env.NEXT_PUBLIC_APP_BRAND ?? 'Dispatch Intake',
  demoForced: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
};

export function isSupabaseConfigured(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

/**
 * Demo mode is active when Supabase env vars are missing OR when explicitly forced.
 * In demo mode the app reads from lib/mockData.ts instead of Supabase — this keeps
 * the whole UI navigable even before you've wired up Supabase.
 */
export function isDemoMode(): boolean {
  return env.demoForced || !isSupabaseConfigured();
}
