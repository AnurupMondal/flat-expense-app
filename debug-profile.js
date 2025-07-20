// Debug script to test profile completion logic
const fs = require('fs');
const path = require('path');

// Copy the profile completion logic from frontend
function checkProfileCompletion(user) {
    const missingFields = [];
    const requiredFields = [];

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
        if (!value || (typeof value === "string" && value.trim() === "")) {
            missingFields.push(label);
        }
    });

    // Check role-specific fields
    const roleFields = roleSpecificFields[user.role] || [];
    roleFields.forEach(({ key, label }) => {
        requiredFields.push(label);
        const value = user[key];
        if (!value || (typeof value === "string" && value.trim() === "")) {
            missingFields.push(label);
        }
    });

    return {
        isComplete: missingFields.length === 0,
        missingFields,
        requiredFields,
    };
}

// Simulate different user scenarios
const testUsers = [
    {
        id: "1",
        email: "admin@flatmanager.com",
        name: "System Administrator",
        role: "super-admin",
        phone: "+1234567890",
        buildingId: null,
        flatNumber: null,
        status: "approved"
    },
    {
        id: "2",
        email: "admin@flatmanager.com",
        name: "Building Admin",
        role: "admin",
        phone: "+1234567890",
        buildingId: null,
        flatNumber: null,
        status: "approved"
    },
    {
        id: "3",
        email: "resident@flatmanager.com",
        name: "John Resident",
        role: "resident",
        phone: "+1234567890",
        buildingId: null,
        flatNumber: null,
        status: "approved"
    },
    {
        id: "4",
        email: "resident@flatmanager.com",
        name: "John Resident",
        role: "resident",
        phone: "+1234567890",
        buildingId: "building-1",
        flatNumber: "301",
        status: "approved"
    }
];

console.log("Testing Profile Completion Logic:");
console.log("=".repeat(50));

testUsers.forEach((user, index) => {
    console.log(`\nTest ${index + 1}: ${user.role} - ${user.name}`);
    console.log("User data:", JSON.stringify(user, null, 2));

    const result = checkProfileCompletion(user);
    console.log("Profile check result:", result);

    if (!result.isComplete) {
        console.log("❌ PROFILE INCOMPLETE - Would show ProfileCompletion component");
    } else {
        console.log("✅ PROFILE COMPLETE - Would show dashboard");
    }
    console.log("-".repeat(40));
});
