-- AI PLANNER (JARVIS) SCHEMA

CREATE TABLE IF NOT EXISTS ai_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_date DATE NOT NULL,
  type TEXT CHECK (type IN (
    'morning_brief', 
    'evening_review', 
    'conversation'
  )),
  context_snapshot JSONB,
  ai_response JSONB,
  user_input TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster retrieval of today's sessions
CREATE INDEX IF NOT EXISTS idx_ai_sessions_date ON ai_sessions(session_date);
