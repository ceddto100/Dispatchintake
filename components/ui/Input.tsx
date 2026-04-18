import { cn } from '@/lib/cn';
import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

const FIELD =
  'w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-surface-muted disabled:text-ink-muted dark:bg-ink/40 dark:text-white dark:border-white/10 dark:placeholder:text-white/30';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(FIELD, 'h-9', className)} {...props} />;
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(FIELD, 'min-h-[88px] resize-y', className)} {...props} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select ref={ref} className={cn(FIELD, 'h-9 pr-8 appearance-none bg-no-repeat', 'bg-[right_0.6rem_center]', className)} {...props}>
        {children}
      </select>
    );
  },
);

export function Label({ htmlFor, children, className }: { htmlFor?: string; children: React.ReactNode; className?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn('mb-1.5 block text-xs font-medium text-ink-muted dark:text-white/60', className)}
    >
      {children}
    </label>
  );
}
