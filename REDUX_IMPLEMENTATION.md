# Redux Implementation for User State Management with Flexible Role-Based Access Control

## Overview

This document describes the Redux implementation for managing user state and flexible role-based access control throughout the Smartmove WorkOS application. The implementation eliminates the need to fetch user data repeatedly, provides a centralized state management solution, and includes comprehensive role and permission management with support for any role or permission combination.

## Architecture

### Store Structure

```
store/
├── index.ts              # Main store configuration
├── provider.tsx          # Redux provider component
├── hooks.ts              # Typed Redux hooks
├── hooks/
│   ├── useAuth.ts        # Authentication hook
│   ├── useLogin.ts       # Login functionality hook
│   └── useRoleAccess.ts  # Role-based access control hook
└── slices/
    └── userSlice.ts      # User state slice

app/shared-ui/
├── lib/utils/supabase/
│   ├── profiles.ts       # User profile management
│   ├── roles.ts          # Role and permission management
│   └── client.ts         # Supabase client
└── components/
    ├── role-protection.tsx    # Flexible role-based access control components
    └── user-info-display.tsx  # User information display
```

## Components

### 1. User Slice (`store/slices/userSlice.ts`)

The user slice manages all user-related state including:

- **Authentication State**: `isAuthenticated`, `isLoading`, `error`
- **User Data**: Basic user information from Supabase auth
- **User Profile**: Extended profile data including username, avatar, roles, etc.
- **User Roles & Permissions**: Role-based access control data
- **SM Rewards Balance**: User's reward points balance
- **Loading States**: Separate loading states for different data types
- **Error States**: Error handling for different operations

#### Key Features:

- **Async Thunks**: Handle API calls for authentication, profile fetching, and balance updates
- **Optimistic Updates**: Local state updates for better UX
- **Error Handling**: Comprehensive error management
- **Type Safety**: Full TypeScript support with proper typing
- **Smart Object Comparison**: Prevents unnecessary re-renders by comparing key properties

#### Actions:

- `checkAuthStatus`: Verify user authentication
- `fetchUserProfile`: Get user profile data
- `fetchUserRoles`: Get user roles and permissions
- `fetchSMRewardsBalance`: Get SM rewards balance
- `signOut`: Handle user logout
- `updateUserProfile`: Update profile locally
- `updateUserRoles`: Update roles locally
- `updateSMRewardsBalance`: Update balance locally
- `clearError`: Clear error states
- `resetUserState`: Reset all user state (for logout)

### 2. Store Configuration (`store/index.ts`)

Configures the Redux store with:

- User reducer
- Redux DevTools integration (development only)
- TypeScript type exports

### 3. Provider (`store/provider.tsx`)

Wraps the application with Redux Provider to make the store available throughout the component tree.

### 4. Typed Hooks (`store/hooks.ts`)

Provides typed versions of `useDispatch` and `useSelector` for better TypeScript support.

### 5. Authentication Hook (`store/hooks/useAuth.ts`)

A comprehensive hook that:

- Automatically checks authentication status on mount
- Fetches user profile when authenticated
- Fetches user roles and permissions when profile is loaded
- Fetches SM rewards balance when profile is loaded
- Provides all user state and actions
- Handles automatic data refresh

#### Key Features:

- **Simplified Logic**: Clean, straightforward useEffect dependencies
- **Smart Fetching**: Only fetches data when needed and not already loading
- **Console Logging**: Detailed logs for debugging fetch operations
- **Refresh Functions**: Manual refresh capabilities for all data types
- **Error Handling**: Comprehensive error state management

#### Data Flow:

```typescript
// 1. Check authentication on mount
useEffect(() => {
  if (!isAuthenticated) {
    dispatch(checkAuthStatus())
  }
}, [dispatch])

// 2. Fetch profile when authenticated
useEffect(() => {
  if (isAuthenticated && user?.id && !profile?.id && !profileLoading) {
    dispatch(fetchUserProfile())
  }
}, [isAuthenticated, user?.id, profile?.id, profileLoading])

// 3. Fetch roles when profile is loaded
useEffect(() => {
  if (profile?.id && roles.length === 0 && !rolesLoading) {
    dispatch(fetchUserRoles())
  }
}, [profile?.id, roles.length, rolesLoading])

// 4. Fetch SM rewards when profile is loaded
useEffect(() => {
  if (profile?.id && smRewardsBalance === 0 && !smRewardsLoading) {
    dispatch(fetchSMRewardsBalance())
  }
}, [profile?.id, smRewardsBalance, smRewardsLoading])
```

### 6. Role Access Hook (`store/hooks/useRoleAccess.ts`)

A specialized hook for flexible role-based access control that provides:

- Role checking methods (`hasRole`, `hasAnyRole`, `hasAllRoles`)
- Permission checking methods (`hasPermission`, `hasAnyPermission`, `hasAllPermissions`)
- Specific role checks (`isAdmin`, `isManager`, `isHRManager`, etc.)
- Permission-based checks (`canManageUsers`, `canViewReports`, etc.)
- Utility methods for getting current roles and permissions

### 7. Login Hook (`store/hooks/useLogin.ts`)

Encapsulates login functionality with:

- Form validation
- Supabase authentication
- Redux state updates
- Error handling
- Loading states

### 8. Role Management Service (`app/shared-ui/lib/utils/supabase/roles.ts`)

Comprehensive service for role and permission management:

- **System Roles**: Predefined roles (admin, manager, employee, etc.)
- **Role Permissions**: Granular permission system
- **CRUD Operations**: Full role management capabilities
- **Permission Checking**: Methods to verify user permissions
- **Role Assignment**: Admin tools for role management

### 9. Flexible Role Protection Components (`app/shared-ui/components/role-protection.tsx`)

Comprehensive React components for implementing flexible role-based access control:

#### Core Component:
- `RoleProtection`: Generic component for any role/permission combination with full customization

#### Role-Based Convenience Components:
- `AdminOnly`, `ManagerOnly`, `HRManagerOnly`, `ITAdminOnly`, `FinanceManagerOnly`, `DepartmentHeadOnly`, `AuthenticatedOnly`

#### Permission-Based Convenience Components:
- `CanManageUsers`, `CanManageRoles`, `CanViewReports`, `CanManageReports`, `CanManageSystem`

#### Features:
- Multiple roles with flexible matching (any/all)
- Multiple permissions with flexible matching (any/all)
- Custom access functions for complex logic
- Customizable messages and fallbacks
- Loading states and error handling

## Usage Examples

### Basic Usage in Components

```tsx
import { useAuth } from '@/store/hooks/useAuth'

function MyComponent() {
  const { 
    user, 
    isAuthenticated, 
    profile, 
    roles,
    permissions,
    smRewardsBalance,
    signOut 
  } = useAuth()

  if (!isAuthenticated) {
    return <div>Please log in</div>
  }

  return (
    <div>
      <h1>Welcome, {profile?.username || user?.email}</h1>
      <p>Roles: {roles.join(', ')}</p>
      <p>Balance: {smRewardsBalance} points</p>
      <button onClick={signOut}>Logout</button>
    </div>
  )
}
```

### Role-Based Access Control

```tsx
import { useRoleAccess } from '@/store/hooks/useRoleAccess'
import { RoleProtection, AdminOnly, CanManageUsers } from '@/app/shared-ui/components/role-protection'

function MyComponent() {
  const { isAdmin, canManageUsers, hasPermission } = useRoleAccess()

  return (
    <div>
      {/* Using the hook directly */}
      {isAdmin() && <AdminPanel />}
      
      {/* Using convenience components */}
      <AdminOnly fallback={<AccessDenied />}>
        <AdminPanel />
      </AdminOnly>
      
      <CanManageUsers fallback={<AccessDenied />}>
        <UserManagement />
      </CanManageUsers>
      
      {/* Using the main component */}
      <RoleProtection 
        requiredRoles={['manager', 'admin']}
        requiredPermissions={['reports:read']}
        fallback={<AccessDenied />}
      >
        <ReportsSection />
      </RoleProtection>
    </div>
  )
}
```

### Login Implementation

```tsx
import { useLogin } from '@/store/hooks/useLogin'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { isLoading, errors, handleLogin } = useLogin()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleLogin({ email, password })
  }

  return (
    <form onSubmit={onSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
      {errors && <div className="error">{errors}</div>}
    </form>
  )
}
```

## Integration with Existing Components

### Updated Components

1. **User Profile Dropdown** (`app/shared-ui/components/auth/user-profile-dropdown.tsx`)
   - Now uses Redux for user data and logout functionality
   - Displays user avatar and username from Redux state

2. **Login Page** (`app/login/page.tsx`)
   - Uses Redux-based login hook
   - Automatically updates Redux state after successful login

3. **SM Rewards Page** (`app/(dashboard)/sm-rewards/page.tsx`)
   - Uses Redux for SM rewards balance
   - Eliminates local state management for balance
   - Automatic balance refresh after transactions
   - Uses Redux for current user profile data
   - Maintains direct service calls for balance modifications (write operations)

4. **Admin Users Page** (`app/admin/users/page.tsx`)
   - Protected with flexible role-based access control
   - Displays user roles in the interface
   - Shows access denied for unauthorized users
   - Uses `CanManageUsers` component for protection

5. **User Info Display** (`app/shared-ui/components/user-info-display.tsx`)
   - Enhanced to show user roles
   - Displays role badges and permissions

6. **Root Layout** (`app/layout.tsx`)
   - Wrapped with Redux Provider
   - Makes store available to all components

7. **Admin Layout** (`app/admin/layout.tsx`)
   - Protected with `AdminOnly` component
   - Ensures only admin users can access admin routes
   - Shows appropriate loading and error states

8. **Debug Page** (`app/debug/page.tsx`)
   - Enhanced with admin access testing
   - Shows authentication and role state
   - Includes render counter for debugging

9. **Logout Button** (`app/shared-ui/components/auth/logout-button.tsx`)
   - Now uses Redux `signOut` action
   - Removed direct Supabase client usage

10. **Timekeeping Page** (`app/(dashboard)/hrm/timekeeping/page.tsx`)
    - Uses Redux for user authentication data
    - Removed direct `supabase.auth.getUser()` call
    - Maintains direct service calls for timekeeping operations

11. **Meeting Booking Page** (`app/(dashboard)/hrm/meeting-booking/page.tsx`)
    - Uses Redux for user authentication data
    - Removed direct `supabase.auth.getUser()` call
    - Removed local user state management
    - Maintains direct service calls for meeting operations

## Migration Summary

### ✅ **Completed Migrations**

1. **User Authentication Data**
   - All components now use `useAuth()` hook for user data
   - Removed direct `supabase.auth.getUser()` calls from components
   - Centralized authentication state management

2. **User Profile Data**
   - Components use Redux state for current user profile
   - Eliminated redundant profile fetching
   - Smart caching prevents unnecessary API calls

3. **SM Rewards Balance**
   - Components use Redux state for balance display
   - Automatic balance refresh after transactions
   - Maintained direct service calls for balance modifications

4. **Logout Functionality**
   - All logout operations use Redux `signOut` action
   - Consistent logout behavior across the application

5. **Role and Permission Data**
   - Components use Redux state for roles and permissions
   - Eliminated redundant role fetching
   - Centralized role-based access control

### 🔄 **Maintained Direct Service Calls**

The following operations still use direct service calls as they are write operations or fetch data for other users:

1. **Balance Modifications** (`profilesService.addSMRewards`, `profilesService.deductSMRewards`)
   - These are write operations that modify the database
   - Redux state is updated after successful operations

2. **Transfer Profile Fetching** (`profilesService.getProfilesForTransfer`)
   - Fetches other users' profiles for transfer functionality
   - Not current user data, so not cached in Redux

3. **Database Operations** (timekeeping, meeting booking, transactions)
   - These are application-specific operations
   - Not user authentication/profile data

4. **Service Layer** (profiles.ts, roles.ts, transactions.ts, etc.)
   - These files contain the actual API calls
   - Redux uses these services for data fetching

### 📁 **Files Updated**

1. **Components Updated:**
   - `app/(dashboard)/sm-rewards/page.tsx`
   - `app/shared-ui/components/auth/logout-button.tsx`
   - `app/(dashboard)/hrm/timekeeping/page.tsx`
   - `app/(dashboard)/hrm/meeting-booking/page.tsx`

2. **Files Already Using Redux:**
   - `app/shared-ui/components/auth/user-profile-dropdown.tsx`
   - `app/login/page.tsx`
   - `app/admin/users/page.tsx`
   - `app/shared-ui/components/user-info-display.tsx`
   - `app/layout.tsx`
   - `app/admin/layout.tsx`

3. **Service Files (Unchanged):**
   - `app/shared-ui/lib/utils/supabase/profiles.ts`
   - `app/shared-ui/lib/utils/supabase/roles.ts`
   - `app/shared-ui/lib/utils/supabase/transactions.ts`
   - `app/shared-ui/lib/utils/supabase/canteen-products.ts`

## Benefits

### 1. Performance Improvements

- **Eliminates Redundant API Calls**: User data is fetched once and cached in Redux
- **Reduced Network Requests**: Components share the same data source
- **Faster Component Rendering**: No loading states for already-fetched data
- **Smart Object Comparison**: Prevents unnecessary re-renders

### 2. Better User Experience

- **Consistent State**: All components show the same user information
- **Real-time Updates**: Changes in one component reflect everywhere
- **Persistent State**: User data persists across component unmounts/remounts
- **Smooth Loading**: Intelligent loading states prevent UI flicker

### 3. Developer Experience

- **Centralized State Management**: Single source of truth for user data
- **Type Safety**: Full TypeScript support with proper typing
- **Debugging**: Redux DevTools for state inspection
- **Predictable State Updates**: Clear action/reducer pattern
- **Flexible Role-Based Access Control**: Easy implementation of any role/permission combination
- **Reusable Components**: Pre-built components for common access patterns
- **Custom Access Logic**: Support for complex access requirements
- **Simplified Logic**: Clean, maintainable useEffect dependencies

### 4. Maintainability

- **Separation of Concerns**: UI logic separated from data fetching
- **Reusable Logic**: Hooks can be used across multiple components
- **Easy Testing**: Redux actions and reducers are easily testable
- **Clear Data Flow**: Predictable state updates and data fetching

## State Flow

```
Component Mount
    ↓
useAuth Hook
    ↓
checkAuthStatus (Redux Thunk)
    ↓
If Authenticated → fetchUserProfile → fetchUserRoles → fetchSMRewardsBalance
    ↓
State Updated in Redux Store
    ↓
Components Re-render with New Data
    ↓
Flexible Role-Based Access Control Applied
```

## Error Handling

The implementation includes comprehensive error handling:

- **Network Errors**: Graceful fallbacks for API failures
- **Authentication Errors**: Clear error messages for login issues
- **Loading States**: Proper loading indicators during data fetching
- **Error Recovery**: Ability to retry failed operations
- **Console Logging**: Detailed logs for debugging

## Testing and Examples

### Role Examples Page (`/role-examples`)

A comprehensive demonstration page that showcases all protection options:

- **Current User Information**: Displays user details, roles, and permissions
- **Role-Based Protection Examples**: All role-based components in action
- **Permission-Based Protection Examples**: All permission-based components in action
- **Custom Protection Examples**: Custom access functions and fallbacks
- **Usage Instructions**: Code examples and best practices

### Debug Page (`/debug`)

Enhanced debugging tools for development:

- **Authentication State**: Real-time auth status and user data
- **Role Information**: Current roles and permissions
- **Admin Access Testing**: Test admin panel access
- **Render Counter**: Monitor component re-renders
- **Console Logging**: Detailed fetch operation logs

## Future Enhancements

1. **Persistence**: Add Redux Persist for offline support
2. **Real-time Updates**: WebSocket integration for live data updates
3. **Caching**: Implement smart caching strategies
4. **Optimistic Updates**: More optimistic updates for better UX
5. **Middleware**: Add custom middleware for logging, analytics, etc.
6. **Advanced Role Management**: Role hierarchy and inheritance
7. **Dynamic Permissions**: Runtime permission updates
8. **Audit Logging**: Track role and permission changes
9. **Role Templates**: Predefined role configurations
10. **Resource-Level Permissions**: Granular resource access control
11. **Multi-Tenant Support**: Organization-level role management
12. **Time-Based Access**: Working hours and schedule-based access
13. **Permission Groups**: Group permissions for easier management

## Migration Guide

### From Local State to Redux

1. **Replace direct API calls** with Redux state
2. **Use useAuth hook** instead of local state management
3. **Remove loading states** for user data (handled by Redux)
4. **Update error handling** to use Redux error states

### Example Migration

**Before:**
```tsx
const [user, setUser] = useState(null)
const [loading, setLoading] = useState(true)

useEffect(() => {
  fetchUser().then(setUser).finally(() => setLoading(false))
}, [])
```

**After:**
```tsx
const { user, isLoading } = useAuth()
```

### From Old Role-Based Access to Flexible System

#### Before (Old System)
```tsx
import { AdminProtection } from '@/app/shared-ui/components/admin-protection'
import { RoleBasedAccess, CanManageUsers } from '@/app/shared-ui/components/role-based-access'

<AdminProtection>
  <div>Admin content</div>
</AdminProtection>

<RoleBasedAccess requiredRoles={['admin']}>
  <div>Admin content</div>
</RoleBasedAccess>
```

#### After (Flexible System)
```tsx
import { AdminOnly, CanManageUsers, RoleProtection } from '@/app/shared-ui/components/role-protection'

<AdminOnly>
  <div>Admin content</div>
</AdminOnly>

<RoleProtection requiredRoles={['admin']}>
  <div>Admin content</div>
</RoleProtection>
```

#### New Capabilities
```tsx
// Multiple roles (any)
<RoleProtection requiredRoles={['admin', 'manager']} requireAllRoles={false}>
  <div>Admin or manager content</div>
</RoleProtection>

// Multiple roles (all)
<RoleProtection requiredRoles={['admin', 'manager']} requireAllRoles={true}>
  <div>Admin AND manager content</div>
</RoleProtection>

// Custom access function
<RoleProtection customAccessCheck={() => hasRole('admin') && hasPermission('system:admin')}>
  <div>Complex protected content</div>
</RoleProtection>

// Custom fallback
<RoleProtection 
  requiredRoles={['admin']}
  fallback={<CustomAccessDeniedComponent />}
  accessDeniedMessage="Custom message"
>
  <div>Admin content</div>
</RoleProtection>
```

## Conclusion

This Redux implementation provides a robust, scalable solution for user state management with simplified logic and enhanced performance. It eliminates redundant API calls, improves performance, and provides a better developer experience while maintaining type safety and comprehensive error handling. The flexible role-based access control system supports any role or permission combination, making it suitable for complex enterprise applications.

The migration has been completed successfully, with all user-related and profile-related database fetching now using the Redux hooks. The implementation maintains a clear separation between read operations (handled by Redux) and write operations (handled by direct service calls), ensuring optimal performance and data consistency. 