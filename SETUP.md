# 🚀 Player One - Setup Guide

## 1. Database Setup (Supabase)
Create a new project in [Supabase](https://supabase.com). Copy the SQL below into the SQL Editor and run it.

```sql
-- Player state (one row, your character)
CREATE TABLE player_state (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  xp INTEGER DEFAULT 0,
  gold INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  last_active_date DATE,
  stat_dsa INTEGER DEFAULT 0,
  stat_sysdesign INTEGER DEFAULT 0,
  stat_backend INTEGER DEFAULT 0,
  stat_trading INTEGER DEFAULT 0,
  stat_physique INTEGER DEFAULT 0,
  stat_analytical INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Daily quests master list
CREATE TABLE daily_quests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quest_text TEXT NOT NULL,
  xp_reward INTEGER DEFAULT 20,
  gold_reward INTEGER DEFAULT 5,
  category TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Daily completions log
CREATE TABLE daily_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quest_id UUID REFERENCES daily_quests(id),
  completed_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Main quests (weekly goals)
CREATE TABLE quests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  xp_reward INTEGER DEFAULT 50,
  gold_reward INTEGER DEFAULT 20,
  domain TEXT,
  phase INTEGER DEFAULT 1,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- World boss
CREATE TABLE boss (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  total_hp INTEGER DEFAULT 100,
  current_hp INTEGER DEFAULT 100,
  xp_reward INTEGER DEFAULT 500,
  gold_reward INTEGER DEFAULT 200,
  deadline DATE,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE boss_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  boss_id UUID REFERENCES boss(id),
  task_text TEXT NOT NULL,
  hp_damage INTEGER DEFAULT 25,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ
);

-- Penalties log
CREATE TABLE penalties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reason TEXT,
  xp_penalty INTEGER DEFAULT 0,
  gold_penalty INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed daily quests
INSERT INTO daily_quests (quest_text, xp_reward, gold_reward, category) VALUES
  ('Wake up by 6:30 AM', 20, 5, 'discipline'),
  ('Gym or walk session', 25, 5, 'health'),
  ('Trading journal entry before market', 30, 10, 'trading'),
  ('2hr deep study block (DSA or SDE)', 50, 15, 'sde'),
  ('Review yesterday''s mistakes', 20, 5, 'discipline'),
  ('1 coding session — DSA or project', 30, 10, 'sde'),
  ('No doom-scrolling before noon', 15, 5, 'discipline');

-- Seed world boss
INSERT INTO boss (name, total_hp, current_hp, xp_reward, gold_reward, deadline) VALUES
  ('Final Sem Exam Gauntlet', 100, 100, 500, 200, '2025-04-30');

INSERT INTO boss_tasks (boss_id, task_text, hp_damage) 
SELECT id, 'OS unit 1+2 complete', 25 FROM boss WHERE name = 'Final Sem Exam Gauntlet';
INSERT INTO boss_tasks (boss_id, task_text, hp_damage) 
SELECT id, 'DAA dynamic programming chapter', 25 FROM boss WHERE name = 'Final Sem Exam Gauntlet';
INSERT INTO boss_tasks (boss_id, task_text, hp_damage) 
SELECT id, 'OS unit 3+4 complete', 25 FROM boss WHERE name = 'Final Sem Exam Gauntlet';
INSERT INTO boss_tasks (boss_id, task_text, hp_damage) 
SELECT id, 'Full mock test all subjects', 25 FROM boss WHERE name = 'Final Sem Exam Gauntlet';

-- Wallet (one row, current balance)
CREATE TABLE wallet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  balance_paise INTEGER DEFAULT 0,
  total_earned_paise INTEGER DEFAULT 0,
  total_withdrawn_paise INTEGER DEFAULT 0,
  total_penalties_paise INTEGER DEFAULT 0,
  month_start_balance INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Every rupee transaction logged here
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT CHECK (type IN ('earn','penalty','withdraw','bonus')),
  amount_paise INTEGER NOT NULL,
  reason TEXT NOT NULL,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Monthly summary (auto-generated at month end)
CREATE TABLE monthly_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month TEXT NOT NULL,
  total_earned INTEGER DEFAULT 0,
  total_penalties INTEGER DEFAULT 0,
  net_balance INTEGER DEFAULT 0,
  completion_percent INTEGER DEFAULT 0,
  withdrawn BOOLEAN DEFAULT false,
  withdraw_eligible BOOLEAN DEFAULT false,
  targets_hit INTEGER DEFAULT 0,
  targets_total INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Monthly targets (auto-generated each month)
CREATE TABLE monthly_targets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_description TEXT,
  rupee_value INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed wallet
INSERT INTO wallet (balance_paise, month_start_balance) VALUES (0, 0);

-- Seed monthly targets for current month
INSERT INTO monthly_targets (month, target_type, target_description, rupee_value) VALUES
  (to_char(now(), 'YYYY-MM'), 'daily_streak', 'Maintain 7-day streak', 10000),
  (to_char(now(), 'YYYY-MM'), 'daily_streak', 'Maintain 30-day streak bonus', 30000),
  (to_char(now(), 'YYYY-MM'), 'weekly_boss', 'Defeat world boss', 20000),
  (to_char(now(), 'YYYY-MM'), 'perfect_week', 'Complete all 7 dailies for 7 days straight', 20000),
  (to_char(now(), 'YYYY-MM'), 'main_quests', 'Complete 8 main quests this month', 15000),
  (to_char(now(), 'YYYY-MM'), 'phase_milestone', 'Hit phase milestone checkpoint', 50000),
  (to_char(now(), 'YYYY-MM'), 'sde_goal', 'Solve 30 DSA problems this month', 15000),
  (to_char(now(), 'YYYY-MM'), 'trading_goal', 'Journal every trade for 20 days', 15000),
  (to_char(now(), 'YYYY-MM'), 'health_goal', 'Gym 20+ days this month', 15000),
  (to_char(now(), 'YYYY-MM'), 'exam_goal', 'All subjects above 70% readiness', 10000);

-- Settings Table (for global config like exam dates)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
INSERT INTO settings (key, value) VALUES ('exam_date', '2025-04-30') 
ON CONFLICT DO NOTHING;


-- XP and Leveling System Updates
ALTER TABLE player_state ADD COLUMN IF NOT EXISTS total_xp_alltime INTEGER DEFAULT 0;
ALTER TABLE player_state ADD COLUMN IF NOT EXISTS penalties_count INTEGER DEFAULT 0;
ALTER TABLE player_state ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
ALTER TABLE player_state ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]';

CREATE TABLE xp_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount INTEGER NOT NULL,
  multiplier NUMERIC DEFAULT 1.0,
  final_amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Quest and World Boss System Updates
ALTER TABLE quests ADD COLUMN IF NOT EXISTS rupee_value INTEGER DEFAULT 3000;
ALTER TABLE quests ADD COLUMN IF NOT EXISTS domain TEXT;
ALTER TABLE quests ADD COLUMN IF NOT EXISTS week_number INTEGER;

CREATE TABLE weekly_targets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start DATE NOT NULL,
  quests_completed INTEGER DEFAULT 0,
  quests_target INTEGER DEFAULT 4,
  rupee_bonus INTEGER DEFAULT 15000,
  bonus_claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed Initial Quests
INSERT INTO quests (title, description, xp_reward, gold_reward, rupee_value, domain, phase) VALUES
  ('Solve 10 DSA problems', 'Arrays, strings, hashing — no skipping', 100, 30, 5000, 'sde', 1),
  ('Complete 1 Striver chapter', 'Full chapter with notes', 80, 25, 4000, 'sde', 1),
  ('Journal every trade this week', 'Before entry, no exceptions', 70, 20, 4000, 'trading', 1),
  ('Gym 5 out of 7 days', 'Track in health page', 60, 15, 3000, 'health', 1),
  ('Study OS unit 1+2', '2 hours minimum per subject', 90, 25, 4000, 'exams', 1),
  ('Study DAA DP chapter', 'Complete with practice problems', 90, 25, 4000, 'exams', 1),
  ('No doom scroll before noon — 7 days', 'Track daily in tracker', 50, 10, 2000, 'discipline', 1),
  ('Read 20 pages of a book', 'Financial or skill book', 40, 10, 2000, 'learning', 1);

-- AI Planner System
CREATE TABLE daily_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_date DATE NOT NULL UNIQUE,
  morning_plan JSONB,
  evening_review JSONB,
  day_score INTEGER,
  plan_generated_at TIMESTAMPTZ,
  review_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## 2. Environment Variables
Get your `URL` and `Anon Key` from Supabase (Project Settings > API). Get an API Key from Anthropic.

Create a `.env.local` file with the following variables:
```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_ANTHROPIC_API_KEY=your_anthropic_key_here
```

## 3. Local Development
Run the local server:
```
npm run dev
```

## 4. Deployment (Vercel)
1. Push your project to a GitHub repository.
2. Sign in to [Vercel](https://vercel.com).
3. Import your GitHub repository.
4. Add the 3 environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ANTHROPIC_API_KEY`) to the Environment Variables section in the Vercel deployment settings.
5. Click **Deploy**.
