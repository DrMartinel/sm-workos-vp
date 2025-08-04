# Auth Hooks Refactor Documentation

## Overview

The authentication system has been refactored to split the `useAuth()` hook into two separate hooks to optimize performance and prevent unnecessary API calls:

1. **`useAuthInitializer`** - Handles initial authentication state fetching
2. **`useAuth`** - Reads authentication data and provides actions (no fetching)

## Problem Solved

Previously, the `useAuth()` hook was used in the `UserProfileDropdown` component, which caused unnecessary API calls every time the component re-rendered. This was inefficient because:

- The dropdown component only needs to read auth data, not trigger fetches
- Multiple components using `useAuth()` would trigger duplicate API calls
- No clear separation between initialization and data reading

## Solution

### 1. useAuthInitializer Hook

**Purpose**: Entry point for application-wide user state initialization
**Location**: `store/hooks/useAuthInitializer.ts`

**Features**:
- Checks authentication status on mount
- Fetches user profile when authenticated
- Fetches user roles when profile is loaded
- Fetches SM rewards balance when profile is loaded
- Returns initialization status for debugging

**Usage**:
```tsx
import { useAuthInitializer } from "@/store/hooks/useAuthInitializer"

export function UserProfileDropdown() {
  // Initialize auth state (triggers initial fetching)
  useAuthInitializer()
  
  // Read auth data and get actions
  const { signOut, user, profile } = useAuth()
  
  // Component logic...
}
```

**Return Value**:
```typescript
{
  isInitialized: boolean,    // Whether auth check is complete
  hasProfile: boolean,       // Whether user profile is loaded
  hasRoles: boolean,         // Whether user roles are loaded
  hasSMRewards: boolean,     // Whether SM rewards balance is loaded
}
```

### 2. useAuth Hook (Updated)

**Purpose**: Read authentication state and perform auth-related actions
**Location**: `store/hooks/useAuth.ts`

**Features**:
- Reads all auth state from Redux store
- Provides auth-related actions (signOut, clearError, refresh functions)
- **No automatic fetching** - only reads existing data
- Safe to use in multiple components without performance impact

**Usage**:
```tsx
import { useAuth } from "@/store/hooks/useAuth"

export function SomeComponent() {
  const { 
    user, 
    profile, 
    isAuthenticated, 
    signOut,
    refreshUserProfile 
  } = useAuth()
  
  // Component logic...
}
```

**Return Value**:
```typescript
{
  // State
  user: User | null,
  isAuthenticated: boolean,
  isLoading: boolean,
  error: string | null,
  profile: UserProfile | null,
  profileLoading: boolean,
  profileError: string | null,
  roles: string[],
  permissions: string[],
  rolesLoading: boolean,
  rolesError: string | null,
  smRewardsBalance: number,
  smRewardsLoading: boolean,
  smRewardsError: string | null,
  
  // Actions
  signOut: () => Promise<void>,
  clearError: () => void,
  refreshUserProfile: () => void,
  refreshUserRoles: () => void,
  refreshSMRewardsBalance: () => void,
}
```

## Implementation Details

### Files Modified

1. **`store/hooks/useAuthInitializer.ts`** (NEW)
   - Created new hook for initialization logic
   - Contains all useEffect hooks for fetching data
   - Optimized to prevent unnecessary API calls

2. **`store/hooks/useAuth.ts`** (MODIFIED)
   - Removed all useEffect hooks
   - Removed `checkAuthStatus` import
   - Added comprehensive JSDoc comments
   - Now only reads state and provides actions

3. **`app/shared-ui/components/auth/user-profile-dropdown.tsx`** (MODIFIED)
   - Added `useAuthInitializer()` call for initialization
   - Kept `useAuth()` for reading data and actions
   - Maintains same functionality with better performance

### Migration Guide

#### For Components That Need Auth Data Only

**Before**:
```tsx
import { useAuth } from "@/store/hooks/useAuth"

export function MyComponent() {
  const { user, profile } = useAuth()
  // Component logic...
}
```

**After**:
```tsx
import { useAuth } from "@/store/hooks/useAuth"

export function MyComponent() {
  const { user, profile } = useAuth()
  // Component logic... (no changes needed)
}
```

#### For Components That Need to Initialize Auth

**Before**:
```tsx
import { useAuth } from "@/store/hooks/useAuth"

export function LayoutComponent() {
  const { user, profile } = useAuth()
  // Component logic...
}
```

**After**:
```tsx
import { useAuth } from "@/store/hooks/useAuth"
import { useAuthInitializer } from "@/store/hooks/useAuthInitializer"

export function LayoutComponent() {
  // Initialize auth state
  useAuthInitializer()
  
  // Read auth data
  const { user, profile } = useAuth()
  // Component logic...
}
```

## Performance Benefits

1. **Reduced API Calls**: Only one component (UserProfileDropdown) triggers initial fetching
2. **Better Caching**: Auth data is fetched once and shared across all components
3. **Improved Performance**: Components that only read data don't trigger re-fetches
4. **Clear Separation**: Initialization logic is separated from data reading logic

## Best Practices

1. **Use `useAuthInitializer`** in layout components or top-level components that need to initialize auth
2. **Use `useAuth`** in components that only need to read auth data or perform actions
3. **Don't call `useAuthInitializer`** in multiple components - it should be called once at the app level
4. **Use refresh functions** from `useAuth` when you need to manually refresh specific data

## Testing

The refactor maintains backward compatibility for components that only read auth data. Components that need initialization should be updated to use both hooks as shown in the migration guide.

## Future Considerations

- Consider adding a global auth context provider if the app grows larger
- Monitor performance to ensure the single initialization point doesn't become a bottleneck
- Consider adding retry logic for failed auth checks
- Add loading states for better UX during initialization 