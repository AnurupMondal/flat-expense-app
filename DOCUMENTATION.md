# Flat Expense Management Application

A comprehensive apartment/flat expense management system built with modern web technologies, designed to streamline building management, expense tracking, and resident communication.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technologies Used](#technologies-used)
4. [Project Structure](#project-structure)
5. [Installation & Setup](#installation--setup)
6. [User Roles & Permissions](#user-roles--permissions)
7. [Core Features](#core-features)
8. [API Documentation](#api-documentation)
9. [Database Schema](#database-schema)
10. [Frontend Components](#frontend-components)
11. [Authentication System](#authentication-system)
12. [Profile Management](#profile-management)
13. [Building Management](#building-management)
14. [Bill Management](#bill-management)
15. [Complaint System](#complaint-system)
16. [Analytics & Reporting](#analytics--reporting)
17. [File Upload System](#file-upload-system)
18. [Notification System](#notification-system)
19. [Security Features](#security-features)
20. [Development Guidelines](#development-guidelines)
21. [Deployment](#deployment)
22. [Troubleshooting](#troubleshooting)

## Overview

The Flat Expense Management Application is a full-stack web application designed to manage apartment complexes, track expenses, handle resident complaints, and facilitate communication between building administrators and residents.

### Key Objectives
- **Expense Management**: Track and distribute building maintenance expenses among residents
- **User Management**: Role-based access control for super-admins, admins, and residents
- **Communication**: Streamlined complaint submission and resolution system
- **Transparency**: Clear visibility into building expenses and management decisions
- **Automation**: Automated notifications and approval workflows

### Target Users
- **Super Administrators**: System-wide management and oversight
- **Building Administrators**: Building-specific management and resident oversight
- **Residents**: Access to personal expenses, bill payments, and complaint submission

## Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Frontend     │    │     Backend     │    │    Database     │
│   (Next.js)     │◄──►│  (Express.js)   │◄──►│  (PostgreSQL)   │
│                 │    │                 │    │                 │
│ - React UI      │    │ - REST API      │    │ - User Data     │
│ - TypeScript    │    │ - JWT Auth      │    │ - Buildings     │
│ - Tailwind CSS  │    │ - Middleware    │    │ - Bills         │
│ - shadcn/ui     │    │ - File Upload   │    │ - Complaints    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web application framework
- **TypeScript**: Type-safe JavaScript development
- **PostgreSQL**: Primary database
- **JWT**: Authentication tokens
- **bcrypt**: Password hashing
- **multer**: File upload handling
- **express-rate-limit**: API rate limiting

#### Frontend
- **Next.js 14**: React framework with App Router
- **React 18**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern component library
- **Lucide React**: Icon library

#### DevOps & Tools
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **Git**: Version control
- **ESLint**: Code linting
- **Prettier**: Code formatting

## Project Structure

```
flat-expense-app/
├── backend/                     # Backend application
│   ├── src/
│   │   ├── server.ts           # Main server file
│   │   ├── config/
│   │   │   └── database.ts     # Database configuration
│   │   ├── middleware/
│   │   │   ├── auth.ts         # Authentication middleware
│   │   │   ├── errorMiddleware.ts
│   │   │   └── rateLimiter.ts  # Rate limiting
│   │   ├── routes/             # API route handlers
│   │   │   ├── auth.ts         # Authentication routes
│   │   │   ├── users.ts        # User management
│   │   │   ├── buildings.ts    # Building management
│   │   │   ├── bills.ts        # Bill management
│   │   │   ├── complaints.ts   # Complaint system
│   │   │   ├── notifications.ts
│   │   │   ├── analytics.ts    # Analytics endpoints
│   │   │   └── upload.ts       # File upload
│   │   ├── types/
│   │   │   └── index.ts        # TypeScript type definitions
│   │   └── utils/
│   │       └── ensureAdminUser.ts
│   ├── scripts/
│   │   └── create-admin-user.ts
│   ├── uploads/                # File upload directory
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # Frontend application
│   ├── app/
│   │   ├── layout.tsx          # Root layout component
│   │   ├── page.tsx            # Main page with auth logic
│   │   └── globals.css         # Global styles
│   ├── components/             # React components
│   │   ├── admin-dashboard.tsx
│   │   ├── resident-dashboard.tsx
│   │   ├── super-admin-dashboard.tsx
│   │   ├── auth-page.tsx
│   │   ├── profile-completion.tsx
│   │   └── ui/                 # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       ├── dialog.tsx
│   │       └── ... (40+ UI components)
│   ├── hooks/                  # Custom React hooks
│   │   ├── useApi.ts
│   │   ├── use-toast.ts
│   │   └── useSidebarState.ts
│   ├── lib/                    # Utility libraries
│   │   ├── api.ts              # API client
│   │   ├── utils.ts            # General utilities
│   │   ├── profileUtils.ts     # Profile validation
│   │   └── userUtils.ts        # User data normalization
│   ├── types/
│   │   └── app-types.ts        # TypeScript definitions
│   ├── public/                 # Static assets
│   ├── Dockerfile
│   ├── package.json
│   └── next.config.mjs
├── database/
│   └── init/
│       ├── 01-schema.sql       # Database schema
│       └── 02-create-admin.sh  # Admin user creation
├── docker-compose.yml          # Multi-container setup
├── start.bat                   # Windows startup script
├── start.sh                    # Unix startup script
└── README.md
```

## Installation & Setup

### Prerequisites
- **Node.js** (v18 or higher)
- **Docker** and **Docker Compose**
- **Git**

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd flat-expense-app
   ```

2. **Start with Docker Compose**
   ```bash
   # Windows
   start.bat
   
   # Unix/Linux/macOS
   ./start.sh
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Manual Setup

#### Backend Setup
1. Navigate to backend directory
   ```bash
   cd backend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   # Edit .env with your configurations
   ```

4. Build and start
   ```bash
   npm run build
   npm start
   ```

#### Frontend Setup
1. Navigate to frontend directory
   ```bash
   cd frontend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start development server
   ```bash
   npm run dev
   ```

#### Database Setup
1. Ensure PostgreSQL is running
2. Create database: `flat_expense_db`
3. Run initialization scripts from `database/init/`

### Environment Variables

#### Backend (.env)
```env
PORT=3001
DATABASE_URL=postgresql://username:password@localhost:5432/flat_expense_db
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## User Roles & Permissions

### Super Administrator
**Highest level of access with system-wide control**

**Permissions:**
- Create and manage all buildings
- Approve/reject building administrators
- View system-wide analytics
- Manage all users across buildings
- Access all bills and expenses
- System configuration and settings

**Profile Requirements:**
- Name, email, phone number

### Building Administrator (Admin)
**Building-specific management role**

**Permissions:**
- Manage assigned building residents
- Approve/reject resident registrations
- Create and distribute bills for their building
- View building-specific analytics
- Handle resident complaints
- Manage building information and flat assignments

**Profile Requirements:**
- Name, email, phone number
- Building assignment (must be assigned by super-admin)

### Resident
**Standard user with access to personal information and building services**

**Permissions:**
- View personal bills and payment history
- Submit complaints to building administration
- Update personal profile information
- View building announcements and notifications
- Access building-specific information

**Profile Requirements:**
- Name, email, phone number
- Building assignment
- Flat/unit number

## Core Features

### 1. User Management System

#### User Registration & Approval
- New users register with basic information
- Admin/Super-admin approval required for account activation
- Email verification and validation
- Role assignment during approval process

#### Profile Completion
- Mandatory profile completion for first-time users
- Role-based field requirements
- Progress tracking with completion percentage
- Prevents dashboard access until completion

#### User Status Management
- Active/Inactive status control
- Approval workflow with notifications
- Role modification capabilities
- User activity tracking

### 2. Authentication System

#### JWT-Based Authentication
- Secure token-based authentication
- Automatic token refresh mechanism
- Role-based route protection
- Session management

#### Security Features
- Password hashing with bcrypt
- Rate limiting on authentication endpoints
- CORS configuration
- XSS protection

### 3. Building Management

#### Multi-Building Support
- Create and manage multiple buildings
- Building-specific administrator assignments
- Flat/unit management within buildings
- Building information and metadata

#### Flat Assignment System
- Assign residents to specific flats
- Track occupancy and vacancy
- Flat-based billing and expense allocation
- Resident transfer between flats

### 4. Bill Management System

#### Bill Creation & Distribution
- Create bills for building expenses
- Assign bills to specific flats or entire building
- File attachment support for bill documents
- Automated notifications to residents

#### Payment Tracking
- Track payment status for each resident
- Payment history and records
- Overdue payment notifications
- Payment confirmation system

#### Expense Categories
- Categorize expenses (maintenance, utilities, etc.)
- Custom category creation
- Expense tracking and reporting
- Budget management tools

### 5. Complaint Management

#### Complaint Submission
- Residents can submit complaints to administrators
- Category-based complaint classification
- File attachment support
- Priority level assignment

#### Complaint Resolution
- Admin workflow for complaint handling
- Status tracking (pending, in-progress, resolved)
- Communication thread between resident and admin
- Resolution documentation

### 6. Analytics & Reporting

#### Expense Analytics
- Building-wise expense breakdowns
- Monthly/yearly expense trends
- Category-wise expense analysis
- Cost per flat calculations

#### User Analytics
- User activity tracking
- Registration and approval trends
- Payment completion rates
- Complaint resolution metrics

### 7. Notification System

#### Automated Notifications
- New bill notifications
- Payment reminders
- Complaint status updates
- System announcements

#### Communication Channels
- In-app notifications
- Email notifications (configurable)
- Push notifications (future enhancement)
- SMS notifications (future enhancement)

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication Endpoints

#### POST /auth/login
Login with email and password

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "resident",
    "isApproved": true,
    "buildingId": 1,
    "flatNumber": "101"
  }
}
```

#### POST /auth/register
Register a new user

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```

#### GET /auth/profile
Get current user profile (requires authentication)

**Headers:**
```
Authorization: Bearer <jwt-token>
```

#### PUT /auth/profile
Update user profile

**Request Body:**
```json
{
  "name": "Updated Name",
  "phone": "+0987654321",
  "buildingId": 1,
  "flatNumber": "102"
}
```

### User Management Endpoints

#### GET /users
Get all users (admin/super-admin only)

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `role`: Filter by role
- `buildingId`: Filter by building
- `isApproved`: Filter by approval status

#### PUT /users/:id/status
Update user approval status

**Request Body:**
```json
{
  "isApproved": true,
  "role": "resident",
  "buildingId": 1
}
```

#### GET /users/:id
Get specific user details

#### PUT /users/:id
Update user information

#### DELETE /users/:id
Delete user (soft delete)

### Building Management Endpoints

#### GET /buildings
Get all buildings

**Response:**
```json
{
  "buildings": [
    {
      "id": 1,
      "name": "Sunrise Apartments",
      "address": "123 Main Street",
      "totalFlats": 50,
      "adminId": 2,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /buildings
Create new building (super-admin only)

**Request Body:**
```json
{
  "name": "New Building",
  "address": "456 Oak Avenue",
  "totalFlats": 30,
  "adminId": 3
}
```

#### PUT /buildings/:id
Update building information

#### GET /buildings/:id/flats
Get flats in a building

#### POST /buildings/:id/flats
Create flat in building

### Bill Management Endpoints

#### GET /bills
Get bills (filtered by user role and building)

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `buildingId`: Filter by building
- `category`: Filter by expense category
- `status`: Filter by payment status
- `dateFrom`: Start date filter
- `dateTo`: End date filter

#### POST /bills
Create new bill (admin/super-admin only)

**Request Body:**
```json
{
  "title": "Monthly Maintenance",
  "description": "Building maintenance expenses",
  "amount": 1000.00,
  "category": "maintenance",
  "buildingId": 1,
  "dueDate": "2024-02-01",
  "assignedFlats": ["101", "102", "103"]
}
```

#### GET /bills/:id
Get specific bill details

#### PUT /bills/:id/payment
Update payment status

**Request Body:**
```json
{
  "flatNumber": "101",
  "isPaid": true,
  "paidDate": "2024-01-15",
  "paymentMethod": "bank_transfer"
}
```

### Complaint Endpoints

#### GET /complaints
Get complaints (filtered by user role)

#### POST /complaints
Submit new complaint

**Request Body:**
```json
{
  "title": "Water Leakage",
  "description": "Water leaking from ceiling in bedroom",
  "category": "maintenance",
  "priority": "high",
  "buildingId": 1,
  "flatNumber": "101"
}
```

#### PUT /complaints/:id/status
Update complaint status (admin only)

**Request Body:**
```json
{
  "status": "resolved",
  "adminNotes": "Fixed the pipe connection",
  "resolvedDate": "2024-01-20"
}
```

### Analytics Endpoints

#### GET /analytics/expenses
Get expense analytics

**Query Parameters:**
- `buildingId`: Filter by building
- `period`: Time period (monthly, yearly)
- `category`: Expense category

#### GET /analytics/payments
Get payment analytics

#### GET /analytics/users
Get user analytics

### File Upload Endpoints

#### POST /upload/bill-document
Upload bill document

**Request:** Multipart form data with file

#### POST /upload/complaint-attachment
Upload complaint attachment

#### GET /upload/:filename
Download uploaded file

### Notification Endpoints

#### GET /notifications
Get user notifications

#### PUT /notifications/:id/read
Mark notification as read

#### POST /notifications/send
Send notification (admin only)

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'resident',
    is_approved BOOLEAN DEFAULT false,
    building_id INTEGER REFERENCES buildings(id),
    flat_number VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Buildings Table
```sql
CREATE TABLE buildings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    total_flats INTEGER,
    admin_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Bills Table
```sql
CREATE TABLE bills (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    building_id INTEGER REFERENCES buildings(id),
    due_date DATE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Bill Assignments Table
```sql
CREATE TABLE bill_assignments (
    id SERIAL PRIMARY KEY,
    bill_id INTEGER REFERENCES bills(id),
    flat_number VARCHAR(10),
    amount DECIMAL(10,2),
    is_paid BOOLEAN DEFAULT false,
    paid_date TIMESTAMP,
    payment_method VARCHAR(50)
);
```

### Complaints Table
```sql
CREATE TABLE complaints (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending',
    building_id INTEGER REFERENCES buildings(id),
    resident_id INTEGER REFERENCES users(id),
    flat_number VARCHAR(10),
    admin_notes TEXT,
    resolved_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Notifications Table
```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255),
    message TEXT,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Frontend Components

### Core Components

#### Dashboard Components
- **`admin-dashboard.tsx`**: Building administrator interface
- **`resident-dashboard.tsx`**: Resident user interface  
- **`super-admin-dashboard.tsx`**: System administrator interface

#### Authentication Components
- **`auth-page.tsx`**: Login and registration forms
- **`profile-completion.tsx`**: Profile completion wizard

#### UI Components (shadcn/ui)
- **Form Components**: `form.tsx`, `input.tsx`, `button.tsx`, `label.tsx`
- **Layout Components**: `card.tsx`, `dialog.tsx`, `sheet.tsx`, `sidebar.tsx`
- **Data Display**: `table.tsx`, `badge.tsx`, `avatar.tsx`, `chart.tsx`
- **Feedback**: `alert.tsx`, `toast.tsx`, `loading-spinner.tsx`

### Custom Hooks

#### `useApi.ts`
Centralized API interaction hook with error handling and loading states.

```typescript
const { data, loading, error, execute } = useApi<UserData>('/api/users/1');
```

#### `use-toast.ts`
Toast notification management for user feedback.

```typescript
const { toast } = useToast();
toast({
  title: "Success",
  description: "Operation completed successfully"
});
```

#### `useSidebarState.ts`
Sidebar state management for responsive layout.

### Utility Libraries

#### `profileUtils.ts`
Profile validation and completion checking logic.

```typescript
export const checkProfileCompletion = (user: User): boolean => {
  // Role-based validation logic
  return isComplete;
};
```

#### `userUtils.ts`
User data normalization between API responses and frontend types.

```typescript
export const normalizeUser = (apiUser: any): User => {
  // Convert snake_case to camelCase
  return normalizedUser;
};
```

## Authentication System

### JWT Implementation

#### Token Structure
```json
{
  "userId": 123,
  "email": "user@example.com",
  "role": "resident",
  "iat": 1640995200,
  "exp": 1641081600
}
```

#### Middleware Protection
```typescript
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};
```

#### Role-Based Access Control
```typescript
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

### Frontend Authentication

#### Auth Context
```typescript
const AuthContext = createContext<{
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  loading: boolean;
}>({
  user: null,
  login: async () => {},
  logout: () => {},
  loading: false
});
```

#### Protected Routes
```typescript
const ProtectedRoute = ({ children, requiredRole }: { 
  children: React.ReactNode; 
  requiredRole?: string 
}) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }
  
  return <>{children}</>;
};
```

## Profile Management

### Profile Completion System

#### Validation Logic
```typescript
export const checkProfileCompletion = (user: User): boolean => {
  const baseFields = ['name', 'email', 'phone'];
  
  // Check base fields
  for (const field of baseFields) {
    if (!user[field as keyof User]) return false;
  }
  
  // Role-specific requirements
  if (user.role === 'admin' || user.role === 'resident') {
    if (!user.buildingId) return false;
  }
  
  if (user.role === 'resident') {
    if (!user.flatNumber) return false;
  }
  
  return true;
};
```

#### Progress Calculation
```typescript
export const getProfileCompletionPercentage = (user: User): number => {
  const requiredFields = getRequiredFields(user.role);
  const completedFields = requiredFields.filter(field => user[field as keyof User]);
  
  return Math.round((completedFields.length / requiredFields.length) * 100);
};
```

### Profile Update Flow

1. **Validation**: Client-side validation using `profileUtils.ts`
2. **API Call**: Update profile via `/api/auth/profile`
3. **Normalization**: Convert API response using `userUtils.ts`
4. **State Update**: Update application state with new user data
5. **Redirect**: Navigate to appropriate dashboard upon completion

## Building Management

### Building Creation Process

1. **Super-admin Access**: Only super-admins can create buildings
2. **Form Validation**: Validate building information
3. **Admin Assignment**: Assign building administrator
4. **Database Creation**: Create building record
5. **Notification**: Notify assigned admin

### Flat Management

#### Flat Assignment
```typescript
interface FlatAssignment {
  buildingId: number;
  flatNumber: string;
  residentId: number;
  assignedDate: Date;
  isActive: boolean;
}
```

#### Occupancy Tracking
- Track current and historical residents
- Vacancy management
- Transfer residents between flats
- Flat-specific billing

## Bill Management

### Bill Creation Workflow

1. **Admin/Super-admin**: Creates bill with details
2. **Flat Assignment**: Select target flats or entire building
3. **Amount Calculation**: Calculate per-flat amounts
4. **Document Upload**: Attach supporting documents
5. **Distribution**: Create bill assignments for each flat
6. **Notification**: Send notifications to residents

### Payment Tracking

#### Payment Status States
- **Pending**: Bill created, payment not made
- **Paid**: Payment confirmed
- **Overdue**: Past due date, payment not made
- **Partial**: Partial payment made

#### Payment Confirmation
```typescript
interface PaymentUpdate {
  billId: number;
  flatNumber: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  paidDate: Date;
}
```

## Complaint System

### Complaint Lifecycle

1. **Submission**: Resident submits complaint with details
2. **Categorization**: Auto or manual category assignment
3. **Priority Assignment**: Based on complaint type and urgency
4. **Admin Assignment**: Route to appropriate building admin
5. **Investigation**: Admin reviews and investigates
6. **Resolution**: Admin resolves and documents solution
7. **Closure**: Resident confirmation and case closure

### Complaint Categories
- **Maintenance**: Repairs, upkeep issues
- **Utilities**: Water, electricity, gas issues
- **Security**: Safety and security concerns
- **Noise**: Noise complaints from neighbors
- **Common Areas**: Issues with shared spaces
- **Other**: Miscellaneous complaints

### Priority Levels
- **Low**: Non-urgent issues, can wait
- **Medium**: Standard priority, address within reasonable time
- **High**: Urgent issues affecting daily life
- **Critical**: Emergency situations requiring immediate attention

## Analytics & Reporting

### Expense Analytics

#### Monthly Expense Reports
```typescript
interface MonthlyExpense {
  month: string;
  totalAmount: number;
  categoryBreakdown: {
    maintenance: number;
    utilities: number;
    security: number;
    other: number;
  };
  paymentStatus: {
    paid: number;
    pending: number;
    overdue: number;
  };
}
```

#### Building Comparison
- Compare expenses across different buildings
- Per-flat cost analysis
- Efficiency metrics
- Trend analysis

### User Analytics

#### Registration Trends
- New user registrations over time
- Approval rates and timelines
- Role distribution
- Building occupancy rates

#### Activity Metrics
- User login frequency
- Feature usage statistics
- Complaint resolution times
- Payment compliance rates

## Security Features

### Data Protection

#### Password Security
- bcrypt hashing with salt rounds
- Password complexity requirements
- Password change enforcement
- Account lockout after failed attempts

#### Input Validation
- Server-side validation for all inputs
- SQL injection prevention
- XSS protection
- CSRF protection

#### API Security
- Rate limiting per endpoint
- Request size limits
- CORS configuration
- Header validation

### Access Control

#### Role-Based Permissions
```typescript
const permissions = {
  'super-admin': ['*'], // All permissions
  'admin': [
    'building:read',
    'building:update',
    'residents:manage',
    'bills:create',
    'complaints:resolve'
  ],
  'resident': [
    'profile:read',
    'profile:update',
    'bills:read',
    'complaints:create'
  ]
};
```

#### Route Protection
- Frontend route guards
- Backend middleware protection
- Token validation on each request
- Session timeout handling

## Development Guidelines

### Code Style

#### TypeScript Standards
- Strict TypeScript configuration
- Explicit type definitions
- Interface over type aliases
- Consistent naming conventions

#### React Best Practices
- Functional components with hooks
- Custom hooks for shared logic
- Proper error boundaries
- Performance optimization with useMemo/useCallback

#### API Design
- RESTful conventions
- Consistent response formats
- Proper HTTP status codes
- Comprehensive error messages

### Testing Strategy

#### Unit Testing
- Test individual functions and components
- Mock external dependencies
- Test edge cases and error conditions
- Maintain high test coverage

#### Integration Testing
- Test API endpoints
- Test database operations
- Test authentication flows
- Test user workflows

#### End-to-End Testing
- Test complete user journeys
- Test cross-browser compatibility
- Test responsive design
- Test performance

### Git Workflow

#### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: Feature development
- `hotfix/*`: Critical bug fixes

#### Commit Standards
- Conventional commit messages
- Clear, descriptive commit messages
- Atomic commits
- Regular commits with logical grouping

## Deployment

### Docker Deployment

#### Production Build
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

#### Docker Compose Production
```yaml
version: '3.8'
services:
  database:
    image: postgres:15
    environment:
      POSTGRES_DB: flat_expense_db
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      
  backend:
    build: ./backend
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@database:5432/flat_expense_db
    depends_on:
      - database
      
  frontend:
    build: ./frontend
    ports:
      - "80:3000"
    depends_on:
      - backend
```

### Environment Configuration

#### Production Environment Variables
```env
# Backend
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-production-jwt-secret
CORS_ORIGIN=https://your-domain.com

# Frontend
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_ENV=production
```

### Monitoring & Logging

#### Application Logging
- Structured logging with Winston
- Log levels: error, warn, info, debug
- Request/response logging
- Error tracking and alerts

#### Performance Monitoring
- Response time tracking
- Database query performance
- Memory usage monitoring
- User activity analytics

## Troubleshooting

### Common Issues

#### Authentication Problems
**Issue**: "Invalid token" errors
**Solution**: 
1. Check JWT secret configuration
2. Verify token expiration
3. Clear browser localStorage
4. Restart backend service

#### Database Connection Issues
**Issue**: "Database connection failed"
**Solution**:
1. Verify database credentials
2. Check database service status
3. Verify network connectivity
4. Check connection pool settings

#### File Upload Issues
**Issue**: File uploads failing
**Solution**:
1. Check file size limits
2. Verify upload directory permissions
3. Check multer configuration
4. Verify file type restrictions

#### Profile Completion Issues
**Issue**: Profile completion not triggering
**Solution**:
1. Verify API response format
2. Check property name normalization
3. Validate profile completion logic
4. Clear browser cache

### Debugging Tools

#### Backend Debugging
```typescript
// Enable debug logging
process.env.DEBUG = 'app:*';

// Database query logging
const db = new Pool({
  // ... config
  log: (message) => console.log('DB:', message)
});
```

#### Frontend Debugging
```typescript
// React Developer Tools
// Redux DevTools (if using Redux)
// Browser console logging

console.log('User state:', user);
console.log('API response:', response);
```

### Performance Optimization

#### Backend Optimization
- Database query optimization
- Connection pooling
- Response caching
- Compression middleware

#### Frontend Optimization
- Code splitting
- Image optimization
- Bundle size analysis
- Lazy loading components

### Backup & Recovery

#### Database Backup
```bash
# Create backup
pg_dump -h localhost -U postgres flat_expense_db > backup.sql

# Restore backup
psql -h localhost -U postgres flat_expense_db < backup.sql
```

#### File Backup
- Regular backup of uploads directory
- Version control for code
- Configuration backup
- Documentation backup

## Support & Maintenance

### Regular Maintenance Tasks
- Database optimization and cleanup
- Log file rotation and cleanup
- Security updates and patches
- Performance monitoring and optimization
- Backup verification and testing

### Support Channels
- Documentation (this file)
- Code comments and inline documentation
- Issue tracking system
- Development team contact

### Update Procedures
1. Test updates in development environment
2. Create database backup
3. Deploy to staging environment
4. Run integration tests
5. Deploy to production during maintenance window
6. Monitor application performance
7. Rollback if issues detected

---

## Conclusion

This Flat Expense Management Application provides a comprehensive solution for apartment building management, expense tracking, and resident communication. The system is built with modern web technologies, follows security best practices, and is designed for scalability and maintainability.

For additional support or questions, please refer to the troubleshooting section or contact the development team.

**Version**: 1.0.0  
**Last Updated**: July 19, 2025  
**Maintainer**: Development Team
