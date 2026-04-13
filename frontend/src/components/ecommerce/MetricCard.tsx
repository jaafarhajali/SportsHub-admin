'use client';
import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowUpIcon, ArrowDownIcon } from "@/icons";

interface MetricCardProps {
  title: string;
  value: string | number;
  growth?: number; // Optional: pass percentage to show a badge (positive/negative)
  icon?: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, growth, icon }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-stone-800 dark:bg-white/[0.03] md:p-6">
      {icon && (
        <div className="flex items-center justify-center w-12 h-12 text-white bg-[#1a7b9b] rounded-xl">
          {icon}
        </div>
      )}

      <div className="flex items-end justify-between mt-5">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
            {value}
          </h4>
        </div>

        {typeof growth === "number" && (
          <Badge color={growth >= 0 ? "success" : "error"}>
            {growth >= 0 ? (
              <ArrowUpIcon className="text-success-500" />
            ) : (
              <ArrowDownIcon className="text-error-500" />
            )}
            {Math.abs(growth).toFixed(2)}%
          </Badge>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
