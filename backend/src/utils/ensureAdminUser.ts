import bcrypt from "bcryptjs";
import { pool } from "../config/database";

export async function ensureAdminUser() {
  try {
    // Demo users to create
    const demoUsers = [
      {
        email: "superadmin@flatmanager.com",
        password: "superadmin123",
        name: "Super Administrator",
        role: "super-admin",
        phone: "+1234567890",
        status: "approved",
        building_id: null,
        flat_number: null,
      },
      {
        email: "admin@flatmanager.com",
        password: "admin123",
        name: "Building Administrator",
        role: "admin",
        phone: "+1234567891",
        status: "approved",
        building_id: null, // Will be set after building creation
        flat_number: null,
      },
      {
        email: "resident@flatmanager.com",
        password: "resident123",
        name: "Demo Resident",
        role: "resident",
        phone: "+1234567892",
        status: "approved",
        building_id: null, // Will be set after building creation
        flat_number: "101",
      },
    ];

    console.log("🏗️  Ensuring demo users exist...");

    // First, ensure a demo building exists
    let buildingId = null;
    const buildingResult = await pool.query(
      "SELECT id FROM buildings WHERE name = $1",
      ["Demo Building"]
    );

    if (buildingResult.rows.length === 0) {
      const newBuilding = await pool.query(
        `INSERT INTO buildings (name, address, total_units) 
         VALUES ($1, $2, $3) RETURNING id`,
        ["Demo Building", "123 Demo Street, Demo City", 50]
      );
      buildingId = newBuilding.rows[0].id;
      console.log("🏢 Demo building created");
    } else {
      buildingId = buildingResult.rows[0].id;
      console.log("🏢 Demo building already exists");
    }

    // Create demo users
    for (const userData of demoUsers) {
      // Create user with bcrypt hash
      const passwordHash = await bcrypt.hash(userData.password, 10);

      // Set building_id for admin and resident
      const userBuildingId =
        userData.role !== "super-admin" ? buildingId : null;

      const result = await pool.query(
        `INSERT INTO users (email, password_hash, name, role, phone, status, building_id, flat_number)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (email) DO NOTHING`,
        [
          userData.email,
          passwordHash,
          userData.name,
          userData.role,
          userData.phone,
          userData.status,
          userBuildingId,
          userData.flat_number,
        ]
      );

      if (result.rowCount && result.rowCount > 0) {
        console.log(`✅ ${userData.role} user created: ${userData.email}`);
      } else {
        console.log(`✅ User ${userData.email} already exists`);
      }
    }

    // Update building admin_id to point to the admin user
    const adminUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      ["admin@flatmanager.com"]
    );

    if (adminUser.rows.length > 0) {
      await pool.query("UPDATE buildings SET admin_id = $1 WHERE id = $2", [
        adminUser.rows[0].id,
        buildingId,
      ]);
      console.log("🏢 Building admin assigned");
    }

    // console.log("\n🎉 Demo credentials created successfully!");
    console.log("✅ Demo users check complete");
  } catch (error) {
    console.error("❌ Error ensuring demo users:", error);
  }
}
