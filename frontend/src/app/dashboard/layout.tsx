
import React from "react";
import DashboardLayoutWrapper from "@/layout/DashboardLayoutWrapper";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>;
}
