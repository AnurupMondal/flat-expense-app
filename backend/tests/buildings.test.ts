import request from 'supertest';
import app from '../src/server';
import { pool } from '../src/config/database';

describe('Building Management Tests', () => {
  let superAdminToken: string;
  let adminToken: string;
  let residentToken: string;
  let testBuildingId: string;
  let testUserId: string;

  beforeAll(async () => {
    // Clean up existing test data
    await pool.query("DELETE FROM buildings WHERE name LIKE 'Test%'");
    await pool.query("DELETE FROM users WHERE email LIKE 'test%building%'");

    // Create test users
    const superAdmin = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Super Admin Test',
        email: 'test.superadmin.building@example.com',
        password: 'password123',
        role: 'super-admin'
      });

    const admin = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin Test',
        email: 'test.admin.building@example.com',
        password: 'password123',
        role: 'admin'
      });

    const resident = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Resident Test',
        email: 'test.resident.building@example.com',
        password: 'password123',
        role: 'resident'
      });

    // Login and get tokens
    const superAdminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test.superadmin.building@example.com',
        password: 'password123'
      });
    
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test.admin.building@example.com',
        password: 'password123'
      });

    const residentLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test.resident.building@example.com',
        password: 'password123'
      });

    superAdminToken = superAdminLogin.body.token;
    adminToken = adminLogin.body.token;
    residentToken = residentLogin.body.token;
    testUserId = adminLogin.body.user.id;
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query("DELETE FROM buildings WHERE name LIKE 'Test%'");
    await pool.query("DELETE FROM users WHERE email LIKE 'test%building%'");
    await pool.end();
  });

  describe('GET /api/buildings', () => {
    it('should return all buildings for authenticated user', async () => {
      const response = await request(app)
        .get('/api/buildings')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.buildings).toBeInstanceOf(Array);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/buildings')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should include pagination support', async () => {
      const response = await request(app)
        .get('/api/buildings?page=1&limit=5')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.buildings).toBeInstanceOf(Array);
    });

    it('should include search functionality', async () => {
      const response = await request(app)
        .get('/api/buildings?search=Test')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/buildings', () => {
    it('should create a new building for super admin', async () => {
      const buildingData = {
        name: 'Test Building 1',
        address: '123 Test Street',
        total_units: 50,
        admin_id: testUserId
      };

      const response = await request(app)
        .post('/api/buildings')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(buildingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.building.name).toBe('Test Building 1');
      expect(response.body.data.building.total_units).toBe(50);
      
      testBuildingId = response.body.data.building.id;
    });

    it('should reject creation by non-super-admin', async () => {
      const buildingData = {
        name: 'Test Building Unauthorized',
        address: '456 Test Avenue',
        total_units: 30
      };

      const response = await request(app)
        .post('/api/buildings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(buildingData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        name: 'Test Building Invalid'
        // Missing address and total_units
      };

      const response = await request(app)
        .post('/api/buildings')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required');
    });

    it('should handle duplicate building names', async () => {
      const buildingData = {
        name: 'Test Building 1', // Same name as created above
        address: '789 Another Street',
        total_units: 25
      };

      const response = await request(app)
        .post('/api/buildings')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(buildingData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/buildings/:id', () => {
    it('should update building information', async () => {
      const updateData = {
        name: 'Test Building 1 Updated',
        address: '123 Test Street Updated',
        total_units: 55
      };

      const response = await request(app)
        .put(`/api/buildings/${testBuildingId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.building.name).toBe('Test Building 1 Updated');
      expect(response.body.data.building.total_units).toBe(55);
    });

    it('should reject update by non-authorized user', async () => {
      const updateData = {
        name: 'Unauthorized Update'
      };

      const response = await request(app)
        .put(`/api/buildings/${testBuildingId}`)
        .set('Authorization', `Bearer ${residentToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should handle non-existent building ID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const updateData = {
        name: 'Non-existent Building'
      };

      const response = await request(app)
        .put(`/api/buildings/${fakeId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/buildings/:id', () => {
    it('should prevent deletion of occupied building', async () => {
      // First assign a resident to the building
      await pool.query(
        'UPDATE users SET building_id = $1, flat_number = $2 WHERE email = $3',
        [testBuildingId, '101', 'test.resident.building@example.com']
      );

      const response = await request(app)
        .delete(`/api/buildings/${testBuildingId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('occupied');
    });

    it('should allow deletion of empty building', async () => {
      // Create a new empty building for deletion
      const emptyBuilding = await request(app)
        .post('/api/buildings')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'Test Building for Deletion',
          address: '999 Delete Street',
          total_units: 10
        });

      const buildingId = emptyBuilding.body.data.building.id;

      const response = await request(app)
        .delete(`/api/buildings/${buildingId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject deletion by non-super-admin', async () => {
      const response = await request(app)
        .delete(`/api/buildings/${testBuildingId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/buildings/:id/flats', () => {
    it('should return flats in a building', async () => {
      const response = await request(app)
        .get(`/api/buildings/${testBuildingId}/flats`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.flats).toBeInstanceOf(Array);
    });

    it('should include occupancy information', async () => {
      const response = await request(app)
        .get(`/api/buildings/${testBuildingId}/flats`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data.flats.length > 0) {
        expect(response.body.data.flats[0]).toHaveProperty('occupied');
        expect(response.body.data.flats[0]).toHaveProperty('resident_name');
      }
    });
  });

  describe('POST /api/buildings/:id/flats', () => {
    it('should create flat in building', async () => {
      const flatData = {
        flat_number: '102',
        floor: 1,
        bedrooms: 2,
        rent_amount: 1500
      };

      const response = await request(app)
        .post(`/api/buildings/${testBuildingId}/flats`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(flatData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.flat.flat_number).toBe('102');
    });

    it('should prevent duplicate flat numbers in same building', async () => {
      const flatData = {
        flat_number: '102', // Duplicate
        floor: 1,
        bedrooms: 2,
        rent_amount: 1500
      };

      const response = await request(app)
        .post(`/api/buildings/${testBuildingId}/flats`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(flatData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('duplicate');
    });
  });

  describe('Bulk Operations', () => {
    it('should support bulk building creation from CSV', async () => {
      const csvData = `name,address,total_units
Test Bulk Building 1,100 Bulk Street,20
Test Bulk Building 2,200 Bulk Avenue,30
Test Bulk Building 3,300 Bulk Road,25`;

      const response = await request(app)
        .post('/api/buildings/bulk-import')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .field('csv_data', csvData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.created_count).toBe(3);
      expect(response.body.data.buildings).toHaveLength(3);
    });

    it('should validate CSV format and data', async () => {
      const invalidCsvData = `name,address
Invalid Building 1,100 Invalid Street`;

      const response = await request(app)
        .post('/api/buildings/bulk-import')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .field('csv_data', invalidCsvData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('total_units');
    });
  });

  describe('Data Integrity', () => {
    it('should maintain referential integrity when updating admin', async () => {
      // Create new admin user
      const newAdmin = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New Admin Test',
          email: 'test.newadmin.building@example.com',
          password: 'password123',
          role: 'admin'
        });

      // Update building with new admin
      const response = await request(app)
        .put(`/api/buildings/${testBuildingId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          admin_id: newAdmin.body.user.id
        })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify the relationship
      const buildingResponse = await request(app)
        .get('/api/buildings')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      const updatedBuilding = buildingResponse.body.data.buildings.find(
        (b: any) => b.id === testBuildingId
      );
      expect(updatedBuilding.admin_name).toBe('New Admin Test');
    });

    it('should cascade properly when deleting admin user', async () => {
      // This should set admin_id to null, not fail
      await request(app)
        .delete(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      // Check that building still exists but admin_id is null
      const response = await request(app)
        .get('/api/buildings')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      const building = response.body.data.buildings.find(
        (b: any) => b.id === testBuildingId
      );
      expect(building).toBeDefined();
      expect(building.admin_id).toBeNull();
    });
  });

  describe('Analytics Integration', () => {
    it('should provide building analytics data', async () => {
      const response = await request(app)
        .get(`/api/buildings/${testBuildingId}/analytics`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('occupancy_rate');
      expect(response.body.data).toHaveProperty('total_units');
      expect(response.body.data).toHaveProperty('occupied_units');
      expect(response.body.data).toHaveProperty('revenue_data');
    });
  });
});
