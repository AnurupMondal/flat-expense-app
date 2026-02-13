import dotenv from "dotenv";
dotenv.config();

import { pool } from "../config/database";
import logger from "../utils/logger";
import DemoDataCreator from "./create-demo-users";

export async function resetDatabase() {
  const client = await pool.connect();

  try {
    logger.info("🗑️ Starting database reset...");

    // Drop all tables
    // We cascade to handle dependencies
    await client.query(`
      DROP TABLE IF EXISTS community_posts CASCADE;
      DROP TABLE IF EXISTS complaint_updates CASCADE;
      DROP TABLE IF EXISTS complaints CASCADE;
      DROP TABLE IF EXISTS notifications CASCADE;
      DROP TABLE IF EXISTS bill_items CASCADE;
      DROP TABLE IF EXISTS bills CASCADE;
      DROP TABLE IF EXISTS admin_building_assignments CASCADE;
      DROP TABLE IF EXISTS user_sessions CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS buildings CASCADE;
    `);

    logger.info("✅ All tables dropped successfully");

    // Recreate tables
    // Buildings
    await client.query(`
      CREATE TABLE IF NOT EXISTS buildings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        total_units INTEGER NOT NULL DEFAULT 0,
        admin_id UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'resident',
        phone VARCHAR(20),
        building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
        flat_number VARCHAR(50),
        status VARCHAR(50) DEFAULT 'pending',
        approved_by UUID,
        rent_enabled BOOLEAN DEFAULT false,
        maintenance_enabled BOOLEAN DEFAULT false,
        avatar VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add foreign key for admin_id in buildings after users table exists
    await client.query(`
      ALTER TABLE buildings 
      ADD CONSTRAINT fk_building_admin 
      FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL;
    `);

    // User Sessions
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Admin Building Assignments
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_building_assignments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
        assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(admin_id, building_id)
      );
    `);

    // Complaints
    await client.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        priority VARCHAR(50) NOT NULL DEFAULT 'medium',
        status VARCHAR(50) NOT NULL DEFAULT 'submitted',
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
        assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Complaint Updates
    await client.query(`
      CREATE TABLE IF NOT EXISTS complaint_updates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        note TEXT,
        updated_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Bills
    await client.query(`
      CREATE TABLE IF NOT EXISTS bills (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        amount DECIMAL(10, 2) NOT NULL,
        due_date TIMESTAMP WITH TIME ZONE NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        type VARCHAR(50) NOT NULL,
        building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Bill Items
    await client.query(`
      CREATE TABLE IF NOT EXISTS bill_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
        description VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Notifications
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        urgent BOOLEAN DEFAULT false,
        read BOOLEAN DEFAULT false,
        data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Community Posts
    await client.query(`
      CREATE TABLE IF NOT EXISTS community_posts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        attachments TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    logger.info("✅ All tables recreated successfully");

    // Run demo data creator
    logger.info("🌱 Seeding database with demo data...");
    const creator = new DemoDataCreator();
    await creator.run();

    logger.info("✨ Database reset and seeding completed successfully!");
  } catch (error) {
    logger.error("❌ Database reset failed:", error);
    throw error;
  } finally {
    client.release();
  }
}

// Allow running directly
if (require.main === module) {
  resetDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
