import Link from 'next/link';
import { Header } from '@/components/Header';
import { IntakeTable } from '@/components/IntakeTable';
import { FiltersBar } from '@/components/FiltersBar';
import { Button } from '@/components/ui/Button';
import { getCurrentUser } from '@/lib/auth';
import { listIntakes, listProfiles } from '@/lib/queries';
import { INTAKE_STATUSES, URGENCY_LEVELS, type IntakeStatus, type IntakeUrgency } from '@/types/intake';

export const metadata = { title: 'Intakes' };
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 25;

function parseList<T extends string>(value: string | undefined, allowed: readonly T[]): T[] {
  if (!value) return [];
  return value
    .split(',')
    .map((v) => v.trim())
    .filter((v): v is T => (allowed as readonly string[]).includes(v));
}

export default async function IntakesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const get = (k: string) =>
    typeof searchParams[k] === 'string' ? (searchParams[k] as string) : undefined;

  const page = Math.max(1, parseInt(get('page') ?? '1', 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const statuses = [
    ...parseList<IntakeStatus>(get('status'), INTAKE_STATUSES),
  ];
  const urgencies = [
    ...parseList<IntakeUrgency>(get('urgency'), URGENCY_LEVELS),
  ];

  const [{ profile, isDemo }, { data, count }, profiles] = await Promise.all([
    getCurrentUser(),
    listIntakes({
      search: get('q'),
      statuses,
      urgencies,
      assignedTo: (get('assignee') as 'any' | 'unassigned' | string | undefined) ?? 'any',
      from: get('from'),
      to: get('to'),
      company: get('company'),
      limit: PAGE_SIZE,
      offset,
    }),
    listProfiles(),
  ]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const qs = (overrides: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...searchParams, ...overrides })) {
      if (typeof v === 'string' && v) p.set(k, v);
    }
    return p.toString();
  };

  return (
    <>
      <Header
        title="Intakes"
        subtitle={`${count} total · showing page ${page} of ${totalPages}`}
        profile={profile}
        isDemo={isDemo}
      />
      <div className="space-y-4 px-6 py-6">
        <FiltersBar profiles={profiles} />
        <IntakeTable intakes={data} profiles={profiles} />

        <div className="flex items-center justify-between text-xs text-ink-muted dark:text-white/50">
          <div>
            Showing {data.length === 0 ? 0 : offset + 1}–{offset + data.length} of {count}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/intakes?${qs({ page: String(Math.max(1, page - 1)) })}`}
              aria-disabled={page <= 1}
              className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
            >
              <Button variant="outline" size="sm">
                Previous
              </Button>
            </Link>
            <Link
              href={`/intakes?${qs({ page: String(Math.min(totalPages, page + 1)) })}`}
              aria-disabled={page >= totalPages}
              className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
            >
              <Button variant="outline" size="sm">
                Next
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
