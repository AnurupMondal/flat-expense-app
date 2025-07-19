import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { pool } from "../config/database";
import { JWTPayload } from "../types";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    userId: number;
    email: string;
    role: string;
    buildingId?: number;
    [key: string]: any;
  };
}

// Authentication middleware
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        error: "Access denied. No token provided.",
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not configured");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;

    // Check if user still exists and is active
    const userQuery =
      "SELECT id, email, role, building_id, status FROM users WHERE id = $1 AND status = $2";
    const { rows } = await pool.query(userQuery, [decoded.userId, "approved"]);

    if (rows.length === 0) {
      res.status(401).json({
        success: false,
        error: "User not found or not approved.",
      });
      return;
    }

    req.user = {
      id: decoded.userId,
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      buildingId: rows[0].building_id,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "Invalid token.",
    });
  }
};

// Authorization middleware factory
export const authorize = (...roles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Authentication required.",
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: "Insufficient permissions.",
      });
      return;
    }

    next();
  };
};

// Building access middleware
export const requireBuildingAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Authentication required.",
      });
      return;
    }

    const buildingId = req.params.buildingId || req.body.building_id;

    // Super admins have access to all buildings
    if (req.user.role === "super-admin") {
      next();
      return;
    }

    // Admins and residents can only access their assigned building
    if (req.user.buildingId !== buildingId) {
      res.status(403).json({
        success: false,
        error: "Access denied to this building.",
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server error during authorization.",
    });
  }
};
