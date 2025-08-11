"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  RoleProtection,
  AdminOnly,
  ManagerOnly,
  HRManagerOnly,
  ITAdminOnly,
  FinanceManagerOnly,
  DepartmentHeadOnly,
  AuthenticatedOnly,
  CanManageUsers,
  CanManageRoles,
  CanViewReports,
  CanManageReports,
  CanManageSystem
} from '@/app/shared-ui/components/role-protection'
import { useAuth } from '@/src/store/hooks/useAuth'
import { useRoleAccess } from '@/src/store/hooks/useRoleAccess'

export default function RoleExamplesPage() {
  const { user, profile, isAuthenticated } = useAuth()
  const { getUserRoles, getUserPermissions, hasRole, hasPermission } = useRoleAccess()
  const [customAccessResult, setCustomAccessResult] = useState<boolean | null>(null)

  const currentRoles = getUserRoles()
  const currentPermissions = getUserPermissions()

  const customAccessCheck = () => {
    // Example custom access check
    const result = hasRole('admin') && hasPermission('system:admin')
    setCustomAccessResult(result)
    return result
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Role Protection Examples</h1>
        <p className="text-gray-600 mt-2">
          This page demonstrates all the different role protection options available in the system.
        </p>
      </div>

      {/* Current User Info */}
      <Card>
        <CardHeader>
          <CardTitle>Current User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">User Details</h3>
              <p><strong>Email:</strong> {user?.email || 'Not logged in'}</p>
              <p><strong>Username:</strong> {profile?.username || 'Not set'}</p>
              <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Roles & Permissions</h3>
              <div className="space-y-2">
                <div>
                  <strong>Roles:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {currentRoles.length > 0 ? (
                      currentRoles.map(role => (
                        <Badge key={role} variant="secondary">{role}</Badge>
                      ))
                    ) : (
                      <span className="text-gray-500">None</span>
                    )}
                  </div>
                </div>
                <div>
                  <strong>Permissions:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {currentPermissions.length > 0 ? (
                      currentPermissions.map(permission => (
                        <Badge key={permission} variant="outline">{permission}</Badge>
                      ))
                    ) : (
                      <span className="text-gray-500">None</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role-Based Protection Examples */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Role-Based Protection Examples</h2>
        
        {/* Admin Only */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="destructive">Admin Only</Badge>
              <span className="text-sm font-normal text-gray-500">
                Requires: admin role
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AdminOnly>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">✅ You have admin access!</p>
                <p className="text-green-600 text-sm">This content is only visible to administrators.</p>
              </div>
            </AdminOnly>
          </CardContent>
        </Card>

        {/* Manager Only */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="default">Manager Only</Badge>
              <span className="text-sm font-normal text-gray-500">
                Requires: manager OR admin role
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ManagerOnly>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 font-medium">✅ You have manager access!</p>
                <p className="text-blue-600 text-sm">This content is visible to managers and administrators.</p>
              </div>
            </ManagerOnly>
          </CardContent>
        </Card>

        {/* HR Manager Only */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">HR Manager Only</Badge>
              <span className="text-sm font-normal text-gray-500">
                Requires: hr_manager OR admin role
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HRManagerOnly>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-purple-800 font-medium">✅ You have HR manager access!</p>
                <p className="text-purple-600 text-sm">This content is visible to HR managers and administrators.</p>
              </div>
            </HRManagerOnly>
          </CardContent>
        </Card>

        {/* IT Admin Only */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline">IT Admin Only</Badge>
              <span className="text-sm font-normal text-gray-500">
                Requires: it_admin OR admin role
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ITAdminOnly>
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-orange-800 font-medium">✅ You have IT admin access!</p>
                <p className="text-orange-600 text-sm">This content is visible to IT administrators and system admins.</p>
              </div>
            </ITAdminOnly>
          </CardContent>
        </Card>

        {/* Finance Manager Only */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">Finance Manager Only</Badge>
              <span className="text-sm font-normal text-gray-500">
                Requires: finance_manager OR admin role
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FinanceManagerOnly>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-emerald-800 font-medium">✅ You have finance manager access!</p>
                <p className="text-emerald-600 text-sm">This content is visible to finance managers and administrators.</p>
              </div>
            </FinanceManagerOnly>
          </CardContent>
        </Card>

        {/* Department Head Only */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline">Department Head Only</Badge>
              <span className="text-sm font-normal text-gray-500">
                Requires: department_head OR manager OR admin role
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DepartmentHeadOnly>
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <p className="text-indigo-800 font-medium">✅ You have department head access!</p>
                <p className="text-indigo-600 text-sm">This content is visible to department heads, managers, and administrators.</p>
              </div>
            </DepartmentHeadOnly>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Permission-Based Protection Examples */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Permission-Based Protection Examples</h2>
        
        {/* Can Manage Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="destructive">Can Manage Users</Badge>
              <span className="text-sm font-normal text-gray-500">
                Requires: user:read AND user:write permissions
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CanManageUsers>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">✅ You can manage users!</p>
                <p className="text-green-600 text-sm">You have the required permissions to manage user accounts.</p>
              </div>
            </CanManageUsers>
          </CardContent>
        </Card>

        {/* Can Manage Roles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="default">Can Manage Roles</Badge>
              <span className="text-sm font-normal text-gray-500">
                Requires: role:read AND role:write permissions
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CanManageRoles>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 font-medium">✅ You can manage roles!</p>
                <p className="text-blue-600 text-sm">You have the required permissions to manage user roles.</p>
              </div>
            </CanManageRoles>
          </CardContent>
        </Card>

        {/* Can View Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">Can View Reports</Badge>
              <span className="text-sm font-normal text-gray-500">
                Requires: reports:read permission
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CanViewReports>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-purple-800 font-medium">✅ You can view reports!</p>
                <p className="text-purple-600 text-sm">You have the required permissions to view system reports.</p>
              </div>
            </CanViewReports>
          </CardContent>
        </Card>

        {/* Can Manage Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline">Can Manage Reports</Badge>
              <span className="text-sm font-normal text-gray-500">
                Requires: reports:read AND reports:write permissions
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CanManageReports>
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-orange-800 font-medium">✅ You can manage reports!</p>
                <p className="text-orange-600 text-sm">You have the required permissions to create and manage reports.</p>
              </div>
            </CanManageReports>
          </CardContent>
        </Card>

        {/* Can Manage System */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="destructive">Can Manage System</Badge>
              <span className="text-sm font-normal text-gray-500">
                Requires: system:admin permission
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CanManageSystem>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium">✅ You can manage the system!</p>
                <p className="text-red-600 text-sm">You have the required permissions to manage system settings.</p>
              </div>
            </CanManageSystem>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Custom Protection Examples */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Custom Protection Examples</h2>
        
        {/* Custom Access Check */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline">Custom Access Check</Badge>
              <span className="text-sm font-normal text-gray-500">
                Custom function: admin role AND system:admin permission
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={customAccessCheck} variant="outline">
              Test Custom Access Check
            </Button>
            {customAccessResult !== null && (
              <div className={`p-4 border rounded-lg ${
                customAccessResult 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <p className={customAccessResult ? 'text-green-800' : 'text-red-800'}>
                  {customAccessResult ? '✅ Custom access check passed!' : '❌ Custom access check failed!'}
                </p>
              </div>
            )}
            <RoleProtection customAccessCheck={customAccessCheck}>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">✅ Custom access check passed!</p>
                <p className="text-green-600 text-sm">This content is visible because the custom access check returned true.</p>
              </div>
            </RoleProtection>
          </CardContent>
        </Card>

        {/* Multiple Roles Required */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">Multiple Roles Required</Badge>
              <span className="text-sm font-normal text-gray-500">
                Requires ALL: admin AND manager roles
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RoleProtection 
              requiredRoles={['admin', 'manager']} 
              requireAllRoles={true}
              accessDeniedTitle="Multiple Roles Required"
              accessDeniedMessage="You need both admin AND manager roles to access this content."
            >
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-purple-800 font-medium">✅ You have both admin AND manager roles!</p>
                <p className="text-purple-600 text-sm">This content requires both admin and manager roles.</p>
              </div>
            </RoleProtection>
          </CardContent>
        </Card>

        {/* Multiple Permissions Required */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline">Multiple Permissions Required</Badge>
              <span className="text-sm font-normal text-gray-500">
                Requires ALL: user:read, user:write, role:read permissions
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RoleProtection 
              requiredPermissions={['user:read', 'user:write', 'role:read']} 
              requireAllPermissions={true}
              accessDeniedTitle="Multiple Permissions Required"
              accessDeniedMessage="You need all specified permissions to access this content."
            >
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-orange-800 font-medium">✅ You have all required permissions!</p>
                <p className="text-orange-600 text-sm">This content requires user:read, user:write, and role:read permissions.</p>
              </div>
            </RoleProtection>
          </CardContent>
        </Card>

        {/* Custom Fallback */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="destructive">Custom Fallback</Badge>
              <span className="text-sm font-normal text-gray-500">
                Custom access denied message and actions
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RoleProtection 
              requiredRoles={['admin']}
              fallback={
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 font-medium">🚫 Custom Access Denied</p>
                  <p className="text-yellow-600 text-sm">This is a custom fallback message for admin-only content.</p>
                  <Button className="mt-2" variant="outline" size="sm">
                    Custom Action
                  </Button>
                </div>
              }
            >
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">✅ Admin access granted!</p>
                <p className="text-green-600 text-sm">This content is only visible to administrators.</p>
              </div>
            </RoleProtection>
          </CardContent>
        </Card>
      </div>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use Role Protection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">1. Basic Role Protection</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
{`<AdminOnly>
  <div>Admin-only content</div>
</AdminOnly>`}
            </pre>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">2. Permission Protection</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
{`<CanManageUsers>
  <div>User management content</div>
</CanManageUsers>`}
            </pre>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">3. Custom Role Protection</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
{`<RoleProtection 
  requiredRoles={['admin', 'manager']} 
  requireAllRoles={false}
  accessDeniedMessage="Custom message"
>
  <div>Custom protected content</div>
</RoleProtection>`}
            </pre>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">4. Custom Access Check</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
{`<RoleProtection 
  customAccessCheck={() => hasRole('admin') && hasPermission('system:admin')}
>
  <div>Custom logic protected content</div>
</RoleProtection>`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 