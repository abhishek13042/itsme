-- Add notes column to explorer_topics
ALTER TABLE explorer_topics ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';
ALTER TABLE explorer_topics ADD COLUMN IF NOT EXISTS read_concepts JSONB DEFAULT '[]';
ALTER TABLE explorer_topics ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;
ALTER TABLE explorer_topics ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE explorer_topics ADD COLUMN IF NOT EXISTS depth_score INTEGER DEFAULT 0;

-- Knowledge depth tracker per subject
CREATE TABLE IF NOT EXISTS knowledge_depth (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL UNIQUE,
  topics_explored INTEGER DEFAULT 0,
  concepts_read INTEGER DEFAULT 0,
  papers_read INTEGER DEFAULT 0,
  brain_drops INTEGER DEFAULT 0,
  depth_score INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default domains
INSERT INTO knowledge_depth (domain) VALUES
  ('Psychology'),
  ('Neuroscience'),
  ('Cognitive Science'),
  ('Geopolitics'),
  ('Artificial Intelligence')
ON CONFLICT (domain) DO NOTHING;
