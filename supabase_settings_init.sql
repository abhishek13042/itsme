-- SETTINGS INITIALIZATION

INSERT INTO settings (key, value) VALUES
('name', '"Abhishek"'),
('monthly_target_inr', '"3000"'),
('exam_date', '"2025-04-30"'),
('current_semester', '5'),
('trading_pairs', '["GBPUSD","EURUSD"]'),
('target_companies', '["Google","Meta","Amazon","Microsoft","Atlassian","Razorpay","Zerodha"]'),
('theme', '"LIGHT PROFESSIONAL"'),
('voice_enabled', 'true'),
('daily_reset_time', '"00:00"'),
('morning_brief_time', '"06:30"'),
('evening_review_time', '"21:00"'),
('lc_problems_solved', '0'),
('prop_firm_passed', 'false'),
('withdrawal_count', '0')
ON CONFLICT (key) DO NOTHING;
