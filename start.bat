@echo off
REM Flat Expense App - Quick Start Script for Windows

echo 🏢 Starting Flat Expense Management System...
echo ================================================

REM Check if Docker is installed
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

echo ✅ Docker and Docker Compose are installed

REM Stop any existing containers
echo 🛑 Stopping any existing containers...
docker-compose down

REM Build and start all services
echo 🔨 Building and starting all services...
docker-compose up -d --build

echo ⏳ Waiting for services to be ready...
timeout /t 15 /nobreak >nul

echo 🔍 Checking service health...

REM Check services (simplified for Windows)
echo Checking database...
docker-compose exec -T database pg_isready -U flatexpense -d flat_expense_db >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Database is ready
) else (
    echo ❌ Database is not ready
)

echo.
echo 🎉 Flat Expense Management System is starting!
echo ================================================
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:3001/api
echo 📊 Database: localhost:5432
echo.
echo 🔐 Default Login:
echo    Email: admin@flatmanager.com
echo    Password: admin123
echo.
echo 📋 Useful Commands:
echo    View logs: docker-compose logs -f
echo    Stop system: docker-compose down
echo    Restart: docker-compose restart
echo.
echo 📚 For more information, check README.md
echo.
pause
