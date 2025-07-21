# Test Execution Guide - Flat Expense Management System

## Overview
This guide provides instructions for executing the comprehensive test matrix covering all modules, roles, and device sizes for the Flat Expense Management System.

## Test Matrix Structure

The test matrix (`test-matrix.csv`) contains the following columns:
- **Feature**: High-level feature being tested
- **Module**: Specific module/component
- **Role**: User role (Super Admin, Admin, Resident, All)
- **Device Size**: Target device screen size
- **Test Case Type**: Positive, Negative, Security, Performance
- **Test Case Description**: Detailed test scenario
- **Expected Result**: Expected outcome
- **Actual Result**: Actual outcome (filled during execution)
- **Status**: Pass/Fail/In Progress/Blocked
- **Priority**: P0 (Critical), P1 (High), P2 (Medium)
- **Ticket Link**: Link to bug tracking system
- **Notes**: Additional comments

## Priority Levels

### P0 - Critical (Security & Data Loss Prevention)
- **Must be tested first**
- **Blocking issues for production**
- Examples: Authentication, Authorization, Data Security, Data Loss Prevention

### P1 - High (Core Functionality)
- **Should be tested after P0**
- **Important features but not security-critical**
- Examples: User Management, Bill Creation, Complaint System

### P2 - Medium (User Experience & Performance)
- **Can be tested after P1**
- **UI/UX and performance related**
- Examples: Responsiveness, Cross-browser compatibility, Performance

## Test Environment Setup

### Prerequisites
1. Docker and Docker Compose installed
2. Test database with sample data
3. Different devices/browsers for testing
4. API testing tools (Postman, curl, etc.)

### Environment Configuration
```bash
# Start the application
docker-compose up -d

# Verify services are running
docker-compose ps

# Access points
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001/api
# Database: http://localhost:5432
```

### Test Data Setup
```bash
# The application comes with default admin user
# Email: admin@flatmanager.com
# Password: admin123

# Additional test users can be created through the UI or database
```

## Test Execution Process

### Phase 1: P0 Security & Data Loss Tests (Days 1-3)

#### Authentication Tests
1. **Login with valid credentials**
   - Navigate to http://localhost:3000
   - Enter: admin@flatmanager.com / admin123
   - **Expected**: Successful login, redirect to dashboard
   - **Record**: Actual result in test matrix

2. **SQL Injection attempts**
   - Login field: `admin'; DROP TABLE users; --`
   - **Expected**: Input sanitized, login fails safely
   - **Record**: Result and any error messages

3. **JWT Token validation**
   - Use browser dev tools to modify/delete token
   - Try accessing protected routes
   - **Expected**: Redirect to login with 401

#### Role-Based Access Control Tests
4. **Super Admin access verification**
   - Login as super admin
   - Access all modules (Users, Buildings, Analytics)
   - **Expected**: Full access granted

5. **Cross-role access attempts**
   - Login as resident
   - Try accessing admin API endpoints directly
   - **Expected**: 403 Forbidden response

#### Data Security Tests
6. **Password storage verification**
   - Check database for password hashes
   - **Expected**: Only bcrypt hashes stored

7. **XSS prevention**
   - Input: `<script>alert('xss')</script>` in name fields
   - **Expected**: Input sanitized and stored safely

### Phase 2: P1 Core Functionality Tests (Days 4-7)

#### User Management Tests
8. **Profile completion**
   - Create new user, complete profile
   - **Expected**: Profile completion percentage updates

9. **Building assignment**
   - Assign user to building as admin
   - **Expected**: User can access building-specific data

#### Bill Management Tests
10. **Bill creation and distribution**
    - Login as admin, create bill for building
    - **Expected**: Bill assigned to all residents

11. **Payment status updates**
    - Login as resident, mark bill as paid
    - **Expected**: Status updated in database

#### Complaint System Tests
12. **Complaint submission**
    - Login as resident, submit complaint
    - **Expected**: Complaint created with submitted status

13. **Complaint resolution**
    - Login as admin, update complaint status
    - **Expected**: Status changed to resolved

### Phase 3: P2 UI/UX & Performance Tests (Days 8-10)

#### Responsive Design Tests
14. **Mobile responsiveness (320px)**
    - Use browser dev tools to simulate mobile
    - Navigate through all major features
    - **Expected**: UI elements properly sized

15. **Tablet responsiveness (768px)**
    - Test dashboard, forms, tables
    - **Expected**: Layout optimized for tablet

16. **Desktop optimization (1440px+)**
    - Test all features on large screens
    - **Expected**: Optimal use of screen space

#### Cross-Browser Tests
17. **Chrome compatibility**
    - Test all core features in Chrome
    - **Expected**: Full functionality

18. **Firefox compatibility**
    - Test all core features in Firefox
    - **Expected**: Full functionality

19. **Safari compatibility** (if available)
    - Test all core features in Safari
    - **Expected**: Full functionality

#### Performance Tests
20. **Dashboard load with large dataset**
    - Create 1000+ bills in test database
    - Load dashboard
    - **Expected**: Loads within 5 seconds

21. **Search functionality**
    - Search with large dataset
    - **Expected**: Results within 3 seconds

## Test Data Management

### Creating Test Data

#### Sample Buildings
```sql
INSERT INTO buildings (name, address, total_units, admin_id) VALUES 
('Test Building A', '123 Test Street', 50, 'admin-user-id'),
('Test Building B', '456 Test Avenue', 30, 'admin-user-id');
```

#### Sample Users
```sql
INSERT INTO users (name, email, password_hash, role, building_id, flat_number, status) VALUES 
('Test Admin', 'test.admin@test.com', 'hashed-password', 'admin', 'building-id', NULL, 'approved'),
('Test Resident', 'test.resident@test.com', 'hashed-password', 'resident', 'building-id', '101', 'approved');
```

#### Sample Bills
```sql
INSERT INTO bills (user_id, building_id, month, year, total_amount, due_date) VALUES 
('resident-id', 'building-id', 'January', 2024, 1500.00, '2024-01-31');
```

### Cleanup After Testing
```sql
-- Clean up test data
DELETE FROM bills WHERE month = 'TestMonth';
DELETE FROM users WHERE email LIKE '%@test.com';
DELETE FROM buildings WHERE name LIKE 'Test%';
```

## Recording Test Results

### Status Values
- **Pass**: Test completed successfully, actual matches expected
- **Fail**: Test failed, actual doesn't match expected
- **In Progress**: Test currently being executed
- **Blocked**: Cannot execute due to dependency/environment issue
- **Skipped**: Test skipped (with reason in Notes)

### Result Documentation
1. Update `test-matrix.csv` with actual results
2. For failures, create detailed bug reports
3. Link bug tracking tickets in "Ticket Link" column
4. Add relevant notes in "Notes" column

### Example Result Entry
```csv
Authentication,Auth,All,All,Positive,Login with valid credentials,User logged in successfully,User logged in and redirected to dashboard,Pass,P0,TICKET-123,Works correctly
```

## Bug Reporting Template

### Bug Report Format
```markdown
## Bug ID: BUG-001
**Feature**: Authentication
**Module**: Auth
**Priority**: P0
**Device**: All
**Browser**: Chrome 91.0

### Description
Login with valid credentials fails

### Steps to Reproduce
1. Navigate to http://localhost:3000
2. Enter email: admin@flatmanager.com
3. Enter password: admin123
4. Click Login

### Expected Result
User should be logged in and redirected to dashboard

### Actual Result
Error message: "Invalid credentials"

### Environment
- OS: Windows 10
- Browser: Chrome 91.0
- Application Version: 1.0.0
```

## Test Automation Considerations

### Candidates for Automation
- Authentication flows
- API endpoint testing
- Form validation
- Cross-browser compatibility
- Performance benchmarks

### Manual Testing Required
- Visual design verification
- Usability testing
- Complex user workflows
- Device-specific behavior

## Reporting and Metrics

### Daily Test Metrics
- Tests executed: X/Y
- Pass rate: X%
- P0 failures: X
- Blockers: X

### Weekly Summary
- Feature coverage: X%
- Role coverage: X%
- Device coverage: X%
- Critical issues found: X
- Issues resolved: X

## Continuous Testing

### Regression Testing
- Run P0 tests after each code change
- Full test suite before releases
- Automated smoke tests in CI/CD

### Test Maintenance
- Update test cases for new features
- Review and update expected results
- Maintain test data consistency
- Update browser/device test matrix

## Tools and Resources

### Testing Tools
- **Browser Dev Tools**: For responsive testing
- **Postman/Insomnia**: For API testing
- **BrowserStack**: For cross-browser testing
- **Chrome DevTools**: For performance testing

### Documentation
- API Documentation: `/api/docs`
- Database Schema: `database/init/01-schema.sql`
- Application Architecture: `DOCUMENTATION.md`

## Conclusion

This test execution guide ensures comprehensive coverage of the Flat Expense Management System, prioritizing security and data loss prevention while maintaining thorough functional and user experience testing. Regular execution and maintenance of this test suite will ensure application quality and reliability.
