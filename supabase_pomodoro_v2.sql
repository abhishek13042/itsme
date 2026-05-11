-- POMODORO & FOCUS V2 SCHEMA

-- 1. POMODORO SESSIONS
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_date DATE NOT NULL,
  label TEXT,
  category TEXT,
  mode TEXT CHECK (mode IN (
    'pomodoro','deep_work',
    'study_block','flow','custom'
  )),
  duration_minutes INTEGER NOT NULL,
  break_minutes INTEGER DEFAULT 5,
  completed BOOLEAN DEFAULT false,
  interrupted BOOLEAN DEFAULT false,
  interruption_count INTEGER DEFAULT 0,
  linked_quest_id UUID,
  xp_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. FOCUS SETTINGS
CREATE TABLE IF NOT EXISTS focus_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID, -- For future multi-user support
  pomodoro_duration INTEGER DEFAULT 25,
  short_break INTEGER DEFAULT 5,
  long_break INTEGER DEFAULT 15,
  long_break_interval INTEGER DEFAULT 4,
  auto_start_breaks BOOLEAN DEFAULT true,
  auto_start_pomodoros BOOLEAN DEFAULT false,
  sound_enabled BOOLEAN DEFAULT true,
  sound_volume INTEGER DEFAULT 70,
  ambient_sound TEXT DEFAULT 'none',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default focus settings
INSERT INTO focus_settings (pomodoro_duration) 
VALUES (25)
ON CONFLICT DO NOTHING;

-- Index for history lookups
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_date ON pomodoro_sessions(session_date);
