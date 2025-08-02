import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/shared-ui/lib/utils/supabase/client'
import { useAppDispatch } from '../hooks'
import { checkAuthStatus, fetchUserProfile, fetchSMRewardsBalance } from '../slices/userSlice'
import { toast } from '@/components/ui/use-toast'

interface LoginFormData {
  email: string
  password: string
}

interface LoginErrors {
  email?: string
  password?: string
  form?: string
}

export function useLogin() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<LoginErrors>({})

  const validateForm = (data: LoginFormData) => {
    const newErrors: LoginErrors = {}
    if (!data.email) newErrors.email = "Email is required"
    if (!data.password) newErrors.password = "Password is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (data: LoginFormData) => {
    if (!validateForm(data)) return

    setIsLoading(true)
    setErrors({})
    
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        setErrors({ form: error.message })
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Login Successful",
          description: "Redirecting to your dashboard...",
        })
        
        // Update Redux state with new user data
        await dispatch(checkAuthStatus())
        await dispatch(fetchUserProfile())
        await dispatch(fetchSMRewardsBalance())
        
        // Redirect to dashboard
        router.push('/reports/overview')
        router.refresh()
      }
    } catch (error) {
      setErrors({ form: 'An unexpected error occurred' })
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearErrors = () => {
    setErrors({})
  }

  return {
    isLoading,
    errors,
    handleLogin,
    clearErrors,
  }
} 