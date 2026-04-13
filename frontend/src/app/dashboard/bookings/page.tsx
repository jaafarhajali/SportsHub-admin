import BookingsDashboard from "@/components/ui/dashboard/BookingsDashboard";
import { Metadata } from "next";
import React from "react";

// Note: Remove this if you're using 'use client' directive
export const metadata: Metadata = {
  title: "Dashboard | Bookings",
  description: "This is Next.js Bookings Table",
};

export default function BookingsPage() {

  return <BookingsDashboard />

}