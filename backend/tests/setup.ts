import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test', override: true });

// Set test environment
// NODE_ENV is set by dotenv or the test runner
// process.env.NODE_ENV = 'test';

// Mock environment variables if not set
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-jwt-secret';
}

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
}
