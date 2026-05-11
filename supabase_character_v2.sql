-- CHARACTER SHEET V2 SCHEMA

-- 1. BRAIN LOGS
CREATE TABLE IF NOT EXISTS brain_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  logged_at TIMESTAMPTZ DEFAULT now(),
  topic TEXT NOT NULL,
  subject_area TEXT, -- DSA, SysDesign, Backend, Trading, Exams, Other
  was_stuck_on TEXT NOT NULL,
  minutes_pushed INTEGER NOT NULL,
  solved BOOLEAN DEFAULT false,
  what_clicked TEXT,
  concept_unlocked TEXT,
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  mood_before INTEGER CHECK (mood_before BETWEEN 1 AND 5),
  mood_after INTEGER CHECK (mood_after BETWEEN 1 AND 5),
  xp_awarded INTEGER DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. BADGES
CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  badge_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  unlock_condition TEXT,
  earned BOOLEAN DEFAULT false,
  earned_at TIMESTAMPTZ,
  category TEXT, -- identity, sde, trading, health, brain, money, knowledge, exams
  icon TEXT,
  xp_reward INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. UPDATING PLAYER STATE (Add missing Stat columns if not exists)
ALTER TABLE player_state ADD COLUMN IF NOT EXISTS stat_dsa INTEGER DEFAULT 0;
ALTER TABLE player_state ADD COLUMN IF NOT EXISTS stat_sysdesign INTEGER DEFAULT 0;
ALTER TABLE player_state ADD COLUMN IF NOT EXISTS stat_backend INTEGER DEFAULT 0;
ALTER TABLE player_state ADD COLUMN IF NOT EXISTS stat_trading INTEGER DEFAULT 0;
ALTER TABLE player_state ADD COLUMN IF NOT EXISTS stat_physique INTEGER DEFAULT 0;
ALTER TABLE player_state ADD COLUMN IF NOT EXISTS stat_analytical INTEGER DEFAULT 0;

-- SEEDING BADGES
DELETE FROM badges;

INSERT INTO badges 
(badge_key, title, description, unlock_condition, category, icon, xp_reward)
VALUES
-- Identity badges
('first_blood', 'First Blood', 'Completed your first daily quest', 'daily_completions >= 1', 'identity', '🩸', 50),
('week_warrior', 'Week Warrior', 'Maintained a 7-day streak', 'streak_days >= 7', 'identity', '⚔️', 100),
('month_monk', 'Month Monk', '30 consecutive days. Unbreakable.', 'streak_days >= 30', 'identity', '🧘', 300),

-- SDE badges
('code_initiate', 'Code Initiate', 'Completed first SDE chapter', 'sde_chapters_done >= 1', 'sde', '💻', 50),
('dsa_warrior', 'DSA Warrior', '100 LC problems solved', 'lc_solved >= 100', 'sde', '⚡', 200),
('dsa_master', 'DSA Master', '300 LC problems. You are dangerous.', 'lc_solved >= 300', 'sde', '🗡️', 500),
('system_thinker', 'System Thinker', 'Completed System Design phase', 'sysdesign_chapters >= 6', 'sde', '🏗️', 300),
('builder', 'Builder', 'First project deployed publicly', 'projects_deployed >= 1', 'sde', '🚀', 200),
('portfolio_complete', 'Portfolio Complete', '4 projects live. Resume locked.', 'projects_deployed >= 4', 'sde', '💼', 500),

-- Trading badges
('market_journal', 'Market Journal', 'Logged 10 trading sessions', 'trades_logged >= 10', 'trading', '📊', 100),
('tape_reader', 'Tape Reader', 'Completed 30 days tape reading', 'tape_reading_days >= 30', 'trading', '📈', 200),
('rule_follower', 'Rule Follower', '21 consecutive rule-following days', 'rule_streak >= 21', 'trading', '📐', 300),
('funded_trader', 'Funded Trader', 'Passed prop firm. $100k buying power.', 'prop_firm_passed = true', 'trading', '💰', 1000),

-- Health badges  
('gym_initiate', 'Gym Initiate', 'First 7 gym days logged', 'gym_streak >= 7', 'health', '💪', 100),
('iron_will', 'Iron Will', '30 gym days this month', 'gym_days_month >= 25', 'health', '🏋️', 300),
('clean_machine', 'Clean Machine', '14 days perfect hygiene streak', 'hygiene_streak >= 14', 'health', '✨', 200),
('sleep_locked', 'Sleep Locked', '7 days perfect sleep schedule', 'sleep_streak >= 7', 'health', '😴', 100),

-- Brain badges
('deep_thinker', 'Deep Thinker', 'Logged 10 analytical brain sessions', 'brain_logs >= 10', 'brain', '🧠', 200),
('problem_solver', 'Problem Solver', '30 deep thinking sessions logged', 'brain_logs >= 30', 'brain', '🎯', 500),
('never_quit', 'Never Quit', 'Pushed through 50 hard problems', 'brain_logs >= 50', 'brain', '🔥', 1000),
('concept_collector', 'Concept Collector', 'Logged 20 concepts that clicked', 'concepts_unlocked >= 20', 'brain', '💡', 300),

-- Money badges
('first_rupee', 'First Rupee', 'Earned first rupee in wallet', 'wallet_balance > 0', 'money', '₹', 50),
('month_earner', 'Month Earner', 'Hit ₹3000 monthly target', 'month_earned >= 300000', 'money', '🏆', 500),
('withdrawal_day', 'Withdrawal Day', 'First ever wallet withdrawal', 'withdrawals >= 1', 'money', '💸', 300),

-- Knowledge badges
('bookworm', 'Bookworm', 'Finished first book', 'books_completed >= 1', 'knowledge', '📚', 100),
('phase_reader', 'Phase Reader', 'Completed Phase 1 reading list', 'phase1_books_done = true', 'knowledge', '📖', 300),

-- Exam badges
('exam_slayer', 'Exam Slayer', 'Defeated the exam world boss', 'boss_defeated = true', 'exams', '⚔️', 500),
('nine_pointer', 'Nine Pointer', 'Achieved 9+ CGPA in a semester', 'sgpa >= 9.0', 'exams', '🎓', 1000)
ON CONFLICT (badge_key) DO NOTHING;
