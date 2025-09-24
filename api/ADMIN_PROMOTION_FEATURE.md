# Admin Promotion Feature

## Overview
New routes have been added to allow administrators to promote regular users to admin status and demote admins back to regular users. This provides a secure way to manage user roles within the system.

## Changes Made

### 1. Added Controller Functions (`controllers/usersController.js`)

#### `promoteToAdmin`
- Promotes a regular user to admin status
- Includes security checks to prevent self-promotion
- Validates user existence and status before promotion
- Logs promotion events for audit purposes

#### `demoteFromAdmin`
- Demotes an admin back to regular user status
- Prevents self-demotion for security
- Validates user existence and current admin status
- Logs demotion events for audit purposes

### 2. Added Routes (`routes/users.js`)

#### `PUT /users/:userId/promote`
- Promotes user to admin (Admin only)
- Comprehensive Swagger documentation included

#### `PUT /users/:userId/demote`
- Demotes admin to user (Admin only)
- Comprehensive Swagger documentation included

## API Usage

### Promote User to Admin
```http
PUT /users/{userId}/promote
Authorization: Bearer <admin_token>
```

#### Example Request
```bash
curl -X PUT \
  'https://api.example.com/users/user-id-123/promote' \
  -H 'Authorization: Bearer your-admin-token' \
  -H 'Content-Type: application/json'
```

#### Success Response
```json
{
  "success": true,
  "message": "User john_doe has been successfully promoted to admin",
  "data": {
    "id": "user-id-123",
    "username": "john_doe",
    "email": "john@example.com",
    "displayName": "John Doe",
    "role": "admin",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-09-24T10:30:00.000Z"
  }
}
```

### Demote Admin to User
```http
PUT /users/{userId}/demote
Authorization: Bearer <admin_token>
```

#### Example Request
```bash
curl -X PUT \
  'https://api.example.com/users/admin-id-456/demote' \
  -H 'Authorization: Bearer your-admin-token' \
  -H 'Content-Type: application/json'
```

#### Success Response
```json
{
  "success": true,
  "message": "Admin jane_admin has been demoted to regular user",
  "data": {
    "id": "admin-id-456",
    "username": "jane_admin",
    "email": "jane@example.com",
    "displayName": "Jane Admin",
    "role": "user",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-09-24T10:30:00.000Z"
  }
}
```

## Error Responses

### User Not Found
```json
{
  "success": false,
  "error": "User not found"
}
```

### User Already Admin
```json
{
  "success": false,
  "error": "User is already an admin"
}
```

### Self-Promotion Attempt
```json
{
  "success": false,
  "error": "You cannot promote yourself to admin"
}
```

### Inactive User
```json
{
  "success": false,
  "error": "Cannot promote inactive user to admin"
}
```

### User Not Admin (for demotion)
```json
{
  "success": false,
  "error": "User is not an admin"
}
```

### Self-Demotion Attempt
```json
{
  "success": false,
  "error": "You cannot demote yourself from admin"
}
```

## Security Features

### Authentication & Authorization
- **Admin Only**: Both endpoints require admin authentication
- **No Self-Actions**: Users cannot promote/demote themselves
- **Active Users Only**: Only active users can be promoted to admin

### Audit Logging
- All promotion/demotion events are logged to console with:
  - Target user information (username and ID)
  - Acting admin information (username and ID)
  - Timestamp of the action
  - Type of action (promotion/demotion)

### Validation
- **User Existence**: Validates that the target user exists
- **Current Role**: Checks current role before making changes
- **Status Check**: Ensures user is active before promotion

## Use Cases

### Typical Workflow
1. **New Moderator**: Promote trusted community member to admin
2. **Role Change**: Admin steps down, demote to regular user
3. **Temporary Admin**: Promote for specific event, then demote
4. **Account Recovery**: Restore admin access to legitimate admin

### Security Considerations
- **Principle of Least Privilege**: Only admins can modify roles
- **Prevention of Privilege Escalation**: No self-promotion allowed
- **Audit Trail**: All role changes are logged for accountability
- **Reversible Actions**: Both promote and demote operations available

## Database Impact
- **Role Field**: Updates the `role` field in the `users` table
- **Atomic Operations**: Uses Prisma's update operation for consistency
- **No Side Effects**: No other user data is modified during role changes

## Integration
This feature integrates with:
- **Authentication System**: Uses existing JWT token validation
- **Authorization Middleware**: Leverages existing admin role checks
- **User Management**: Works with existing user CRUD operations
- **Audit System**: Provides logging for security monitoring
