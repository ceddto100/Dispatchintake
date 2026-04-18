export type ActivityType =
  | 'intake_created'
  | 'status_changed'
  | 'assignment_changed'
  | 'note_added'
  | 'webhook_received'
  | 'notification_sent'
  | 'field_updated';

export interface ActivityLog {
  id: string;
  intake_id: string;
  action_type: ActivityType;
  action_detail: Record<string, unknown> | null;
  created_at: string;
  actor: string | null;
  actor_label: string | null;
}
