'use client'

import { createClient } from '@/lib/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export const LogoutButton = () => {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-500 hover:bg-gray-100 hover:text-gray-900">
      <LogOut className="h-5 w-5" />
    </Button>
  )
} 