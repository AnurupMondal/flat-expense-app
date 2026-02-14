import express from "express";
import { pool } from "../config/database";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import {
  authenticate,
  authorize,
  AuthenticatedRequest,
} from "../middleware/auth";

const router = express.Router();

// Get all users (Super Admin only)
router.get(
  "/",
  authenticate,
  authorize("super-admin", "admin"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      const search = (req.query.search as string) || "";
      const status = (req.query.status as string) || "";
      const role = (req.query.role as string) || "";
      const building_id = (req.query.building_id as string) || "";

      let query = `
      SELECT u.id, u.email, u.name, u.role, u.phone, u.building_id, u.flat_number, 
             u.status, u.created_at, u.updated_at, b.name as building_name
      FROM users u
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE 1=1
    `;
      const values: unknown[] = [];
      let paramCount = 0;

      if (search) {
        paramCount++;
        query += ` AND (u.name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
        values.push(`%${search}%`);
      }

      if (status) {
        paramCount++;
        query += ` AND u.status = $${paramCount}`;
        values.push(status);
      }

      if (role) {
        paramCount++;
        query += ` AND u.role = $${paramCount}`;
        values.push(role);
      }

      if (building_id) {
        paramCount++;
        query += ` AND u.building_id = $${paramCount}`;
        values.push(building_id);
      }

      // Filter by building for admin
      if (req.user!.role === "admin") {
        paramCount++;
        query += ` AND u.building_id = $${paramCount}`;
        values.push(req.user!.buildingId);
      }

      // Count total
      const countQuery = query.replace(
        "SELECT u.id, u.email, u.name, u.role, u.phone, u.building_id, u.flat_number, u.status, u.created_at, u.updated_at, b.name as building_name",
        "SELECT COUNT(*)"
      );
      const countResult = await pool.query(countQuery, values);
      const total = parseInt(countResult.rows[0].count);

      // Add pagination
      query += ` ORDER BY u.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2
        }`;
      values.push(limit, offset);

      const result = await pool.query(query, values);

      return res.json({
        success: true,
        data: {
          users: result.rows,
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
      console.error("Get users error:", error);
      return res.status(500).json({
        success: false,
        error: "Server error while fetching users",
      });
    }
  }
);

// Create new user (Super Admin only)
router.post(
  "/",
  authenticate,
  authorize("super-admin"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { email, password, name, phone, role, building_id, flat_number } =
        req.body;

      if (!email || !password || !name || !role) {
        return res.status(400).json({
          success: false,
          error: "Email, password, name, and role are required",
        });
      }

      // Check if user exists
      const existingUser = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: "User with this email already exists",
        });
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const id = uuidv4();
      const query = `
        INSERT INTO users (id, email, password_hash, name, phone, role, building_id, flat_number, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, email, name, role, phone, building_id, flat_number, status, created_at
      `;

      const values = [
        id,
        email.toLowerCase(),
        passwordHash,
        name,
        phone || null,
        role,
        building_id || null,
        flat_number || null,
        role === "super-admin" || role === "admin" ? "approved" : "approved", // Auto-approve all created by super-admin
      ];

      const result = await pool.query(query, values);
      const newUser = result.rows[0];

      return res.status(201).json({
        success: true,
        data: { user: newUser },
      });
    } catch (error) {
      console.error("Create user error:", error);
      return res.status(500).json({
        success: false,
        error: "Server error while creating user",
      });
    }
  }
);

// Get user by ID
router.get("/:id", authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    // Users can only view their own profile unless they're admin/super-admin
    if (user.role === "resident" && user.userId !== id) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    const query = `
      SELECT u.id, u.email, u.name, u.role, u.phone, u.building_id, u.flat_number, 
             u.status, u.rent_enabled, u.maintenance_enabled, u.avatar, u.created_at, u.updated_at,
             b.name as building_name, b.address as building_address
      FROM users u
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE u.id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    return res.json({
      success: true,
      data: { user: result.rows[0] },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error while fetching user",
    });
  }
});

// Update user
router.put("/:id", authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    // Users can only update their own profile unless they're admin/super-admin
    const { flat_number, building_id } = req.body;
    if (user.role === "resident" && user.userId !== id) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    // Only admins can change role and status
    const allowedFields = ["name", "phone", "flat_number"];
    if (user.role !== "resident") {
      allowedFields.push(
        "building_id",
        "role",
        "status",
        "rent_enabled",
        "maintenance_enabled"
      );
    }

    // Restrict admin from moving user to another building (strict string compare for UUIDs)
    if (
      building_id != null &&
      user.role === "admin" &&
      String(building_id) !== String(user.buildingId ?? "")
    ) {
      return res.status(403).json({
        success: false,
        error: "Admins cannot transfer users to other buildings",
      });
    }

    // Validate phone number format if provided
    if (req.body.phone !== undefined && req.body.phone !== null) {
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(String(req.body.phone).trim())) {
        return res.status(400).json({
          success: false,
          error: "Invalid phone number format",
        });
      }
    }

    // Validate flat number if provided (reject empty or whitespace-only)
    if (flat_number !== undefined && flat_number !== null) {
      if (String(flat_number).trim() === "") {
        return res.status(400).json({
          success: false,
          error: "Flat number cannot be empty",
        });
      }
    }

    // Check for duplicate flat number
    if (flat_number) {
      let targetBuildingId = building_id;
      if (!targetBuildingId) {
        const userRes = await pool.query('SELECT building_id FROM users WHERE id = $1', [id]);
        if (userRes.rows.length > 0) targetBuildingId = userRes.rows[0].building_id;
      }

      if (targetBuildingId) {
        const conflict = await pool.query(
          'SELECT id FROM users WHERE building_id = $1 AND flat_number = $2 AND id != $3',
          [targetBuildingId, flat_number, id]
        );
        if (conflict.rows.length > 0) {
          return res.status(400).json({
            success: false,
            error: `Flat ${flat_number} is already occupied in this building`
          });
        }
      }
    }

    const updates: string[] = [];
    const values: unknown[] = [];
    let paramCount = 0;

    Object.entries(req.body).forEach(([key, value]) => {
      if (allowedFields.includes(key) && value !== undefined) {
        paramCount++;
        updates.push(`${key} = $${paramCount}`);
        values.push(value);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid fields to update",
      });
    }

    paramCount++;
    values.push(id);

    const query = `
      UPDATE users 
      SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING id, email, name, role, phone, building_id, flat_number, status, rent_enabled, maintenance_enabled, updated_at
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    return res.json({
      success: true,
      data: { user: result.rows[0] },
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error while updating user",
    });
  }
});

// Approve/reject user (Admin/Super Admin only)
router.patch(
  "/:id/status",
  authenticate,
  authorize("admin", "super-admin"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const user = req.user!;

      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status. Must be "approved" or "rejected"',
        });
      }

      const query = `
      UPDATE users 
      SET status = $1, approved_by = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 
      RETURNING id, email, name, role, status, approved_by, updated_at
    `;

      const result = await pool.query(query, [status, user.userId, id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      return res.json({
        success: true,
        data: { user: result.rows[0] },
        message: `User ${status} successfully`,
      });
    } catch (error) {
      console.error("Update user status error:", error);
      return res.status(500).json({
        success: false,
        error: "Server error while updating user status",
      });
    }
  }
);

// Delete user (Super Admin only)
router.delete(
  "/:id",
  authenticate,
  authorize("super-admin"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        "DELETE FROM users WHERE id = $1 RETURNING id",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      return res.json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("Delete user error:", error);
      return res.status(500).json({
        success: false,
        error: "Server error while deleting user",
      });
    }
  }
);

// Get pending approvals
router.get(
  "/pending/approvals",
  authenticate,
  authorize("admin", "super-admin"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;

      let query = `
      SELECT u.id, u.email, u.name, u.phone, u.building_id, u.flat_number, u.created_at,
             b.name as building_name
      FROM users u
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE u.status = 'pending'
    `;

      const values: unknown[] = [];

      // Admins can only see pending users from their building
      if (user.role === "admin" && user.buildingId) {
        query += " AND u.building_id = $1";
        values.push(user.buildingId);
      }

      query += " ORDER BY u.created_at ASC";

      const result = await pool.query(query, values);

      return res.json({
        success: true,
        data: { pendingUsers: result.rows },
      });
    } catch (error) {
      console.error("Get pending approvals error:", error);
      return res.status(500).json({
        success: false,
        error: "Server error while fetching pending approvals",
      });
    }
  }
);

export default router;
