import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { createClient } from '@/app/shared-ui/lib/utils/supabase/client'
import { profilesService, UserProfile } from '@/app/shared-ui/lib/utils/supabase/profiles'
import { rolesService, SystemRole, SYSTEM_ROLES } from '@/app/shared-ui/lib/utils/supabase/roles'
import { User } from '@supabase/supabase-js'

// Define the user state interface
export interface UserState {
  // Authentication state
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // User data
  user: {
    id: string | null
    email: string | null
    created_at: string | null
    updated_at: string | null
  } | null
  
  // User profile data
  profile: UserProfile | null
  profileLoading: boolean
  profileError: string | null
  
  // User roles and permissions
  roles: string[]
  permissions: string[]
  rolesLoading: boolean
  rolesError: string | null
  
  // SM Rewards balance
  smRewardsBalance: number
  smRewardsLoading: boolean
  smRewardsError: string | null
}

// Initial state
const initialState: UserState = {
  isAuthenticated: false,
  isLoading: true,
  error: null,
  user: null,
  profile: null,
  profileLoading: false,
  profileError: null,
  roles: [],
  permissions: [],
  rolesLoading: true,
  rolesError: null,
  smRewardsBalance: 0,
  smRewardsLoading: true,
  smRewardsError: null,
}

// Async thunk to check authentication status
export const checkAuthStatus = createAsyncThunk<User | null, void, { rejectValue: string }>(
  'user/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        return rejectWithValue(error.message)
      }
      
      return user
    } catch (error) {
      return rejectWithValue('Failed to check authentication status')
    }
  }
)

// Async thunk to fetch user profile
export const fetchUserProfile = createAsyncThunk<UserProfile, string, { rejectValue: string }>(
  'user/fetchUserProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const profile = await profilesService.getProfileById(userId)
      if (!profile) {
        return rejectWithValue('Failed to fetch user profile')
      }
      return profile
    } catch (error) {
      return rejectWithValue('Failed to fetch user profile')
    }
  }
)

// Async thunk to fetch user roles and permissions
export const fetchUserRoles = createAsyncThunk<{ roles: string[], permissions: string[] }, string, { rejectValue: string }>(
  'user/fetchUserRoles',
  async (userId, { rejectWithValue }) => {
    try {
      const roles = await rolesService.getUserRolesById(userId)
      const permissions = await rolesService.getUserPermissionsById(userId)
      return { roles, permissions }
    } catch (error) {
      return rejectWithValue('Failed to fetch user roles')
    }
  }
)

// Async thunk to fetch SM rewards balance
export const fetchSMRewardsBalance = createAsyncThunk<number, string, { rejectValue: string }>(
  'user/fetchSMRewardsBalance',
  async (userId, { rejectWithValue }) => {
    try {
      const balance = await profilesService.getSMRewardsBalanceById(userId)
      return balance
    } catch (error) {
      return rejectWithValue('Failed to fetch SM rewards balance')
    }
  }
)

// Async thunk to sign out
export const signOut = createAsyncThunk<boolean, void, { rejectValue: string }>(
  'user/signOut',
  async (_, { rejectWithValue }) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        return rejectWithValue(error.message)
      }
      
      return true
    } catch (error) {
      return rejectWithValue('Failed to sign out')
    }
  }
)

// Create the user slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Clear errors
    clearError: (state) => {
      state.error = null
      state.profileError = null
      state.rolesError = null
      state.smRewardsError = null
    },
    
    // Update user profile locally
    updateUserProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload }
      }
    },
    
    // Update user roles locally
    updateUserRoles: (state, action: PayloadAction<string[]>) => {
      state.roles = action.payload
      // Recalculate permissions based on new roles
      const permissions = new Set<string>()
      action.payload.forEach(role => {
        const rolePermissions = rolesService.getRolePermissions(role as SystemRole) || []
        rolePermissions.forEach(permission => permissions.add(permission))
      })
      state.permissions = Array.from(permissions)
    },
    
    // Update SM rewards balance locally
    updateSMRewardsBalance: (state, action: PayloadAction<number>) => {
      state.smRewardsBalance = action.payload
    },
    
    // Reset state (for logout)
    resetUserState: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.profile = null
      state.roles = []
      state.permissions = []
      state.smRewardsBalance = 0
      state.error = null
      state.profileError = null
      state.rolesError = null
      state.smRewardsError = null
    },
  },
  extraReducers: (builder) => {
    // Check auth status
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = !!action.payload
        
        // Only update user if it's different or doesn't exist
        if (action.payload) {
          const newUser = {
            id: action.payload.id || null,
            email: action.payload.email || null,
            created_at: action.payload.created_at || null,
            updated_at: action.payload.updated_at || null,
          }
          
          // Check if user data has actually changed
          if (!state.user || 
              state.user.id !== newUser.id ||
              state.user.email !== newUser.email) {
            state.user = newUser
          }
        } else {
          state.user = null
        }
        
        state.error = null
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.error = action.payload as string
      })
    
    // Fetch user profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.profileLoading = true
        state.profileError = null
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profileLoading = false
        
        // Only update profile if it's different or doesn't exist
        if (!state.profile || 
            state.profile.id !== action.payload?.id ||
            state.profile.username !== action.payload?.username) {
          state.profile = action.payload
        }
        
        state.profileError = null
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.profileLoading = false
        state.profileError = action.payload as string
      })
    
    // Fetch user roles
    builder
      .addCase(fetchUserRoles.pending, (state) => {
        state.rolesLoading = true
        state.rolesError = null
      })
      .addCase(fetchUserRoles.fulfilled, (state, action) => {
        state.rolesLoading = false
        state.roles = action.payload.roles
        state.permissions = action.payload.permissions
        state.rolesError = null
      })
      .addCase(fetchUserRoles.rejected, (state, action) => {
        state.rolesLoading = false
        state.rolesError = action.payload as string
      })
    
    // Fetch SM rewards balance
    builder
      .addCase(fetchSMRewardsBalance.pending, (state) => {
        state.smRewardsLoading = true
        state.smRewardsError = null
      })
      .addCase(fetchSMRewardsBalance.fulfilled, (state, action) => {
        state.smRewardsLoading = false
        state.smRewardsBalance = action.payload
        state.smRewardsError = null
      })
      .addCase(fetchSMRewardsBalance.rejected, (state, action) => {
        state.smRewardsLoading = false
        state.smRewardsError = action.payload as string
      })
    
    // Sign out
    builder
      .addCase(signOut.fulfilled, (state) => {
        state.isAuthenticated = false
        state.user = null
        state.profile = null
        state.roles = []
        state.permissions = []
        state.smRewardsBalance = 0
        state.error = null
        state.profileError = null
        state.rolesError = null
        state.smRewardsError = null
      })
  },
})

// Export actions
export const {
  clearError,
  updateUserProfile,
  updateUserRoles,
  updateSMRewardsBalance,
  resetUserState,
} = userSlice.actions

// Export selectors
export const selectUser = (state: { user: UserState }) => state.user.user
export const selectIsAuthenticated = (state: { user: UserState }) => state.user.isAuthenticated
export const selectIsLoading = (state: { user: UserState }) => state.user.isLoading
export const selectUserError = (state: { user: UserState }) => state.user.error
export const selectUserProfile = (state: { user: UserState }) => state.user.profile
export const selectProfileLoading = (state: { user: UserState }) => state.user.profileLoading
export const selectProfileError = (state: { user: UserState }) => state.user.profileError
export const selectUserRoles = (state: { user: UserState }) => state.user.roles
export const selectUserPermissions = (state: { user: UserState }) => state.user.permissions
export const selectRolesLoading = (state: { user: UserState }) => state.user.rolesLoading
export const selectRolesError = (state: { user: UserState }) => state.user.rolesError
export const selectSMRewardsBalance = (state: { user: UserState }) => state.user.smRewardsBalance
export const selectSMRewardsLoading = (state: { user: UserState }) => state.user.smRewardsLoading
export const selectSMRewardsError = (state: { user: UserState }) => state.user.smRewardsError

// Export reducer
export default userSlice.reducer 