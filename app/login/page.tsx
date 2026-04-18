import { env, isDemoMode } from '@/lib/env';
import { LoginForm } from './LoginForm';
import { IconTruck } from '@/components/icons';

export const metadata = { title: 'Sign in' };
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-muted px-4 py-10 dark:bg-ink">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-white dark:bg-brand-600">
            <IconTruck className="h-5 w-5" />
          </span>
          <div>
            <div className="text-base font-semibold tracking-tight text-ink dark:text-white">
              {env.appBrand}
            </div>
            <div className="text-xs text-ink-muted dark:text-white/50">
              Dispatch operations console
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-surface-border bg-white p-6 shadow-card dark:border-white/10 dark:bg-ink-soft/80">
          <h1 className="text-xl font-semibold tracking-tight text-ink dark:text-white">
            Sign in
          </h1>
          <p className="mt-1 text-sm text-ink-muted dark:text-white/60">
            Sign in to manage inbound voice intakes.
          </p>

          <div className="mt-6">
            <LoginForm demo={isDemoMode()} />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-ink-muted dark:text-white/50">
          Protected by Supabase Auth · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
