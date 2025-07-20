// Test file to simulate the exact login flow and profile completion logic
console.log("Testing Profile Completion Issue");
console.log("=====================================");

// Simulate the exact user objects that would come from the backend API
const mockApiResponses = {
    // What the login API returns (with snake_case)
    loginResponse: {
        success: true,
        data: {
            token: "mock-jwt-token",
            user: {
                id: "550e8400-e29b-41d4-a716-446655440000",
                email: "admin@flatmanager.com",
                name: "Building Administrator",
                role: "admin",
                phone: "+1234567891",
                building_id: null,  // THIS IS THE ISSUE - admin needs building assignment
                flat_number: null,
                status: "approved"
            }
        },
        message: "Login successful"
    },

    // What the usersApi.getById returns (also snake_case)
    getUserResponse: {
        user: {
            id: "550e8400-e29b-41d4-a716-446655440000",
            email: "admin@flatmanager.com",
            name: "Building Administrator",
            role: "admin",
            phone: "+1234567891",
            building_id: null,  // Still null
            flat_number: null,
            status: "approved",
            created_at: "2025-01-01T00:00:00Z",
            updated_at: "2025-01-01T00:00:00Z"
        }
    }
};

// Copy the exact normalizeUser function from frontend
function normalizeUser(apiUser) {
    return {
        id: apiUser.id,
        email: apiUser.email,
        password: apiUser.password || "",
        name: apiUser.name,
        role: apiUser.role,
        phone: apiUser.phone || "",
        buildingId: apiUser.building_id || apiUser.buildingId || null,
        flatNumber: apiUser.flat_number || apiUser.flatNumber || null,
        status: apiUser.status,
        createdAt: new Date(apiUser.created_at || apiUser.createdAt || Date.now()),
        approvedBy: apiUser.approved_by || apiUser.approvedBy || null,
        rentEnabled: apiUser.rent_enabled || apiUser.rentEnabled || false,
        maintenanceEnabled: apiUser.maintenance_enabled || apiUser.maintenanceEnabled || false,
        avatar: apiUser.avatar || null,
    };
}

// Copy the profile completion function
function checkProfileCompletion(user) {
    const missingFields = [];
    const requiredFields = [];

    console.log("Checking profile completion for user:", {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone,
        buildingId: user.buildingId,
        flatNumber: user.flatNumber
    });

    // Basic required fields for all users
    const basicFields = [
        { key: "name", label: "Full Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone Number" },
    ];

    // Role-specific required fields
    const roleSpecificFields = {
        "super-admin": [],
        admin: [{ key: "buildingId", label: "Building Assignment" }],
        resident: [
            { key: "buildingId", label: "Building Assignment" },
            { key: "flatNumber", label: "Flat Number" },
        ],
    };

    // Check basic fields
    basicFields.forEach(({ key, label }) => {
        requiredFields.push(label);
        const value = user[key];
        console.log(`Checking basic field ${key} (${label}):`, value);
        if (!value || (typeof value === "string" && value.trim() === "")) {
            missingFields.push(label);
            console.log(`Missing basic field: ${label}`);
        }
    });

    // Check role-specific fields
    const roleFields = roleSpecificFields[user.role] || [];
    roleFields.forEach(({ key, label }) => {
        requiredFields.push(label);
        const value = user[key];
        console.log(`Checking role-specific field ${key} (${label}) for role ${user.role}:`, value);
        if (!value || (typeof value === "string" && value.trim() === "")) {
            missingFields.push(label);
            console.log(`Missing role-specific field: ${label}`);
        }
    });

    const result = {
        isComplete: missingFields.length === 0,
        missingFields,
        requiredFields,
    };

    console.log("Profile completion result:", result);
    return result;
}

// Simulate the exact login flow
console.log("\n1. LOGIN FLOW SIMULATION");
console.log("------------------------");

const loginUser = mockApiResponses.loginResponse.data.user;
console.log("Raw user from login API:", loginUser);

const normalizedLoginUser = normalizeUser(loginUser);
console.log("Normalized user:", normalizedLoginUser);

const loginProfileCheck = checkProfileCompletion(normalizedLoginUser);
console.log("Should show profile completion?", !loginProfileCheck.isComplete);

// Simulate session restoration
console.log("\n2. SESSION RESTORATION SIMULATION");
console.log("----------------------------------");

// User data would be saved to localStorage as normalizedLoginUser
const savedUserData = JSON.stringify(normalizedLoginUser);
console.log("Data saved to localStorage:", savedUserData);

// On page reload, this data is restored and usersApi.getById is called
const restoredUserData = JSON.parse(savedUserData);
console.log("Restored from localStorage:", restoredUserData);

// Fresh user data from API
const freshUser = mockApiResponses.getUserResponse.user;
console.log("Fresh user from API:", freshUser);

const normalizedFreshUser = normalizeUser(freshUser);
console.log("Normalized fresh user:", normalizedFreshUser);

const restoreProfileCheck = checkProfileCompletion(normalizedFreshUser);
console.log("Should show profile completion after restore?", !restoreProfileCheck.isComplete);

console.log("\n3. CONCLUSION");
console.log("-------------");
if (!loginProfileCheck.isComplete && !restoreProfileCheck.isComplete) {
    console.log("✅ WORKING CORRECTLY: Profile completion should show in both cases");
} else if (!loginProfileCheck.isComplete && restoreProfileCheck.isComplete) {
    console.log("❌ BUG: Profile completion shows on login but not on restore");
} else if (loginProfileCheck.isComplete && !restoreProfileCheck.isComplete) {
    console.log("❌ BUG: Profile completion doesn't show on login but shows on restore");
} else {
    console.log("❌ BUG: Profile completion never shows (but should for admin role)");
}
