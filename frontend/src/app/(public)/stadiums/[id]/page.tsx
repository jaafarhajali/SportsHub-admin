import { Metadata } from "next";
import StadiumClientPage from "@/components/ui/pages/stadiums/StadiumClientPage";

export const metadata: Metadata = {
  title: "Stadium Details | SportsHub",
  description: "View stadium details, availability, and booking options on SportsHub.",
};

export default function StadiumDetailPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <StadiumClientPage />
    </div>
  );
}
