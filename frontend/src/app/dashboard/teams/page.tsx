
import TeamsDashboard from "@/components/ui/dashboard/TeamsDashboard";
import { Metadata } from "next";
import React from "react";

// Note: Remove this if you're using 'use client' directive
export const metadata: Metadata = {
  title: "Dashboard | Teams",
  description: "This is Next.js Bookings Table",
};

export default function BookingsPage() {

  return <TeamsDashboard />

}