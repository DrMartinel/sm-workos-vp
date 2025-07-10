"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Download, LogOut, User, Settings } from "lucide-react"
import { usePWAInstall } from "@/hooks/use-pwa-install"
import { createClient } from "@/lib/utils/supabase/client"
import { useRouter } from "next/navigation"

export function UserProfileDropdown() {
  const { handleInstall, installState } = usePWAInstall()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 overflow-hidden rounded-full bg-gray-200 hover:bg-gray-300">
          <User className="h-full w-full p-2 text-gray-500" />
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        {installState === "available" && (
          <DropdownMenuItem onClick={handleInstall}>
            <Download className="mr-2 h-4 w-4" />
            <span>Install App</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 