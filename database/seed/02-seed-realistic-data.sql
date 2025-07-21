-- Insert sample residents
INSERT INTO residents (user_id, flat_number, name, email, phone, is_admin) VALUES 
(1, 'A-101', 'John Doe', 'john.doe@email.com', '+1234567890', false),
(2, 'A-102', 'Jane Smith', 'jane.smith@email.com', '+1234567891', true);

-- Insert sample flats
INSERT INTO flats (flat_number, owner_name, resident_count, status) VALUES 
('A-101', 'John Doe', 3, 'occupied'),
('A-102', 'Jane Smith', 2, 'occupied'),
('B-201', 'Bob Wilson', 4, 'occupied'),
('B-202', 'Alice Brown', 1, 'occupied');

-- Insert sample expense categories
INSERT INTO expense_categories (name, description) VALUES 
('Maintenance', 'Building maintenance and repairs'),
('Utilities', 'Electricity, water, gas bills'),
('Security', 'Security guard and surveillance'),
('Cleaning', 'Common area cleaning services'),
('Gardening', 'Lawn and garden maintenance');

-- Insert sample expenses
INSERT INTO expenses (title, description, amount, category_id, date_incurred, status, created_by) VALUES 
('Monthly Maintenance', 'General building maintenance for January', 5000.00, 1, '2025-01-15', 'approved', 2),
('Electricity Bill', 'Common area electricity bill', 1200.00, 2, '2025-01-10', 'approved', 2),
('Security Services', 'Monthly security service payment', 3000.00, 3, '2025-01-01', 'approved', 2),
('Garden Maintenance', 'Monthly gardening service', 800.00, 5, '2025-01-05', 'pending', 2);

-- Insert sample complaints
INSERT INTO complaints (title, description, category, priority, status, reported_by) VALUES 
('Elevator Issue', 'Elevator on floor 3 is not working properly', 'maintenance', 'high', 'open', 1),
('Noise Complaint', 'Loud music from apartment B-201 during night hours', 'noise', 'medium', 'in_progress', 1),
('Water Leak', 'Water leaking from common area ceiling', 'maintenance', 'urgent', 'resolved', 1);

-- Insert sample announcements
INSERT INTO announcements (title, content, priority, created_by) VALUES 
('Monthly Society Meeting', 'Monthly society meeting scheduled for January 25th at 7 PM in the community hall.', 'high', 2),
('New Security Guidelines', 'Please ensure all visitors are registered at the security desk before entry.', 'medium', 2),
('Festival Celebration', 'Diwali celebration on October 31st. All residents are invited to participate.', 'low', 2);
