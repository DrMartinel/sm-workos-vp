import { useEffect } from 'react'
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
  checkAuthStatus,
  fetchUserProfile,
  fetchUserRoles,
  fetchSMRewardsBalance,
  signOut,
  clearError,
} from '../slices/userSlice'

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

  // Check authentication status on mount
  useEffect(() => {
    dispatch(checkAuthStatus())
  }, [dispatch])

  // Fetch user profile when authenticated
  useEffect(() => {
    if (isAuthenticated && user && !profile) {
      dispatch(fetchUserProfile())
    }
  }, [isAuthenticated, user, profile, dispatch])

  // Fetch user roles when profile is loaded
  useEffect(() => {
    if (profile && roles.length === 0) {
      dispatch(fetchUserRoles())
    }
  }, [profile, roles, dispatch])

  // Fetch SM rewards balance when profile is loaded
  useEffect(() => {
    if (profile && smRewardsBalance === 0) {
      dispatch(fetchSMRewardsBalance())
    }
  }, [profile, smRewardsBalance, dispatch])

  // Actions
  const handleSignOut = async () => {
    await dispatch(signOut())
  }

  const handleClearError = () => {
    dispatch(clearError())
  }

  const refreshUserProfile = () => {
    if (isAuthenticated) {
      dispatch(fetchUserProfile())
    }
  }

  const refreshUserRoles = () => {
    if (isAuthenticated) {
      dispatch(fetchUserRoles())
    }
  }

  const refreshSMRewardsBalance = () => {
    if (isAuthenticated) {
      dispatch(fetchSMRewardsBalance())
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