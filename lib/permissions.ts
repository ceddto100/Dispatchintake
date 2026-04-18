import type { UserRole } from '@/types/profile';

export type Capability =
  | 'intake.read'
  | 'intake.write'
  | 'intake.assign'
  | 'intake.status'
  | 'notes.write'
  | 'settings.manage'
  | 'users.manage';

const MATRIX: Record<UserRole, Capability[]> = {
  admin: [
    'intake.read',
    'intake.write',
    'intake.assign',
    'intake.status',
    'notes.write',
    'settings.manage',
    'users.manage',
  ],
  dispatcher: [
    'intake.read',
    'intake.write',
    'intake.assign',
    'intake.status',
    'notes.write',
  ],
  sales_rep: ['intake.read', 'intake.status', 'notes.write'],
  viewer: ['intake.read'],
};

export function can(role: UserRole | undefined | null, cap: Capability): boolean {
  if (!role) return false;
  return MATRIX[role]?.includes(cap) ?? false;
}
