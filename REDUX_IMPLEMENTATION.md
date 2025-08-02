# Redux Implementation for User State Management with Role-Based Access Control

## Overview

This document describes the Redux implementation for managing user state and role-based access control throughout the Smartmove WorkOS application. The implementation eliminates the need to fetch user data repeatedly, provides a centralized state management solution, and includes comprehensive role and permission management.

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
    ├── role-based-access.tsx  # Role-based access control components
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

### 6. Role Access Hook (`store/hooks/useRoleAccess.ts`)

A specialized hook for role-based access control that provides:

- Role checking methods (`hasRole`, `hasAnyRole`, `hasAllRoles`)
- Permission checking methods (`hasPermission`, `hasAnyPermission`, `hasAllPermissions`)
- Specific role checks (`isAdmin`, `isManager`, `isHRManager`, etc.)
- Specific permission checks (`canManageUsers`, `canViewReports`, etc.)
- Data access methods for roles and permissions

### 7. Login Hook (`store/hooks/useLogin.ts`)

Handles login functionality with:

- Form validation
- Supabase authentication
- Redux state updates after successful login
- Error handling and user feedback

### 8. Role Management Service (`app/shared-ui/lib/utils/supabase/roles.ts`)

Comprehensive role and permission management service that provides:

- **System Roles**: Predefined roles (admin, manager, employee, etc.)
- **Role Permissions**: Granular permission system
- **CRUD Operations**: Full role management capabilities
- **Permission Checking**: Methods to verify user permissions
- **Role Assignment**: Admin tools for role management

### 9. Role-Based Access Components (`app/shared-ui/components/role-based-access.tsx`)

React components for implementing role-based access control:

- `RoleBasedAccess`: Main component for conditional rendering
- `AdminOnly`, `ManagerOnly`, `HRManagerOnly`: Convenience components
- `CanManageUsers`, `CanViewReports`: Permission-based components
- Loading states and fallback content support

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
import { RoleBasedAccess, AdminOnly, CanManageUsers } from '@/app/shared-ui/components/role-based-access'

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
      <RoleBasedAccess 
        requiredRoles={['manager', 'admin']}
        requiredPermissions={['reports:read']}
        fallback={<AccessDenied />}
      >
        <ReportsSection />
      </RoleBasedAccess>
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
      {/* form fields */}
    </form>
  )
}
```

### Manual State Updates

```tsx
import { useAppDispatch } from '@/store/hooks'
import { updateSMRewardsBalance } from '@/store/slices/userSlice'

function UpdateBalance() {
  const dispatch = useAppDispatch()

  const handleBalanceUpdate = (newBalance: number) => {
    dispatch(updateSMRewardsBalance(newBalance))
  }

  return (
    <button onClick={() => handleBalanceUpdate(1000)}>
      Update Balance
    </button>
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

4. **Admin Users Page** (`app/admin/users/page.tsx`)
   - Protected with role-based access control
   - Displays user roles in the interface
   - Shows access denied for unauthorized users

5. **User Info Display** (`app/shared-ui/components/user-info-display.tsx`)
   - Enhanced to show user roles
   - Displays role badges and permissions

6. **Root Layout** (`app/layout.tsx`)
   - Wrapped with Redux Provider
   - Makes store available to all components

## Benefits

### 1. Performance Improvements

- **Eliminates Redundant API Calls**: User data is fetched once and cached in Redux
- **Reduced Network Requests**: Components share the same data source
- **Faster Component Rendering**: No loading states for already-fetched data

### 2. Better User Experience

- **Consistent State**: All components show the same user information
- **Real-time Updates**: Changes in one component reflect everywhere
- **Persistent State**: User data persists across component unmounts/remounts

### 3. Developer Experience

- **Centralized State Management**: Single source of truth for user data
- **Type Safety**: Full TypeScript support with proper typing
- **Debugging**: Redux DevTools for state inspection
- **Predictable State Updates**: Clear action/reducer pattern
- **Role-Based Access Control**: Easy implementation of permission-based features
- **Reusable Components**: Pre-built components for common access patterns

### 4. Maintainability

- **Separation of Concerns**: UI logic separated from data fetching
- **Reusable Logic**: Hooks can be used across multiple components
- **Easy Testing**: Redux actions and reducers are easily testable

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
Role-Based Access Control Applied
```

## Error Handling

The implementation includes comprehensive error handling:

- **Network Errors**: Graceful fallbacks for API failures
- **Authentication Errors**: Clear error messages for login issues
- **Loading States**: Proper loading indicators during data fetching
- **Error Recovery**: Ability to retry failed operations

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
10. **Permission Groups**: Group permissions for easier management

## Migration Guide

### For Existing Components

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

## Conclusion

This Redux implementation provides a robust, scalable solution for user state management. It eliminates redundant API calls, improves performance, and provides a better developer experience while maintaining type safety and error handling. 