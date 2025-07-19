import { Pool, PoolConfig } from "pg";

// Database configuration
const dbConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
export const pool = new Pool(dbConfig);

// Database connection function
export const connectDB = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log("📊 PostgreSQL database connected successfully");
    client.release();
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    console.log(
      "⚠️  Server will continue running but database operations will fail"
    );
    // Don't exit in development mode
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
};

// Test database connection
export const testDBConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    await client.query("SELECT NOW()");
    client.release();
    return true;
  } catch (error) {
    console.error("Database connection test failed:", error);
    return false;
  }
};

// Close database connection
export const closeDB = async (): Promise<void> => {
  try {
    await pool.end();
    console.log("📊 Database connection closed");
  } catch (error) {
    console.error("Error closing database connection:", error);
  }
};
