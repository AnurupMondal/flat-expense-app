import express from "express";
import { pool } from "../config/database";
import {
  authenticate,
  authorize,
  AuthenticatedRequest,
} from "../middleware/auth";

const router = express.Router();

// Get all buildings with pagination and filtering
router.get("/", authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search as string;

    let query = `
      SELECT b.*, u.name as admin_name
      FROM buildings b
      LEFT JOIN users u ON b.admin_id = u.id
      WHERE 1=1
    `;
    let values: any[] = [];
    let paramCount = 0;

    // Search filter
    if (search) {
      paramCount++;
      query += ` AND (b.name ILIKE $${paramCount} OR b.address ILIKE $${paramCount})`;
      values.push(`%${search}%`);
    }

    // Count total for pagination
    const countQuery = query.replace(
      "SELECT b.*, u.name as admin_name",
      "SELECT COUNT(*)"
    );
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination and sorting
    query += ` ORDER BY b.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    return res.json({
      success: true,
      data: {
        buildings: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get buildings error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error while fetching buildings",
    });
  }
});

// Create building (Super Admin only)
router.post(
  "/",
  authenticate,
  authorize("super-admin"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { name, address, admin_id, total_units } = req.body;

      if (!name || !address || !total_units) {
        return res.status(400).json({
          success: false,
          error: "Name, address, and total_units are required",
        });
      }

      const query = `
      INSERT INTO buildings (name, address, admin_id, total_units)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

      const result = await pool.query(query, [
        name,
        address,
        admin_id || null,
        total_units,
      ]);

      return res.status(201).json({
        success: true,
        data: { building: result.rows[0] },
        message: "Building created successfully",
      });
    } catch (error) {
      console.error("Create building error:", error);
      return res.status(500).json({
        success: false,
        error: "Server error while creating building",
      });
    }
  }
);

// Update building (Super Admin only)
router.put(
  "/:id",
  authenticate,
  authorize("super-admin"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { name, address, admin_id, total_units } = req.body;

      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 0;

      if (name !== undefined) {
        paramCount++;
        updates.push(`name = $${paramCount}`);
        values.push(name);
      }
      
      if (address !== undefined) {
        paramCount++;
        updates.push(`address = $${paramCount}`);
        values.push(address);
      }
      
      if (admin_id !== undefined) {
        paramCount++;
        updates.push(`admin_id = $${paramCount}`);
        values.push(admin_id);
      }
      
      if (total_units !== undefined) {
        paramCount++;
        updates.push(`total_units = $${paramCount}`);
        values.push(total_units);
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No valid fields to update",
        });
      }

      paramCount++;
      values.push(id);
      
      // Check for duplicate building name
      if (name) {
        const duplicateCheck = await pool.query(
          "SELECT id FROM buildings WHERE name = $1 AND id != $2",
          [name, id]
        );
        if (duplicateCheck.rows.length > 0) {
          return res.status(400).json({
            success: false,
            error: "Building name already exists",
          });
        }
      }

      const query = `
        UPDATE buildings 
        SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Building not found",
        });
      }

      return res.json({
        success: true,
        data: { building: result.rows[0] },
        message: "Building updated successfully",
      });
    } catch (error) {
      console.error("Update building error:", error);
      return res.status(500).json({
        success: false,
        error: "Server error while updating building",
      });
    }
  }
);

// Delete building (Super Admin only)
router.delete(
  "/:id",
  authenticate,
  authorize("super-admin"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;

      // Check if building has residents
      const residentsCheck = await pool.query(
        "SELECT COUNT(*) FROM users WHERE building_id = $1 AND status != 'rejected'",
        [id]
      );
      
      const residentCount = parseInt(residentsCheck.rows[0].count);
      if (residentCount > 0) {
        return res.status(400).json({
          success: false,
          error: "Cannot delete building with occupied flats",
        });
      }

      const result = await pool.query(
        "DELETE FROM buildings WHERE id = $1 RETURNING *",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Building not found",
        });
      }

      return res.json({
        success: true,
        data: { building: result.rows[0] },
        message: "Building deleted successfully",
      });
    } catch (error) {
      console.error("Delete building error:", error);
      return res.status(500).json({
        success: false,
        error: "Server error while deleting building",
      });
    }
  }
);

// Get flats in a building
router.get(
  "/:id/flats",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;

      // Get unique flat numbers from users table for this building
      const query = `
        SELECT DISTINCT flat_number, 
               COUNT(CASE WHEN status = 'approved' THEN 1 END) > 0 as occupied,
               STRING_AGG(CASE WHEN status = 'approved' THEN name END, ', ') as resident_name
        FROM users 
        WHERE building_id = $1 AND flat_number IS NOT NULL
        GROUP BY flat_number
        ORDER BY flat_number::int
      `;

      const result = await pool.query(query, [id]);

      return res.json({
        success: true,
        data: { flats: result.rows },
      });
    } catch (error) {
      console.error("Get building flats error:", error);
      return res.status(500).json({
        success: false,
        error: "Server error while fetching building flats",
      });
    }
  }
);

// Create flat in building (for testing - in real app flats are created via user assignment)
router.post(
  "/:id/flats",
  authenticate,
  authorize("admin", "super-admin"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { flat_number, floor, bedrooms, rent_amount } = req.body;

      if (!flat_number) {
        return res.status(400).json({
          success: false,
          error: "Flat number is required",
        });
      }

      // Check for duplicate flat number in the same building
      const duplicateCheck = await pool.query(
        "SELECT id FROM users WHERE building_id = $1 AND flat_number = $2",
        [id, flat_number]
      );
      
      if (duplicateCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: "Flat number already exists in this building",
        });
      }

      // For testing purposes, create a flat record
      const flatData = {
        id: `${id}-${flat_number}`,
        building_id: id,
        flat_number,
        floor: floor || 1,
        bedrooms: bedrooms || 1,
        rent_amount: rent_amount || 1000
      };

      return res.status(201).json({
        success: true,
        data: { flat: flatData },
        message: "Flat created successfully",
      });
    } catch (error) {
      console.error("Create flat error:", error);
      return res.status(500).json({
        success: false,
        error: "Server error while creating flat",
      });
    }
  }
);

// Bulk import buildings from CSV
router.post(
  "/bulk-import",
  authenticate,
  authorize("super-admin"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { csv_data } = req.body;

      if (!csv_data) {
        return res.status(400).json({
          success: false,
          error: "CSV data is required",
        });
      }

      const lines = csv_data.trim().split('\n');
      const headers = lines[0].split(',').map((h: string) => h.trim());
      
      // Validate headers
      const requiredHeaders = ['name', 'address', 'total_units'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Missing required headers: ${missingHeaders.join(', ')}`
        });
      }

      const buildings = [];
      const errors = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v: string) => v.trim());
        const building: any = {};
        
        headers.forEach((header: string, index: number) => {
          building[header] = values[index];
        });

        // Validate building data
        if (!building.name || !building.address || !building.total_units) {
          errors.push(`Line ${i + 1}: Missing required fields`);
          continue;
        }

        try {
          const result = await pool.query(
            "INSERT INTO buildings (name, address, total_units) VALUES ($1, $2, $3) RETURNING *",
            [building.name, building.address, parseInt(building.total_units)]
          );
          buildings.push(result.rows[0]);
        } catch (error: any) {
          errors.push(`Line ${i + 1}: ${error.message}`);
        }
      }

      return res.status(201).json({
        success: true,
        data: {
          created_count: buildings.length,
          buildings,
          errors
        },
        message: `Created ${buildings.length} buildings successfully`
      });
    } catch (error) {
      console.error("Bulk import buildings error:", error);
      return res.status(500).json({
        success: false,
        error: "Server error while importing buildings",
      });
    }
  }
);

// Get building analytics
router.get(
  "/:id/analytics",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;

      // Get basic building info
      const buildingInfo = await pool.query(
        "SELECT * FROM buildings WHERE id = $1",
        [id]
      );

      if (buildingInfo.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Building not found",
        });
      }

      const building = buildingInfo.rows[0];

      // Get occupancy data
      const occupancyData = await pool.query(
        "SELECT COUNT(*) as occupied_units FROM users WHERE building_id = $1 AND status = 'approved'",
        [id]
      );

      const occupiedUnits = parseInt(occupancyData.rows[0].occupied_units);
      const totalUnits = building.total_units;
      const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

      // Get revenue data (mock)
      const revenueData = {
        monthly_revenue: occupiedUnits * 1000, 
        total_pending: 0,
        collection_rate: 95
      };

      return res.json({
        success: true,
        data: {
          building_id: id,
          building_name: building.name,
          total_units: totalUnits,
          occupied_units: occupiedUnits,
          vacant_units: totalUnits - occupiedUnits,
          occupancy_rate: parseFloat(occupancyRate.toFixed(2)),
          revenue_data: revenueData
        },
      });
    } catch (error) {
      console.error("Get building analytics error:", error);
      return res.status(500).json({
        success: false,
        error: "Server error while fetching building analytics",
      });
    }
  }
);

export default router;
