import request from 'supertest';
import app from '../src/server';
import { pool } from '../src/config/database';

describe('Resident Management Tests', () => {
  let superAdminToken: string;
  let adminToken: string;
  let residentToken: string;
  let testBuildingId: string;
  let testResidentId: string;
  let testAdminId: string;

  beforeAll(async () => {
    // Clean up existing test data
    await pool.query("DELETE FROM users WHERE email LIKE 'test%resident%'");
    await pool.query("DELETE FROM buildings WHERE name LIKE 'Test%'");

    // Create test building
    const buildingResult = await pool.query(
      'INSERT INTO buildings (name, address, total_units) VALUES ($1, $2, $3) RETURNING id',
      ['Test Resident Building', '123 Resident Street', 50]
    );
    testBuildingId = buildingResult.rows[0].id;

    // Create test users
    const superAdmin = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Super Admin Resident',
        email: 'test.superadmin.resident@example.com',
        password: 'password123',
        role: 'super-admin'
      });

    const admin = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin Resident',
        email: 'test.admin.resident@example.com',
        password: 'password123',
        role: 'admin',
        building_id: testBuildingId
      });

    const resident = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Resident',
        email: 'test.resident.main@example.com',
        password: 'password123',
        role: 'resident',
        building_id: testBuildingId,
        flat_number: '101'
      });

    // Login and get tokens
    const superAdminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test.superadmin.resident@example.com',
        password: 'password123'
      });

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test.admin.resident@example.com',
        password: 'password123'
      });

    const residentLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test.resident.main@example.com',
        password: 'password123'
      });

    superAdminToken = superAdminLogin.body.token;
    adminToken = adminLogin.body.token;
    residentToken = residentLogin.body.token;
    testResidentId = residentLogin.body.user.id;
    testAdminId = adminLogin.body.user.id;

    // Update building admin
    await pool.query(
      'UPDATE buildings SET admin_id = $1 WHERE id = $2',
      [testAdminId, testBuildingId]
    );
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query("DELETE FROM users WHERE email LIKE 'test%resident%'");
    await pool.query("DELETE FROM buildings WHERE name LIKE 'Test%'");
    await pool.end();
  });

  describe('GET /api/users (Residents)', () => {
    it('should return all residents for super admin', async () => {
      const response = await request(app)
        .get('/api/users?role=resident')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toBeInstanceOf(Array);
      expect(response.body.data.users.length).toBeGreaterThan(0);
    });

    it('should return only building residents for admin', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      // Admin should only see users from their building
      const buildingUsers = response.body.data.users.filter(
        (user: any) => user.building_id === testBuildingId
      );
      expect(buildingUsers.length).toBeGreaterThan(0);
    });

    it('should support pagination for residents list', async () => {
      const response = await request(app)
        .get('/api/users?role=resident&page=1&limit=5')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(5);
    });

    it('should support search functionality', async () => {
      const response = await request(app)
        .get('/api/users?search=Test%20Resident')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      const foundUser = response.body.data.users.find(
        (user: any) => user.name === 'Test Resident'
      );
      expect(foundUser).toBeDefined();
    });

    it('should filter by building for super admin', async () => {
      const response = await request(app)
        .get(`/api/users?building_id=${testBuildingId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.users.forEach((user: any) => {
        if (user.building_id) {
          expect(user.building_id).toBe(testBuildingId);
        }
      });
    });
  });

  describe('POST /api/users (Create Resident)', () => {
    it('should create a new resident', async () => {
      const residentData = {
        name: 'New Test Resident',
        email: 'test.newresident@example.com',
        password: 'password123',
        phone: '+1234567890',
        role: 'resident',
        building_id: testBuildingId,
        flat_number: '102'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(residentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user.name).toBe('New Test Resident');
      expect(response.body.user.role).toBe('resident');
      expect(response.body.user.status).toBe('pending'); // Should require approval
    });

    it('should prevent duplicate flat numbers in same building', async () => {
      const duplicateResidentData = {
        name: 'Duplicate Flat Resident',
        email: 'test.duplicate.flat@example.com',
        password: 'password123',
        role: 'resident',
        building_id: testBuildingId,
        flat_number: '101' // Same as existing resident
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateResidentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already occupied');
    });

    it('should validate required fields for resident', async () => {
      const invalidData = {
        name: 'Invalid Resident',
        email: 'test.invalid@example.com',
        password: 'password123',
        role: 'resident'
        // Missing building_id and flat_number
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate email format', async () => {
      const invalidEmailData = {
        name: 'Invalid Email Resident',
        email: 'invalid-email',
        password: 'password123',
        role: 'resident',
        building_id: testBuildingId,
        flat_number: '103'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidEmailData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/:id (Update Resident)', () => {
    it('should update resident profile information', async () => {
      const updateData = {
        name: 'Updated Test Resident',
        phone: '+0987654321',
        flat_number: '101A'
      };

      const response = await request(app)
        .put(`/api/users/${testResidentId}`)
        .set('Authorization', `Bearer ${residentToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.name).toBe('Updated Test Resident');
      expect(response.body.data.user.phone).toBe('+0987654321');
    });

    it('should allow admin to update resident in their building', async () => {
      const updateData = {
        status: 'approved',
        rent_enabled: true,
        maintenance_enabled: true
      };

      const response = await request(app)
        .put(`/api/users/${testResidentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.status).toBe('approved');
    });

    it('should prevent residents from updating other residents', async () => {
      // Create another resident
      const anotherResident = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another Resident',
          email: 'test.another.resident@example.com',
          password: 'password123',
          role: 'resident',
          building_id: testBuildingId,
          flat_number: '104'
        });

      const updateData = {
        name: 'Unauthorized Update'
      };

      const response = await request(app)
        .put(`/api/users/${anotherResident.body.user.id}`)
        .set('Authorization', `Bearer ${residentToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should prevent flat number conflicts when updating', async () => {
      // Create another resident
      const anotherResident = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Conflict Test Resident',
          email: 'test.conflict.resident@example.com',
          password: 'password123',
          role: 'resident',
          building_id: testBuildingId,
          flat_number: '105'
        });

      // Try to update to existing flat number
      const updateData = {
        flat_number: '101A' // Already taken by testResidentId
      };

      const response = await request(app)
        .put(`/api/users/${anotherResident.body.user.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('occupied');
    });
  });

  describe('PATCH /api/users/:id/status (Approve/Reject Resident)', () => {
    let pendingResidentId: string;

    beforeAll(async () => {
      const pendingResident = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Pending Resident',
          email: 'test.pending.resident@example.com',
          password: 'password123',
          role: 'resident',
          building_id: testBuildingId,
          flat_number: '106'
        });
      pendingResidentId = pendingResident.body.user.id;
    });

    it('should approve resident by admin', async () => {
      const response = await request(app)
        .patch(`/api/users/${pendingResidentId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'approved' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.status).toBe('approved');
      expect(response.body.data.user.approved_by).toBe(testAdminId);
    });

    it('should reject resident by admin', async () => {
      // Create another pending resident
      const anotherPending = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Reject Test Resident',
          email: 'test.reject.resident@example.com',
          password: 'password123',
          role: 'resident',
          building_id: testBuildingId,
          flat_number: '107'
        });

      const response = await request(app)
        .patch(`/api/users/${anotherPending.body.user.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'rejected' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.status).toBe('rejected');
    });

    it('should prevent resident from changing status', async () => {
      const response = await request(app)
        .patch(`/api/users/${pendingResidentId}/status`)
        .set('Authorization', `Bearer ${residentToken}`)
        .send({ status: 'approved' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should validate status values', async () => {
      const response = await request(app)
        .patch(`/api/users/${pendingResidentId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/users/:id (Delete Resident)', () => {
    let deleteTestResidentId: string;

    beforeAll(async () => {
      const deleteTestResident = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Delete Test Resident',
          email: 'test.delete.resident@example.com',
          password: 'password123',
          role: 'resident',
          building_id: testBuildingId,
          flat_number: '108'
        });
      deleteTestResidentId = deleteTestResident.body.user.id;
    });

    it('should delete resident by super admin', async () => {
      const response = await request(app)
        .delete(`/api/users/${deleteTestResidentId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should prevent deletion by admin', async () => {
      const response = await request(app)
        .delete(`/api/users/${testResidentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should prevent resident from deleting themselves', async () => {
      const response = await request(app)
        .delete(`/api/users/${testResidentId}`)
        .set('Authorization', `Bearer ${residentToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Resident Transfer Between Flats', () => {
    it('should allow moving resident to different flat in same building', async () => {
      const response = await request(app)
        .put(`/api/users/${testResidentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          flat_number: '109'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.flat_number).toBe('109');
    });

    it('should allow super admin to transfer resident between buildings', async () => {
      // Create another building
      const newBuilding = await pool.query(
        'INSERT INTO buildings (name, address, total_units) VALUES ($1, $2, $3) RETURNING id',
        ['Transfer Test Building', '456 Transfer Street', 30]
      );
      const newBuildingId = newBuilding.rows[0].id;

      const response = await request(app)
        .put(`/api/users/${testResidentId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          building_id: newBuildingId,
          flat_number: '201'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.building_id).toBe(newBuildingId);
      expect(response.body.data.user.flat_number).toBe('201');
    });

    it('should prevent admin from transferring resident to different building', async () => {
      const anotherBuilding = await pool.query(
        'INSERT INTO buildings (name, address, total_units) VALUES ($1, $2, $3) RETURNING id',
        ['Another Building', '789 Another Street', 40]
      );
      const anotherBuildingId = anotherBuilding.rows[0].id;

      const response = await request(app)
        .put(`/api/users/${testResidentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          building_id: anotherBuildingId,
          flat_number: '301'
        })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Bulk Resident Operations', () => {
    it('should support bulk resident import from CSV', async () => {
      const csvData = `name,email,phone,flat_number
Bulk Resident 1,bulk1@example.com,+1111111111,401
Bulk Resident 2,bulk2@example.com,+2222222222,402
Bulk Resident 3,bulk3@example.com,+3333333333,403`;

      const response = await request(app)
        .post(`/api/buildings/${testBuildingId}/residents/bulk-import`)
        .set('Authorization', `Bearer ${adminToken}`)
        .field('csv_data', csvData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.created_count).toBe(3);
    });

    it('should validate CSV data for bulk import', async () => {
      const invalidCsvData = `name,email
Invalid Bulk 1,invalid1@example.com`;

      const response = await request(app)
        .post(`/api/buildings/${testBuildingId}/residents/bulk-import`)
        .set('Authorization', `Bearer ${adminToken}`)
        .field('csv_data', invalidCsvData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('flat_number');
    });

    it('should handle duplicate emails in bulk import', async () => {
      const csvWithDuplicates = `name,email,phone,flat_number
Duplicate Test 1,duplicate@example.com,+1111111111,501
Duplicate Test 2,duplicate@example.com,+2222222222,502`;

      const response = await request(app)
        .post(`/api/buildings/${testBuildingId}/residents/bulk-import`)
        .set('Authorization', `Bearer ${adminToken}`)
        .field('csv_data', csvWithDuplicates)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('duplicate');
    });
  });

  describe('Resident Profile Validation', () => {
    it('should validate phone number format', async () => {
      const response = await request(app)
        .put(`/api/users/${testResidentId}`)
        .set('Authorization', `Bearer ${residentToken}`)
        .send({
          phone: 'invalid-phone'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate flat number format', async () => {
      const response = await request(app)
        .put(`/api/users/${testResidentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          flat_number: '' // Empty flat number
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Resident Analytics', () => {
    it('should provide resident analytics for building admin', async () => {
      const response = await request(app)
        .get(`/api/buildings/${testBuildingId}/residents/analytics`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total_residents');
      expect(response.body.data).toHaveProperty('approved_residents');
      expect(response.body.data).toHaveProperty('pending_residents');
      expect(response.body.data).toHaveProperty('occupancy_rate');
    });

    it('should provide system-wide resident analytics for super admin', async () => {
      const response = await request(app)
        .get('/api/users/analytics')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total_residents');
      expect(response.body.data).toHaveProperty('residents_by_building');
      expect(response.body.data).toHaveProperty('approval_trends');
    });
  });

  describe('Data Integrity Checks', () => {
    it('should maintain consistency when deleting building with residents', async () => {
      // Create a test building with residents
      const testBuilding = await pool.query(
        'INSERT INTO buildings (name, address, total_units) VALUES ($1, $2, $3) RETURNING id',
        ['Integrity Test Building', '123 Integrity St', 10]
      );
      const buildingId = testBuilding.rows[0].id;

      // Create resident in this building
      const testResident = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Integrity Test Resident',
          email: 'integrity.test@example.com',
          password: 'password123',
          role: 'resident',
          building_id: buildingId,
          flat_number: '101'
        });

      // Try to delete building - should fail due to residents
      const deleteResponse = await request(app)
        .delete(`/api/buildings/${buildingId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(400);

      expect(deleteResponse.body.success).toBe(false);
      expect(deleteResponse.body.error).toContain('occupied');
    });

    it('should handle cascade operations properly', async () => {
      // When a building is deleted (after all residents moved), 
      // all related data should be handled properly
      const emptyBuilding = await pool.query(
        'INSERT INTO buildings (name, address, total_units) VALUES ($1, $2, $3) RETURNING id',
        ['Empty Building', '999 Empty St', 5]
      );
      const emptyBuildingId = emptyBuilding.rows[0].id;

      // Delete empty building should succeed
      const response = await request(app)
        .delete(`/api/buildings/${emptyBuildingId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
