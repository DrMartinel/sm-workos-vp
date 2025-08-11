import type React from "react"

export default function WorkflowEditorLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <div className="h-screen">{children}</div>
}
