import { signOut } from '@/lib/actions';
import { IconLogout } from '@/components/icons';
import { initials } from '@/lib/formatters';
import { ROLE_LABEL, type Profile } from '@/types/profile';

export function Header({
  title,
  subtitle,
  profile,
  isDemo,
  right,
}: {
  title: string;
  subtitle?: string;
  profile: Profile | null;
  isDemo: boolean;
  right?: React.ReactNode;
}) {
  const name = profile?.full_name ?? profile?.email ?? 'Signed out';

  return (
    <header className="sticky top-0 z-10 border-b border-surface-border bg-white/85 px-6 py-4 backdrop-blur-md dark:border-white/5 dark:bg-ink/80">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink dark:text-white">{title}</h1>
          {subtitle ? (
            <p className="mt-0.5 text-sm text-ink-muted dark:text-white/60">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          {right}
          {isDemo ? (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
              Demo mode
            </span>
          ) : null}
          <div className="flex items-center gap-2 rounded-full border border-surface-border bg-white px-2 py-1 dark:border-white/10 dark:bg-white/5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-200">
              {initials(name)}
            </span>
            <div className="pr-1 text-xs">
              <div className="font-medium text-ink dark:text-white">{name}</div>
              <div className="text-[11px] text-ink-faint dark:text-white/40">
                {profile ? ROLE_LABEL[profile.role] : ''}
              </div>
            </div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-surface-border bg-white text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
              title="Sign out"
              aria-label="Sign out"
            >
              <IconLogout className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
