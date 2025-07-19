# Flat Expense Management System

A comprehensive full-stack application for managing apartment/flat expenses, complaints, and building management with role-based access control.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Frontend     │    │     Backend     │    │    Database     │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│  (PostgreSQL)   │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, Radix UI
- **Backend**: Node.js with Express, TypeScript, JWT Authentication
- **Database**: PostgreSQL 15 with comprehensive schema
- **Containerization**: Docker & Docker Compose

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for development)
- Git

### 1. Clone and Setup

```bash
git clone <repository-url>
cd flat-expense-app
```

### 2. Start with Docker Compose

```bash
# Start all services (database, backend, frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Database**: http://localhost:5432

### 4. Default Login

```
Email: admin@flatmanager.com
Password: admin123
Role: Super Admin
```

## 🛠️ Development Setup

### Backend Development

```bash
cd backend
npm install
npm run dev
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Database Only

```bash
# Start only PostgreSQL
docker-compose up database -d
```

## 📊 Database Schema

### Core Tables

- **users** - User management with role-based access
- **buildings** - Building information and settings
- **bills** - Rent and maintenance billing
- **complaints** - Complaint management system
- **notifications** - User notifications
- **user_sessions** - JWT session management

### User Roles

1. **Super Admin**: Full system access
2. **Admin**: Building-specific management
3. **Resident**: Personal bills and complaints

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token

### Users
- `GET /api/users` - List users (Admin+)
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `PATCH /api/users/:id/status` - Approve/reject user
- `DELETE /api/users/:id` - Delete user (Super Admin)

### Buildings
- `GET /api/buildings` - List buildings
- `POST /api/buildings` - Create building (Super Admin)

### Bills
- `GET /api/bills` - Get bills (filtered by role)

### Analytics
- `GET /api/analytics` - Get analytics data (Admin+)

## 🏢 Features

### Super Admin Features
- User approval/rejection system
- Building management
- System-wide analytics
- User role management

### Admin Features
- Building-specific user management
- Bill generation and tracking
- Complaint management
- Building analytics

### Resident Features
- View and pay bills
- Submit and track complaints
- Receive notifications
- Profile management

## 🔒 Security Features

- JWT token-based authentication
- Role-based access control (RBAC)
- Rate limiting
- Input validation
- SQL injection protection
- XSS protection with Helmet.js

## 🐳 Docker Configuration

### Services

1. **database** (PostgreSQL 15)
   - Persistent data volume
   - Health checks
   - Automatic schema initialization

2. **backend** (Node.js API)
   - Depends on database health
   - Environment-based configuration
   - File upload support

3. **frontend** (Next.js)
   - Optimized production build
   - Standalone output
   - Environment-based API URL

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=production
DATABASE_URL=postgresql://flatexpense:flatexpense123@database:5432/flat_expense_db
JWT_SECRET=your_super_secret_jwt_key
API_PORT=3001
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=FlatManager Pro
```

## 📱 UI Components

- **Dashboard Layouts**: Role-specific dashboards
- **Sidebar Navigation**: Collapsible with responsive design
- **Form Components**: Validation with React Hook Form
- **Data Tables**: Sortable, filterable tables
- **Charts**: Analytics visualization with Recharts
- **Modals**: CRUD operations
- **Toast Notifications**: User feedback

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📈 Monitoring

### Health Checks

- Backend: `GET /api/health`
- Database: Built-in PostgreSQL health check
- Frontend: Next.js built-in health monitoring

### Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs database
```

## 🔧 Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in docker-compose.yml
2. **Database connection**: Check DATABASE_URL and database health
3. **CORS errors**: Verify CORS_ORIGIN in backend environment
4. **Token issues**: Check JWT_SECRET configuration

### Reset Database

```bash
docker-compose down -v
docker-compose up database -d
```

## 📚 Development

### Project Structure

```
flat-expense-app/
├── backend/              # Node.js API server
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth, error handling
│   │   ├── config/       # Database config
│   │   └── types/        # TypeScript types
│   └── Dockerfile
├── frontend/             # Next.js application
│   ├── app/              # App router pages
│   ├── components/       # React components
│   ├── lib/              # Utilities and API client
│   └── Dockerfile
├── database/
│   └── init/             # Database initialization scripts
└── docker-compose.yml    # Multi-service orchestration
```

### Adding New Features

1. **Backend**: Add routes, middleware, database queries
2. **Frontend**: Create components, pages, API integration
3. **Database**: Update schema, migrations if needed

## 🚀 Production Deployment

### Build for Production

```bash
# Build all services
docker-compose build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Setup

1. Change default passwords
2. Use strong JWT secrets
3. Configure proper CORS origins
4. Set up SSL/TLS certificates
5. Configure backup strategies

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:

- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Happy Building! 🏢✨**
