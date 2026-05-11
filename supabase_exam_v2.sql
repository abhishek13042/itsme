-- EXAM MODE V2 SCHEMA

CREATE TABLE IF NOT EXISTS semesters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sem_number INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT false,
  mid_sem_date DATE,
  end_sem_date DATE,
  target_cgpa NUMERIC DEFAULT 9.0,
  sgpa NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sem_subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sem_id UUID REFERENCES semesters(id),
  name TEXT NOT NULL,
  short_name TEXT,
  has_lab BOOLEAN DEFAULT false,
  lab_deadline DATE,
  mid_marks_obtained NUMERIC DEFAULT 0,
  mid_marks_total NUMERIC DEFAULT 30,
  end_marks_obtained NUMERIC DEFAULT 0,
  end_marks_total NUMERIC DEFAULT 100,
  internal_marks_obtained NUMERIC DEFAULT 0,
  internal_marks_total NUMERIC DEFAULT 25,
  readiness INTEGER DEFAULT 0,
  color TEXT DEFAULT '#1A1A2E',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subject_checklist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES sem_subjects(id),
  type TEXT CHECK (type IN (
    'mid_prep','end_prep',
    'mid_notes','end_notes','assignment'
  )),
  item_text TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  deadline DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed semesters 4 through 8
INSERT INTO semesters 
(sem_number, is_active, target_cgpa) VALUES
(4, false, 9.0),
(5, true, 9.0),
(6, false, 9.0),
(7, false, 9.0),
(8, false, 9.0)
ON CONFLICT DO NOTHING;

-- Seed Sem 4 subjects
INSERT INTO sem_subjects 
(sem_id, name, short_name, has_lab, color)
SELECT id, 'Operating Systems', 'OS', true, '#C0392B' FROM semesters WHERE sem_number = 4;

INSERT INTO sem_subjects 
(sem_id, name, short_name, has_lab, color)
SELECT id, 'Design & Analysis of Algorithms', 'DAA', false, '#1A1A2E' FROM semesters WHERE sem_number = 4;

INSERT INTO sem_subjects 
(sem_id, name, short_name, has_lab, color)
SELECT id, 'Machine Learning', 'ML', true, '#7C3AED' FROM semesters WHERE sem_number = 4;

INSERT INTO sem_subjects 
(sem_id, name, short_name, has_lab, color)
SELECT id, 'Software Engineering', 'SE', false, '#1A6B4A' FROM semesters WHERE sem_number = 4;

INSERT INTO sem_subjects 
(sem_id, name, short_name, has_lab, color)
SELECT id, 'Database Management Systems', 'DBMS', true, '#E07B39' FROM semesters WHERE sem_number = 4;
