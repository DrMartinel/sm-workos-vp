import { useAuth } from './useAuth'
import { SystemRole, SYSTEM_ROLES } from '@/app/shared-ui/lib/utils/supabase/roles'

export function useRoleAccess() {
  const { roles, permissions, rolesLoading } = useAuth()

  // Check if user has a specific role
  const hasRole = (role: SystemRole): boolean => {
    return roles.includes(role)
  }

  // Check if user has any of the specified roles
  const hasAnyRole = (requiredRoles: SystemRole[]): boolean => {
    return requiredRoles.some(role => roles.includes(role))
  }

  // Check if user has all of the specified roles
  const hasAllRoles = (requiredRoles: SystemRole[]): boolean => {
    return requiredRoles.every(role => roles.includes(role))
  }

  // Check if user has a specific permission
  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission)
  }

  // Check if user has any of the specified permissions
  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.some(permission => permissions.includes(permission))
  }

  // Check if user has all of the specified permissions
  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.every(permission => permissions.includes(permission))
  }

  // Check if user is an admin
  const isAdmin = (): boolean => {
    return hasRole(SYSTEM_ROLES.ADMIN)
  }

  // Check if user is a manager
  const isManager = (): boolean => {
    return hasAnyRole([SYSTEM_ROLES.MANAGER, SYSTEM_ROLES.DEPARTMENT_HEAD])
  }

  // Check if user is HR manager
  const isHRManager = (): boolean => {
    return hasRole(SYSTEM_ROLES.HR_MANAGER)
  }

  // Check if user is IT admin
  const isITAdmin = (): boolean => {
    return hasRole(SYSTEM_ROLES.IT_ADMIN)
  }

  // Check if user is finance manager
  const isFinanceManager = (): boolean => {
    return hasRole(SYSTEM_ROLES.FINANCE_MANAGER)
  }

  // Check if user can manage users
  const canManageUsers = (): boolean => {
    return hasAnyPermission(['user:write', 'user:delete', 'hr:admin'])
  }

  // Check if user can view reports
  const canViewReports = (): boolean => {
    return hasPermission('reports:read')
  }

  // Check if user can create/edit reports
  const canManageReports = (): boolean => {
    return hasPermission('reports:write')
  }

  // Check if user can manage system settings
  const canManageSystem = (): boolean => {
    return hasAnyPermission(['system:admin', 'it:admin'])
  }

  // Check if user can manage roles
  const canManageRoles = (): boolean => {
    return hasPermission('role:write')
  }

  // Check if user can manage approvals
  const canManageApprovals = (): boolean => {
    return hasAnyPermission(['approvals:read', 'approvals:write'])
  }

  // Check if user can manage team
  const canManageTeam = (): boolean => {
    return hasPermission('team:manage')
  }

  // Check if user can manage finance
  const canManageFinance = (): boolean => {
    return hasAnyPermission(['finance:read', 'finance:write'])
  }

  // Get user's primary role (first role in the array)
  const getPrimaryRole = (): SystemRole | null => {
    return roles.length > 0 ? (roles[0] as SystemRole) : null
  }

  // Get all user roles as SystemRole array
  const getUserRoles = (): SystemRole[] => {
    return roles as SystemRole[]
  }

  // Get all user permissions
  const getUserPermissions = (): string[] => {
    return [...permissions]
  }

  return {
    // Loading state
    rolesLoading,
    
    // Role checking methods
    hasRole,
    hasAnyRole,
    hasAllRoles,
    
    // Permission checking methods
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Specific role checks
    isAdmin,
    isManager,
    isHRManager,
    isITAdmin,
    isFinanceManager,
    
    // Specific permission checks
    canManageUsers,
    canViewReports,
    canManageReports,
    canManageSystem,
    canManageRoles,
    canManageApprovals,
    canManageTeam,
    canManageFinance,
    
    // Data access
    getPrimaryRole,
    getUserRoles,
    getUserPermissions,
  }
} 