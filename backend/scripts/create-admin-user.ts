import bcrypt from "bcryptjs";
import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "flat_expense_db",
  user: "flatexpense",
  password: "flatexpense123",
});

async function createAdminUser() {
  const email = "admin@flatmanager.com";
  const password = "admin123";
  const name = "System Administrator";
  const role = "super-admin";
  const phone = "+1234567890";
  const status = "approved";

  const passwordHash = await bcrypt.hash(password, 10);

  // Check if user already exists
  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);
  if (existing.rows.length > 0) {
    console.log("Admin user already exists.");
    return;
  }

  await pool.query(
    `INSERT INTO users (email, password_hash, name, role, phone, status)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [email, passwordHash, name, role, phone, status]
  );
  console.log("Admin user created successfully.");
}

createAdminUser()
  .catch((err) => {
    console.error("Error creating admin user:", err);
  })
  .finally(() => pool.end());
