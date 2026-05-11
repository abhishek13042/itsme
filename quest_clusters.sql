-- Quest clusters table
CREATE TABLE IF NOT EXISTS quest_clusters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cluster_date DATE NOT NULL DEFAULT CURRENT_DATE,
  cluster_name TEXT NOT NULL,
  domain TEXT NOT NULL,
  theme TEXT,
  quests JSONB NOT NULL DEFAULT '[]',
  total_xp INTEGER DEFAULT 0,
  approved BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
