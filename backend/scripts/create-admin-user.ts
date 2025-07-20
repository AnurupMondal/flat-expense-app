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
  const users = [
    {
      email: "superadmin@flatmanager.com",
      password: "superadmin123",
      name: "Super Administrator",
      role: "super-admin",
      phone: "+1234567890",
      status: "approved",
    },
    {
      email: "admin@flatmanager.com",
      password: "admin123",
      name: "Building Administrator",
      role: "admin",
      phone: "+1234567891",
      status: "approved",
    },
    {
      email: "resident@flatmanager.com",
      password: "resident123",
      name: "John Resident",
      role: "resident",
      phone: "+1234567892",
      status: "approved",
    },
  ];

  for (const userData of users) {
    const { email, password, name, role, phone, status } = userData;
    const passwordHash = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rows.length > 0) {
      console.log(`User ${email} already exists.`);
      continue;
    }

    await pool.query(
      `INSERT INTO users (email, password_hash, name, role, phone, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [email, passwordHash, name, role, phone, status]
    );
    console.log(`User ${email} created successfully.`);
  }
}

createAdminUser()
  .catch((err) => {
    console.error("Error creating admin user:", err);
  })
  .finally(() => pool.end());
