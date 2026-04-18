import type { IntakeStatus, IntakeUrgency } from './intake';
import type { UserRole } from './profile';
import type { ActivityType } from './activity';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [k: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          role: UserRole;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      dispatch_intakes: {
        Row: {
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
          missing_fields: Json | null;
          priority_score: number | null;
          intake_status: IntakeStatus;
          source: string;
          assigned_to: string | null;
          elevenlabs_call_id: string | null;
          make_execution_id: string | null;
          call_timestamp: string | null;
        };
        Insert: Partial<Database['public']['Tables']['dispatch_intakes']['Row']>;
        Update: Partial<Database['public']['Tables']['dispatch_intakes']['Row']>;
      };
      internal_notes: {
        Row: {
          id: string;
          intake_id: string;
          note_text: string;
          created_at: string;
          created_by: string | null;
        };
        Insert: Partial<Database['public']['Tables']['internal_notes']['Row']> & {
          intake_id: string;
          note_text: string;
        };
        Update: Partial<Database['public']['Tables']['internal_notes']['Row']>;
      };
      activity_logs: {
        Row: {
          id: string;
          intake_id: string;
          action_type: ActivityType;
          action_detail: Json | null;
          created_at: string;
          actor: string | null;
          actor_label: string | null;
        };
        Insert: Partial<Database['public']['Tables']['activity_logs']['Row']> & {
          intake_id: string;
          action_type: ActivityType;
        };
        Update: Partial<Database['public']['Tables']['activity_logs']['Row']>;
      };
    };
  };
}
