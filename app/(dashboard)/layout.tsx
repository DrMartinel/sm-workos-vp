import AppSidebar from "@/app/shared-ui/components/layout/app-sidebar";
import React from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppSidebar>{children}</AppSidebar>;
}
