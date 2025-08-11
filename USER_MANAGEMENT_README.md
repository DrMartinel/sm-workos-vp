# User Management Feature

This document describes the implementation of the user management feature for the SM WorkOS application.

## Overview

The user management feature allows administrators to create, edit, and delete users with specific roles and permissions. The feature includes:

- **User Creation**: Create new users with email, password, username, and roles
- **User Editing**: Update existing user information and roles
- **User Deletion**: Remove users from the system
- **Role Management**: Assign and manage user roles using the predefined system roles

## Features Implemented

### 1. User Creation
- **Form Fields**: Username, Email, Password, Confirm Password, Roles
- **Validation**: 
  - Username is required
  - Email is required and must be valid
  - Password must be at least 6 characters
  - Passwords must match
  - At least one role must be selected
- **Security**: Passwords are hidden by default with toggle visibility
- **Roles**: Uses predefined system roles from `app/shared-ui/lib/utils/supabase/roles.ts`

### 2. User Editing
- **Editable Fields**: Username and Roles
- **Validation**: Username is required, at least one role must be selected
- **Real-time Updates**: Changes are reflected immediately in the UI

### 3. User Deletion
- **Confirmation Dialog**: Prevents accidental deletions
- **Complete Removal**: Deletes both auth user and profile data

### 4. User Listing
- **Search**: Filter users by name or email
- **Status Filter**: Filter by active/inactive status
- **Role Filter**: Filter by specific roles
- **Real-time Stats**: Dynamic statistics based on current user data

## Technical Implementation

### Backend Components

#### 1. API Routes (`app/api/admin/users/route.ts`)
- **POST**: Create new user with auth and profile
- **PUT**: Update existing user profile
- **DELETE**: Remove user and profile
- **Security**: Protected by middleware with admin role verification

#### 2. Admin Client (`app/shared-ui/lib/utils/supabase/admin.ts`)
- Uses Supabase service role key for admin operations
- Handles user creation and deletion in auth system
- Manages profile data in database

#### 3. Profiles Service (`app/shared-ui/lib/utils/supabase/profiles.ts`)
- Updated with new admin operations
- Uses API routes for secure client-side operations
- Maintains existing functionality for non-admin operations

### Frontend Components

#### 1. Admin Users Page (`app/admin/users/page.tsx`)
- Complete rewrite with full CRUD functionality
- Modern UI with proper form handling
- Real-time data loading and updates
- Role-based access control using `CanManageUsers` component

#### 2. Form Components
- **Create User Modal**: Comprehensive form with validation
- **Edit User Modal**: Streamlined editing interface
- **Delete Confirmation**: Safe deletion with confirmation

### Security Features

#### 1. Middleware Protection (`middleware.ts`)
- Admin API routes require admin role
- Automatic permission checking
- Secure error handling

#### 2. Role-Based Access Control
- Uses existing role protection system
- Admin-only access to user management
- Proper permission validation

## System Roles

The feature uses the predefined system roles from `app/shared-ui/lib/utils/supabase/roles.ts`:

- **ADMIN**: Full system access
- **MANAGER**: User and team management
- **EMPLOYEE**: Basic user permissions
- **GUEST**: Limited read access
- **HR_MANAGER**: HR-specific permissions
- **IT_ADMIN**: IT system management
- **FINANCE_MANAGER**: Financial data access
- **DEPARTMENT_HEAD**: Department management

## Usage

### For Administrators

1. **Access**: Navigate to `/admin/users` (requires admin role)
2. **Create User**: Click "Add User" button and fill out the form
3. **Edit User**: Use the dropdown menu on any user row and select "Edit"
4. **Delete User**: Use the dropdown menu and select "Delete" (with confirmation)

### Form Guidelines

- **Username**: Should be unique and descriptive
- **Email**: Must be a valid email format
- **Password**: Minimum 6 characters, will be hidden by default
- **Roles**: Select one or more roles based on user responsibilities

## Error Handling

- **Validation Errors**: Displayed as toast notifications
- **Network Errors**: Graceful error handling with user feedback
- **Permission Errors**: Clear access denied messages
- **Database Errors**: Proper error logging and user notification

## Future Enhancements

Potential improvements for the user management feature:

1. **Bulk Operations**: Create/edit/delete multiple users at once
2. **User Import**: CSV/Excel import functionality
3. **Advanced Filtering**: More sophisticated search and filter options
4. **User Activity**: Track user login and activity history
5. **Password Policies**: Configurable password requirements
6. **Email Notifications**: Welcome emails and role change notifications
7. **Audit Log**: Track all user management actions

## Dependencies

- **Supabase**: Authentication and database
- **Next.js**: API routes and middleware
- **React Hook Form**: Form handling (if needed)
- **Toast Notifications**: User feedback
- **Role Protection**: Access control components

## Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Database Schema

The feature works with the existing `profiles` table:

```sql
profiles (
  id UUID PRIMARY KEY,
  username TEXT,
  avatar_url TEXT,
  sm_rewards_balance INTEGER DEFAULT 0,
  role TEXT[] DEFAULT '{}',
  updated_at TIMESTAMP
)
```

## Testing

To test the user management feature:

1. Ensure you have admin role permissions
2. Navigate to the admin users page
3. Try creating a new user with different role combinations
4. Test editing existing users
5. Verify deletion works with confirmation
6. Test search and filter functionality

## Troubleshooting

Common issues and solutions:

1. **Permission Denied**: Ensure user has admin role
2. **API Errors**: Check environment variables and Supabase configuration
3. **Form Validation**: Verify all required fields are filled
4. **Network Issues**: Check internet connection and API endpoint availability 