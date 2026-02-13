-- Seed Historical Financial Data (Bills) for the past 6 months
-- Building: Sunrise Apartments (0becf749-dbaf-4f24-8720-0ca0619a568e)
-- Residents: John Smith (abd4097a-512c-4c1b-8694-e8c86a7cf75b), Sarah Johnson (c64bc556-7800-4bf9-94c4-338f4cb90456)
-- Created By: Super Admin (c2ad2b15-9b8e-441a-93a0-46ea4517c8b6)

INSERT INTO bills (id, title, description, amount, due_date, status, type, building_id, user_id, created_by, created_at, updated_at) VALUES
-- January 2026
(gen_random_uuid(), 'January Maintenance', 'Maintenance for Jan 2026', 2500.00, '2026-01-15 00:00:00', 'paid', 'maintenance', '0becf749-dbaf-4f24-8720-0ca0619a568e', 'abd4097a-512c-4c1b-8694-e8c86a7cf75b', 'c2ad2b15-9b8e-441a-93a0-46ea4517c8b6', '2026-01-01', '2026-01-01'),
(gen_random_uuid(), 'January Rent', 'Rent for Jan 2026', 15000.00, '2026-01-05 00:00:00', 'paid', 'rent', '0becf749-dbaf-4f24-8720-0ca0619a568e', 'abd4097a-512c-4c1b-8694-e8c86a7cf75b', 'c2ad2b15-9b8e-441a-93a0-46ea4517c8b6', '2026-01-01', '2026-01-01'),
(gen_random_uuid(), 'January Maintenance', 'Maintenance for Jan 2026', 2500.00, '2026-01-15 00:00:00', 'paid', 'maintenance', '0becf749-dbaf-4f24-8720-0ca0619a568e', 'c64bc556-7800-4bf9-94c4-338f4cb90456', 'c2ad2b15-9b8e-441a-93a0-46ea4517c8b6', '2026-01-01', '2026-01-01'),

-- December 2025
(gen_random_uuid(), 'December Maintenance', 'Maintenance for Dec 2025', 2500.00, '2025-12-15 00:00:00', 'paid', 'maintenance', '0becf749-dbaf-4f24-8720-0ca0619a568e', 'abd4097a-512c-4c1b-8694-e8c86a7cf75b', 'c2ad2b15-9b8e-441a-93a0-46ea4517c8b6', '2025-12-01', '2025-12-01'),
(gen_random_uuid(), 'December Rent', 'Rent for Dec 2025', 15000.00, '2025-12-05 00:00:00', 'paid', 'rent', '0becf749-dbaf-4f24-8720-0ca0619a568e', 'abd4097a-512c-4c1b-8694-e8c86a7cf75b', 'c2ad2b15-9b8e-441a-93a0-46ea4517c8b6', '2025-12-01', '2025-12-01'),
(gen_random_uuid(), 'December Maintenance', 'Maintenance for Dec 2025', 2500.00, '2025-12-15 00:00:00', 'paid', 'maintenance', '0becf749-dbaf-4f24-8720-0ca0619a568e', 'c64bc556-7800-4bf9-94c4-338f4cb90456', 'c2ad2b15-9b8e-441a-93a0-46ea4517c8b6', '2025-12-01', '2025-12-01'),

-- November 2025
(gen_random_uuid(), 'November Maintenance', 'Maintenance for Nov 2025', 2500.00, '2025-11-15 00:00:00', 'paid', 'maintenance', '0becf749-dbaf-4f24-8720-0ca0619a568e', 'abd4097a-512c-4c1b-8694-e8c86a7cf75b', 'c2ad2b15-9b8e-441a-93a0-46ea4517c8b6', '2025-11-01', '2025-11-01'),
(gen_random_uuid(), 'November Rent', 'Rent for Nov 2025', 15000.00, '2025-11-05 00:00:00', 'paid', 'rent', '0becf749-dbaf-4f24-8720-0ca0619a568e', 'abd4097a-512c-4c1b-8694-e8c86a7cf75b', 'c2ad2b15-9b8e-441a-93a0-46ea4517c8b6', '2025-11-01', '2025-11-01'),
(gen_random_uuid(), 'November Maintenance', 'Maintenance for Nov 2025', 2500.00, '2025-11-15 00:00:00', 'paid', 'maintenance', '0becf749-dbaf-4f24-8720-0ca0619a568e', 'c64bc556-7800-4bf9-94c4-338f4cb90456', 'c2ad2b15-9b8e-441a-93a0-46ea4517c8b6', '2025-11-01', '2025-11-01'),

-- October 2025
(gen_random_uuid(), 'October Maintenance', 'Maintenance for Oct 2025', 2500.00, '2025-10-15 00:00:00', 'paid', 'maintenance', '0becf749-dbaf-4f24-8720-0ca0619a568e', 'abd4097a-512c-4c1b-8694-e8c86a7cf75b', 'c2ad2b15-9b8e-441a-93a0-46ea4517c8b6', '2025-10-01', '2025-10-01'),
(gen_random_uuid(), 'October Rent', 'Rent for Oct 2025', 15000.00, '2025-10-05 00:00:00', 'paid', 'rent', '0becf749-dbaf-4f24-8720-0ca0619a568e', 'abd4097a-512c-4c1b-8694-e8c86a7cf75b', 'c2ad2b15-9b8e-441a-93a0-46ea4517c8b6', '2025-10-01', '2025-10-01'),
(gen_random_uuid(), 'October Maintenance', 'Maintenance for Oct 2025', 2500.00, '2025-10-15 00:00:00', 'paid', 'maintenance', '0becf749-dbaf-4f24-8720-0ca0619a568e', 'c64bc556-7800-4bf9-94c4-338f4cb90456', 'c2ad2b15-9b8e-441a-93a0-46ea4517c8b6', '2025-10-01', '2025-10-01'),

-- September 2025
(gen_random_uuid(), 'September Maintenance', 'Maintenance for Sep 2025', 2500.00, '2025-09-15 00:00:00', 'paid', 'maintenance', '0becf749-dbaf-4f24-8720-0ca0619a568e', 'abd4097a-512c-4c1b-8694-e8c86a7cf75b', 'c2ad2b15-9b8e-441a-93a0-46ea4517c8b6', '2025-09-01', '2025-09-01'),
(gen_random_uuid(), 'September Rent', 'Rent for Sep 2025', 15000.00, '2025-09-05 00:00:00', 'paid', 'rent', '0becf749-dbaf-4f24-8720-0ca0619a568e', 'abd4097a-512c-4c1b-8694-e8c86a7cf75b', 'c2ad2b15-9b8e-441a-93a0-46ea4517c8b6', '2025-09-01', '2025-09-01'),
(gen_random_uuid(), 'September Maintenance', 'Maintenance for Sep 2025', 2500.00, '2025-09-15 00:00:00', 'paid', 'maintenance', '0becf749-dbaf-4f24-8720-0ca0619a568e', 'c64bc556-7800-4bf9-94c4-338f4cb90456', 'c2ad2b15-9b8e-441a-93a0-46ea4517c8b6', '2025-09-01', '2025-09-01'),

-- August 2025
(gen_random_uuid(), 'August Maintenance', 'Maintenance for Aug 2025', 2500.00, '2025-08-15 00:00:00', 'paid', 'maintenance', '0becf749-dbaf-4f24-8720-0ca0619a568e', 'abd4097a-512c-4c1b-8694-e8c86a7cf75b', 'c2ad2b15-9b8e-441a-93a0-46ea4517c8b6', '2025-08-01', '2025-08-01'),
(gen_random_uuid(), 'August Rent', 'Rent for Aug 2025', 15000.00, '2025-08-05 00:00:00', 'paid', 'rent', '0becf749-dbaf-4f24-8720-0ca0619a568e', 'abd4097a-512c-4c1b-8694-e8c86a7cf75b', 'c2ad2b15-9b8e-441a-93a0-46ea4517c8b6', '2025-08-01', '2025-08-01');
