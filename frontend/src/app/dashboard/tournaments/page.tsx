import TournamentsDashboard from "@/components/ui/dashboard/TournamentsDashboard";
import { Metadata } from "next";
import React from "react";

// Note: Remove this if you're using 'use client' directive
export const metadata: Metadata = {
  title: "Dashboard | Users",
  description: "This is Next.js Users Table",
};

export default function TournamentsPage() {

  return <TournamentsDashboard />

}