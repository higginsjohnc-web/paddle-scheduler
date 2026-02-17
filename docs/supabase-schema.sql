-- Run this in Supabase SQL Editor to create your database tables

-- Players table (synced from Google Sheets)
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Match blocks (time slots and locations)
CREATE TABLE match_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week TEXT NOT NULL, -- 'Saturday' or 'Sunday'
  start_time TIME NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weekend events (each weekend's schedule)
CREATE TABLE weekend_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saturday_date DATE NOT NULL,
  sunday_date DATE NOT NULL,
  status TEXT DEFAULT 'draft', -- 'draft', 'invites_sent', 'completed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(saturday_date, sunday_date)
);

-- Player availability responses
CREATE TABLE player_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weekend_event_id UUID REFERENCES weekend_events(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  availability TEXT NOT NULL, -- 'both', 'saturday', 'sunday', 'none'
  responded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(weekend_event_id, player_id)
);

-- Matches (actual scheduled games)
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weekend_event_id UUID REFERENCES weekend_events(id) ON DELETE CASCADE,
  match_block_id UUID REFERENCES match_blocks(id) ON DELETE CASCADE,
  match_date DATE NOT NULL,
  player1_id UUID REFERENCES players(id),
  player2_id UUID REFERENCES players(id),
  player3_id UUID REFERENCES players(id),
  player4_id UUID REFERENCES players(id),
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email log (track what we've sent)
CREATE TABLE email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id),
  weekend_event_id UUID REFERENCES weekend_events(id),
  email_type TEXT NOT NULL, -- 'availability_request', 'reminder_availability', 'match_reminder'
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  success BOOLEAN DEFAULT TRUE
);

-- Indexes for performance
CREATE INDEX idx_player_availability_weekend ON player_availability(weekend_event_id);
CREATE INDEX idx_matches_weekend ON matches(weekend_event_id);
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_email_log_player ON email_log(player_id);
CREATE INDEX idx_email_log_weekend ON email_log(weekend_event_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for players table
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
