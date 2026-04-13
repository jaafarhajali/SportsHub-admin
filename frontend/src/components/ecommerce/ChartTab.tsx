"use client";
import { useState } from "react";

const options = [
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Yearly", value: "yearly" },
];

export default function ChartTab({ onChange }: { onChange: (val: string) => void }) {
  const [selected, setSelected] = useState("monthly");

  return (
    <div className="flex gap-2 bg-gray-100 p-1 rounded-full dark:bg-gray-800">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => {
            setSelected(opt.value);
            onChange(opt.value);
          }}
          className={`px-4 py-1 text-sm rounded-full ${
            selected === opt.value
              ? "bg-white text-gray-900 dark:bg-white/10 dark:text-white"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
