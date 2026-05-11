-- Explorer topics table
-- Stores AI-generated weekly topics, concepts, books, and research papers
CREATE TABLE IF NOT EXISTS explorer_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_data JSONB NOT NULL,
  concepts JSONB DEFAULT '[]',
  books JSONB DEFAULT '[]',
  papers JSONB DEFAULT '[]',
  domain TEXT,
  week_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brain drops table
-- Quick thoughts and insights captured while exploring
CREATE TABLE IF NOT EXISTS brain_drops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  topic_title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
