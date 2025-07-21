import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

// Standardized error response interface
interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
  timestamp: string;
  path: string;
  requestId?: string;
}

// Standard API response interface
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
  details?: any;
  timestamp?: string;
  path?: string;
}

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;
  public code?: string;
  public details?: any;

  constructor(message: string, statusCode: number, code?: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    if (code !== undefined) {
      this.code = code;
    }
    if (details !== undefined) {
      this.details = details;
    }

    Error.captureStackTrace(this, this.constructor);
  }
}

// Legacy interface for backward compatibility
export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

// Helper function to create standardized error responses
export const createErrorResponse = (
  message: string,
  statusCode: number,
  req: Request,
  code?: string,
  details?: any
): ErrorResponse => {
  const response: ErrorResponse = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  };
  
  if (code !== undefined) {
    response.code = code;
  }
  
  if (process.env.NODE_ENV === "development" && details !== undefined) {
    response.details = details;
  }
  
  const requestId = req.headers['x-request-id'] as string;
  if (requestId) {
    response.requestId = requestId;
  }
  
  return response;
};

// Helper function to create standardized success responses
export const createSuccessResponse = <T>(
  data?: T,
  message?: string
): ApiResponse<T> => {
  const response: ApiResponse<T> = {
    success: true,
    timestamp: new Date().toISOString()
  };
  
  if (data !== undefined) {
    response.data = data;
  }
  
  if (message !== undefined) {
    response.message = message;
  }
  
  return response;
};

// Not found middleware
export const notFound = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.api(`404 Not Found: ${req.method} ${req.originalUrl}`);
  
  const errorResponse = createErrorResponse(
    "Endpoint not found",
    404,
    req,
    "ENDPOINT_NOT_FOUND"
  );
  
  res.status(404).json(errorResponse);
};

// Error handler middleware
export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;
  let statusCode = err.statusCode || 500;
  let errorCode = err.code;

  // Log error
  logger.logError(err, "API_ERROR", {
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Handle specific error types
  
  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    error.message = "Invalid resource ID format";
    statusCode = 400;
    errorCode = "INVALID_ID_FORMAT";
  }

  // Duplicate key errors
  if (err.message.includes("duplicate key")) {
    error.message = "Resource already exists with this value";
    statusCode = 409;
    errorCode = "DUPLICATE_RESOURCE";
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error.message = "Invalid authentication token";
    statusCode = 401;
    errorCode = "INVALID_TOKEN";
  }

  if (err.name === "TokenExpiredError") {
    error.message = "Authentication token has expired";
    statusCode = 401;
    errorCode = "TOKEN_EXPIRED";
  }

  // PostgreSQL errors
  if (err.message.includes("violates foreign key constraint")) {
    error.message = "Referenced resource does not exist";
    statusCode = 400;
    errorCode = "FOREIGN_KEY_VIOLATION";
  }

  if (err.message.includes("violates unique constraint")) {
    error.message = "Resource already exists - unique constraint violation";
    statusCode = 409;
    errorCode = "UNIQUE_CONSTRAINT_VIOLATION";
  }

  if (err.message.includes("violates not-null constraint")) {
    error.message = "Required field is missing";
    statusCode = 422;
    errorCode = "NOT_NULL_VIOLATION";
  }

  // Multer errors (file upload)
  if (err.message.includes("File too large")) {
    error.message = "File size exceeds the allowed limit";
    statusCode = 413;
    errorCode = "FILE_TOO_LARGE";
  }

  if (err.message.includes("Too many files")) {
    error.message = "Too many files uploaded";
    statusCode = 413;
    errorCode = "TOO_MANY_FILES";
  }

  // Rate limiting errors
  if (err.message.includes("Rate limit") || err.message.includes("Too Many Requests")) {
    error.message = "Too many requests - rate limit exceeded";
    statusCode = 429;
    errorCode = "RATE_LIMIT_EXCEEDED";
  }

  // Create standardized error response
  const errorResponse = createErrorResponse(
    error.message || "Internal server error",
    statusCode,
    req,
    errorCode || "INTERNAL_ERROR",
    error.details
  );

  // Add stack trace in development
  if (process.env.NODE_ENV === "development") {
    errorResponse.details = {
      ...errorResponse.details,
      stack: err.stack,
    };
  }

  res.status(statusCode).json(errorResponse);
};
