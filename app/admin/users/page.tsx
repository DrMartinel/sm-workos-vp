"use client"
import { useState, useEffect } from "react"
import { Users, UserPlus, Search, MoreHorizontal, Edit, Trash2, Mail, Calendar, Shield, Eye, EyeOff } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/app/shared-ui/components/ui/use-toast"
import { CanManageUsers } from "@/app/shared-ui/components/role-protection"
import { SYSTEM_ROLES, SystemRole, rolesService } from "@/app/shared-ui/lib/utils/supabase/roles"
import { profilesService, UserProfile, CreateUserData } from "@/app/shared-ui/lib/utils/supabase/profiles"

interface UserWithProfile extends UserProfile {
  email?: string
  status?: string
  joinDate?: string
}

export default function UsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<UserWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedRole, setSelectedRole] = useState("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserWithProfile | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states
  const [createForm, setCreateForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    roles: [] as SystemRole[]
  })
  const [editForm, setEditForm] = useState({
    username: "",
    roles: [] as SystemRole[]
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const stats = [
    { title: "Total Users", value: users.length.toString(), icon: Users, color: "blue" },
    { title: "Active Users", value: users.filter(u => u.status !== "Inactive").length.toString(), icon: Users, color: "green" },
    { title: "Inactive Users", value: users.filter(u => u.status === "Inactive").length.toString(), icon: Users, color: "gray" },
    { title: "Admins", value: users.filter(u => Array.isArray(u.role) && u.role.includes("admin")).length.toString(), icon: Users, color: "purple" },
  ]

  // Load users on component mount
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const usersData = await rolesService.getAllUsersWithRolesAndEmails()
      setUsers(usersData.map(user => ({
        ...user,
        status: "Active", // Default status since we don't have this field in the current schema
        joinDate: user.updated_at ? new Date(user.updated_at).toLocaleDateString() : "N/A"
      })))
    } catch (error) {
      console.error("Error loading users:", error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || user.status?.toLowerCase() === selectedStatus
    const matchesRole = selectedRole === "all" || (Array.isArray(user.role) && user.role.some(role => role.toLowerCase() === selectedRole))

    return matchesSearch && matchesStatus && matchesRole
  })

  const handleCreateUser = async () => {
    if (!validateCreateForm()) return

    setIsSubmitting(true)
    try {
      const userData: CreateUserData = {
        email: createForm.email,
        password: createForm.password,
        username: createForm.username,
        roles: createForm.roles
      }

      const result = await profilesService.createUser(userData)

      if (result.success) {
        toast({
          title: "Success",
          description: "User created successfully",
        })
        setIsCreateModalOpen(false)
        resetCreateForm()
        loadUsers() // Reload users list
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create user",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error creating user:", error)
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser || !validateEditForm()) return

    setIsSubmitting(true)
    try {
      const success = await profilesService.updateUserProfile(selectedUser.id, {
        username: editForm.username,
        role: editForm.roles
      })

      if (success) {
        toast({
          title: "Success",
          description: "User updated successfully",
        })
        setIsEditModalOpen(false)
        loadUsers() // Reload users list
      } else {
        toast({
          title: "Error",
          description: "Failed to update user",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    setIsSubmitting(true)
    try {
      const success = await profilesService.deleteUser(selectedUser.id)

      if (success) {
        toast({
          title: "Success",
          description: "User deleted successfully",
        })
        setIsDeleteModalOpen(false)
        loadUsers() // Reload users list
      } else {
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const validateCreateForm = () => {
    if (!createForm.username.trim()) {
      toast({
        title: "Validation Error",
        description: "Username is required",
        variant: "destructive"
      })
      return false
    }
    if (!createForm.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email is required",
        variant: "destructive"
      })
      return false
    }
    if (!createForm.password) {
      toast({
        title: "Validation Error",
        description: "Password is required",
        variant: "destructive"
      })
      return false
    }
    if (createForm.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      })
      return false
    }
    if (createForm.password !== createForm.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match",
        variant: "destructive"
      })
      return false
    }
    // Roles are now optional - removed the validation check
    return true
  }

  const validateEditForm = () => {
    if (!editForm.username.trim()) {
      toast({
        title: "Validation Error",
        description: "Username is required",
        variant: "destructive"
      })
      return false
    }
    // Roles are now optional - removed the validation check
    return true
  }

  const resetCreateForm = () => {
    setCreateForm({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      roles: []
    })
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  const openEditModal = (user: UserWithProfile) => {
    setSelectedUser(user)
    setEditForm({
      username: user.username || "",
      roles: Array.isArray(user.role) ? (user.role as SystemRole[]) : []
    })
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (user: UserWithProfile) => {
    setSelectedUser(user)
    setIsDeleteModalOpen(true)
  }

  const handleRoleToggle = (role: SystemRole, isCreate: boolean = true) => {
    if (isCreate) {
      setCreateForm(prev => ({
        ...prev,
        roles: prev.roles.includes(role)
          ? prev.roles.filter(r => r !== role)
          : [...prev.roles, role]
      }))
    } else {
      setEditForm(prev => ({
        ...prev,
        roles: prev.roles.includes(role)
          ? prev.roles.filter(r => r !== role)
          : [...prev.roles, role]
      }))
    }
  }

  return (
    <CanManageUsers 
      fallback={
        <div className="p-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
                <p className="text-gray-500">You don't have permission to manage users.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-500 mt-1">Manage user accounts and permissions</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>Add a new user to the system. Roles are optional and can be assigned later.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={createForm.username}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter username"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={createForm.password}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={createForm.confirmPassword}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Roles (Optional)</Label>
                <div className="grid gap-2">
                  {Object.entries(SYSTEM_ROLES).map(([key, role]) => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox
                        id={`create-${role}`}
                        checked={createForm.roles.includes(role)}
                        onCheckedChange={() => handleRoleToggle(role, true)}
                      />
                      <Label htmlFor={`create-${role}`} className="text-sm font-normal">
                        {key.replace(/_/g, ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700" 
                onClick={handleCreateUser}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                    <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
          <CardDescription>Search and filter users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {Object.entries(SYSTEM_ROLES).map(([key, role]) => (
                  <SelectItem key={role} value={role}>
                    {key.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback>
                              {user.username
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("") || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.username || "Unknown"}</div>
                            <div className="text-sm text-gray-500">{user.email || "No email"}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1 text-gray-400" />
                            {user.email || "No email"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(user.role) ? user.role.map((role, index) => (
                            <Badge key={index} variant={role === "admin" ? "default" : "secondary"}>
                              {role}
                            </Badge>
                          )) : (
                            <Badge variant="secondary">No roles</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === "Active" ? "default" : "secondary"}>
                          {user.status || "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                          {user.joinDate || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditModal(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => openDeleteModal(user)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and permissions. Roles are optional.</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  value={editForm.username}
                  onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter username"
                />
              </div>
              <div className="grid gap-2">
                <Label>Roles (Optional)</Label>
                <div className="grid gap-2">
                  {Object.entries(SYSTEM_ROLES).map(([key, role]) => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${role}`}
                        checked={editForm.roles.includes(role)}
                        onCheckedChange={() => handleRoleToggle(role, false)}
                      />
                      <Label htmlFor={`edit-${role}`} className="text-sm font-normal">
                        {key.replace(/_/g, ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700" 
              onClick={handleEditUser}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="py-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Avatar>
                  <AvatarImage src={selectedUser.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>
                    {selectedUser.username
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{selectedUser.username || "Unknown"}</div>
                  <div className="text-sm text-gray-500">{selectedUser.email || "No email"}</div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteUser}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </CanManageUsers>
  )
}
