-- Add some pending/overdue bills for Feb 2026
-- Building: Ocean View Towers (5b2605e8-a0c5-4eed-96b9-a552d7b476cb)
-- Residents: Mike Davis (5e49e735-4cb2-4d6c-850c-f7a4be360857), Emily Wilson (45f3f576-f386-4601-b36d-a08fdc632303)

INSERT INTO bills (id, title, description, amount, due_date, status, type, building_id, user_id, created_by, created_at, updated_at) VALUES
(gen_random_uuid(), 'February Maintenance', 'Maintenance for Feb 2026', 2500.00, '2026-02-15 00:00:00', 'pending', 'maintenance', '5b2605e8-a0c5-4eed-96b9-a552d7b476cb', '5e49e735-4cb2-4d6c-850c-f7a4be360857', 'c2ad2b15-9b8e-441a-93a0-46ea4517c8b6', '2026-02-01', '2026-02-01'),
(gen_random_uuid(), 'February Rent', 'Rent for Feb 2026', 15000.00, '2026-02-05 00:00:00', 'overdue', 'rent', '5b2605e8-a0c5-4eed-96b9-a552d7b476cb', '5e49e735-4cb2-4d6c-850c-f7a4be360857', 'c2ad2b15-9b8e-441a-93a0-46ea4517c8b6', '2026-02-01', '2026-02-01'),
(gen_random_uuid(), 'February Maintenance', 'Maintenance for Feb 2026', 2500.00, '2026-02-15 00:00:00', 'pending', 'maintenance', '5b2605e8-a0c5-4eed-96b9-a552d7b476cb', '45f3f576-f386-4601-b36d-a08fdc632303', 'c2ad2b15-9b8e-441a-93a0-46ea4517c8b6', '2026-02-01', '2026-02-01');
