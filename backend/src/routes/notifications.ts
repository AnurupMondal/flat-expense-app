import express from "express";
import { pool } from "../config/database";
import {
  authenticate,
  authorize,
  AuthenticatedRequest,
} from "../middleware/auth";

const router = express.Router();

// Get all notifications for the current user
router.get(
  "/",
  authenticate,
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const user = req.user!;

      const query = `
      SELECT n.*, u.name as sender_name
      FROM notifications n
      LEFT JOIN users u ON n.building_id = u.building_id
      WHERE n.user_id = $1
      ORDER BY n.created_at DESC
    `;

      const result = await pool.query(query, [user.userId]);

      res.json({
        success: true,
        data: { notifications: result.rows },
      });
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({
        success: false,
        error: "Server error while fetching notifications",
      });
    }
  }
);

// Get notifications for a specific user (admin/super-admin only)
router.get(
  "/user/:userId",
  authenticate,
  authorize("admin", "super-admin"),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const { userId } = req.params;
      const currentUser = req.user!;

      // If admin, ensure the user belongs to their building
      if (currentUser.role === "admin" && currentUser.buildingId) {
        const userQuery = "SELECT building_id FROM users WHERE id = $1";
        const userResult = await pool.query(userQuery, [userId]);

        if (
          userResult.rows.length === 0 ||
          userResult.rows[0].building_id !== currentUser.buildingId
        ) {
          res.status(403).json({
            success: false,
            error:
              "You don't have permission to view notifications for this user",
          });
          return;
        }
      }

      const query = `
      SELECT n.*, u.name as sender_name
      FROM notifications n
      LEFT JOIN users u ON n.sender_id = u.id
      WHERE n.user_id = $1
      ORDER BY n.created_at DESC
    `;

      const result = await pool.query(query, [userId]);

      res.json({
        success: true,
        data: { notifications: result.rows },
      });
    } catch (error) {
      console.error("Get user notifications error:", error);
      res.status(500).json({
        success: false,
        error: "Server error while fetching user notifications",
      });
    }
  }
);

// Create a new notification (admin/super-admin only)
router.post(
  "/",
  authenticate,
  authorize("admin", "super-admin"),
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const sender = req.user!;
      const {
        userId,
        title,
        message,
        type = "announcement",
        buildingId,
      } = req.body;

      // Validation
      if (!title || !message) {
        res.status(400).json({
          success: false,
          error: "Title and message are required",
        });
        return;
      }

      const senderBuildingId = sender.buildingId;

      // If userId is provided, create notification for specific user
      if (userId) {
        // If admin, ensure the user belongs to their building
        if (sender.role === "admin" && senderBuildingId) {
          const userQuery = "SELECT building_id FROM users WHERE id = $1";
          const userResult = await pool.query(userQuery, [userId]);

          if (
            userResult.rows.length === 0 ||
            userResult.rows[0].building_id !== senderBuildingId
          ) {
            res.status(403).json({
              success: false,
              error:
                "You don't have permission to send notifications to this user",
            });
            return;
          }
        }

        const userBuildingQuery = "SELECT building_id FROM users WHERE id = $1";
        const userBuildingResult = await pool.query(userBuildingQuery, [
          userId,
        ]);
        const targetBuildingId = userBuildingResult.rows[0]?.building_id;

        const query = `
        INSERT INTO notifications (user_id, building_id, title, message, type, read, created_at)
        VALUES ($1, $2, $3, $4, $5, false, NOW())
        RETURNING *
      `;

        const values = [userId, targetBuildingId, title, message, type];
        const result = await pool.query(query, values);

        res.status(201).json({
          success: true,
          data: { notification: result.rows[0] },
        });
      }
      // If buildingId is provided, create notifications for all users in that building
      else if (buildingId) {
        // If admin, ensure they can only send to their building
        if (sender.role === "admin" && senderBuildingId !== buildingId) {
          res.status(403).json({
            success: false,
            error: "You can only send notifications to users in your building",
          });
          return;
        }

        // Get all users in the building
        const usersQuery =
          "SELECT id FROM users WHERE building_id = $1 AND status = 'approved'";
        const usersResult = await pool.query(usersQuery, [buildingId]);

        if (usersResult.rows.length === 0) {
          res.status(404).json({
            success: false,
            error: "No users found in the specified building",
          });
          return;
        }

        // Create notifications for all users
        const notifications = [];
        for (const user of usersResult.rows) {
          const query = `
          INSERT INTO notifications (user_id, building_id, title, message, type, read, created_at)
          VALUES ($1, $2, $3, $4, $5, false, NOW())
          RETURNING *
        `;

          const values = [user.id, buildingId, title, message, type];
          const result = await pool.query(query, values);
          notifications.push(result.rows[0]);
        }

        res.status(201).json({
          success: true,
          data: { notifications, count: notifications.length },
        });
      } else {
        res.status(400).json({
          success: false,
          error: "Either userId or buildingId must be provided",
        });
      }
    } catch (error) {
      console.error("Create notification error:", error);
      res.status(500).json({
        success: false,
        error: "Server error while creating notification",
      });
    }
  }
);

// Mark notification as read
router.patch(
  "/:id/read",
  authenticate,
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const { id } = req.params;
      const user = req.user!;

      const query = `
      UPDATE notifications 
      SET read = true
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;

      const result = await pool.query(query, [id, user.userId]);

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          error:
            "Notification not found or you don't have permission to update it",
        });
        return;
      }

      res.json({
        success: true,
        data: { notification: result.rows[0] },
      });
    } catch (error) {
      console.error("Mark notification as read error:", error);
      res.status(500).json({
        success: false,
        error: "Server error while updating notification",
      });
    }
  }
);

// Mark all notifications as read for current user
router.patch(
  "/mark-all-read",
  authenticate,
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const user = req.user!;

      const query = `
      UPDATE notifications 
      SET read = true
      WHERE user_id = $1 AND read = false
      RETURNING COUNT(*) as updated_count
    `;

      const result = await pool.query(query, [user.userId]);

      res.json({
        success: true,
        data: { updatedCount: result.rowCount || 0 },
      });
    } catch (error) {
      console.error("Mark all notifications as read error:", error);
      res.status(500).json({
        success: false,
        error: "Server error while updating notifications",
      });
    }
  }
);

// Get unread notification count
router.get(
  "/unread-count",
  authenticate,
  async (req: AuthenticatedRequest, res): Promise<void> => {
    try {
      const user = req.user!;

      const query = `
      SELECT COUNT(*) as unread_count
      FROM notifications
      WHERE user_id = $1 AND read = false
    `;

      const result = await pool.query(query, [user.userId]);

      res.json({
        success: true,
        data: { unreadCount: parseInt(result.rows[0].unread_count) },
      });
    } catch (error) {
      console.error("Get unread count error:", error);
      res.status(500).json({
        success: false,
        error: "Server error while fetching unread count",
      });
    }
  }
);

export default router;
