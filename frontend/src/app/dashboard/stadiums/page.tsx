import StadiumsDashboard from "@/components/ui/dashboard/StadiumsDashbaord";
import { Metadata } from "next";
import React from "react";


export const metadata: Metadata = {
  title: "Dashboard | Stadiums",
  description: "This is Next.js Stadiums Table",
};

export default function StadiumsPage() {
  
  return <StadiumsDashboard />;
}