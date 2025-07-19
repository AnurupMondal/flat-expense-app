import winston from "winston";
import path from "path";
import fs from "fs";

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info: any) => {
    const { timestamp, level, message, stack, ...meta } = info;
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;

    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += ` | Meta: ${JSON.stringify(meta)}`;
    }

    // Add stack trace for errors
    if (stack) {
      log += `\nStack: ${stack}`;
    }

    return log;
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf((info: any) => {
    const { timestamp, level, message, ...meta } = info;
    let log = `${timestamp} ${level}: ${message}`;

    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }

    return log;
  })
);

// Create winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  defaultMeta: { service: "flat-expense-backend" },
  transports: [
    // Error logs - separate file for errors only
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Combined logs - all levels
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Access logs - for HTTP requests
    new winston.transports.File({
      filename: path.join(logsDir, "access.log"),
      level: "http",
      maxsize: 5242880, // 5MB
      maxFiles: 3,
    }),
  ],
});

// Add console transport for development
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// Custom logging methods
class Logger {
  private winston: winston.Logger;

  constructor(winstonLogger: winston.Logger) {
    this.winston = winstonLogger;
  }

  // Standard log levels
  error(message: string, meta?: any): void {
    this.winston.error(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.winston.warn(message, meta);
  }

  info(message: string, meta?: any): void {
    this.winston.info(message, meta);
  }

  debug(message: string, meta?: any): void {
    this.winston.debug(message, meta);
  }

  // HTTP request logging
  http(message: string, meta?: any): void {
    this.winston.log("http", message, meta);
  }

  // Authentication related logs
  auth(message: string, meta?: any): void {
    this.winston.info(`[AUTH] ${message}`, meta);
  }

  // Database related logs
  db(message: string, meta?: any): void {
    this.winston.info(`[DATABASE] ${message}`, meta);
  }

  // API related logs
  api(message: string, meta?: any): void {
    this.winston.info(`[API] ${message}`, meta);
  }

  // Security related logs
  security(message: string, meta?: any): void {
    this.winston.warn(`[SECURITY] ${message}`, meta);
  }

  // Performance related logs
  performance(message: string, meta?: any): void {
    this.winston.info(`[PERFORMANCE] ${message}`, meta);
  }

  // User action logs
  userAction(action: string, userId: number, meta?: any): void {
    this.winston.info(`[USER_ACTION] ${action}`, {
      userId,
      ...meta,
    });
  }

  // System events
  system(message: string, meta?: any): void {
    this.winston.info(`[SYSTEM] ${message}`, meta);
  }

  // Request logging helper
  logRequest(req: any, res: any, responseTime?: number): void {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
      statusCode: res.statusCode,
      responseTime: responseTime ? `${responseTime}ms` : undefined,
      userId: req.user?.id,
      userRole: req.user?.role,
    };

    this.http(`${req.method} ${req.originalUrl} - ${res.statusCode}`, logData);
  }

  // Error logging helper with stack trace
  logError(error: Error, context?: string, meta?: any): void {
    this.winston.error(`${context ? `[${context}] ` : ""}${error.message}`, {
      stack: error.stack,
      name: error.name,
      ...meta,
    });
  }

  // Business logic logging
  business(
    operation: string,
    entity: string,
    entityId?: number,
    meta?: any
  ): void {
    this.winston.info(
      `[BUSINESS] ${operation} ${entity}${entityId ? ` ID:${entityId}` : ""}`,
      meta
    );
  }

  // Validation error logging
  validation(message: string, data?: any): void {
    this.winston.warn(`[VALIDATION] ${message}`, data);
  }

  // External service logging
  external(service: string, action: string, meta?: any): void {
    this.winston.info(`[EXTERNAL] ${service} - ${action}`, meta);
  }
}

// Create and export logger instance
const appLogger = new Logger(logger);

export default appLogger;

// Export types for TypeScript
export interface LogMeta {
  [key: string]: any;
}

export interface RequestLogData {
  method: string;
  url: string;
  ip: string;
  userAgent?: string;
  statusCode: number;
  responseTime?: string;
  userId?: number;
  userRole?: string;
}
