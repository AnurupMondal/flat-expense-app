import express from "express";
import { pool } from "../config/database";
import {
  authenticate,
  authorize,
  AuthenticatedRequest,
} from "../middleware/auth";

const router = express.Router();

// Get all buildings
router.get("/", authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const query = `
      SELECT b.*, u.name as admin_name
      FROM buildings b
      LEFT JOIN users u ON b.admin_id = u.id
      ORDER BY b.created_at DESC
    `;

    const result = await pool.query(query);

    return res.json({
      success: true,
      data: { buildings: result.rows },
    });
  } catch (error) {
    console.error("Get buildings error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error while fetching buildings",
    });
  }
});

// Create building (Super Admin only)
router.post(
  "/",
  authenticate,
  authorize("super-admin"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { name, address, admin_id, total_units } = req.body;

      if (!name || !address || !total_units) {
        return res.status(400).json({
          success: false,
          error: "Name, address, and total_units are required",
        });
      }

      const query = `
      INSERT INTO buildings (name, address, admin_id, total_units)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

      const result = await pool.query(query, [
        name,
        address,
        admin_id || null,
        total_units,
      ]);

      return res.status(201).json({
        success: true,
        data: { building: result.rows[0] },
        message: "Building created successfully",
      });
    } catch (error) {
      console.error("Create building error:", error);
      return res.status(500).json({
        success: false,
        error: "Server error while creating building",
      });
    }
  }
);

export default router;
