-- HEALTH V2 SCHEMA

CREATE TABLE IF NOT EXISTS health_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  log_date DATE NOT NULL UNIQUE,
  
  -- Gym
  gym_done BOOLEAN DEFAULT false,
  gym_type TEXT,
  
  -- Meals
  meal_1_done BOOLEAN DEFAULT false,
  meal_2_done BOOLEAN DEFAULT false,
  protein_hit BOOLEAN DEFAULT false,
  no_junk_before_6pm BOOLEAN DEFAULT false,
  
  -- Sleep
  sleep_time TEXT,
  wake_time TEXT,
  sleep_hours NUMERIC,
  slept_by_midnight BOOLEAN DEFAULT false,
  woke_by_630 BOOLEAN DEFAULT false,
  
  -- Hygiene
  bath_done BOOLEAN DEFAULT false,
  bed_made BOOLEAN DEFAULT false,
  teeth_brushed BOOLEAN DEFAULT false,
  skincare_am BOOLEAN DEFAULT false,
  skincare_pm BOOLEAN DEFAULT false,
  study_table_organised BOOLEAN DEFAULT false,
  
  -- Score
  total_checks INTEGER DEFAULT 0,
  total_possible INTEGER DEFAULT 13,
  day_score NUMERIC DEFAULT 0,
  rupees_earned INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- PHYSIQUE MILESTONES (Update or insert into health_milestones)
DELETE FROM health_milestones WHERE id IS NOT NULL;

INSERT INTO health_milestones (phase, text, completed) VALUES
(1, 'Gym 25/30 days', false),
(1, '30 consecutive gym logs', false),
(1, 'Sleep schedule locked (7 days)', false),
(1, 'Hygiene streak 14 days', false),

(2, 'Can do 20 pushups without stopping', false),
(2, '30 min cardio non-stop', false),
(2, 'No junk food week (7 days clean)', false),
(2, 'Clothes starting to fit differently', false),

(3, 'People notice the change', false),
(3, 'Skin visibly clearer (3 months skincare)', false),
(3, 'Hair routine locked', false),
(3, 'Energy high every morning', false),
(3, '3 months consistent gym', false),

(4, 'Physique is permanent identity', false),
(4, 'Never miss gym 2 days in a row', false),
(4, 'Skincare is automatic (no reminders)', false),
(4, 'Sleep schedule never breaks', false),
(4, 'You look exactly how you imagined', false);
