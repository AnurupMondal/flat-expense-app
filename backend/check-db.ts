import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

if (!process.env.DB_PASSWORD) {
  console.error("Error: DB_PASSWORD environment variable is required.");
  process.exit(1);
}

async function checkComplaintsInDB() {
  try {
    console.log("Connecting to database...");

    // Check if complaints table exists and has data
    const complaintsResult = await pool.query(
      "SELECT * FROM complaints ORDER BY created_at DESC;"
    );
    console.log("Complaints in database:", complaintsResult.rows.length);
    console.log("First few complaints:", complaintsResult.rows.slice(0, 3));

    // Check users table to see what user IDs exist
    const usersResult = await pool.query(
      "SELECT id, name, role FROM users;"
    );
    console.log("Users in database:", usersResult.rows.length);
    console.log("Users (sanitized):", usersResult.rows);

    await pool.end();
  } catch (error) {
    console.error("Database check failed:", error);
    await pool.end();
  }
}

checkComplaintsInDB();
