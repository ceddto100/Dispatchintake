export type UserRole = 'admin' | 'dispatcher' | 'sales_rep' | 'viewer';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Admin',
  dispatcher: 'Dispatcher',
  sales_rep: 'Sales Rep',
  viewer: 'Viewer',
};
