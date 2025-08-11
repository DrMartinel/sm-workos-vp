# Flexible Role Protection System

## Overview

The flexible role protection system provides comprehensive access control for any role or permission combination. Unlike the previous admin-only system, this new system supports:

- **Multiple roles** with flexible matching (any/all)
- **Multiple permissions** with flexible matching (any/all)
- **Custom access functions** for complex logic
- **Customizable messages** and fallbacks
- **Reusable convenience components** for common use cases

## Architecture

### Core Component: `RoleProtection`

The main component that handles all protection logic:

```tsx
<RoleProtection
  requiredRoles={['admin', 'manager']}
  requireAllRoles={false}
  requiredPermissions={['user:read', 'user:write']}
  requireAllPermissions={true}
  customAccessCheck={() => hasRole('admin') && hasPermission('system:admin')}
  accessDeniedMessage="Custom access denied message"
  fallback={<CustomFallbackComponent />}
>
  {/* Protected content */}
</RoleProtection>
```

### Convenience Components

Pre-built components for common use cases:

#### Role-Based Components
- `AdminOnly` - Requires admin role
- `ManagerOnly` - Requires manager OR admin role
- `HRManagerOnly` - Requires hr_manager OR admin role
- `ITAdminOnly` - Requires it_admin OR admin role
- `FinanceManagerOnly` - Requires finance_manager OR admin role
- `DepartmentHeadOnly` - Requires department_head OR manager OR admin role
- `AuthenticatedOnly` - Requires authentication only

#### Permission-Based Components
- `CanManageUsers` - Requires user:read AND user:write permissions
- `CanManageRoles` - Requires role:read AND role:write permissions
- `CanViewReports` - Requires reports:read permission
- `CanManageReports` - Requires reports:read AND reports:write permissions
- `CanManageSystem` - Requires system:admin permission

## Usage Examples

### 1. Basic Role Protection

```tsx
// Single role
<AdminOnly>
  <div>Admin-only content</div>
</AdminOnly>

// Multiple roles (any)
<ManagerOnly>
  <div>Manager or admin content</div>
</ManagerOnly>
```

### 2. Permission-Based Protection

```tsx
// Single permission
<CanViewReports>
  <div>Report viewing content</div>
</CanViewReports>

// Multiple permissions (all required)
<CanManageUsers>
  <div>User management content</div>
</CanManageUsers>
```

### 3. Custom Role Protection

```tsx
// Multiple roles with custom logic
<RoleProtection 
  requiredRoles={['admin', 'manager']} 
  requireAllRoles={true}
  accessDeniedMessage="You need both admin AND manager roles"
>
  <div>Content requiring both roles</div>
</RoleProtection>

// Multiple permissions with custom logic
<RoleProtection 
  requiredPermissions={['user:read', 'user:write', 'role:read']} 
  requireAllPermissions={true}
  accessDeniedTitle="Multiple Permissions Required"
>
  <div>Content requiring all permissions</div>
</RoleProtection>
```

### 4. Custom Access Functions

```tsx
// Complex access logic
<RoleProtection 
  customAccessCheck={() => {
    const isAdmin = hasRole('admin')
    const hasSystemAccess = hasPermission('system:admin')
    const isWorkingHours = new Date().getHours() >= 9 && new Date().getHours() <= 17
    return isAdmin && hasSystemAccess && isWorkingHours
  }}
  accessDeniedMessage="Access only available to admins with system access during working hours"
>
  <div>Complex protected content</div>
</RoleProtection>
```

### 5. Custom Fallbacks

```tsx
<RoleProtection 
  requiredRoles={['admin']}
  fallback={
    <div className="custom-access-denied">
      <h1>Custom Access Denied</h1>
      <p>Your custom message here</p>
      <Button onClick={handleCustomAction}>Custom Action</Button>
    </div>
  }
>
  <div>Admin content</div>
</RoleProtection>
```

### 6. Custom Messages and Actions

```tsx
<RoleProtection 
  requiredRoles={['admin']}
  accessDeniedTitle="Admin Access Required"
  accessDeniedMessage="You need administrator privileges to access this feature."
  loadingMessage="Checking admin privileges..."
  notAuthenticatedMessage="Please log in to access admin features."
  redirectTo="/dashboard"
  showUserInfo={false}
  onAccessDenied={() => {
    console.log('Access denied for user:', user?.email)
    // Custom analytics or logging
  }}
>
  <div>Admin content</div>
</RoleProtection>
```

## Component Props

### RoleProtection Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | - | Content to protect |
| `fallback` | ReactNode | - | Custom fallback component |
| `showLoading` | boolean | true | Show loading state |
| `requiredRoles` | SystemRole[] | [] | Required roles |
| `requireAllRoles` | boolean | false | Require all roles (vs any) |
| `requiredPermissions` | string[] | [] | Required permissions |
| `requireAllPermissions` | boolean | false | Require all permissions (vs any) |
| `customAccessCheck` | () => boolean | - | Custom access function |
| `loadingMessage` | string | "Verifying access..." | Loading message |
| `notAuthenticatedMessage` | string | "You must be logged in..." | Not authenticated message |
| `accessDeniedMessage` | string | "You don't have the required..." | Access denied message |
| `accessDeniedTitle` | string | "Access Denied" | Access denied title |
| `onAccessDenied` | () => void | - | Callback when access denied |
| `redirectTo` | string | "/" | Redirect URL |
| `showUserInfo` | boolean | true | Show user info in error |

## Protection Levels

### 1. Route-Level Protection

```tsx
// app/admin/layout.tsx
export default function AdminLayout({ children }) {
  return (
    <AdminOnly>
      <div className="admin-layout">
        {children}
      </div>
    </AdminOnly>
  )
}
```

### 2. Page-Level Protection

```tsx
// app/admin/users/page.tsx
export default function UsersPage() {
  return (
    <CanManageUsers>
      <div className="users-page">
        {/* User management content */}
      </div>
    </CanManageUsers>
  )
}
```

### 3. Component-Level Protection

```tsx
// Any component
export function SensitiveComponent() {
  return (
    <RoleProtection 
      requiredRoles={['admin', 'hr_manager']} 
      requireAllRoles={false}
    >
      <div>Sensitive content</div>
    </RoleProtection>
  )
}
```

### 4. Feature-Level Protection

```tsx
// Conditional rendering
export function FeatureToggle() {
  return (
    <div>
      <h1>Feature Dashboard</h1>
      
      <CanManageUsers>
        <UserManagementSection />
      </CanManageUsers>
      
      <CanViewReports>
        <ReportsSection />
      </CanViewReports>
      
      <AdminOnly>
        <SystemSettingsSection />
      </AdminOnly>
    </div>
  )
}
```

## Advanced Patterns

### 1. Hierarchical Access

```tsx
// Department-based access
<RoleProtection 
  customAccessCheck={() => {
    const userDepartment = profile?.department
    const isAdmin = hasRole('admin')
    const isDepartmentHead = hasRole('department_head')
    const isSameDepartment = userDepartment === 'IT'
    
    return isAdmin || (isDepartmentHead && isSameDepartment)
  }}
  accessDeniedMessage="You can only access your own department's data"
>
  <DepartmentData />
</RoleProtection>
```

### 2. Time-Based Access

```tsx
// Working hours access
<RoleProtection 
  customAccessCheck={() => {
    const now = new Date()
    const hour = now.getHours()
    const isWorkingHours = hour >= 9 && hour <= 17
    const isWeekday = now.getDay() >= 1 && now.getDay() <= 5
    
    return isWorkingHours && isWeekday
  }}
  accessDeniedMessage="This feature is only available during working hours (9 AM - 5 PM, weekdays)"
>
  <WorkingHoursFeature />
</RoleProtection>
```

### 3. Conditional Permissions

```tsx
// Resource-specific permissions
<RoleProtection 
  customAccessCheck={() => {
    const resourceId = router.query.resourceId
    const hasGlobalAccess = hasPermission('resource:read:all')
    const hasSpecificAccess = hasPermission(`resource:read:${resourceId}`)
    
    return hasGlobalAccess || hasSpecificAccess
  }}
>
  <ResourceContent />
</RoleProtection>
```

### 4. Multi-Tenant Access

```tsx
// Organization-based access
<RoleProtection 
  customAccessCheck={() => {
    const userOrg = profile?.organization_id
    const targetOrg = router.query.orgId
    const isSuperAdmin = hasRole('super_admin')
    
    return isSuperAdmin || userOrg === targetOrg
  }}
  accessDeniedMessage="You can only access your own organization's data"
>
  <OrganizationData />
</RoleProtection>
```

## Testing and Debugging

### 1. Example Page

Visit `/role-examples` to see all protection options in action:

- Current user information
- Role-based protection examples
- Permission-based protection examples
- Custom protection examples
- Usage instructions

### 2. Debug Tools

```tsx
// Debug component
export function DebugAccess() {
  const { getUserRoles, getUserPermissions, hasRole, hasPermission } = useRoleAccess()
  
  return (
    <div>
      <h3>Current Access</h3>
      <p>Roles: {getUserRoles().join(', ')}</p>
      <p>Permissions: {getUserPermissions().join(', ')}</p>
      <p>Is Admin: {hasRole('admin') ? 'Yes' : 'No'}</p>
      <p>Can Manage Users: {hasPermission('user:read') && hasPermission('user:write') ? 'Yes' : 'No'}</p>
    </div>
  )
}
```

### 3. Console Logging

```tsx
<RoleProtection 
  onAccessDenied={() => {
    console.log('Access denied for:', {
      user: user?.email,
      roles: getUserRoles(),
      permissions: getUserPermissions(),
      required: ['admin', 'manager']
    })
  }}
>
  <div>Protected content</div>
</RoleProtection>
```

## Migration from Old System

### Before (Admin-Only)
```tsx
import { AdminProtection } from '@/app/shared-ui/components/admin-protection'

<AdminProtection>
  <div>Admin content</div>
</AdminProtection>
```

### After (Flexible)
```tsx
import { AdminOnly } from '@/app/shared-ui/components/role-protection'

<AdminOnly>
  <div>Admin content</div>
</AdminOnly>
```

### Or More Flexible
```tsx
import { RoleProtection } from '@/app/shared-ui/components/role-protection'

<RoleProtection requiredRoles={['admin']}>
  <div>Admin content</div>
</RoleProtection>
```

## Best Practices

### 1. Use Appropriate Components

```tsx
// ✅ Good - Use specific component
<CanManageUsers>
  <UserManagement />
</CanManageUsers>

// ❌ Avoid - Too generic
<RoleProtection requiredPermissions={['user:read', 'user:write']}>
  <UserManagement />
</RoleProtection>
```

### 2. Provide Clear Messages

```tsx
// ✅ Good - Clear message
<RoleProtection 
  requiredRoles={['admin']}
  accessDeniedMessage="You need administrator privileges to manage system settings."
>

// ❌ Avoid - Generic message
<RoleProtection requiredRoles={['admin']}>
```

### 3. Use Custom Fallbacks for Complex UI

```tsx
// ✅ Good - Custom fallback
<RoleProtection 
  requiredRoles={['admin']}
  fallback={<UpgradeToAdminBanner />}
>

// ❌ Avoid - Default fallback for complex cases
<RoleProtection requiredRoles={['admin']}>
```

### 4. Handle Loading States

```tsx
// ✅ Good - Custom loading
<RoleProtection 
  showLoading={true}
  loadingMessage="Checking your permissions..."
>

// ❌ Avoid - No loading state
<RoleProtection showLoading={false}>
```

## Performance Considerations

### 1. Memoize Custom Functions

```tsx
// ✅ Good - Memoized function
const customAccessCheck = useCallback(() => {
  return hasRole('admin') && hasPermission('system:admin')
}, [hasRole, hasPermission])

<RoleProtection customAccessCheck={customAccessCheck}>
  <div>Content</div>
</RoleProtection>

// ❌ Avoid - Function recreated on every render
<RoleProtection customAccessCheck={() => hasRole('admin')}>
  <div>Content</div>
</RoleProtection>
```

### 2. Use Appropriate Loading States

```tsx
// ✅ Good - Only show loading when necessary
<RoleProtection showLoading={isLoading || rolesLoading}>

// ❌ Avoid - Always show loading
<RoleProtection showLoading={true}>
```

## Future Enhancements

### 1. Server-Side Protection
- API route protection
- Server-side role validation
- Database-level permissions

### 2. Advanced Features
- Resource-level permissions
- Dynamic permission checking
- Permission inheritance
- Role hierarchies

### 3. Analytics and Monitoring
- Access attempt logging
- Permission usage analytics
- Security audit trails

### 4. Multi-Tenant Support
- Organization-level roles
- Cross-organization permissions
- Tenant isolation

## Conclusion

The flexible role protection system provides comprehensive access control that can handle any role or permission combination. It's designed to be:

- **Flexible** - Supports any role/permission combination
- **Reusable** - Pre-built components for common cases
- **Customizable** - Custom functions, messages, and fallbacks
- **Performant** - Optimized for React rendering
- **Maintainable** - Clear patterns and best practices

This system replaces the previous admin-only approach with a much more powerful and flexible solution that can grow with your application's needs. 