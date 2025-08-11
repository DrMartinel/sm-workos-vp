import { useAppDispatch, useAppSelector } from '../hooks'
import {
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectUserError,
  selectUserProfile,
  selectProfileLoading,
  selectProfileError,
  selectUserRoles,
  selectUserPermissions,
  selectRolesLoading,
  selectRolesError,
  selectSMRewardsBalance,
  selectSMRewardsLoading,
  selectSMRewardsError,
  fetchUserProfile,
  fetchUserRoles,
  fetchSMRewardsBalance,
  signOut,
  clearError,
} from '../slices/userSlice'

/**
 * Hook for reading authentication state and performing auth-related actions.
 * This hook does NOT trigger any initial fetching - use useAuthInitializer for that.
 * Use this hook in components that need to read auth data or perform auth actions.
 */
export function useAuth() {
  const dispatch = useAppDispatch()
  
  // Select user state from Redux
  const user = useAppSelector(selectUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const isLoading = useAppSelector(selectIsLoading)
  const error = useAppSelector(selectUserError)
  const profile = useAppSelector(selectUserProfile)
  const profileLoading = useAppSelector(selectProfileLoading)
  const profileError = useAppSelector(selectProfileError)
  const roles = useAppSelector(selectUserRoles)
  const permissions = useAppSelector(selectUserPermissions)
  const rolesLoading = useAppSelector(selectRolesLoading)
  const rolesError = useAppSelector(selectRolesError)
  const smRewardsBalance = useAppSelector(selectSMRewardsBalance)
  const smRewardsLoading = useAppSelector(selectSMRewardsLoading)
  const smRewardsError = useAppSelector(selectSMRewardsError)

  // Actions
  const handleSignOut = async () => {
    await dispatch(signOut())
  }

  const handleClearError = () => {
    dispatch(clearError())
  }

  const refreshUserProfile = () => {
    if (isAuthenticated && user?.id) {
      dispatch(fetchUserProfile(user.id))
    }
  }

  const refreshUserRoles = () => {
    if (isAuthenticated && profile?.id) {
      dispatch(fetchUserRoles(profile.id))
    }
  }

  const refreshSMRewardsBalance = () => {
    if (isAuthenticated && profile?.id) {
      dispatch(fetchSMRewardsBalance(profile.id))
    }
  }

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    profile,
    profileLoading,
    profileError,
    roles,
    permissions,
    rolesLoading,
    rolesError,
    smRewardsBalance,
    smRewardsLoading,
    smRewardsError,
    
    // Actions
    signOut: handleSignOut,
    clearError: handleClearError,
    refreshUserProfile,
    refreshUserRoles,
    refreshSMRewardsBalance,
  }
} 