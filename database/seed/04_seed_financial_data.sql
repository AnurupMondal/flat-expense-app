-- Seed Financial Data (Bills) with realistic collection history

-- Set variables for existing IDs (using the ones queried earlier)
\set building_id '0becf749-dbaf-4f24-8720-0ca0619a568e'
\set resident_1 '86019841-f410-4efe-abec-6bc8f7f25c8b'
\set resident_2 '45f3f576-f386-4601-b36d-a08fdc632303'
\set admin_id 'abd4097a-512c-4c1b-8694-e8c86a7cf75b' -- Using John Smith ID as admin reference, assuming he exists

-- Clear existing bills to avoid duplicates/confusion if re-run (optional)
-- DELETE FROM bills;

-- Insert Bills for last 6 months

-- February 2026 (Current Month)
INSERT INTO bills (id, title, description, amount, due_date, status, type, building_id, user_id, created_at, updated_at) VALUES
(uuid_generate_v4(), 'February Maintenance', 'Monthly maintenance charges for Feb 2026', 2500.00, '2026-02-15 00:00:00', 'pending', 'maintenance', :'building_id', :'resident_1', NOW(), NOW()),
(uuid_generate_v4(), 'February Maintenance', 'Monthly maintenance charges for Feb 2026', 2500.00, '2026-02-15 00:00:00', 'paid', 'maintenance', :'building_id', :'resident_2', NOW(), NOW());

-- January 2026
INSERT INTO bills (id, title, description, amount, due_date, status, type, building_id, user_id, created_at, updated_at) VALUES
(uuid_generate_v4(), 'January Maintenance', 'Monthly maintenance charges for Jan 2026', 2500.00, '2026-01-15 00:00:00', 'paid', 'maintenance', :'building_id', :'resident_1', NOW() - INTERVAL '1 month', NOW() - INTERVAL '1 month'),
(uuid_generate_v4(), 'January Utility', 'Water usage charges Jan 2026', 450.00, '2026-01-20 00:00:00', 'paid', 'utility', :'building_id', :'resident_1', NOW() - INTERVAL '1 month', NOW() - INTERVAL '1 month'),
(uuid_generate_v4(), 'January Maintenance', 'Monthly maintenance charges for Jan 2026', 2500.00, '2026-01-15 00:00:00', 'paid', 'maintenance', :'building_id', :'resident_2', NOW() - INTERVAL '1 month', NOW() - INTERVAL '1 month');

-- December 2025
INSERT INTO bills (id, title, description, amount, due_date, status, type, building_id, user_id, created_at, updated_at) VALUES
(uuid_generate_v4(), 'December Maintenance', 'Monthly maintenance charges for Dec 2025', 2500.00, '2025-12-15 00:00:00', 'paid', 'maintenance', :'building_id', :'resident_1', NOW() - INTERVAL '2 months', NOW() - INTERVAL '2 months'),
(uuid_generate_v4(), 'December Special Levy', 'Elevator repair contribution', 1000.00, '2025-12-25 00:00:00', 'overdue', 'maintenance', :'building_id', :'resident_1', NOW() - INTERVAL '2 months', NOW() - INTERVAL '2 months'),
(uuid_generate_v4(), 'December Maintenance', 'Monthly maintenance charges for Dec 2025', 2500.00, '2025-12-15 00:00:00', 'paid', 'maintenance', :'building_id', :'resident_2', NOW() - INTERVAL '2 months', NOW() - INTERVAL '2 months');

-- November 2025
INSERT INTO bills (id, title, description, amount, due_date, status, type, building_id, user_id, created_at, updated_at) VALUES
(uuid_generate_v4(), 'November Maintenance', 'Monthly maintenance charges for Nov 2025', 2500.00, '2025-11-15 00:00:00', 'paid', 'maintenance', :'building_id', :'resident_1', NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 months'),
(uuid_generate_v4(), 'November Maintenance', 'Monthly maintenance charges for Nov 2025', 2500.00, '2025-11-15 00:00:00', 'paid', 'maintenance', :'building_id', :'resident_2', NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 months');

-- October 2025
INSERT INTO bills (id, title, description, amount, due_date, status, type, building_id, user_id, created_at, updated_at) VALUES
(uuid_generate_v4(), 'October Maintenance', 'Monthly maintenance charges for Oct 2025', 2500.00, '2025-10-15 00:00:00', 'paid', 'maintenance', :'building_id', :'resident_1', NOW() - INTERVAL '4 months', NOW() - INTERVAL '4 months'),
(uuid_generate_v4(), 'October Maintenance', 'Monthly maintenance charges for Oct 2025', 2500.00, '2025-10-15 00:00:00', 'paid', 'maintenance', :'building_id', :'resident_2', NOW() - INTERVAL '4 months', NOW() - INTERVAL '4 months');

-- September 2025
INSERT INTO bills (id, title, description, amount, due_date, status, type, building_id, user_id, created_at, updated_at) VALUES
(uuid_generate_v4(), 'September Maintenance', 'Monthly maintenance charges for Sep 2025', 2500.00, '2025-09-15 00:00:00', 'paid', 'maintenance', :'building_id', :'resident_1', NOW() - INTERVAL '5 months', NOW() - INTERVAL '5 months'),
(uuid_generate_v4(), 'September Maintenance', 'Monthly maintenance charges for Sep 2025', 2500.00, '2025-09-15 00:00:00', 'paid', 'maintenance', :'building_id', :'resident_2', NOW() - INTERVAL '5 months', NOW() - INTERVAL '5 months');
