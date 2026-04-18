export type IntakeStatus =
  | 'new'
  | 'incomplete'
  | 'contacted'
  | 'quoted'
  | 'booked'
  | 'closed_lost';

export type IntakeUrgency = 'low' | 'normal' | 'high' | 'critical';

export interface DispatchIntake {
  id: string;
  created_at: string;
  updated_at: string;

  caller_name: string | null;
  caller_phone: string | null;
  caller_email: string | null;
  company_name: string | null;
  company_id: string | null;

  pickup_location: string | null;
  delivery_location: string | null;
  load_type: string | null;
  trailer_type: string | null;
  weight: string | null;
  pickup_date: string | null;
  urgency: IntakeUrgency;
  special_instructions: string | null;

  call_summary: string | null;
  transcript: string | null;
  recommended_action: string | null;
  missing_fields: string[] | null;
  priority_score: number | null;

  intake_status: IntakeStatus;
  source: string;
  assigned_to: string | null;

  elevenlabs_call_id: string | null;
  make_execution_id: string | null;
  call_timestamp: string | null;
}

export const INTAKE_STATUSES: IntakeStatus[] = [
  'new',
  'incomplete',
  'contacted',
  'quoted',
  'booked',
  'closed_lost',
];

export const URGENCY_LEVELS: IntakeUrgency[] = ['low', 'normal', 'high', 'critical'];

export const STATUS_LABEL: Record<IntakeStatus, string> = {
  new: 'New',
  incomplete: 'Incomplete',
  contacted: 'Contacted',
  quoted: 'Quoted',
  booked: 'Booked',
  closed_lost: 'Closed Lost',
};

export const URGENCY_LABEL: Record<IntakeUrgency, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  critical: 'Critical',
};
