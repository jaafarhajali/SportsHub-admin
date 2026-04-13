import RolesDashboard from "@/components/ui/dashboard/RolesDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard |  Roles",
  description:
    "This is Next.js Roles Table",
};

export default function RolesPage() {

  return <RolesDashboard />
}
