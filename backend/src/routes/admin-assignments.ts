import express from "express";
import { pool } from "../config/database";
import {
  authenticate,
  authorize,
  AuthenticatedRequest,
} from "../middleware/auth";

const router = express.Router();

// Get all admin-building assignments (super-admin only)
router.get("/", authenticate, authorize("super-admin"), async (req: AuthenticatedRequest, res) => {
  try {
    const query = `
      SELECT 
        aba.id,
        aba.admin_id,
        aba.building_id,
        aba.assigned_at,
        aba.is_active,
        u.name as admin_name,
        u.email as admin_email,
        b.name as building_name,
        b.address as building_address,
        assigned_by_user.name as assigned_by_name
      FROM admin_building_assignments aba
      JOIN users u ON aba.admin_id = u.id
      JOIN buildings b ON aba.building_id = b.id
      JOIN users assigned_by_user ON aba.assigned_by = assigned_by_user.id
      WHERE aba.is_active = true
      ORDER BY aba.assigned_at DESC
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get admin assignments error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching admin assignments",
    });
  }
});

// Get all available admins for assignment
router.get("/available-admins", authenticate, authorize("super-admin"), async (req: AuthenticatedRequest, res) => {
  try {
    const query = `
      SELECT id, name, email, phone
      FROM users
      WHERE role = 'admin' AND is_verified = true
      ORDER BY name
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get available admins error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching available admins",
    });
  }
});

// Get admin's assigned buildings
router.get("/admin/:adminId", authenticate, authorize("super-admin"), async (req: AuthenticatedRequest, res) => {
  try {
    const { adminId } = req.params;

    const query = `
      SELECT 
        aba.id,
        aba.building_id,
        aba.assigned_at,
        b.name as building_name,
        b.address as building_address,
        b.total_flats
      FROM admin_building_assignments aba
      JOIN buildings b ON aba.building_id = b.id
      WHERE aba.admin_id = $1 AND aba.is_active = true
      ORDER BY b.name
    `;

    const result = await pool.query(query, [adminId]);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get admin buildings error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching admin buildings",
    });
  }
});

// Assign admin to building
router.post("/", authenticate, authorize("super-admin"), async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const user = req.user!;
    const { adminId, buildingId } = req.body;

    if (!adminId || !buildingId) {
      res.status(400).json({
        success: false,
        error: "Admin ID and Building ID are required",
      });
      return;
    }

    // Check if admin exists and has admin role
    const adminCheck = await pool.query(
      "SELECT id, role FROM users WHERE id = $1 AND role = 'admin'",
      [adminId]
    );

    if (adminCheck.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: "Admin not found",
      });
      return;
    }

    // Check if building exists
    const buildingCheck = await pool.query(
      "SELECT id FROM buildings WHERE id = $1",
      [buildingId]
    );

    if (buildingCheck.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: "Building not found",
      });
      return;
    }

    // Check if assignment already exists
    const existingAssignment = await pool.query(
      "SELECT id FROM admin_building_assignments WHERE admin_id = $1 AND building_id = $2 AND is_active = true",
      [adminId, buildingId]
    );

    if (existingAssignment.rows.length > 0) {
      res.status(409).json({
        success: false,
        error: "Admin is already assigned to this building",
      });
      return;
    }

    // Create new assignment
    const insertQuery = `
      INSERT INTO admin_building_assignments (admin_id, building_id, assigned_by)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [adminId, buildingId, user.userId]);

    res.status(201).json({
      success: true,
      message: "Admin successfully assigned to building",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Assign admin error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while assigning admin",
    });
  }
});

// Remove admin assignment from building
router.delete("/:assignmentId", authenticate, authorize("super-admin"), async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const { assignmentId } = req.params;

    // Deactivate the assignment instead of deleting for audit trail
    const updateQuery = `
      UPDATE admin_building_assignments 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_active = true
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [assignmentId]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: "Assignment not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Admin assignment removed successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Remove assignment error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while removing assignment",
    });
  }
});

// Bulk assign admin to multiple buildings
router.post("/bulk", authenticate, authorize("super-admin"), async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const user = req.user!;
    const { adminId, buildingIds } = req.body;

    if (!adminId || !Array.isArray(buildingIds) || buildingIds.length === 0) {
      res.status(400).json({
        success: false,
        error: "Admin ID and array of Building IDs are required",
      });
      return;
    }

    // Check if admin exists
    const adminCheck = await pool.query(
      "SELECT id, role FROM users WHERE id = $1 AND role = 'admin'",
      [adminId]
    );

    if (adminCheck.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: "Admin not found",
      });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const assignments = [];
      for (const buildingId of buildingIds) {
        // Check if building exists
        const buildingCheck = await client.query(
          "SELECT id FROM buildings WHERE id = $1",
          [buildingId]
        );

        if (buildingCheck.rows.length === 0) {
          throw new Error(`Building with ID ${buildingId} not found`);
        }

        // Check if assignment already exists
        const existingAssignment = await client.query(
          "SELECT id FROM admin_building_assignments WHERE admin_id = $1 AND building_id = $2 AND is_active = true",
          [adminId, buildingId]
        );

        if (existingAssignment.rows.length === 0) {
          // Create new assignment
          const insertQuery = `
            INSERT INTO admin_building_assignments (admin_id, building_id, assigned_by)
            VALUES ($1, $2, $3)
            RETURNING *
          `;

          const result = await client.query(insertQuery, [adminId, buildingId, user.userId]);
          assignments.push(result.rows[0]);
        }
      }

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: `Admin successfully assigned to ${assignments.length} buildings`,
        data: assignments,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Bulk assign admin error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Server error while bulk assigning admin",
    });
  }
});

export default router;
