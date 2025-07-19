import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/database";
import { User, JWTPayload } from "../types";

const router = express.Router();

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, phone, building_id, flat_number } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: "Email, password, and name are required",
      });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: "User already exists with this email",
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const query = `
      INSERT INTO users (email, password_hash, name, phone, building_id, flat_number, role, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, email, name, role, phone, building_id, flat_number, status, created_at
    `;

    const values = [
      email.toLowerCase(),
      passwordHash,
      name,
      phone || null,
      building_id || null,
      flat_number || null,
      "resident", // Default role
      "pending", // Default status
    ];

    const result = await pool.query(query, values);
    const newUser = result.rows[0];

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          phone: newUser.phone,
          buildingId: newUser.building_id,
          flatNumber: newUser.flat_number,
          status: newUser.status,
          createdAt: newUser.created_at,
        },
      },
      message: "Registration successful. Awaiting admin approval.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error during registration",
    });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    console.log("Login request received");
    console.log("Request body:", req.body);
    console.log("Content-Type:", req.headers["content-type"]);

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log("Missing email or password");
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    console.log("Attempting login for email:", email);

    // Find user
    const query = `
      SELECT id, email, password_hash, name, role, phone, building_id, flat_number, status
      FROM users 
      WHERE email = $1
    `;
    const result = await pool.query(query, [email.toLowerCase()]);

    if (result.rows.length === 0) {
      console.log("User not found:", email);
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    const user = result.rows[0];
    console.log("User found:", {
      id: user.id,
      email: user.email,
      status: user.status,
    });

    // Check if user is approved
    if (user.status !== "approved") {
      console.log("User not approved:", user.status);
      return res.status(401).json({
        success: false,
        error: "Account is pending approval or has been rejected",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Generate JWT token
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      buildingId: user.building_id,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    // Save session
    const sessionQuery = `
      INSERT INTO user_sessions (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
    `;
    const tokenHash = await bcrypt.hash(token, 8);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await pool.query(sessionQuery, [user.id, tokenHash, expiresAt]);

    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          buildingId: user.building_id,
          flatNumber: user.flat_number,
          status: user.status,
        },
      },
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error during login",
    });
  }
});

// Logout user
router.post("/logout", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);

      // Remove session
      const tokenHash = await bcrypt.hash(token, 8);
      await pool.query("DELETE FROM user_sessions WHERE token_hash = $1", [
        tokenHash,
      ]);
    }

    return res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error during logout",
    });
  }
});

// Refresh token
router.post("/refresh", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "No token provided",
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    // Check if user still exists and is active
    const userQuery =
      "SELECT id, email, name, role, building_id, status FROM users WHERE id = $1 AND status = $2";
    const { rows } = await pool.query(userQuery, [decoded.userId, "approved"]);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: "User not found or not approved",
      });
    }

    const user = rows[0];

    // Generate new token
    const newPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      buildingId: user.building_id,
    };

    const newToken = jwt.sign(newPayload, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    return res.json({
      success: true,
      data: {
        token: newToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          building_id: user.building_id,
          status: user.status,
        },
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }
});

export default router;
