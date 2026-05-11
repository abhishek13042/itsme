-- Physique measurements tracker
CREATE TABLE IF NOT EXISTS physique_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg DECIMAL(5,2),
  chest_cm INTEGER,
  waist_cm INTEGER,
  arms_cm INTEGER,
  forearms_cm INTEGER,
  shoulders_cm INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monthly health costs
CREATE TABLE IF NOT EXISTS health_costs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month TEXT NOT NULL,
  item TEXT NOT NULL,
  category TEXT NOT NULL,
  amount_inr INTEGER NOT NULL,
  is_recurring BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI coach sessions
CREATE TABLE IF NOT EXISTS health_ai_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_date DATE DEFAULT CURRENT_DATE,
  prompt_type TEXT,
  ai_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
