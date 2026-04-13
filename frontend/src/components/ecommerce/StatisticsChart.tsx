"use client";
import React, { useEffect, useState } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { getDashbaordStats } from "@/lib/api/dashboard/dashboard";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function StatisticsChart() {
  const [series, setSeries] = useState([
    { name: "Bookings", data: Array(12).fill(0) },
    { name: "Tournaments", data: Array(12).fill(0) },
  ]);

  const fetchStats = async () => {
    try {
      const res = await getDashbaordStats("monthly");

      // Defensive: make sure these exist
      const bookingsArray = res.data?.bookings || [];
      const tournamentsArray = res.data?.tournaments || [];

      const bookingsData = Array(12).fill(0);
      const tournamentsData = Array(12).fill(0);

      bookingsArray.forEach((item: { _id: number; profit: number }) => {
        bookingsData[item._id - 1] = item.profit;
      });

      tournamentsArray.forEach((item: { _id: number; profit: number }) => {
        tournamentsData[item._id - 1] = item.profit;
      });

      setSeries([
        { name: "Bookings", data: bookingsData },
        { name: "Tournaments", data: tournamentsData },
      ]);
    } catch (err) {
      console.error("Error loading stats:", err);
      setSeries([
        { name: "Bookings", data: Array(12).fill(0) },
        { name: "Tournaments", data: Array(12).fill(0) },
      ]);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const options: ApexOptions = {
    legend: {
      show: false,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#465FFF", "#9CB9FF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line",
      toolbar: { show: false },
    },
    stroke: {
      curve: "straight",
      width: [2, 2],
    },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.55, opacityTo: 0 },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 6 },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      x: { format: "dd MMM yyyy" },
    },
    xaxis: {
      type: "category",
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: {
        style: { fontSize: "12px", colors: ["#6B7280"] },
      },
      title: {
        text: "",
        style: { fontSize: "0px" },
      },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Statistics</h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Target you’ve set for each month
          </p>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          <ReactApexChart
            options={options}
            series={series.length ? series : [{ name: "Profit", data: Array(12).fill(0) }]}
            type="area"
            height={310}
          />
        </div>
      </div>
    </div>
  );
}
