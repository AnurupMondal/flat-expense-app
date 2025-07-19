import express from "express";
import { pool } from "../config/database";
import {
  authenticate,
  authorize,
  AuthenticatedRequest,
} from "../middleware/auth";

const router = express.Router();

// Get analytics data
router.get(
  "/",
  authenticate,
  authorize("admin", "super-admin"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      let buildingFilter = "";
      const values: any[] = [];

      // Admins can only see analytics for their building
      if (user.role === "admin" && user.buildingId) {
        buildingFilter = "WHERE building_id = $1";
        values.push(user.buildingId);
      }

      // Revenue analytics
      const revenueQuery = `
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month,
        SUM(total_amount) as amount,
        SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END) as collected
      FROM bills 
      ${buildingFilter}
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 12
    `;

      const revenueResult = await pool.query(revenueQuery, values);

      // Complaints analytics
      const complaintsQuery = `
      SELECT 
        category,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
      FROM complaints 
      ${buildingFilter}
      GROUP BY category
    `;

      const complaintsResult = await pool.query(complaintsQuery, values);

      // Status analytics
      const statusQuery = `
      SELECT 
        status,
        COUNT(*) as count
      FROM complaints 
      ${buildingFilter}
      GROUP BY status
    `;

      const statusResult = await pool.query(statusQuery, values);

      // User analytics
      const userQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
      FROM users 
      ${buildingFilter ? "WHERE building_id = $1" : ""}
    `;

      const userResult = await pool.query(userQuery, values);

      // Occupancy analytics (for building-specific or all buildings)
      let occupancyQuery = "";
      let occupancyValues: any[] = [];

      if (user.role === "admin" && user.buildingId) {
        occupancyQuery = `
        SELECT 
          b.total_units,
          COUNT(u.id) as occupied
        FROM buildings b
        LEFT JOIN users u ON b.id = u.building_id AND u.status = 'approved'
        WHERE b.id = $1
        GROUP BY b.total_units
      `;
        occupancyValues = [user.buildingId];
      } else {
        occupancyQuery = `
        SELECT 
          SUM(b.total_units) as total_units,
          COUNT(u.id) as occupied
        FROM buildings b
        LEFT JOIN users u ON b.id = u.building_id AND u.status = 'approved'
      `;
      }

      const occupancyResult = await pool.query(occupancyQuery, occupancyValues);

      const analytics = {
        revenue: {
          monthly: revenueResult.rows,
          yearly: {}, // Could be expanded
        },
        complaints: {
          byCategory: complaintsResult.rows,
          byStatus: statusResult.rows,
        },
        occupancy: {
          total: parseInt(occupancyResult.rows[0]?.total_units || 0),
          occupied: parseInt(occupancyResult.rows[0]?.occupied || 0),
          vacant:
            parseInt(occupancyResult.rows[0]?.total_units || 0) -
            parseInt(occupancyResult.rows[0]?.occupied || 0),
          rate: occupancyResult.rows[0]?.total_units
            ? (parseInt(occupancyResult.rows[0]?.occupied || 0) /
                parseInt(occupancyResult.rows[0]?.total_units || 1)) *
              100
            : 0,
        },
        users: userResult.rows[0] || {
          total: 0,
          approved: 0,
          pending: 0,
          rejected: 0,
        },
      };

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      console.error("Get analytics error:", error);
      res.status(500).json({
        success: false,
        error: "Server error while fetching analytics",
      });
    }
  }
);

export default router;
