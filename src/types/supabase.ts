// Supabase Database Types
export interface GuardianRelationshipRow {
  minor_id: string;
  relationship_type: string;
  alert_level: string;
}

export interface ProfileRow {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

export interface SupabaseRealtimePayload<T> {
  new: T;
  old: T;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
}
