# Development Environment Setup

This guide explains how to set up a complete development environment for the Flat Expense App that replicates a production-like stack.

## Prerequisites

- Docker Desktop (recommended) or Docker Engine with Docker Compose
- Git
- Node.js 18+ (for local development without Docker)

## Quick Setup

### Option 1: Automated Setup (Recommended)

**For Linux/macOS:**
```bash
chmod +x setup-dev-env.sh
./setup-dev-env.sh
```

**For Windows:**
```cmd
setup-dev-env.bat
```

### Option 2: Manual Setup

1. **Clone the repository and create a development branch:**
   ```bash
   git checkout -b development
   ```

2. **Start the infrastructure services:**
   ```bash
   docker-compose up -d database redis minio mailhog
   ```

3. **Wait for services to initialize (about 15 seconds):**
   ```bash
   # Check database is ready
   docker-compose logs database
   ```

4. **Build and start the application:**
   ```bash
   docker-compose up -d --build backend frontend
   ```

## Services Overview

The development environment includes the following services replicating a production stack:

| Service | Port | Description | Access |
|---------|------|-------------|---------|
| **Frontend** | 3000 | Next.js React application | http://localhost:3000 |
| **Backend** | 3001 | Node.js/Express API server | http://localhost:3001 |
| **PostgreSQL** | 5432 | Primary database | `flatexpense/flatexpense123` |
| **Redis** | 6379 | Caching and session store | No auth required |
| **MinIO** | 9000/9001 | S3-compatible object storage | http://localhost:9001 |
| **MailHog** | 1025/8025 | SMTP testing server | http://localhost:8025 |

## Environment Configuration

### Backend Environment Variables

The backend uses the following environment variables (automatically configured):

```env
NODE_ENV=development
DATABASE_URL=postgresql://flatexpense:flatexpense123@database:5432/flat_expense_db
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
API_PORT=3001
CORS_ORIGIN=http://localhost:3000
REDIS_URL=redis://redis:6379
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
SMTP_HOST=mailhog
SMTP_PORT=1025
```

### Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NODE_ENV=development
```

## Database Setup

### Initial Schema and Seed Data

The database is automatically initialized with:

1. **Schema creation** from `database/init/01-schema.sql`
2. **Admin user creation** from `database/init/02-create-admin.sh`
3. **Seed data** from `database/seed/` directory including:
   - Sample users (testuser/admin)
   - Sample residents and flats
   - Expense categories and sample expenses
   - Sample complaints and announcements

### Database Access

Connect to the database using your preferred client:

- **Host:** localhost
- **Port:** 5432
- **Database:** flat_expense_db
- **Username:** flatexpense
- **Password:** flatexpense123

Or use Docker exec:
```bash
docker exec -it flat-expense-db psql -U flatexpense -d flat_expense_db
```

## Development Workflow

### Running in Development Mode

For active development with hot reload:

1. **Start only infrastructure services:**
   ```bash
   docker-compose up -d database redis minio mailhog
   ```

2. **Run backend in development mode:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Run frontend in development mode:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Testing

The project includes a comprehensive CI/CD pipeline that runs:

- **Unit tests** for backend and frontend
- **Linting** for code quality
- **Integration tests** for service interaction
- **Docker builds** for deployment readiness

Run tests locally:
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm run build && npm run lint

# Integration tests
docker-compose up -d
curl -f http://localhost:3001/api/health
curl -f http://localhost:3000
```

### Useful Commands

```bash
# View logs
docker-compose logs -f [service-name]

# Restart a service
docker-compose restart [service-name]

# Rebuild services
docker-compose up -d --build [service-name]

# Stop all services
docker-compose down

# Reset everything (removes data)
docker-compose down -v

# Access service shell
docker exec -it flat-expense-backend bash
docker exec -it flat-expense-frontend bash
```

## Service Details

### MinIO Object Storage

MinIO provides S3-compatible object storage for file uploads:

- **Console:** http://localhost:9001
- **API:** http://localhost:9000
- **Credentials:** minioadmin / minioadmin123

Create buckets and manage objects through the web interface.

### MailHog Email Testing

MailHog captures all outgoing emails for testing:

- **SMTP Server:** localhost:1025
- **Web Interface:** http://localhost:8025

All emails sent by the application will appear in the MailHog interface.

### Redis Cache

Redis is available for:
- Session storage
- API caching
- Rate limiting
- Real-time features

Connect via: `redis://localhost:6379`

## Troubleshooting

### Common Issues

1. **Port conflicts:** Change ports in `docker-compose.yml` if needed
2. **Database connection issues:** Ensure PostgreSQL is fully started before backend
3. **Frontend build errors:** Clear `frontend/.next` and rebuild
4. **Docker permissions:** On Linux, add user to docker group

### Logs and Debugging

```bash
# Check all service status
docker-compose ps

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs database

# Check resource usage
docker stats
```

### Reset Environment

If you encounter issues, reset the environment:
```bash
docker-compose down -v
docker system prune -f
./setup-dev-env.sh  # or setup-dev-env.bat on Windows
```

## Next Steps

After setup is complete:

1. Access the frontend at http://localhost:3000
2. Access the API documentation at http://localhost:3001/api/docs (if available)
3. Use the seed data to test features:
   - Login as `admin@example.com` or `testuser@example.com`
   - Password: `password123` (check seed files for exact credentials)
4. Check MailHog for any email notifications
5. Use MinIO console to manage file uploads

## CI/CD Pipeline

The project includes GitHub Actions workflows that automatically:

- Run tests on every push to `main` or `development` branches
- Build Docker images for production deployment
- Run integration tests with the full stack
- Check code quality with linting

The pipeline ensures code quality and deployment readiness on every change.
