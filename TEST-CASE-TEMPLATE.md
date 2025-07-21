# Test Case Template

## Test Case Information
- **Test Case ID**: TC-001
- **Feature**: [Feature Name]
- **Module**: [Module Name]
- **Priority**: P0/P1/P2
- **Created By**: [Tester Name]
- **Created Date**: [Date]
- **Last Updated**: [Date]

## Test Environment
- **Browser**: [Chrome/Firefox/Safari/Edge]
- **Device**: [Desktop/Tablet/Mobile]
- **Screen Resolution**: [1920x1080/768x1024/375x667/etc.]
- **OS**: [Windows/macOS/iOS/Android]
- **Application URL**: http://localhost:3000

## Prerequisites
- [ ] Application is running (docker-compose up -d)
- [ ] Test database is initialized
- [ ] Test user accounts are available
- [ ] Required test data is present

## Test Objective
[Brief description of what this test is trying to validate]

## Test Steps
1. [Step 1 description]
2. [Step 2 description]
3. [Step 3 description]
4. [Continue with additional steps...]

## Expected Results
- **After Step 1**: [Expected result]
- **After Step 2**: [Expected result]
- **After Step 3**: [Expected result]
- **Final Result**: [Overall expected outcome]

## Actual Results
- **After Step 1**: [Record actual result]
- **After Step 2**: [Record actual result]
- **After Step 3**: [Record actual result]
- **Final Result**: [Record actual outcome]

## Test Status
- [ ] **Pass** - Test completed successfully
- [ ] **Fail** - Test failed (attach bug report)
- [ ] **Blocked** - Cannot execute (specify reason)
- [ ] **Skipped** - Not applicable (specify reason)

## Bug Information (if applicable)
- **Bug ID**: [BUG-XXX]
- **Severity**: [Critical/High/Medium/Low]
- **Bug Summary**: [Brief description]
- **Ticket Link**: [Link to bug tracking system]

## Attachments
- [ ] Screenshots
- [ ] Video recording
- [ ] Log files
- [ ] Network traces
- [ ] Other evidence

## Notes
[Any additional observations, comments, or relevant information]

---

## Example Test Cases

### TC-AUTH-001: Valid User Login
- **Test Case ID**: TC-AUTH-001
- **Feature**: Authentication
- **Module**: Auth
- **Priority**: P0
- **Browser**: Chrome
- **Device**: Desktop

**Test Objective**: Verify that valid users can successfully log in

**Prerequisites**:
- Application running on localhost:3000
- Default admin user exists (admin@flatmanager.com/admin123)

**Test Steps**:
1. Navigate to http://localhost:3000
2. Enter email: admin@flatmanager.com
3. Enter password: admin123
4. Click "Login" button

**Expected Results**:
- After Step 2: Email field accepts input without validation errors
- After Step 3: Password field shows masked characters
- After Step 4: User is authenticated and redirected to dashboard
- Final Result: User successfully logged in with JWT token stored

**Test Status**: [ ] Pass [ ] Fail [ ] Blocked [ ] Skipped

---

### TC-AUTH-002: Invalid Password Login
- **Test Case ID**: TC-AUTH-002
- **Feature**: Authentication
- **Module**: Auth
- **Priority**: P0
- **Browser**: Chrome
- **Device**: Desktop

**Test Objective**: Verify that login fails with incorrect password

**Test Steps**:
1. Navigate to http://localhost:3000
2. Enter email: admin@flatmanager.com
3. Enter password: wrongpassword
4. Click "Login" button

**Expected Results**:
- After Step 4: Error message displayed "Invalid credentials"
- Final Result: User remains on login page, no authentication token

**Test Status**: [ ] Pass [ ] Fail [ ] Blocked [ ] Skipped

---

### TC-RBAC-001: Super Admin Access
- **Test Case ID**: TC-RBAC-001
- **Feature**: Role-Based Access Control
- **Module**: Auth
- **Priority**: P0
- **Browser**: Chrome
- **Device**: Desktop

**Test Objective**: Verify super admin can access all system features

**Prerequisites**:
- Super admin user logged in
- Multiple buildings exist in system

**Test Steps**:
1. Login as super admin
2. Navigate to Users section
3. Navigate to Buildings section
4. Navigate to Analytics section
5. Attempt to create new building
6. Attempt to approve user

**Expected Results**:
- After Step 2: Can view all users across all buildings
- After Step 3: Can view all buildings in system
- After Step 4: Can view system-wide analytics
- After Step 5: Building creation form is accessible
- After Step 6: User approval controls are available
- Final Result: Full system access confirmed

**Test Status**: [ ] Pass [ ] Fail [ ] Blocked [ ] Skipped

---

### TC-RESP-001: Mobile Dashboard Navigation
- **Test Case ID**: TC-RESP-001
- **Feature**: Responsive Design
- **Module**: Frontend
- **Priority**: P2
- **Browser**: Chrome
- **Device**: Mobile (375px)

**Test Objective**: Verify dashboard is fully functional on mobile devices

**Test Steps**:
1. Open Chrome DevTools
2. Set device simulation to iPhone 6/7/8 (375x667)
3. Navigate to http://localhost:3000
4. Login with valid credentials
5. Navigate through main menu items
6. Test sidebar collapse/expand
7. Try submitting a form (complaint or profile update)

**Expected Results**:
- After Step 4: Dashboard loads with mobile-optimized layout
- After Step 5: All menu items are accessible and clickable
- After Step 6: Sidebar functions properly on mobile
- After Step 7: Forms are usable with proper field sizing
- Final Result: Full functionality maintained on mobile

**Test Status**: [ ] Pass [ ] Fail [ ] Blocked [ ] Skipped

---

### TC-SEC-001: SQL Injection Prevention
- **Test Case ID**: TC-SEC-001
- **Feature**: Input Security
- **Module**: Database/API
- **Priority**: P0
- **Browser**: Chrome
- **Device**: Desktop

**Test Objective**: Verify application prevents SQL injection attacks

**Test Steps**:
1. Navigate to login page
2. Enter email: `admin'; DROP TABLE users; --`
3. Enter any password
4. Click login
5. Check application functionality
6. Verify database integrity

**Expected Results**:
- After Step 4: Login fails with appropriate error message
- After Step 5: Application continues to function normally
- After Step 6: Database tables remain intact
- Final Result: SQL injection attempt blocked safely

**Test Status**: [ ] Pass [ ] Fail [ ] Blocked [ ] Skipped

---

## Test Execution Checklist

### Before Testing
- [ ] Environment setup completed
- [ ] Test data prepared
- [ ] Required tools installed
- [ ] Test cases reviewed
- [ ] Bug tracking system accessible

### During Testing
- [ ] Record actual results for each step
- [ ] Take screenshots for evidence
- [ ] Note any deviations from expected behavior
- [ ] Report bugs immediately for P0 issues
- [ ] Update test matrix with results

### After Testing
- [ ] Test results documented
- [ ] Bug reports filed
- [ ] Test artifacts archived
- [ ] Metrics updated
- [ ] Next test cycle planned

## Notes for Testers
1. Always test P0 security cases first
2. Document every deviation, even minor ones
3. Use consistent browser versions across team
4. Clear browser cache between test cycles
5. Report environment issues immediately
6. Maintain confidentiality of test data
