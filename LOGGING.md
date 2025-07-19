# Logging System Documentation

## Overview

The Flat Expense Management Application uses a comprehensive logging system built with Winston to track all application events, debug issues, and monitor system performance. This logging system provides structured, configurable, and searchable logs for development, debugging, and production monitoring.

## Log Levels

The application uses the following log levels (in order of severity):

1. **error** - Error conditions that need immediate attention
2. **warn** - Warning conditions that should be monitored
3. **info** - General application information
4. **http** - HTTP request/response logging
5. **debug** - Detailed debug information (development only)

## Log Files

All logs are stored in the `backend/logs/` directory:

- **`error.log`** - Contains only error-level logs
- **`combined.log`** - Contains all log levels
- **`access.log`** - Contains HTTP request/response logs
- **Console** - Development environment displays colored logs

## Log Format

Each log entry includes:
- **Timestamp** - ISO format timestamp
- **Level** - Log level (ERROR, WARN, INFO, etc.)
- **Message** - Descriptive log message
- **Metadata** - Additional structured data (JSON format)
- **Stack Trace** - For errors, includes full stack trace

### Example Log Entry
```
2025-07-19 23:13:15 [INFO]: [AUTH] Login attempt | Meta: {"email":"user@example.com"}
2025-07-19 23:13:15 [INFO]: [DATABASE] DB_SELECT: users - SUCCESS | Meta: {"operation":"SELECT","table":"users","success":true,"timestamp":"2025-07-19T17:43:15.123Z"}
```

## Logging Categories

### 1. Authentication Logging (`[AUTH]`)
Tracks all authentication-related events:
- User registration attempts
- Login/logout events
- Password changes
- Token validation
- Session management

**Example Usage:**
```typescript
logger.auth('User login attempt', { email, userId });
logAuthEvent('Login successful', userId, email, true, { role: 'resident' });
```

### 2. Database Logging (`[DATABASE]`)
Monitors all database operations:
- Query execution
- Connection issues
- Transaction status
- Performance metrics

**Example Usage:**
```typescript
logger.db('Database connection established');
logDatabaseOperation('INSERT', 'users', true, { userId: 123 });
```

### 3. API Logging (`[API]`)
Tracks API requests and responses:
- Request details (method, URL, headers)
- Response status codes
- Response times
- User context

**Example Usage:**
```typescript
logger.api('User profile updated successfully');
logger.logRequest(req, res, responseTime);
```

### 4. Business Logic Logging (`[BUSINESS]`)
Records business operations:
- User management actions
- Bill creation/updates
- Building assignments
- Complaint handling

**Example Usage:**
```typescript
logBusinessOperation('CREATE', 'bill', billId, userId, { amount: 1000 });
```

### 5. Security Logging (`[SECURITY]`)
Monitors security-related events:
- Failed login attempts
- Suspicious activities
- Permission violations
- Rate limiting triggers

**Example Usage:**
```typescript
logSecurityEvent('Multiple failed login attempts', 'medium', { 
  email, 
  attempts: 5, 
  ip: req.ip 
});
```

### 6. Performance Logging (`[PERFORMANCE]`)
Tracks application performance:
- Slow operations
- Response times
- Resource usage
- Bottlenecks

**Example Usage:**
```typescript
logPerformance('Database query', duration, 1000, { query: 'SELECT * FROM users' });
```

### 7. System Events (`[SYSTEM]`)
Records system-level events:
- Server startup/shutdown
- Configuration changes
- Service health
- Error conditions

**Example Usage:**
```typescript
logger.system('Server starting up', { port: 3001, env: 'production' });
```

## Automated Logging

### HTTP Request Logging
All HTTP requests are automatically logged with:
- Request method and URL
- Client IP address
- User agent
- User context (if authenticated)
- Response status code
- Response time

### Error Logging
All errors are automatically captured with:
- Error message and stack trace
- Request context
- User information
- Timestamp

### Request Body Logging
POST/PUT requests automatically log sanitized request bodies:
- Sensitive fields (passwords) are automatically removed
- Large payloads are truncated
- Binary data is excluded

## Environment Configuration

### Development Environment
- **Console Logging**: Enabled with colors
- **Log Level**: `debug` (shows all logs)
- **File Logging**: Enabled
- **Pretty Formatting**: Human-readable format

### Production Environment
- **Console Logging**: Disabled
- **Log Level**: `info` (hides debug logs)
- **File Logging**: Enabled with rotation
- **JSON Formatting**: Machine-readable format

### Environment Variables
```env
LOG_LEVEL=info              # Minimum log level to record
NODE_ENV=production         # Environment type
```

## Log Rotation

Logs are automatically rotated to prevent disk space issues:
- **Max File Size**: 5MB per log file
- **Max Files**: 5 files retained per log type
- **Rotation**: Automatic when size limit reached

## Searching and Analysis

### Log File Analysis
```bash
# Search for specific user activities
grep "userId:123" logs/combined.log

# Find all authentication events
grep "\[AUTH\]" logs/combined.log

# Look for errors in the last hour
grep "$(date -d '1 hour ago' '+%Y-%m-%d %H')" logs/error.log

# Count API requests by endpoint
grep "GET /api" logs/access.log | wc -l
```

### Performance Analysis
```bash
# Find slow operations
grep "SLOW_OPERATION" logs/combined.log

# Database performance issues
grep "\[DATABASE\].*FAILED" logs/combined.log

# Response time analysis
grep "responseTime" logs/access.log
```

## Best Practices

### 1. Use Appropriate Log Levels
- **error**: Only for actual errors that need attention
- **warn**: For potential issues that should be monitored
- **info**: For important application events
- **debug**: For detailed debugging information

### 2. Include Relevant Context
Always include relevant metadata:
```typescript
// Good
logger.auth('Login failed', { email, reason: 'invalid_password', ip: req.ip });

// Bad
logger.auth('Login failed');
```

### 3. Sensitive Data Protection
Never log sensitive information:
```typescript
// Good
logger.auth('Password change attempt', { userId, success: true });

// Bad - Never do this
logger.auth('Password change', { userId, oldPassword, newPassword });
```

### 4. Structured Logging
Use consistent metadata structure:
```typescript
logger.business('Bill created', billId, userId, {
  amount: bill.amount,
  buildingId: bill.buildingId,
  dueDate: bill.dueDate
});
```

## Monitoring and Alerts

### Error Monitoring
Monitor error logs for:
- Database connection failures
- Authentication issues
- API endpoint failures
- Security violations

### Performance Monitoring
Track performance metrics:
- Average response times
- Slow database queries
- Memory usage patterns
- Error rates

### Security Monitoring
Watch for security events:
- Multiple failed login attempts
- Suspicious user activities
- Permission violations
- Unusual access patterns

## Development Debugging

### Enable Debug Logging
```bash
# Set environment variable
export LOG_LEVEL=debug

# Or in .env file
LOG_LEVEL=debug
```

### Real-time Log Monitoring
```bash
# Watch all logs
tail -f logs/combined.log

# Watch only errors
tail -f logs/error.log

# Watch HTTP requests
tail -f logs/access.log
```

### Filtering Logs
```bash
# Filter by user
grep "userId:123" logs/combined.log

# Filter by API endpoint
grep "GET /api/users" logs/access.log

# Filter by error type
grep "ValidationError" logs/error.log
```

## Integration with External Services

### Log Aggregation
For production deployments, consider integrating with:
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Fluentd** for log collection
- **Grafana** for visualization
- **Prometheus** for metrics

### Alerting
Set up alerts for:
- High error rates
- Slow response times
- Security events
- System failures

## Troubleshooting Common Issues

### 1. Log Files Not Created
- Check file permissions
- Ensure logs directory exists
- Verify disk space

### 2. Performance Issues
- Review log rotation settings
- Check log level configuration
- Monitor disk I/O

### 3. Missing Log Entries
- Verify log level settings
- Check for console vs file logging
- Ensure logger is properly imported

## Example Implementation

### Adding Logging to New Routes
```typescript
import logger from '../utils/logger';
import { logSuccess, logBusinessOperation } from '../middleware/loggingMiddleware';

router.post('/bills', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    logger.api('Bill creation request received', { 
      userId: req.user?.id,
      buildingId: req.body.buildingId 
    });

    // Create bill logic here...
    
    logBusinessOperation('CREATE', 'bill', newBill.id, req.user!.id, {
      amount: newBill.amount,
      buildingId: newBill.buildingId
    });

    logSuccess(req, res, 'Bill created successfully', { billId: newBill.id });

    res.status(201).json({ success: true, data: newBill });
  } catch (error) {
    logger.logError(error as Error, 'BILL_CREATION_ERROR', {
      userId: req.user?.id,
      requestData: req.body
    });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});
```

## Maintenance

### Regular Tasks
1. **Monitor Log Files**: Check file sizes and rotation
2. **Review Error Logs**: Daily review of error patterns
3. **Performance Analysis**: Weekly performance log review
4. **Security Audit**: Regular security log analysis
5. **Cleanup**: Remove old log files as needed

### Log Retention Policy
- **Development**: 7 days
- **Staging**: 30 days
- **Production**: 90 days (or as required by compliance)

---

This comprehensive logging system provides complete visibility into the application's behavior, making debugging and monitoring much more effective.
