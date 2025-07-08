"use client"

import { usePWAInstall } from "@/hooks/use-pwa-install"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function PWAInstallButton() {
  const { handleInstall, installState } = usePWAInstall()

  if (installState !== "available") {
    return null
  }

  return (
    <Button onClick={handleInstall} variant="outline" size="sm">
      <Download className="mr-2 h-4 w-4" />
      Install App
    </Button>
  )
} 