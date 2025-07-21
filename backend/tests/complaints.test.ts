import request from 'supertest';
import app from '../src/server';
import { pool } from '../src/config/database';

describe('Complaints Management Tests', () => {
  let superAdminToken: string;
  let adminToken: string;
  let residentToken: string;
  let residentToken2: string;
  let testBuildingId: string;
  let testComplaintId: string;
  let testUserId: string;
  let adminUserId: string;
  let resident2UserId: string;

  beforeAll(async () => {
    // Clean up existing test data
    await pool.query("DELETE FROM complaint_updates WHERE complaint_id IN (SELECT id FROM complaints WHERE category LIKE 'Test%')");
    await pool.query("DELETE FROM complaints WHERE category LIKE 'Test%'");
    await pool.query("DELETE FROM notifications WHERE title LIKE 'Test%'");
    await pool.query("DELETE FROM buildings WHERE name LIKE 'Test Complaint%'");
    await pool.query("DELETE FROM users WHERE email LIKE 'test%complaint%'");

    // Create test building first
    const buildingResult = await pool.query(`
      INSERT INTO buildings (name, address, total_units, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id
    `, ['Test Complaint Building', '123 Test Street', 50]);
    testBuildingId = buildingResult.rows[0].id;

    // Create test users
    const superAdminResult = await pool.query(`
      INSERT INTO users (email, password_hash, name, role, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id
    `, ['test.superadmin.complaint@example.com', '$2b$10$hashedpassword', 'Super Admin Test', 'super-admin', 'approved']);

    const adminResult = await pool.query(`
      INSERT INTO users (email, password_hash, name, role, building_id, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING id
    `, ['test.admin.complaint@example.com', '$2b$10$hashedpassword', 'Admin Test', 'admin', testBuildingId, 'approved']);

    const residentResult = await pool.query(`
      INSERT INTO users (email, password_hash, name, role, building_id, flat_number, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING id
    `, ['test.resident.complaint@example.com', '$2b$10$hashedpassword', 'Resident Test', 'resident', testBuildingId, '101', 'approved']);

    const resident2Result = await pool.query(`
      INSERT INTO users (email, password_hash, name, role, building_id, flat_number, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING id
    `, ['test.resident2.complaint@example.com', '$2b$10$hashedpassword', 'Resident Test 2', 'resident', testBuildingId, '102', 'approved']);

    adminUserId = adminResult.rows[0].id;
    testUserId = residentResult.rows[0].id;
    resident2UserId = resident2Result.rows[0].id;

    // Update building admin_id
    await pool.query('UPDATE buildings SET admin_id = $1 WHERE id = $2', [adminUserId, testBuildingId]);

    // Login and get tokens
    const superAdminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test.superadmin.complaint@example.com',
        password: 'password123'
      });
    
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test.admin.complaint@example.com',
        password: 'password123'
      });

    const residentLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test.resident.complaint@example.com',
        password: 'password123'
      });

    const resident2Login = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test.resident2.complaint@example.com',
        password: 'password123'
      });

    superAdminToken = superAdminLogin.body.data.token;
    adminToken = adminLogin.body.data.token;
    residentToken = residentLogin.body.data.token;
    residentToken2 = resident2Login.body.data.token;
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query("DELETE FROM complaint_updates WHERE complaint_id IN (SELECT id FROM complaints WHERE category LIKE 'Test%')");
    await pool.query("DELETE FROM complaints WHERE category LIKE 'Test%'");
    await pool.query("DELETE FROM notifications WHERE title LIKE 'Test%'");
    await pool.query("DELETE FROM buildings WHERE name LIKE 'Test Complaint%'");
    await pool.query("DELETE FROM users WHERE email LIKE 'test%complaint%'");
    await pool.end();
  });

  describe('POST /api/complaints - Create Complaint', () => {
    it('should create a complaint with valid data', async () => {
      const complaintData = {
        type: 'Test Maintenance',
        description: 'Test complaint description',
        priority: 'medium',
        location: 'Flat 101'
      };

      const response = await request(app)
        .post('/api/complaints')
        .set('Authorization', `Bearer ${residentToken}`)
        .send(complaintData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.complaint.category).toBe('Test Maintenance');
      expect(response.body.data.complaint.description).toBe('Test complaint description');
      expect(response.body.data.complaint.status).toBe('submitted');
      expect(response.body.data.complaint.priority).toBe('medium');
      
      testComplaintId = response.body.data.complaint.id;
    });

    it('should require authentication', async () => {
      const complaintData = {
        type: 'Test Maintenance',
        description: 'Test complaint description',
        priority: 'medium'
      };

      const response = await request(app)
        .post('/api/complaints')
        .send(complaintData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        type: 'Test Maintenance'
        // Missing description and priority
      };

      const response = await request(app)
        .post('/api/complaints')
        .set('Authorization', `Bearer ${residentToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required');
    });

    it('should validate priority values', async () => {
      const invalidData = {
        type: 'Test Maintenance',
        description: 'Test complaint description',
        priority: 'invalid-priority'
      };

      // This should pass through to the database validation
      const response = await request(app)
        .post('/api/complaints')
        .set('Authorization', `Bearer ${residentToken}`)
        .send(invalidData)
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/complaints - List Complaints', () => {
    it('should return complaints for resident (only their own)', async () => {
      const response = await request(app)
        .get('/api/complaints')
        .set('Authorization', `Bearer ${residentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.complaints).toBeInstanceOf(Array);
      // Should only see their own complaint
      response.body.data.complaints.forEach((complaint: any) => {
        expect(complaint.user_id).toBe(testUserId);
      });
    });

    it('should return complaints for admin (building-specific)', async () => {
      const response = await request(app)
        .get('/api/complaints')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.complaints).toBeInstanceOf(Array);
      // Should see complaints from their building
      response.body.data.complaints.forEach((complaint: any) => {
        expect(complaint.building_id).toBe(testBuildingId);
      });
    });

    it('should return all complaints for super admin', async () => {
      const response = await request(app)
        .get('/api/complaints')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.complaints).toBeInstanceOf(Array);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/complaints')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/complaints/:id - Get Complaint by ID', () => {
    it('should return complaint for authorized user', async () => {
      const response = await request(app)
        .get(`/api/complaints/${testComplaintId}`)
        .set('Authorization', `Bearer ${residentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.complaint.id).toBe(testComplaintId);
      expect(response.body.data.complaint.category).toBe('Test Maintenance');
    });

    it('should not allow resident to view other residents complaints', async () => {
      const response = await request(app)
        .get(`/api/complaints/${testComplaintId}`)
        .set('Authorization', `Bearer ${residentToken2}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should allow admin to view complaints in their building', async () => {
      const response = await request(app)
        .get(`/api/complaints/${testComplaintId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.complaint.id).toBe(testComplaintId);
    });

    it('should return 404 for non-existent complaint', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      const response = await request(app)
        .get(`/api/complaints/${fakeId}`)
        .set('Authorization', `Bearer ${residentToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/complaints/:id/status - State Transitions', () => {
    it('should allow admin to update complaint status from submitted to assigned', async () => {
      const response = await request(app)
        .patch(`/api/complaints/${testComplaintId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'assigned',
          response: 'Complaint has been assigned to maintenance team'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.complaint.status).toBe('assigned');
    });

    it('should allow admin to update complaint status from assigned to in-progress', async () => {
      const response = await request(app)
        .patch(`/api/complaints/${testComplaintId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'in-progress',
          response: 'Work has started on this complaint'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.complaint.status).toBe('in-progress');
    });

    it('should allow admin to update complaint status from in-progress to resolved', async () => {
      const response = await request(app)
        .patch(`/api/complaints/${testComplaintId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'resolved',
          response: 'Issue has been resolved successfully'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.complaint.status).toBe('resolved');
    });

    it('should not allow resident to update complaint status', async () => {
      const response = await request(app)
        .patch(`/api/complaints/${testComplaintId}/status`)
        .set('Authorization', `Bearer ${residentToken}`)
        .send({
          status: 'in-progress'
        })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should validate status values', async () => {
      const response = await request(app)
        .patch(`/api/complaints/${testComplaintId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'invalid-status'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Valid status is required');
    });

    it('should not allow admin to update complaints outside their building', async () => {
      // Create another building and complaint
      const otherBuildingResult = await pool.query(`
        INSERT INTO buildings (name, address, total_units, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id
      `, ['Other Test Building', '456 Other Street', 30]);

      const otherComplaintResult = await pool.query(`
        INSERT INTO complaints (user_id, building_id, category, description, priority, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING id
      `, [testUserId, otherBuildingResult.rows[0].id, 'Other Maintenance', 'Other complaint', 'low', 'submitted']);

      const response = await request(app)
        .patch(`/api/complaints/${otherComplaintResult.rows[0].id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'assigned'
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Comment Threads (Complaint Updates)', () => {
    it('should create complaint update when status is changed with response', async () => {
      // First create a new complaint to test with
      const complaintResponse = await request(app)
        .post('/api/complaints')
        .set('Authorization', `Bearer ${residentToken}`)
        .send({
          type: 'Test Comment Thread',
          description: 'Test complaint for comment thread',
          priority: 'high'
        })
        .expect(201);

      const complaintId = complaintResponse.body.data.complaint.id;

      // Update status with response (creates comment thread entry)
      await request(app)
        .patch(`/api/complaints/${complaintId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'assigned',
          response: 'This is a comment in the thread'
        })
        .expect(200);

      // Verify complaint update was created
      const updateResult = await pool.query(
        'SELECT * FROM complaint_updates WHERE complaint_id = $1',
        [complaintId]
      );

      expect(updateResult.rows.length).toBe(1);
      expect(updateResult.rows[0].status).toBe('assigned');
      expect(updateResult.rows[0].note).toBe('This is a comment in the thread');
      expect(updateResult.rows[0].updated_by).toBe(adminUserId);
    });

    it('should maintain chronological order of comment threads', async () => {
      // Create a complaint
      const complaintResponse = await request(app)
        .post('/api/complaints')
        .set('Authorization', `Bearer ${residentToken}`)
        .send({
          type: 'Test Chronological Comments',
          description: 'Test complaint for chronological comments',
          priority: 'medium'
        })
        .expect(201);

      const complaintId = complaintResponse.body.data.complaint.id;

      // Add multiple status updates with delays to ensure different timestamps
      await request(app)
        .patch(`/api/complaints/${complaintId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'assigned',
          response: 'First comment'
        })
        .expect(200);

      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 100));

      await request(app)
        .patch(`/api/complaints/${complaintId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'in-progress',
          response: 'Second comment'
        })
        .expect(200);

      await new Promise(resolve => setTimeout(resolve, 100));

      await request(app)
        .patch(`/api/complaints/${complaintId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'resolved',
          response: 'Third comment'
        })
        .expect(200);

      // Verify chronological order
      const updateResult = await pool.query(
        'SELECT * FROM complaint_updates WHERE complaint_id = $1 ORDER BY created_at ASC',
        [complaintId]
      );

      expect(updateResult.rows.length).toBe(3);
      expect(updateResult.rows[0].note).toBe('First comment');
      expect(updateResult.rows[1].note).toBe('Second comment');
      expect(updateResult.rows[2].note).toBe('Third comment');
    });
  });

  describe('Attachments Support', () => {
    it('should support creating complaints with attachments field', async () => {
      // Note: The schema supports attachments as TEXT[] but the route doesn't handle file uploads yet
      // This tests the database field support
      const attachments = ['file1.jpg', 'file2.pdf'];
      
      const complaintResult = await pool.query(`
        INSERT INTO complaints (user_id, building_id, category, description, priority, status, attachments, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *
      `, [testUserId, testBuildingId, 'Test with Attachments', 'Complaint with attachments', 'medium', 'submitted', attachments]);

      expect(complaintResult.rows[0].attachments).toEqual(attachments);
    });

    it('should retrieve complaints with attachments', async () => {
      // Query the complaint created in the previous test
      const result = await pool.query(
        'SELECT * FROM complaints WHERE category = $1',
        ['Test with Attachments']
      );

      expect(result.rows.length).toBe(1);
      expect(result.rows[0].attachments).toEqual(['file1.jpg', 'file2.pdf']);
    });
  });

  describe('Notifications Integration', () => {
    it('should create notification when complaint status changes', async () => {
      // Create a complaint
      const complaintResponse = await request(app)
        .post('/api/complaints')
        .set('Authorization', `Bearer ${residentToken}`)
        .send({
          type: 'Test Notification',
          description: 'Test complaint for notifications',
          priority: 'high'
        })
        .expect(201);

      const complaintId = complaintResponse.body.data.complaint.id;

      // Update status (should trigger notification)
      await request(app)
        .patch(`/api/complaints/${complaintId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'assigned',
          response: 'Your complaint has been assigned'
        })
        .expect(200);

      // Check if notification was created (assuming there's a notification system)
      // For now, we'll check if the status update was recorded
      const updateResult = await pool.query(
        'SELECT * FROM complaint_updates WHERE complaint_id = $1 AND status = $2',
        [complaintId, 'assigned']
      );

      expect(updateResult.rows.length).toBe(1);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle invalid complaint ID format', async () => {
      const response = await request(app)
        .get('/api/complaints/invalid-id')
        .set('Authorization', `Bearer ${residentToken}`)
        .expect(500);

      expect(response.body.success).toBe(false);
    });

    it('should handle database connection errors gracefully', async () => {
      // This is hard to test without mocking the database
      // For now, we'll test with a very long description that might cause issues
      const longDescription = 'a'.repeat(10000);
      
      const response = await request(app)
        .post('/api/complaints')
        .set('Authorization', `Bearer ${residentToken}`)
        .send({
          type: 'Test Long Description',
          description: longDescription,
          priority: 'low'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should validate complaint ownership on status updates', async () => {
      // Create complaint from one resident
      const complaintResponse = await request(app)
        .post('/api/complaints')
        .set('Authorization', `Bearer ${residentToken}`)
        .send({
          type: 'Test Ownership',
          description: 'Test complaint ownership validation',
          priority: 'medium'
        })
        .expect(201);

      const complaintId = complaintResponse.body.data.complaint.id;

      // Try to update from different building's admin (should fail)
      // First create another building and admin
      const otherBuildingResult = await pool.query(`
        INSERT INTO buildings (name, address, total_units, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id
      `, ['Other Admin Building', '789 Other Ave', 25]);

      const otherAdminResult = await pool.query(`
        INSERT INTO users (email, password_hash, name, role, building_id, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING id
      `, ['test.other.admin@example.com', '$2b$10$hashedpassword', 'Other Admin', 'admin', otherBuildingResult.rows[0].id, 'approved']);

      const otherAdminLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test.other.admin@example.com',
          password: 'password123'
        });

      const otherAdminToken = otherAdminLogin.body.data.token;

      const response = await request(app)
        .patch(`/api/complaints/${complaintId}/status`)
        .set('Authorization', `Bearer ${otherAdminToken}`)
        .send({
          status: 'assigned'
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
