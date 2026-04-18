import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { Database } from '@/types/database';
import { env, isDemoMode } from '@/lib/env';

const PUBLIC_PATHS = ['/login', '/api/intakes/webhook', '/_next', '/favicon.ico', '/api/health'];

export async function updateSession(request: NextRequest) {
  const url = request.nextUrl.clone();
  const isPublic = PUBLIC_PATHS.some((p) => url.pathname.startsWith(p));

  // In demo mode we skip Supabase cookies entirely and let every page render.
  if (isDemoMode()) return NextResponse.next();

  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      get: (name) => request.cookies.get(name)?.value,
      set: (name, value, options: CookieOptions) => {
        response.cookies.set({ name, value, ...options });
      },
      remove: (name, options: CookieOptions) => {
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  const { data } = await supabase.auth.getUser();

  if (!data.user && !isPublic) {
    url.pathname = '/login';
    url.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (data.user && url.pathname === '/login') {
    url.pathname = '/dashboard';
    url.searchParams.delete('next');
    return NextResponse.redirect(url);
  }

  return response;
}
