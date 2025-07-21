@echo off
REM Demo Data Setup Script for Flat Expense App (Windows)
echo 🚀 Setting up demo data for Flat Expense App...

REM Check if the backend is running
echo 📡 Checking if backend is running...
curl -f http://localhost:3001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is running
) else (
    echo ❌ Backend is not running. Please start the backend first.
    echo Run: docker-compose up -d backend
    exit /b 1
)

REM Wait for database to be ready
echo 🗄️  Waiting for database to be ready...
timeout /t 5 >nul

REM Run the demo data creation script
echo 📊 Creating demo data...
cd backend
call npm run ts-node src/scripts/create-demo-users.ts

if %errorlevel% equ 0 (
    echo ✅ Demo data created successfully!
    echo.
    echo 📋 Demo Accounts:
    echo 🔑 Super Admin: superadmin@demo.com / Demo123!
    echo 🏢 Building Admin 1: admin1@demo.com / Demo123!
    echo 🏢 Building Admin 2: admin2@demo.com / Demo123!
    echo 🏠 Resident 1: resident1@demo.com / Demo123!
    echo 🏠 Resident 2: resident2@demo.com / Demo123!
    echo 🏠 Resident 3: resident3@demo.com / Demo123!
    echo 🏠 Resident 4: resident4@demo.com / Demo123!
    echo.
    echo 🎉 You can now test the application with these accounts!
) else (
    echo ❌ Failed to create demo data
    exit /b 1
)
