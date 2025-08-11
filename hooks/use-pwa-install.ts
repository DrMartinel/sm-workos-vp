"use client"

import { useState, useEffect, useCallback } from "react"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

type InstallState = "idle" | "available" | "installing" | "installed"

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installState, setInstallState] = useState<InstallState>("idle")

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
      setInstallState("available")
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    const handleAppInstalled = () => {
      setInstallState("installed")
      setInstallPrompt(null)
    }

    window.addEventListener("appinstalled", handleAppInstalled)

    // Check if the app is already installed
    if (typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches) {
      setInstallState("installed")
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstall = useCallback(async () => {
    if (!installPrompt) {
      return
    }

    setInstallState("installing")
    await installPrompt.prompt()

    const { outcome } = await installPrompt.userChoice
    if (outcome === "accepted") {
      setInstallState("installed")
    } else {
      setInstallState("available")
    }
    setInstallPrompt(null)
  }, [installPrompt])

  return { handleInstall, installState }
} 