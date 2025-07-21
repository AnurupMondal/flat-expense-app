#!/bin/bash

# Flat Expense App - Development Environment Setup
# This script sets up the complete development environment with all services

echo "🚀 Setting up Flat Expense App Development Environment..."

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p backend/uploads backend/logs database/seed

# Set up environment files if they don't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend .env file..."
    cat > backend/.env << EOF
NODE_ENV=development
DATABASE_URL=postgresql://flatexpense:flatexpense123@localhost:5432/flat_expense_db
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
API_PORT=3001
CORS_ORIGIN=http://localhost:3000
REDIS_URL=redis://localhost:6379
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
EOF
fi

if [ ! -f frontend/.env.local ]; then
    echo "📝 Creating frontend .env.local file..."
    cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NODE_ENV=development
EOF
fi

# Build and start services
echo "🐳 Building and starting Docker containers..."
docker-compose down -v
docker-compose up -d database redis minio mailhog

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 15

# Start backend and frontend
echo "🔧 Starting backend and frontend services..."
docker-compose up -d --build backend frontend

echo "✅ Development environment setup complete!"
echo ""
echo "🌐 Access points:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3001"
echo "   Database: localhost:5432 (user: flatexpense, db: flat_expense_db)"
echo "   Redis: localhost:6379"
echo "   MinIO Console: http://localhost:9001 (admin/minioadmin123)"
echo "   MailHog UI: http://localhost:8025"
echo ""
echo "🔍 To view logs: docker-compose logs -f [service-name]"
echo "🛑 To stop: docker-compose down"
echo "🗑️  To reset: docker-compose down -v"
