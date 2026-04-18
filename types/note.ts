export interface InternalNote {
  id: string;
  intake_id: string;
  note_text: string;
  created_at: string;
  created_by: string | null;
  author?: {
    full_name: string | null;
    email: string | null;
  } | null;
}
