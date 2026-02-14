import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test', override: true });

// Mock environment variables if not set
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-jwt-secret';
}

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
}

// Global teardown to prevent open handles
afterAll(async () => {
  // Use dynamic import to ensure environment variables are set before pool is initialized
  const { pool } = await import('../src/config/database');
  await pool.end();

  // Force garbage collection if available to clean up timer referneces
  if (global.gc) {
    global.gc();
  }
});
