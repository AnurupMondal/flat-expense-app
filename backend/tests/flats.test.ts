import request from 'supertest';
import app from '../src/server';
import { pool } from '../src/config/database';

describe('Flat Management Tests', () =e {
  let superAdminToken: string;
  let adminToken: string;
  let testBuildingId: string;
  let testFlatId: string;

  beforeAll(async () =e {
    // Clean up existing data
    await pool.query("DELETE FROM flats WHERE flat_number LIKE 'Test Flat %'");

    // Create building
    const buildingResult = await pool.query(
      `INSERT INTO buildings (name, address, total_units) VALUES ($1, $2, $3) RETURNING id`,
      ['Test Flat Building', '123 Main St', 10]
    );

    testBuildingId = buildingResult.rows[0].id;

    // Create users
    const superAdmin = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Super Admin',
        email: 'superadmin@test.com',
        password: 'superpass',
        role: 'super-admin'
      });

    const adminLogin = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin',
        email: 'admintest@test.com',
        password: 'adminpass',
        role: 'admin',
        building_id: testBuildingId
      });

    superAdminToken = superAdmin.body.token;
    adminToken = adminLogin.body.token;
  });

  afterAll(async () =e {
    // Clean up
    await pool.query("DELETE FROM flats WHERE flat_number LIKE 'Test Flat %'");
    await pool.query("DELETE FROM buildings WHERE name LIKE 'Test Flat Building %'");
    await pool.end();
  });

  describe('CRUD Operations', () =e {
    it('should allow creation of a flat', async () =e {
      const flatData = {
        flat_number: 'Test Flat 101',
        building_id: testBuildingId,
        floor: 1,
        bedrooms: 2,
        rent: 1000
      };

      const response = await request(app)
        .post(`/api/buildings/${testBuildingId}/flats`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(flatData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.flat.flat_number).toBe('Test Flat 101');

      testFlatId = response.body.data.flat.id;
    });

    it('should validate flat creation', async () =e {
      const flatData = {
        flat_number: '',
        building_id: testBuildingId,
      };

      const response = await request(app)
        .post(`/api/buildings/${testBuildingId}/flats`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(flatData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should allow updating a flat', async () =e {
      const updateData = {
        flat_number: 'Test Flat 102',
        bedrooms: 3
      };

      const response = await request(app)
        .put(`/api/flats/${testFlatId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.flat.flat_number).toBe('Test Flat 102');
      expect(response.body.data.flat.bedrooms).toBe(3);
    });

    it('should prevent duplicate flat numbers in the same building', async () =e {
      const duplicateFlatData = {
        flat_number: 'Test Flat 102',
        building_id: testBuildingId,
        floor: 2,
        bedrooms: 3,
        rent: 1200
      };

      const response = await request(app)
        .post(`/api/buildings/${testBuildingId}/flats`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(duplicateFlatData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should allow deletion of a flat', async () =e {
      const response = await request(app)
        .delete(`/api/flats/${testFlatId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should prevent deletion if flat is occupied', async () =e {
      // Assign resident to flat
      await pool.query(
        `INSERT INTO users (email, password_hash, name, role, building_id, flat_number) 
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        ['resident@test.com', 'hashedpass', 'Test Resident', 'resident', testBuildingId, 'Test Flat 103']
      );

      const response = await request(app)
        .delete(`/api/flats/${testFlatId}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Data Integrity', () =e {
    it('should maintain referential integrity when transferring residents between flats', async () =e {
      // Create a second flat
      const secondFlatResult = await request(app)
        .post(`/api/buildings/${testBuildingId}/flats`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          flat_number: 'Test Flat 104',
          building_id: testBuildingId,
          floor: 3,
          bedrooms: 2,
          rent: 900
        })
        .expect(201);

      const secondFlatId = secondFlatResult.body.data.flat.id;

      // Move resident to second flat
      await pool.query(
        `UPDATE users SET flat_number = $1 WHERE email = $2`,
        ['Test Flat 104', 'resident@test.com']
      );

      const response = await request(app)
        .get(`/api/flats/${secondFlatId}/residents`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.residents.some((res: any) =e res.flat_number === 'Test Flat 104')).toBe(true);
    });
  });

  describe('UI and Data Interactions', () =e {
    it('should support CSV import for flats', async () =e {
      const csvData = `flat_number,floor,bedrooms,rent
Test Flat 201,2,2,1100
Test Flat 202,2,3,1200
Test Flat 203,2,1,900`;

      const response = await request(app)
        .post(`/api/buildings/${testBuildingId}/flats/bulk-import`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .field('csv_data', csvData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.created_count).toBe(3);
    });

    it('should validate CSV data format for import', async () =e {
      const invalidCsvData = `flat_number,floor
Invalid Flat,10`;

      const response = await request(app)
        .post(`/api/buildings/${testBuildingId}/flats/bulk-import`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .field('csv_data', invalidCsvData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Analytics Integration', () =e {
    it('should include flat occupancy in building analytics', async () =e {
      const response = await request(app)
        .get(`/api/buildings/${testBuildingId}/analytics`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total_flats');
      expect(response.body.data).toHaveProperty('occupied_flats');
    });
  });
});

