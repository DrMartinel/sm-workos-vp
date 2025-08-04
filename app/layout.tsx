import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import ReactQueryProvider from "@/components/react-query-provider"
import { ReduxProvider } from "@/store/provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Smartmove WorkOS",
  description: "Hệ thống quản lý không gian làm việc thông minh",
  generator: "v0.dev",
  manifest: "/manifest.json",
  icons: {
    apple: "/icons/icon-192.png",
  },
  other: {
    "color-scheme": "light only",
    "theme-color": "#ffffff",
  },
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <ReduxProvider>
        <ThemeProvider attribute="class" forcedTheme="light">
          <ReactQueryProvider>{children}</ReactQueryProvider>
        </ThemeProvider>
        </ReduxProvider>
        <Toaster />
      </body>
    </html>
  )
}
