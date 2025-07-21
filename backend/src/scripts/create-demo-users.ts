import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database';
import logger from '../utils/logger';

interface DemoUser {
  email: string;
  password: string;
  name: string;
  role: 'super-admin' | 'admin' | 'resident';
  phone?: string;
  building_id?: string;
  flat_number?: string;
  status: 'pending' | 'approved' | 'rejected';
  rent_enabled: boolean;
  maintenance_enabled: boolean;
}

interface DemoBuilding {
  name: string;
  address: string;
  total_units: number;
  admin_id?: string;
}

interface DemoComplaint {
  title: string;
  description: string;
  category: 'maintenance' | 'noise' | 'security' | 'cleanliness' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  user_id: string;
  building_id: string;
}

class DemoDataCreator {
  private buildings: any[] = [];
  private users: any[] = [];

  async createDemoBuildings(): Promise<void> {
    const demoBuildings: DemoBuilding[] = [
      {
        name: 'Sunrise Apartments',
        address: '123 Main Street, Downtown, City 12345',
        total_units: 50
      },
      {
        name: 'Ocean View Towers',
        address: '456 Beach Road, Coastal Area, City 67890',
        total_units: 75
      },
      {
        name: 'Green Valley Residences',
        address: '789 Garden Lane, Suburban Area, City 54321',
        total_units: 30
      },
      {
        name: 'Metropolitan Heights',
        address: '321 Business District, Central City, City 98765',
        total_units: 100
      }
    ];

    for (const building of demoBuildings) {
      try {
        const result = await pool.query(
          `INSERT INTO buildings (id, name, address, total_units, created_at, updated_at)
           VALUES ($1, $2, $3, $4, NOW(), NOW())
           RETURNING *`,
          [uuidv4(), building.name, building.address, building.total_units]
        );
        this.buildings.push(result.rows[0]);
        logger.info(`Created building: ${building.name}`);
      } catch (error) {
        logger.error(`Failed to create building ${building.name}:`, error);
      }
    }
  }

  async createDemoUsers(): Promise<void> {
    const saltRounds = 12;
    const defaultPassword = await bcrypt.hash('Demo123!', saltRounds);

    const demoUsers: DemoUser[] = [
      // Super Admin
      {
        email: 'superadmin@demo.com',
        password: defaultPassword,
        name: 'Super Administrator',
        role: 'super-admin',
        phone: '+1234567890',
        status: 'approved',
        rent_enabled: true,
        maintenance_enabled: true
      },
      // Building Admins
      {
        email: 'admin1@demo.com',
        password: defaultPassword,
        name: 'Building Admin - Sunrise',
        role: 'admin',
        phone: '+1234567891',
        status: 'approved',
        rent_enabled: true,
        maintenance_enabled: true
      },
      {
        email: 'admin2@demo.com',
        password: defaultPassword,
        name: 'Building Admin - Ocean View',
        role: 'admin',
        phone: '+1234567892',
        status: 'approved',
        rent_enabled: true,
        maintenance_enabled: true
      },
      // Residents
      {
        email: 'resident1@demo.com',
        password: defaultPassword,
        name: 'John Smith',
        role: 'resident',
        phone: '+1234567893',
        building_id: '', // Will be set after buildings are created
        flat_number: 'A-101',
        status: 'approved',
        rent_enabled: true,
        maintenance_enabled: true
      },
      {
        email: 'resident2@demo.com',
        password: defaultPassword,
        name: 'Sarah Johnson',
        role: 'resident',
        phone: '+1234567894',
        building_id: '', // Will be set after buildings are created
        flat_number: 'B-205',
        status: 'approved',
        rent_enabled: true,
        maintenance_enabled: true
      },
      {
        email: 'resident3@demo.com',
        password: defaultPassword,
        name: 'Mike Davis',
        role: 'resident',
        phone: '+1234567895',
        building_id: '', // Will be set after buildings are created
        flat_number: 'C-301',
        status: 'pending',
        rent_enabled: false,
        maintenance_enabled: false
      },
      {
        email: 'resident4@demo.com',
        password: defaultPassword,
        name: 'Emily Wilson',
        role: 'resident',
        phone: '+1234567896',
        building_id: '', // Will be set after buildings are created
        flat_number: 'A-105',
        status: 'approved',
        rent_enabled: true,
        maintenance_enabled: true
      }
    ];

    // Assign buildings to residents safely
    if (this.buildings.length >= 3) {
      const building0 = this.buildings[0];
      const building1 = this.buildings[1];
      const building2 = this.buildings[2];
      
      if (building0 && demoUsers[3] && demoUsers[5]) {
        demoUsers[3].building_id = building0.id; // John -> Sunrise
        demoUsers[5].building_id = building0.id; // Mike -> Sunrise
      }
      if (building1 && demoUsers[4]) demoUsers[4].building_id = building1.id; // Sarah -> Ocean View
      if (building2 && demoUsers[6]) demoUsers[6].building_id = building2.id; // Emily -> Green Valley
    }

    for (const user of demoUsers) {
      try {
        const result = await pool.query(
          `INSERT INTO users (id, email, password_hash, name, role, phone, building_id, flat_number, status, rent_enabled, maintenance_enabled, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
           RETURNING *`,
          [
            uuidv4(),
            user.email,
            user.password,
            user.name,
            user.role,
            user.phone,
            user.building_id || null,
            user.flat_number || null,
            user.status,
            user.rent_enabled,
            user.maintenance_enabled
          ]
        );
        this.users.push(result.rows[0]);
        logger.info(`Created user: ${user.name} (${user.email})`);
      } catch (error) {
        logger.error(`Failed to create user ${user.email}:`, error);
      }
    }
  }

  async assignAdminsToBuildings(): Promise<void> {
    // Assign building admins to their respective buildings
    const adminAssignments = [
      { adminEmail: 'admin1@demo.com', buildingName: 'Sunrise Apartments' },
      { adminEmail: 'admin2@demo.com', buildingName: 'Ocean View Towers' }
    ];

    for (const assignment of adminAssignments) {
      try {
        const admin = this.users.find(u => u.email === assignment.adminEmail);
        const building = this.buildings.find(b => b.name === assignment.buildingName);

        if (admin && building) {
          // Update building with admin_id
          await pool.query(
            `UPDATE buildings SET admin_id = $1, updated_at = NOW() WHERE id = $2`,
            [admin.id, building.id]
          );

          // Create admin-building assignment record
          await pool.query(
            `INSERT INTO admin_building_assignments (id, admin_id, building_id, assigned_by, created_at, updated_at)
             VALUES ($1, $2, $3, $4, NOW(), NOW())`,
            [uuidv4(), admin.id, building.id, this.users.find(u => u.role === 'super-admin')?.id]
          );

          logger.info(`Assigned ${assignment.adminEmail} to ${assignment.buildingName}`);
        }
      } catch (error) {
        logger.error(`Failed to assign admin to building:`, error);
      }
    }
  }

  async createDemoComplaints(): Promise<void> {
    const residents = this.users.filter(u => u.role === 'resident' && u.building_id);
    
    const complaintTemplates = [
      {
        title: 'Elevator not working properly',
        description: 'The elevator in our building has been making strange noises and sometimes gets stuck between floors.',
        category: 'maintenance' as const,
        priority: 'high' as const
      },
      {
        title: 'Loud music from neighbor',
        description: 'My upstairs neighbor plays loud music every night after 11 PM, disturbing my sleep.',
        category: 'noise' as const,
        priority: 'medium' as const
      },
      {
        title: 'Security gate malfunction',
        description: 'The main security gate is not closing properly, posing a security risk.',
        category: 'security' as const,
        priority: 'urgent' as const
      },
      {
        title: 'Garbage disposal area needs cleaning',
        description: 'The garbage disposal area has not been cleaned for days and is attracting pests.',
        category: 'cleanliness' as const,
        priority: 'medium' as const
      },
      {
        title: 'Water leakage in basement',
        description: 'There is water leakage in the basement parking area that needs immediate attention.',
        category: 'maintenance' as const,
        priority: 'high' as const
      }
    ];

    for (let i = 0; i < residents.length && i < complaintTemplates.length; i++) {
      const resident = residents[i];
      const template = complaintTemplates[i];

      if (!resident || !template) continue;

      try {
        await pool.query(
          `INSERT INTO complaints (id, title, description, category, priority, status, user_id, building_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
          [
            uuidv4(),
            template.title,
            template.description,
            template.category,
            template.priority,
            'open',
            resident.id,
            resident.building_id
          ]
        );
        logger.info(`Created complaint: ${template.title} by ${resident.name}`);
      } catch (error) {
        logger.error(`Failed to create complaint:`, error);
      }
    }
  }

  async createAdminBuildingAssignmentsTable(): Promise<void> {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS admin_building_assignments (
          id UUID PRIMARY KEY,
          admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
          assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(admin_id, building_id)
        );
      `);
      logger.info('Created admin_building_assignments table');
    } catch (error) {
      logger.error('Failed to create admin_building_assignments table:', error);
    }
  }

  async run(): Promise<void> {
    try {
      logger.info('🚀 Starting demo data creation...');

      // Create admin-building assignments table
      await this.createAdminBuildingAssignmentsTable();

      // Create demo buildings
      logger.info('📍 Creating demo buildings...');
      await this.createDemoBuildings();

      // Create demo users
      logger.info('👥 Creating demo users...');
      await this.createDemoUsers();

      // Assign admins to buildings
      logger.info('🏢 Assigning admins to buildings...');
      await this.assignAdminsToBuildings();

      // Create demo complaints
      logger.info('📝 Creating demo complaints...');
      await this.createDemoComplaints();

      logger.info('✅ Demo data creation completed successfully!');
      logger.info('📋 Demo accounts created:');
      logger.info('  Super Admin: superadmin@demo.com / Demo123!');
      logger.info('  Building Admin 1: admin1@demo.com / Demo123!');
      logger.info('  Building Admin 2: admin2@demo.com / Demo123!');
      logger.info('  Residents: resident1@demo.com, resident2@demo.com, etc. / Demo123!');
      
    } catch (error) {
      logger.error('❌ Failed to create demo data:', error);
      throw error;
    }
  }
}

export default DemoDataCreator;

// Allow running this script directly
if (require.main === module) {
  const creator = new DemoDataCreator();
  creator.run()
    .then(() => {
      logger.info('Demo data creation script completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Demo data creation script failed:', error);
      process.exit(1);
    });
}
