import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";
import { AuthenticatedRequest } from "./auth";

// Extend Request interface to include startTime only
declare global {
  namespace Express {
    interface Request {
      startTime?: number;
    }
  }
}

// Request logging middleware
export const requestLogger = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  // Record start time
  req.startTime = Date.now();

  // Log incoming request
  logger.http(`Incoming ${req.method} request to ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get("User-Agent"),
    contentType: req.get("Content-Type"),
    contentLength: req.get("Content-Length"),
    userId: req.user?.id,
    userRole: req.user?.role,
  });

  // Log request body for POST/PUT requests (excluding sensitive data)
  if (req.method === "POST" || req.method === "PUT") {
    const bodyToLog = { ...req.body };

    // Remove sensitive fields from logging
    delete bodyToLog.password;
    delete bodyToLog.confirmPassword;
    delete bodyToLog.oldPassword;
    delete bodyToLog.newPassword;

    if (Object.keys(bodyToLog).length > 0) {
      logger.debug(
        `Request body for ${req.method} ${req.originalUrl}`,
        bodyToLog
      );
    }
  }

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (chunk?: any, encoding?: any): Response {
    const responseTime = req.startTime ? Date.now() - req.startTime : 0;

    // Log response
    logger.logRequest(req, res, responseTime);

    // Call original end method
    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Error logging middleware
export const errorLogger = (
  error: Error,
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const responseTime = req.startTime ? Date.now() - req.startTime : 0;

  logger.logError(error, "REQUEST_ERROR", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get("User-Agent"),
    userId: req.user?.id,
    userRole: req.user?.role,
    responseTime: `${responseTime}ms`,
    statusCode: res.statusCode,
  });

  next(error);
};

// Success response logger
export const logSuccess = (
  req: AuthenticatedRequest,
  res: Response,
  message: string,
  data?: any
): void => {
  logger.api(`SUCCESS: ${message}`, {
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id,
    userRole: req.user?.role,
    data: data
      ? typeof data === "object"
        ? Object.keys(data)
        : data
      : undefined,
  });
};

// Business operation logger
export const logBusinessOperation = (
  operation: string,
  entity: string,
  entityId?: number,
  userId?: number,
  details?: any
): void => {
  logger.business(operation, entity, entityId, {
    performedBy: userId,
    details: details,
    timestamp: new Date().toISOString(),
  });
};

// Authentication event logger
export const logAuthEvent = (
  event: string,
  userId?: number,
  email?: string,
  success: boolean = true,
  details?: any
): void => {
  logger.auth(`${event}: ${success ? "SUCCESS" : "FAILED"}`, {
    userId,
    email,
    success,
    details,
    timestamp: new Date().toISOString(),
  });
};

// Security event logger
export const logSecurityEvent = (
  event: string,
  severity: "low" | "medium" | "high" | "critical",
  details?: any
): void => {
  logger.security(`SECURITY_EVENT: ${event} [${severity.toUpperCase()}]`, {
    severity,
    details,
    timestamp: new Date().toISOString(),
  });
};

// Database operation logger
export const logDatabaseOperation = (
  operation: string,
  table: string,
  success: boolean,
  details?: any
): void => {
  logger.db(
    `DB_${operation.toUpperCase()}: ${table} - ${
      success ? "SUCCESS" : "FAILED"
    }`,
    {
      operation,
      table,
      success,
      details,
      timestamp: new Date().toISOString(),
    }
  );
};

// Performance logger
export const logPerformance = (
  operation: string,
  duration: number,
  threshold: number = 1000,
  details?: any
): void => {
  const isSlowOperation = duration > threshold;

  if (isSlowOperation) {
    logger.performance(
      `SLOW_OPERATION: ${operation} took ${duration}ms (threshold: ${threshold}ms)`,
      {
        operation,
        duration,
        threshold,
        details,
        timestamp: new Date().toISOString(),
      }
    );
  } else {
    logger.performance(`OPERATION: ${operation} completed in ${duration}ms`, {
      operation,
      duration,
      details,
    });
  }
};

export default {
  requestLogger,
  errorLogger,
  logSuccess,
  logBusinessOperation,
  logAuthEvent,
  logSecurityEvent,
  logDatabaseOperation,
  logPerformance,
};
