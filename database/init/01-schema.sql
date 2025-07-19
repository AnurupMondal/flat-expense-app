-- Initialize the database schema for Flat Expense Management App
-- This script creates all the necessary tables and relationships
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM('super-admin', 'admin', 'resident');

CREATE TYPE user_status AS ENUM('pending', 'approved', 'rejected');

CREATE TYPE complaint_priority AS ENUM('low', 'medium', 'high', 'emergency');

CREATE TYPE complaint_status AS ENUM(
    'submitted',
    'assigned',
    'in-progress',
    'resolved'
);

CREATE TYPE bill_status AS ENUM('pending', 'paid', 'overdue');

CREATE TYPE notification_type AS ENUM('bill', 'complaint', 'announcement', 'system');

CREATE TYPE bill_breakdown_type AS ENUM('rent', 'maintenance', 'tax', 'other');

-- Buildings table
CREATE TABLE
    buildings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        admin_id UUID,
        total_units INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

-- Building settings table
CREATE TABLE
    building_settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
        building_id UUID NOT NULL REFERENCES buildings (id) ON DELETE CASCADE,
        rent_amount DECIMAL(10, 2) DEFAULT 0,
        maintenance_amount DECIMAL(10, 2) DEFAULT 0,
        rent_due_date INTEGER DEFAULT 1,
        maintenance_due_date INTEGER DEFAULT 1,
        late_fee DECIMAL(10, 2) DEFAULT 0,
        tax_rate DECIMAL(5, 2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (building_id)
    );

-- Amenities table
CREATE TABLE
    amenities (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
        building_id UUID NOT NULL REFERENCES buildings (id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        icon VARCHAR(100),
        available BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

-- Users table
CREATE TABLE
    users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role user_role NOT NULL DEFAULT 'resident',
        phone VARCHAR(20),
        building_id UUID REFERENCES buildings (id) ON DELETE SET NULL,
        flat_number VARCHAR(20),
        status user_status DEFAULT 'pending',
        approved_by UUID REFERENCES users (id) ON DELETE SET NULL,
        rent_enabled BOOLEAN DEFAULT true,
        maintenance_enabled BOOLEAN DEFAULT true,
        avatar VARCHAR(500),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

-- Add foreign key constraint for buildings.admin_id after users table is created
ALTER TABLE buildings
ADD CONSTRAINT fk_buildings_admin FOREIGN KEY (admin_id) REFERENCES users (id) ON DELETE SET NULL;

-- Complaints table
CREATE TABLE
    complaints (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
        user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        building_id UUID NOT NULL REFERENCES buildings (id) ON DELETE CASCADE,
        category VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        priority complaint_priority DEFAULT 'medium',
        status complaint_status DEFAULT 'submitted',
        assigned_to UUID REFERENCES users (id) ON DELETE SET NULL,
        attachments TEXT[], -- Array of file URLs/paths
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

-- Complaint updates table
CREATE TABLE
    complaint_updates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
        complaint_id UUID NOT NULL REFERENCES complaints (id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        note TEXT,
        updated_by UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

-- Bills table
CREATE TABLE
    bills (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
        user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        building_id UUID NOT NULL REFERENCES buildings (id) ON DELETE CASCADE,
        month VARCHAR(20) NOT NULL,
        year INTEGER NOT NULL,
        rent_amount DECIMAL(10, 2) DEFAULT 0,
        maintenance_amount DECIMAL(10, 2) DEFAULT 0,
        total_amount DECIMAL(10, 2) NOT NULL,
        due_date DATE NOT NULL,
        status bill_status DEFAULT 'pending',
        paid_at TIMESTAMP WITH TIME ZONE,
        payment_method VARCHAR(50),
        transaction_id VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, month, year)
    );

-- Bill breakdown table
CREATE TABLE
    bill_breakdowns (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
        bill_id UUID NOT NULL REFERENCES bills (id) ON DELETE CASCADE,
        item VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        type bill_breakdown_type NOT NULL
    );

-- Notifications table
CREATE TABLE
    notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
        user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        building_id UUID NOT NULL REFERENCES buildings (id) ON DELETE CASCADE,
        type notification_type NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        urgent BOOLEAN DEFAULT false,
        read BOOLEAN DEFAULT false,
        data JSONB, -- Additional data as JSON
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

-- Sessions table for JWT token management
CREATE TABLE
    user_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
        user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users (email);

CREATE INDEX idx_users_building_id ON users (building_id);

CREATE INDEX idx_users_status ON users (status);

CREATE INDEX idx_complaints_user_id ON complaints (user_id);

CREATE INDEX idx_complaints_building_id ON complaints (building_id);

CREATE INDEX idx_complaints_status ON complaints (status);

CREATE INDEX idx_bills_user_id ON bills (user_id);

CREATE INDEX idx_bills_building_id ON bills (building_id);

CREATE INDEX idx_bills_status ON bills (status);

CREATE INDEX idx_bills_month_year ON bills (month, year);

CREATE INDEX idx_notifications_user_id ON notifications (user_id);

CREATE INDEX idx_notifications_read ON notifications (read);

CREATE INDEX idx_user_sessions_user_id ON user_sessions (user_id);

CREATE INDEX idx_user_sessions_expires_at ON user_sessions (expires_at);

-- Create updated_at trigger function
CREATE
OR REPLACE FUNCTION update_updated_at_column () RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_buildings_updated_at BEFORE
UPDATE ON buildings FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column ();

CREATE TRIGGER update_building_settings_updated_at BEFORE
UPDATE ON building_settings FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column ();

CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column ();

CREATE TRIGGER update_complaints_updated_at BEFORE
UPDATE ON complaints FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column ();

CREATE TRIGGER update_bills_updated_at BEFORE
UPDATE ON bills FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column ();

-- Admin user will be created by backend/scripts/create-admin-user.ts after DB init
-- Create a sample building
INSERT INTO
    buildings (name, address, total_units)
VALUES
    (
        'Sunset Apartments',
        '123 Main Street, Downtown, City 12345',
        50
    );

-- Get the building ID and update admin_id
UPDATE buildings
SET
    admin_id = (
        SELECT
            id
        FROM
            users
        WHERE
            email = 'admin@flatmanager.com'
    )
WHERE
    name = 'Sunset Apartments';

-- Insert building settings
INSERT INTO
    building_settings (
        building_id,
        rent_amount,
        maintenance_amount,
        rent_due_date,
        maintenance_due_date,
        late_fee,
        tax_rate
    )
VALUES
    (
        (
            SELECT
                id
            FROM
                buildings
            WHERE
                name = 'Sunset Apartments'
        ),
        1500.00,
        200.00,
        1,
        1,
        50.00,
        5.00
    );

-- Insert sample amenities
INSERT INTO
    amenities (building_id, name, icon, available)
VALUES
    (
        (
            SELECT
                id
            FROM
                buildings
            WHERE
                name = 'Sunset Apartments'
        ),
        'Swimming Pool',
        '🏊',
        true
    ),
    (
        (
            SELECT
                id
            FROM
                buildings
            WHERE
                name = 'Sunset Apartments'
        ),
        'Gym',
        '💪',
        true
    ),
    (
        (
            SELECT
                id
            FROM
                buildings
            WHERE
                name = 'Sunset Apartments'
        ),
        'Parking',
        '🚗',
        true
    ),
    (
        (
            SELECT
                id
            FROM
                buildings
            WHERE
                name = 'Sunset Apartments'
        ),
        'Security',
        '🔒',
        true
    );