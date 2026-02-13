-- Seed Community Posts and Notifications
DO $$
DECLARE
    sunrise_id UUID;
    ocean_view_id UUID;
    john_id UUID;
    sarah_id UUID;
    admin1_id UUID;
BEGIN
    -- Get building IDs
    SELECT id INTO sunrise_id FROM buildings WHERE name = 'Sunrise Apartments';
    SELECT id INTO ocean_view_id FROM buildings WHERE name = 'Ocean View Towers';
    
    -- Get user IDs
    SELECT id INTO john_id FROM users WHERE email = 'resident1@demo.com';
    SELECT id INTO sarah_id FROM users WHERE email = 'resident2@demo.com';
    SELECT id INTO admin1_id FROM users WHERE email = 'admin1@demo.com';

    -- Insert Community Posts if buildings and users exist
    IF sunrise_id IS NOT NULL AND john_id IS NOT NULL THEN
        INSERT INTO community_posts (user_id, building_id, title, content, category, created_at)
        VALUES 
        (john_id, sunrise_id, 'Found a set of keys', 'Found a set of keys near the swimming pool area today around 3 PM. Please contact me if they are yours.', 'Lost & Found', NOW() - INTERVAL '2 hours'),
        (john_id, sunrise_id, 'Yoga Session this Weekend', 'Join us for a community yoga session on Saturday morning at 7 AM in the central park.', 'Event', NOW() - INTERVAL '1 day');
    END IF;

    IF ocean_view_id IS NOT NULL AND sarah_id IS NOT NULL THEN
        INSERT INTO community_posts (user_id, building_id, title, content, category, created_at)
        VALUES 
        (sarah_id, ocean_view_id, 'Moving out sale', 'I am selling some furniture items (sofa, dining table) as I am moving out next month. DM for details.', 'General', NOW() - INTERVAL '5 hours');
    END IF;

    -- Insert Urgent Broadcasts from Admin
    IF sunrise_id IS NOT NULL AND admin1_id IS NOT NULL THEN
        -- Create notification for all approved residents in Sunrise
        INSERT INTO notifications (user_id, building_id, title, message, type, urgent, read, created_at)
        SELECT id, building_id, 'Water Maintenance Alert', 'Emergency water maintenance will be conducted today from 2 PM to 4 PM. Water supply will be limited.', 'announcement', true, false, NOW()
        FROM users 
        WHERE building_id = sunrise_id AND status = 'approved';
    END IF;

END $$;
