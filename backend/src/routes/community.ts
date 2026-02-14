import express from "express";
import { pool } from "../config/database";
import {
    authenticate,
    AuthenticatedRequest,
} from "../middleware/auth";

const router = express.Router();

// Get all posts for the user's building
router.get(
    "/",
    authenticate,
    async (req: AuthenticatedRequest, res): Promise<void> => {
        try {
            const user = req.user!;
            if (!user.buildingId && user.role !== 'super-admin') {
                res.status(400).json({
                    success: false,
                    error: "User is not assigned to a building",
                });
                return;
            }

            let query = `
                SELECT cp.*, u.name as author_name, u.avatar as author_avatar
                FROM community_posts cp
                JOIN users u ON cp.user_id = u.id
            `;
            const params = [];

            if (user.buildingId) {
                query += ` WHERE cp.building_id = $1 `;
                params.push(user.buildingId);
            }

            query += ` ORDER BY cp.created_at DESC `;

            const result = await pool.query(query, params);

            res.json({
                success: true,
                data: { posts: result.rows },
            });
        } catch (error) {
            console.error("Get community posts error:", error);
            res.status(500).json({
                success: false,
                error: "Server error while fetching community posts",
            });
        }
    }
);

// Create a new post
router.post(
    "/",
    authenticate,
    async (req: AuthenticatedRequest, res): Promise<void> => {
        try {
            const user = req.user!;
            const { title, content, category, attachments } = req.body;

            if (!user.buildingId) {
                res.status(400).json({
                    success: false,
                    error: "User is not assigned to a building",
                });
                return;
            }

            if (!title || !content || !category) {
                res.status(400).json({
                    success: false,
                    error: "Title, content, and category are required",
                });
                return;
            }

            if (title.length < 3) {
                res.status(400).json({
                    success: false,
                    error: "Title must be at least 3 characters long",
                });
                return;
            }

            if (content.length < 10) {
                res.status(400).json({
                    success: false,
                    error: "Content must be at least 10 characters long",
                });
                return;
            }

            const query = `
      INSERT INTO community_posts (user_id, building_id, title, content, category, attachments)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

            const values = [
                user.userId,
                user.buildingId,
                title,
                content,
                category,
                attachments || [],
            ];
            const result = await pool.query(query, values);

            // Add author info to the response
            const post = {
                ...result.rows[0],
                author_name: user.name,
                author_avatar: user.avatar,
            };

            res.status(201).json({
                success: true,
                data: { post },
            });
        } catch (error) {
            console.error("Create community post error:", error);
            res.status(500).json({
                success: false,
                error: "Server error while creating post",
            });
        }
    }
);

// Delete a post
router.delete(
    "/:id",
    authenticate,
    async (req: AuthenticatedRequest, res): Promise<void> => {
        try {
            const { id } = req.params;
            const user = req.user!;

            // Check if user is owner or admin
            const checkQuery = "SELECT user_id, building_id FROM community_posts WHERE id = $1";
            const checkResult = await pool.query(checkQuery, [id]);

            if (checkResult.rows.length === 0) {
                res.status(404).json({
                    success: false,
                    error: "Post not found",
                });
                return;
            }

            const post = checkResult.rows[0];
            const isOwner = post.user_id === user.userId;
            const isAdmin = (user.role === "admin" || user.role === "super-admin") && post.building_id === user.buildingId;

            if (!isOwner && !isAdmin) {
                res.status(403).json({
                    success: false,
                    error: "You don't have permission to delete this post",
                });
                return;
            }

            await pool.query("DELETE FROM community_posts WHERE id = $1", [id]);

            res.json({
                success: true,
                message: "Post deleted successfully",
            });
        } catch (error) {
            console.error("Delete community post error:", error);
            res.status(500).json({
                success: false,
                error: "Server error while deleting post",
            });
        }
    }
);

export default router;
