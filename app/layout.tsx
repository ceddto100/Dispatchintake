import type { Metadata } from 'next';
import './globals.css';
import { env } from '@/lib/env';

export const metadata: Metadata = {
  title: { default: env.appName, template: `%s · ${env.appName}` },
  description: 'Voice-driven dispatch intake command center.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-surface-muted text-ink antialiased dark:bg-ink dark:text-white">
        {children}
      </body>
    </html>
  );
}
