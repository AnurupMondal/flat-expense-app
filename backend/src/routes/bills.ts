import express from "express";
import { pool } from "../config/database";
import {
  authenticate,
  authorize,
  AuthenticatedRequest,
} from "../middleware/auth";

const router = express.Router();

// Get bills for user with pagination and filtering
router.get(
  "/",
  authenticate,
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const user = req.user!;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      const status = req.query.status as string;
      const month = req.query.month as string;
      const year = req.query.year as string;
      const search = req.query.search as string;

      let query = `
        SELECT b.*, u.name as user_name, u.flat_number, bd.name as building_name
        FROM bills b
        JOIN users u ON b.user_id = u.id
        LEFT JOIN buildings bd ON b.building_id = bd.id
        WHERE 1=1
      `;
      let values: any[] = [];
      let paramCount = 0;

      // Role-based filtering
      if (user.role === "resident") {
        paramCount++;
        query += ` AND b.user_id = $${paramCount}`;
        values.push(user.userId);
      } else if (user.role === "admin" && user.buildingId) {
        paramCount++;
        query += ` AND b.building_id = $${paramCount}`;
        values.push(user.buildingId);
      }

      // Additional filters
      if (status) {
        paramCount++;
        query += ` AND b.status = $${paramCount}`;
        values.push(status);
      }

      if (month) {
        paramCount++;
        query += ` AND b.month = $${paramCount}`;
        values.push(month);
      }

      if (year) {
        paramCount++;
        query += ` AND b.year = $${paramCount}`;
        values.push(parseInt(year));
      }

      if (search) {
        paramCount++;
        query += ` AND (u.name ILIKE $${paramCount} OR u.flat_number ILIKE $${paramCount})`;
        values.push(`%${search}%`);
      }

      // Count total for pagination
      const countQuery = query.replace(
        "SELECT b.*, u.name as user_name, u.flat_number, bd.name as building_name",
        "SELECT COUNT(*)"
      );
      const countResult = await pool.query(countQuery, values);
      const total = parseInt(countResult.rows[0].count);

      // Add pagination and sorting
      query += ` ORDER BY b.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      values.push(limit, offset);

      const result = await pool.query(query, values);

      res.json({
        success: true,
        data: {
          bills: result.rows,
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
      console.error("Get bills error:", error);
      res.status(500).json({
        success: false,
        error: "Server error while fetching bills",
      });
    }
  }
);

// Create a new bill (admin/super-admin only)
router.post(
  "/",
  authenticate,
  authorize("admin", "super-admin"),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const creator = req.user!;
      const {
        userId,
        buildingId,
        month,
        year,
        rentAmount = 0,
        maintenanceAmount = 0,
        dueDate,
        paymentMethod,
        transactionId,
      } = req.body;

      // Validation
      if (!userId || !month || !year || !dueDate) {
        res.status(400).json({
          success: false,
          error: "User ID, month, year, and due date are required",
        });
        return;
      }

      // If admin, ensure they can only create bills for their building
      if (creator.role === "admin" && creator.buildingId !== buildingId) {
        res.status(403).json({
          success: false,
          error: "You can only create bills for your building",
        });
        return;
      }

      // Verify user exists and belongs to the building
      const userQuery = "SELECT id, building_id FROM users WHERE id = $1";
      const userResult = await pool.query(userQuery, [userId]);

      if (userResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: "User not found",
        });
        return;
      }

      const userBuildingId = userResult.rows[0].building_id;
      const targetBuildingId = buildingId || userBuildingId;

      if (userBuildingId !== targetBuildingId) {
        res.status(400).json({
          success: false,
          error: "User does not belong to the specified building",
        });
        return;
      }

      // Calculate total amount
      const totalAmount =
        parseFloat(rentAmount) + parseFloat(maintenanceAmount);

      const query = `
      INSERT INTO bills (
        user_id, building_id, month, year, rent_amount, maintenance_amount, 
        total_amount, due_date, status, payment_method, transaction_id, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9, $10, NOW(), NOW())
      RETURNING *
    `;

      const values = [
        userId,
        targetBuildingId,
        month,
        year,
        rentAmount,
        maintenanceAmount,
        totalAmount,
        dueDate,
        paymentMethod || null,
        transactionId || null,
      ];

      const result = await pool.query(query, values);

      // Get complete bill data with user and building info
      const fullBillQuery = `
      SELECT b.*, u.name as user_name, u.flat_number, bd.name as building_name
      FROM bills b
      JOIN users u ON b.user_id = u.id
      JOIN buildings bd ON b.building_id = bd.id
      WHERE b.id = $1
    `;

      const fullResult = await pool.query(fullBillQuery, [result.rows[0].id]);

      res.status(201).json({
        success: true,
        data: { bill: fullResult.rows[0] },
      });
    } catch (error: any) {
      console.error("Create bill error:", error);
      if (error.constraint === "bills_user_id_month_year_key") {
        res.status(400).json({
          success: false,
          error: "Bill for this user, month, and year already exists",
        });
      } else {
        res.status(500).json({
          success: false,
          error: "Server error while creating bill",
        });
      }
    }
  }
);

// Update bill status
router.patch(
  "/:id/status",
  authenticate,
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, paymentMethod, transactionId } = req.body;
      const user = req.user!;

      if (!status || !["pending", "paid", "overdue"].includes(status)) {
        res.status(400).json({
          success: false,
          error: "Valid status is required (pending, paid, overdue)",
        });
        return;
      }

      // Build query based on user role
      let whereClause = "WHERE id = $1";
      let values: any[] = [id];

      // Residents can only update their own bills
      if (user.role === "resident") {
        whereClause += " AND user_id = $2";
        values.push(user.userId);
      }
      // Admins can only update bills in their building
      else if (user.role === "admin" && user.buildingId) {
        whereClause += " AND building_id = $2";
        values.push(user.buildingId);
      }

      const updateFields = ["status = $" + (values.length + 1)];
      values.push(status);

      // Add payment details if status is paid
      if (status === "paid") {
        updateFields.push("paid_at = NOW()");
        if (paymentMethod) {
          updateFields.push("payment_method = $" + (values.length + 1));
          values.push(paymentMethod);
        }
        if (transactionId) {
          updateFields.push("transaction_id = $" + (values.length + 1));
          values.push(transactionId);
        }
      }

      updateFields.push("updated_at = NOW()");

      const query = `
      UPDATE bills 
      SET ${updateFields.join(", ")}
      ${whereClause}
      RETURNING *
    `;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: "Bill not found or you don't have permission to update it",
        });
        return;
      }

      res.json({
        success: true,
        data: { bill: result.rows[0] },
      });
    } catch (error) {
      console.error("Update bill status error:", error);
      res.status(500).json({
        success: false,
        error: "Server error while updating bill status",
      });
    }
  }
);

// Get bill by ID
router.get(
  "/:id",
  authenticate,
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const { id } = req.params;
      const user = req.user!;

      let whereClause = "WHERE b.id = $1";
      let values: any[] = [id];

      // Apply role-based filtering
      if (user.role === "resident") {
        whereClause += " AND b.user_id = $2";
        values.push(user.userId);
      } else if (user.role === "admin" && user.buildingId) {
        whereClause += " AND b.building_id = $2";
        values.push(user.buildingId);
      }

      const query = `
      SELECT b.*, u.name as user_name, u.flat_number, bd.name as building_name
      FROM bills b
      JOIN users u ON b.user_id = u.id
      JOIN buildings bd ON b.building_id = bd.id
      ${whereClause}
    `;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: "Bill not found or you don't have permission to view it",
        });
        return;
      }

      res.json({
        success: true,
        data: { bill: result.rows[0] },
      });
    } catch (error) {
      console.error("Get bill by ID error:", error);
      res.status(500).json({
        success: false,
        error: "Server error while fetching bill",
      });
    }
  }
);

// Delete bill (admin/super-admin only)
router.delete(
  "/:id",
  authenticate,
  authorize("admin", "super-admin"),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const { id } = req.params;
      const user = req.user!;

      let whereClause = "WHERE id = $1";
      let values: any[] = [id];

      // Admins can only delete bills in their building
      if (user.role === "admin" && user.buildingId) {
        whereClause += " AND building_id = $2";
        values.push(user.buildingId);
      }

      const query = `DELETE FROM bills ${whereClause} RETURNING *`;
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: "Bill not found or you don't have permission to delete it",
        });
        return;
      }

      res.json({
        success: true,
        data: { bill: result.rows[0] },
      });
    } catch (error) {
      console.error("Delete bill error:", error);
      res.status(500).json({
        success: false,
        error: "Server error while deleting bill",
      });
    }
  }
);

export default router;
