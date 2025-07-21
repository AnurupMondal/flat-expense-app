# [SECURITY] Logout Endpoint Allows Unauthenticated Requests

**Labels:** `auth`, `security`, `medium`

## Problem Description
The `/auth/logout` endpoint accepts requests without authentication, which could lead to security inconsistencies and doesn't follow authentication best practices.

## Current Behavior
- `POST /auth/logout` returns success even without Authorization header
- No token validation is performed before logout
- Response: `{"success":true,"message":"Logout successful"}`

## Expected Behavior
- Logout should require valid authentication token
- Invalid/missing tokens should return 401 Unauthorized
- Only authenticated users should be able to logout

## Security Implications
- **Low severity**: Doesn't expose sensitive data
- **Inconsistency**: Other endpoints properly require authentication
- **Best practices**: Logout should validate session before termination

## Code Analysis
In `backend/src/routes/auth.ts`, lines 247-272:
```typescript
router.post("/logout", async (req, res) => {
  // No authentication middleware applied
  // Optional token handling only
```

## Proposed Solution
1. Add authentication middleware to logout route:
   ```typescript
   router.post("/logout", authenticate, async (req, res) => {
   ```
2. Ensure proper token validation before logout
3. Return appropriate error for unauthenticated requests

## Testing
```bash
# Currently succeeds (should fail)
curl -X POST http://localhost:3001/api/auth/logout

# Should only work with valid token
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer valid-jwt-token"
```

## Priority: Medium
Non-critical security issue that should be addressed for consistency.
