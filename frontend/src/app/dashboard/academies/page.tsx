import AcademiesDashbaord from "@/components/ui/dashboard/AcademiesDashboard";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: "Dashboard | Academys",
  description: "This is Next.js Academys Table",
};

export default function AcademiesPage() {

  return <AcademiesDashbaord />
}