'use client';
import { Trophy, Calendar, Users, Banknote, TrendingUp, Zap } from "lucide-react";
import { useMemo } from "react";
import { formatCurrency, getTournamentStatus } from '@/lib/utils/utils';

interface TournamentStatsProps {
  tournaments: any[];
}

const TournamentStats = ({ tournaments }: TournamentStatsProps) => {
  const stats = useMemo(() => {
    const total = tournaments.length;
    const upcoming = tournaments.filter(t => getTournamentStatus(t.startDate, t.endDate) === 'upcoming').length;
    const ongoing = tournaments.filter(t => getTournamentStatus(t.startDate, t.endDate) === 'ongoing').length;
    const totalPrizePool = tournaments.reduce((sum, t) => sum + (t.rewardPrize || 0), 0);

    return { total, upcoming, ongoing, totalPrizePool };
  }, [tournaments]);

  const statCards = [
    {
      title: 'Total Tournaments',
      value: stats.total,
      icon: Trophy,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
      borderColor: 'border-blue-200 dark:border-blue-700',
      textColor: 'text-blue-600 dark:text-blue-400',
      valueColor: 'text-blue-700 dark:text-blue-300',
      emoji: '🏆'
    },
    {
      title: 'Upcoming',
      value: stats.upcoming,
      icon: Calendar,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
      borderColor: 'border-purple-200 dark:border-purple-700',
      textColor: 'text-purple-600 dark:text-purple-400',
      valueColor: 'text-purple-700 dark:text-purple-300',
      emoji: '🚀'
    },
    {
      title: 'Live Now',
      value: stats.ongoing,
      icon: Zap,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      borderColor: 'border-green-200 dark:border-green-700',
      textColor: 'text-green-600 dark:text-green-400',
      valueColor: 'text-green-700 dark:text-green-300',
      emoji: '🔥'
    },
    {
      title: 'Total Prize Pool',
      value: formatCurrency(stats.totalPrizePool),
      icon: Banknote,
      gradient: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
      borderColor: 'border-amber-200 dark:border-amber-700',
      textColor: 'text-amber-600 dark:text-amber-400',
      valueColor: 'text-amber-700 dark:text-amber-300',
      emoji: '💰'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`group relative bg-gradient-to-br ${card.bgGradient} backdrop-blur-md rounded-3xl shadow-lg hover:shadow-2xl border ${card.borderColor} transition-all duration-500 transform hover:-translate-y-2 overflow-hidden`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Floating decoration */}
            <div className="absolute top-2 right-2 w-16 h-16 bg-gradient-to-br from-white/10 to-white/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative p-6 space-y-4">
              {/* Header with emoji and icon */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{card.emoji}</div>
                  <p className={`text-sm font-bold ${card.textColor} uppercase tracking-wider`}>
                    {card.title}
                  </p>
                </div>
                <div className={`p-3 bg-gradient-to-r ${card.gradient} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              
              {/* Value with enhanced styling */}
              <div className="space-y-1">
                <p className={`text-3xl font-black ${card.valueColor} group-hover:scale-105 transition-transform duration-300`}>
                  {card.value}
                </p>
                {card.title === 'Total Prize Pool' && stats.totalPrizePool > 0 && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className={`w-4 h-4 ${card.textColor}`} />
                    <span className={`text-xs font-semibold ${card.textColor}`}>
                      Growing strong!
                    </span>
                  </div>
                )}
                {card.title === 'Live Now' && stats.ongoing > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className={`text-xs font-semibold ${card.textColor}`}>
                      Active competitions
                    </span>
                  </div>
                )}
                {card.title === 'Upcoming' && stats.upcoming > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                    <span className={`text-xs font-semibold ${card.textColor}`}>
                      Ready to join
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TournamentStats;
