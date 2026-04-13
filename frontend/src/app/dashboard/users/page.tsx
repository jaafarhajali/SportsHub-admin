import React from "react";
import { Metadata } from "next";
import UsersDashboard from "@/components/ui/dashboard/UsersDashbaord";

export const metadata: Metadata = {
  title: "Dashboard | Users",
  description: "This is Next.js Users Table",
};

export default function UsersPage() {

  return (
    <div>
      <UsersDashboard />
    </div>
  );
}