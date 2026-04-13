"use client";
import { useEffect, useState } from "react";
import { getDashboardMetrics } from "@/lib/api/dashboard/dashboard";
import MetricCard from "./MetricCard";
import { UserIcon, BuildingIcon, ClipboardIcon, TrophyIcon, Banknote } from "lucide-react";

export const EcommerceMetrics = () => {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    async function fetchMetrics() {
      const data = await getDashboardMetrics();
      setMetrics(data);
    }
    fetchMetrics();
  }, []);

  if (!metrics) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
      {metrics.role === "admin" && (
        <>
          <MetricCard title="Users" value={metrics.userCount} icon={<UserIcon />} />
          <MetricCard title="Stadiums" value={metrics.stadiumCount} icon={<BuildingIcon />} />
          <MetricCard title="Bookings" value={metrics.bookingCount} icon={<ClipboardIcon />} />
          <MetricCard title="Tournaments" value={metrics.tournamentCount} icon={<TrophyIcon />} />
        </>
      )}

      {metrics.role === "stadiumOwner" && (
        <>
          <MetricCard title="My Stadiums" value={metrics.stadiumCount} icon={<BuildingIcon />} />
          <MetricCard title="Bookings" value={metrics.bookingCount} icon={<ClipboardIcon />} />
          <MetricCard title="Tournaments" value={metrics.tournamentCount} icon={<TrophyIcon />} />
          <MetricCard title="Profit" value={`${metrics.profit?.toFixed(2)} LBP`} icon={<Banknote />} />
        </>
      )}

      {metrics.role === "academyOwner" && (
        <>
          <MetricCard title="Users can see your academy" value={metrics.userCount} icon={<UserIcon />} />
        </>
      )}
    </div>
  );
};
