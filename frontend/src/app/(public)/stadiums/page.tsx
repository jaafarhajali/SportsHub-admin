import StadiumsClientPage from "@/components/ui/pages/stadiums/StadiumsClientPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stadiums | SportsHub",
  description: "Browse and book football stadiums available on SportsHub.",
};

export default function StadiumsPage() {
  return (
    <div className="container mx-auto px-4 pt-0">
      <StadiumsClientPage />
    </div>
  )
}