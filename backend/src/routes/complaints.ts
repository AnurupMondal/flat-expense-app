import express from "express";
import { pool } from "../config/database";
import {
  authenticate,
  authorize,
  AuthenticatedRequest,
} from "../middleware/auth";

const router = express.Router();

// Get all complaints (filtered by role) with pagination and filtering
router.get("/", authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;
    const category = req.query.category as string;
    const priority = req.query.priority as string;
    const search = req.query.search as string;
    
    let query = `
      SELECT c.*, u.name as user_name, u.flat_number, b.name as building_name
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN buildings b ON c.building_id = b.id
      WHERE 1=1
    `;
    let values: any[] = [];
    let paramCount = 0;

    // Role-based filtering
    if (user.role === "resident") {
      paramCount++;
      query += ` AND c.user_id = $${paramCount}`;
      values.push(user.userId);
    } else if (user.role === "admin") {
      // For admins, filter by assigned buildings
      paramCount++;
      query += ` AND c.building_id IN (
        SELECT building_id FROM admin_building_assignments 
        WHERE admin_id = $${paramCount} AND is_active = true
      )`;
      values.push(user.userId);
    }

    // Additional filters
    if (status) {
      paramCount++;
      query += ` AND c.status = $${paramCount}`;
      values.push(status);
    }

    if (category) {
      paramCount++;
      query += ` AND c.category ILIKE $${paramCount}`;
      values.push(`%${category}%`);
    }

    if (priority) {
      paramCount++;
      query += ` AND c.priority = $${paramCount}`;
      values.push(priority);
    }

    if (search) {
      paramCount++;
      query += ` AND (c.description ILIKE $${paramCount} OR c.category ILIKE $${paramCount})`;
      values.push(`%${search}%`);
    }

    // Count total for pagination
    const countQuery = query.replace(
      "SELECT c.*, u.name as user_name, u.flat_number, b.name as building_name",
      "SELECT COUNT(*)"
    );
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination and sorting
    query += ` ORDER BY c.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    res.json({
      success: true,
      data: {
        complaints: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get complaints error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching complaints",
    });
  }
});

// Create a new complaint
router.post(
  "/",
  authenticate,
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const user = req.user!;
      const { title, description, type, priority, location } = req.body;

      // Validation
      if (!description || !type || !priority) {
        res.status(400).json({
          success: false,
          error: "Description, type (category), and priority are required",
        });
        return;
      }

      // Get user's building ID
      const userQuery = "SELECT building_id FROM users WHERE id = $1";
      const userResult = await pool.query(userQuery, [user.userId]);
      const buildingId = userResult.rows[0]?.building_id;

      const query = `
      INSERT INTO complaints (user_id, building_id, category, description, priority, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, 'submitted', NOW(), NOW())
      RETURNING *
    `;

      const values = [
        user.userId,
        buildingId,
        type, // This maps to 'category' in the schema
        description,
        priority,
      ];

      const result = await pool.query(query, values);
      const complaint = result.rows[0];

      // Get complete complaint data with user and building info
      const fullComplaintQuery = `
      SELECT c.*, u.name as user_name, u.flat_number, b.name as building_name
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN buildings b ON c.building_id = b.id
      WHERE c.id = $1
    `;

      const fullResult = await pool.query(fullComplaintQuery, [complaint.id]);

      res.status(201).json({
        success: true,
        data: { complaint: fullResult.rows[0] },
      });
    } catch (error) {
      console.error("Create complaint error:", error);
      res.status(500).json({
        success: false,
        error: "Server error while creating complaint",
      });
    }
  }
);

// Update complaint status (admin/super-admin only)
router.patch(
  "/:id/status",
  authenticate,
  authorize("admin", "super-admin"),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, response } = req.body;
      const user = req.user!;

      if (
        !status ||
        !["submitted", "assigned", "in-progress", "resolved"].includes(status)
      ) {
        res.status(400).json({
          success: false,
          error:
            "Valid status is required (submitted, assigned, in-progress, resolved)",
        });
        return;
      }

      // For admins, ensure they can only update complaints in their assigned buildings
      let whereClause = "WHERE id = $1";
      let values: any[] = [id];

      if (user.role === "admin") {
        whereClause += ` AND building_id IN (
          SELECT building_id FROM admin_building_assignments 
          WHERE admin_id = $2 AND is_active = true
        )`;
        values.push(user.userId);
      }

      const query = `
      UPDATE complaints 
      SET status = $${values.length + 1}, 
          updated_at = NOW()
      ${whereClause}
      RETURNING *
    `;

      values.push(status);

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          error:
            "Complaint not found or you don't have permission to update it",
        });
        return;
      }

      // Create a complaint update record
      if (response) {
        await pool.query(
          "INSERT INTO complaint_updates (complaint_id, status, note, updated_by, created_at) VALUES ($1, $2, $3, $4, NOW())",
          [id, status, response, user.userId]
        );
      }

      res.json({
        success: true,
        data: { complaint: result.rows[0] },
      });
    } catch (error) {
      console.error("Update complaint status error:", error);
      res.status(500).json({
        success: false,
        error: "Server error while updating complaint status",
      });
    }
  }
);

// Get complaint by ID
router.get(
  "/:id",
  authenticate,
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const { id } = req.params;
      const user = req.user!;

      let whereClause = "WHERE c.id = $1";
      let values: any[] = [id];

      // Apply role-based filtering
      if (user.role === "resident") {
        whereClause += " AND c.user_id = $2";
        values.push(user.userId);
      } else if (user.role === "admin") {
        whereClause += ` AND c.building_id IN (
          SELECT building_id FROM admin_building_assignments 
          WHERE admin_id = $2 AND is_active = true
        )`;
        values.push(user.userId);
      }

      const query = `
      SELECT c.*, u.name as user_name, u.flat_number, b.name as building_name
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN buildings b ON c.building_id = b.id
      ${whereClause}
    `;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: "Complaint not found or you don't have permission to view it",
        });
        return;
      }

      res.json({
        success: true,
        data: { complaint: result.rows[0] },
      });
    } catch (error) {
      console.error("Get complaint by ID error:", error);
      res.status(500).json({
        success: false,
        error: "Server error while fetching complaint",
      });
    }
  }
);

export default router;
