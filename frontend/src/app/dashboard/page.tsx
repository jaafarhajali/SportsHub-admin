import type { Metadata } from "next";
import React from "react";
import DashboardClient from "@/components/ui/dashboard/DashboardCLient";

export const metadata: Metadata = {
  title: "Dashboard | Stats",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

export default function Dashboard() {

  return <DashboardClient />
}
