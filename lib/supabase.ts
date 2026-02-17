import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export type Player = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
};

export type MatchBlock = {
  id: string;
  day_of_week: 'Saturday' | 'Sunday';
  start_time: string;
  location: string;
  created_at: string;
};

export type WeekendEvent = {
  id: string;
  saturday_date: string;
  sunday_date: string;
  status: 'draft' | 'invites_sent' | 'completed';
  created_at: string;
};

export type PlayerAvailability = {
  id: string;
  weekend_event_id: string;
  player_id: string;
  availability: 'both' | 'saturday' | 'sunday' | 'none';
  responded_at: string;
};

export type Match = {
  id: string;
  weekend_event_id: string;
  match_block_id: string;
  match_date: string;
  player1_id?: string;
  player2_id?: string;
  player3_id?: string;
  player4_id?: string;
  reminder_sent: boolean;
  created_at: string;
};

export type EmailLog = {
  id: string;
  player_id?: string;
  weekend_event_id?: string;
  email_type: 'availability_request' | 'reminder_availability' | 'match_reminder';
  sent_at: string;
  success: boolean;
};
