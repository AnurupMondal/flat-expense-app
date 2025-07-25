import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import { createServer } from "http";
import dotenv from "dotenv";

import { errorHandler, notFound } from "./middleware/errorMiddleware";
import { rateLimiter } from "./middleware/rateLimiter";
import { requestLogger, errorLogger } from "./middleware/loggingMiddleware";
import { connectDB } from "./config/database";
import { ensureAdminUser } from "./utils/ensureAdminUser";
import logger from "./utils/logger";

// Route imports
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import buildingRoutes from "./routes/buildings";
import complaintRoutes from "./routes/complaints";
import billRoutes from "./routes/bills";
import notificationRoutes from "./routes/notifications";
import analyticsRoutes from "./routes/analytics";
import uploadRoutes from "./routes/upload";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = createServer(app);

logger.system("Server initialization started", {
  nodeEnv: process.env.NODE_ENV,
  port: process.env.API_PORT || 3001,
});

// Database connection
connectDB();

// Ensure admin user exists
ensureAdminUser();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting
app.use(rateLimiter);

// Request logging middleware (before other middleware)
app.use(requestLogger);

// Body parsing middleware
app.use(compression());

// Add custom JSON parsing with error handling
app.use("/api", (req, res, next) => {
  if (req.get("Content-Type") === "application/json") {
    console.log("Incoming JSON request to:", req.path);
    console.log("Raw body length:", req.get("Content-Length"));
  }
  next();
});

app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf, encoding) => {
      if (buf && buf.length) {
        console.log("Raw request body:", buf.toString("utf8"));
      }
    },
  })
);

app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Custom error handler for JSON parsing
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (
    error instanceof SyntaxError &&
    (error as any).status === 400 &&
    "body" in error
  ) {
    logger.logError(error, "JSON_PARSE_ERROR", {
      path: req.path,
      method: req.method,
      contentType: req.get("Content-Type"),
    });
    return res.status(400).json({
      success: false,
      error: "Invalid JSON format in request body",
    });
  }
  return next(error);
});

// Remove morgan as we're using our custom logger now
// Logging middleware
// if (process.env.NODE_ENV !== "test") {
//   app.use(morgan("combined"));
// }

// Health check endpoint
app.get("/api/health", (req, res) => {
  logger.api("Health check requested");
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "flat-expense-backend",
    version: process.env.npm_package_version || "1.0.0",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/buildings", buildingRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/upload", uploadRoutes);

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// Error logging middleware (before error handlers)
app.use(errorLogger);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.API_PORT || 3001;

server.listen(PORT, () => {
  logger.system(`Server running on port ${PORT}`, {
    port: PORT,
    healthCheck: `http://localhost:${PORT}/api/health`,
    corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.system("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    logger.system("Process terminated");
  });
});

process.on("SIGINT", () => {
  logger.system("SIGINT received. Shutting down gracefully...");
  server.close(() => {
    logger.system("Process terminated");
  });
});

export default app;
