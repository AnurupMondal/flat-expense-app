-- Create admin_building_assignments table for super admin to assign admins to buildings
CREATE TABLE IF NOT EXISTS
    admin_building_assignments (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        building_id INTEGER NOT NULL REFERENCES buildings (id) ON DELETE CASCADE,
        assigned_by INTEGER NOT NULL REFERENCES users (id),
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (admin_id, building_id)
    );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_building_assignments_admin_id ON admin_building_assignments (admin_id);

CREATE INDEX IF NOT EXISTS idx_admin_building_assignments_building_id ON admin_building_assignments (building_id);

CREATE INDEX IF NOT EXISTS idx_admin_building_assignments_active ON admin_building_assignments (is_active);

-- Add trigger to update updated_at timestamp
CREATE
OR REPLACE FUNCTION update_admin_building_assignments_updated_at () RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admin_building_assignments_updated_at BEFORE
UPDATE ON admin_building_assignments FOR EACH ROW
EXECUTE FUNCTION update_admin_building_assignments_updated_at ();

-- Insert sample admin assignments for demo data (will be populated by demo script)