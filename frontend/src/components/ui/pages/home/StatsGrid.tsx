'use client';

import { Users, MapPin, Trophy, GraduationCap } from "lucide-react";

export default function StatsGrid() {
  const stats = [
    { number: "50K+", label: "Active Players", icon: Users, color: "from-blue-500 to-cyan-500" },
    { number: "1,200+", label: "Stadiums", icon: MapPin, color: "from-purple-500 to-pink-500" },
    { number: "300+", label: "Tournaments", icon: Trophy, color: "from-emerald-500 to-teal-500" },
    { number: "150+", label: "Academies", icon: GraduationCap, color: "from-orange-500 to-red-500" }
  ];

  return (
    <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-4 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="group text-center p-6 rounded-2xl bg-white/50 dark:bg-stone-800/50 backdrop-blur-sm border border-white/20 dark:border-stone-700/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
            <stat.icon className="h-8 w-8" />
          </div>
          <div className="text-4xl font-black text-gray-900 dark:text-white mb-2">{stat.number}</div>
          <div className="text-sm font-semibold text-gray-600 dark:text-stone-400 uppercase tracking-wide">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
