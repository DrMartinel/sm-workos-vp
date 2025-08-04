import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks'
import {
  selectIsAuthenticated,
  selectUser,
  selectUserProfile,
  selectProfileLoading,
  selectUserRoles,
  selectRolesLoading,
  selectSMRewardsBalance,
  selectSMRewardsLoading,
  checkAuthStatus,
  fetchUserProfile,
  fetchUserRoles,
  fetchSMRewardsBalance,
} from '../slices/userSlice'

/**
 * Hook for initializing authentication state and fetching user data.
 * This should be used as an entry point for application-wide user state.
 * Typically used in layout components or top-level components that need to initialize auth.
 */
export function useAuthInitializer() {
  const dispatch = useAppDispatch()
  
  // Select only the necessary state for initialization
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const user = useAppSelector(selectUser)
  const profile = useAppSelector(selectUserProfile)
  const profileLoading = useAppSelector(selectProfileLoading)
  const roles = useAppSelector(selectUserRoles)
  const rolesLoading = useAppSelector(selectRolesLoading)
  const smRewardsBalance = useAppSelector(selectSMRewardsBalance)
  const smRewardsLoading = useAppSelector(selectSMRewardsLoading)

  // Check authentication status on mount
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('🔐 Initializing auth check')
      dispatch(checkAuthStatus())
    }
  }, [dispatch, isAuthenticated])

  // Fetch user profile when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id && !profile?.id && !profileLoading) {
      console.log('👤 Fetching profile for user:', user.id)
      dispatch(fetchUserProfile())
    }
  }, [isAuthenticated, user?.id, profile?.id, profileLoading, dispatch])

  // Fetch user roles when profile is loaded
  useEffect(() => {
    if (profile?.id && roles.length === 0 && rolesLoading) {
      console.log('🔑 Fetching roles for profile:', profile.id)
      dispatch(fetchUserRoles())
    }
  }, [profile?.id, roles.length, rolesLoading, dispatch])

  // Fetch SM rewards balance when profile is loaded
  useEffect(() => {
    if (profile?.id && smRewardsBalance === 0 && smRewardsLoading) {
      console.log('💰 Fetching SM rewards balance for profile:', profile.id)
      dispatch(fetchSMRewardsBalance())
    }
  }, [profile?.id, smRewardsBalance, smRewardsLoading, dispatch])

  // Return initialization status for debugging/monitoring
  return {
    isInitialized: isAuthenticated,
    hasProfile: !!profile?.id,
    hasRoles: roles.length > 0,
    hasSMRewards: smRewardsBalance > 0,
  }
} 