#!/bin/bash

# Demo Data Setup Script for Flat Expense App
echo "🚀 Setting up demo data for Flat Expense App..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if the backend is running
echo "📡 Checking if backend is running..."
if curl -f http://localhost:3001/health 2>/dev/null; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend is not running. Please start the backend first.${NC}"
    echo "Run: docker-compose up -d backend"
    exit 1
fi

# Wait for database to be ready
echo "🗄️  Waiting for database to be ready..."
sleep 5

# Run the demo data creation script
echo "📊 Creating demo data..."
cd backend
npm run ts-node src/scripts/create-demo-users.ts

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Demo data created successfully!${NC}"
    echo ""
    echo -e "${YELLOW}📋 Demo Accounts:${NC}"
    echo "🔑 Super Admin: superadmin@demo.com / Demo123!"
    echo "🏢 Building Admin 1: admin1@demo.com / Demo123!"
    echo "🏢 Building Admin 2: admin2@demo.com / Demo123!"
    echo "🏠 Resident 1: resident1@demo.com / Demo123!"
    echo "🏠 Resident 2: resident2@demo.com / Demo123!"
    echo "🏠 Resident 3: resident3@demo.com / Demo123!"
    echo "🏠 Resident 4: resident4@demo.com / Demo123!"
    echo ""
    echo -e "${GREEN}🎉 You can now test the application with these accounts!${NC}"
else
    echo -e "${RED}❌ Failed to create demo data${NC}"
    exit 1
fi
