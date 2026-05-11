-- FINANCE & BOOKS V2 SCHEMA
-- Build the 4-phase structured reading path, income roadmap, and curiosity arc.

-- DROP OLD TABLES TO ENSURE SCHEMA UPDATE
DROP TABLE IF EXISTS curiosity_nodes;
DROP TABLE IF EXISTS income_milestones;
DROP TABLE IF EXISTS books;

-- 1. BOOKS TABLE UPDATE
CREATE TABLE books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  phase INTEGER NOT NULL,
  category TEXT,
  status TEXT DEFAULT 'NOT_STARTED', -- NOT_STARTED, READING, COMPLETED
  completed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  order_index INTEGER,
  checklist JSONB DEFAULT '[]', -- Future-proofing for summaries
  rating INTEGER DEFAULT 0, -- 1-5 stars
  one_line_takeaway TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. INCOME MILESTONES
CREATE TABLE income_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  amount_inr INTEGER,
  description TEXT,
  status TEXT DEFAULT 'LOCKED', -- LOCKED, IN_PROGRESS, ACHIEVED
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. CURIOSITY NODES
CREATE TABLE curiosity_nodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  phase_required INTEGER DEFAULT 3, -- Unlock phase in FinanceBooks
  category TEXT,
  unlocked BOOLEAN DEFAULT false,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- SEED DATA

-- Seed books across 4 phases
INSERT INTO books 
(title, author, phase, category, order_index) 
VALUES
-- Phase 1: Money & Markets
('The Psychology of Money', 'Morgan Housel', 1, 'Finance', 1),
('Rich Dad Poor Dad', 'Robert Kiyosaki', 1, 'Finance', 2),
('Influence', 'Robert Cialdini', 1, 'Marketing', 3),
('Zero to One', 'Peter Thiel', 1, 'Startup', 4),
('The Lean Startup', 'Eric Ries', 1, 'Startup', 5),

-- Phase 2: Brain & Psychology
('Thinking Fast and Slow', 'Daniel Kahneman', 2, 'Psychology', 6),
('Atomic Habits', 'James Clear', 2, 'Psychology', 7),
('Deep Work', 'Cal Newport', 2, 'Productivity', 8),
('The Almanack of Naval Ravikant', 'Eric Jorgenson', 2, 'Philosophy', 9),

-- Phase 3: Curiosity Arc
('Behave: The Biology of Humans', 'Robert Sapolsky', 3, 'Neuroscience', 10),
('The Brain That Changes Itself', 'Norman Doidge', 3, 'Neuroscience', 11),
('How Emotions Are Made', 'Lisa Feldman Barrett', 3, 'Brain', 12),

-- Phase 4: Deep Science
('The Code Breaker', 'Walter Isaacson', 4, 'Biotech', 13),
('A Crack in Creation', 'Jennifer Doudna', 4, 'Biotech', 14),
('The Precipice', 'Toby Ord', 4, 'Science', 15);

-- Seed income milestones
INSERT INTO income_milestones 
(title, amount_inr, description, order_index) 
VALUES
('First Rupee Online', 1, 'Any source. Proves it is possible.', 1),
('First ₹1,000', 1000, 'First real proof of skill.', 2),
('First ₹10,000 month', 10000, 'Consistency unlocked.', 3),
('First ₹50,000 month', 50000, 'This is real now.', 4),
('First ₹1,00,000 month', 100000, 'Top 1% income for your age.', 5),
('Trading: First funded withdrawal', 0, 'Prop firm pays you real USD.', 6),
('$100k funded account', 0, '₹83L buying power. You made it.', 7),
('First product sale', 0, 'Someone paid for what you built.', 8),
('Startup first revenue', 0, 'Even ₹100 counts.', 9);

-- Seed curiosity nodes
INSERT INTO curiosity_nodes 
(title, description, phase_required, order_index, category)
VALUES
('Agentic AI', 'Multi-agent systems, LangGraph, autonomous AI pipelines', 3, 1, 'SDE'),
('Brain Biology', 'Real neuroscience — how neurons fire, memory formation, decision making', 3, 2, 'Psychology'),
('Biotech & ML', 'AlphaFold, protein folding, how DeepMind applies ML to biology', 4, 3, 'Science'),
('Startup & Indie Creator', 'Build something people pay for. Document the journey.', 3, 4, 'Finance');
