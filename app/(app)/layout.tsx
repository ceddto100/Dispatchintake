import { AppShell } from '@/components/AppShell';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AuthedLayout({ children }: { children: React.ReactNode }) {
  const { userId, isDemo } = await getCurrentUser();
  if (!userId && !isDemo) redirect('/login');
  return <AppShell>{children}</AppShell>;
}
