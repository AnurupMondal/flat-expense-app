@echo off
echo 🚀 Setting up Flat Expense App Development Environment...

REM Check if Docker is available
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker first.
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

echo 📁 Creating necessary directories...
if not exist "backend\uploads" mkdir backend\uploads
if not exist "backend\logs" mkdir backend\logs
if not exist "database\seed" mkdir database\seed

REM Set up environment files if they don't exist
if not exist "backend\.env" (
    echo 📝 Creating backend .env file...
    (
        echo NODE_ENV=development
        echo DATABASE_URL=postgresql://flatexpense:flatexpense123@localhost:5432/flat_expense_db
        echo JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
        echo API_PORT=3001
        echo CORS_ORIGIN=http://localhost:3000
        echo REDIS_URL=redis://localhost:6379
        echo MINIO_ENDPOINT=localhost:9000
        echo MINIO_ACCESS_KEY=minioadmin
        echo MINIO_SECRET_KEY=minioadmin123
        echo SMTP_HOST=localhost
        echo SMTP_PORT=1025
        echo SMTP_USER=
        echo SMTP_PASS=
    ) > backend\.env
)

if not exist "frontend\.env.local" (
    echo 📝 Creating frontend .env.local file...
    (
        echo NEXT_PUBLIC_API_URL=http://localhost:3001/api
        echo NODE_ENV=development
    ) > frontend\.env.local
)

echo 🐳 Building and starting Docker containers...
docker-compose down -v
docker-compose up -d database redis minio mailhog

echo ⏳ Waiting for database to be ready...
timeout /t 15 /nobreak >nul

echo 🔧 Starting backend and frontend services...
docker-compose up -d --build backend frontend

echo ✅ Development environment setup complete!
echo.
echo 🌐 Access points:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:3001
echo    Database: localhost:5432 (user: flatexpense, db: flat_expense_db)
echo    Redis: localhost:6379
echo    MinIO Console: http://localhost:9001 (admin/minioadmin123)
echo    MailHog UI: http://localhost:8025
echo.
echo 🔍 To view logs: docker-compose logs -f [service-name]
echo 🛑 To stop: docker-compose down
echo 🗑️  To reset: docker-compose down -v

pause
