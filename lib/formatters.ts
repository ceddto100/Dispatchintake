import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

export function formatDateTime(iso: string | Date | null | undefined): string {
  if (!iso) return '—';
  const d = typeof iso === 'string' ? parseISO(iso) : iso;
  return isValid(d) ? format(d, 'MMM d, yyyy · h:mm a') : '—';
}

export function formatDate(iso: string | Date | null | undefined): string {
  if (!iso) return '—';
  const d = typeof iso === 'string' ? parseISO(iso) : iso;
  return isValid(d) ? format(d, 'MMM d, yyyy') : '—';
}

export function formatRelative(iso: string | Date | null | undefined): string {
  if (!iso) return '—';
  const d = typeof iso === 'string' ? parseISO(iso) : iso;
  return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : '—';
}

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '—';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

export function initials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function truncate(text: string | null | undefined, max = 80): string {
  if (!text) return '—';
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
