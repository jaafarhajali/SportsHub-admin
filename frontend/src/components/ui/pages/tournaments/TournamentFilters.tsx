'use client';
import { Search, Filter, ChevronDown, Sparkles, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

interface TournamentFiltersProps {
  filters: {
    search: string;
    status: string;
    maxEntryPrice: string;
    maxTeams: string;
    sortBy: string;
    joinedOnly: boolean;
  };
  onFiltersChange: (filters: TournamentFiltersProps['filters']) => void;
  onSearch: (search: string) => void;
}

const TournamentFilters = ({ filters, onFiltersChange, onSearch }: TournamentFiltersProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="relative overflow-hidden bg-white/80 dark:bg-stone-800/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/50 dark:border-stone-700/50 p-6 min-h-full">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 rounded-3xl"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-400/10 to-blue-400/10 rounded-full blur-xl"></div>
      
      <div className="relative space-y-6">
        {/* Enhanced Search Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-lg">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Find Your Tournament</h3>
              <p className="text-sm text-gray-600 dark:text-stone-400 font-medium">Search and filter through epic competitions</p>
            </div>
          </div>
          
          {/* Enhanced Search Bar */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-stone-500 w-5 h-5 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
              <input
                type="text"
                placeholder="Search tournaments by name, description, or organizer..."
                className="w-full pl-12 pr-6 py-4 bg-gray-50/80 dark:bg-stone-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-stone-600/50 rounded-2xl placeholder-gray-500 dark:placeholder-stone-400 text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:shadow-lg"
                value={filters.search}
                onChange={(e) => onSearch(e.target.value)}
              />
              {/* Search glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </div>
          </div>
        </div>

        {/* Enhanced Filter Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/50 dark:hover:to-purple-900/50 rounded-2xl border border-indigo-200/50 dark:border-indigo-700/50 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="p-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-md group-hover:scale-110 transition-transform">
              <SlidersHorizontal className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">Advanced Filters</span>
            <ChevronDown className={`w-5 h-5 text-gray-600 dark:text-stone-400 transition-all duration-300 ${isFilterOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''}`} />
            <div className="flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
              <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">Smart</span>
            </div>
          </button>
        </div>

        {/* Enhanced Filters Section */}
        {isFilterOpen && (
          <div className="mt-6 pt-6 border-t border-gradient-to-r from-gray-200/50 via-indigo-200/50 to-purple-200/50 dark:from-stone-600/50 dark:via-indigo-700/50 dark:to-purple-700/50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Status Filter */}
              <div className="group space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <label className="text-sm font-bold text-gray-700 dark:text-white uppercase tracking-wider">Status</label>
                </div>
                <div className="relative">
                  <select
                    value={filters.status}
                    onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
                    className="w-full px-4 py-3 bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-700/50 rounded-2xl text-gray-900 dark:text-white font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:shadow-md group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30"
                  >
                    <option value="">🌟 All Status</option>
                    <option value="upcoming">🚀 Upcoming</option>
                    <option value="ongoing">🔥 Ongoing</option> 
                    <option value="completed">✅ Completed</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500 dark:text-blue-400 pointer-events-none" />
                </div>
              </div>

              {/* Entry Price Range */}
              <div className="group space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <label className="text-sm font-bold text-gray-700 dark:text-white uppercase tracking-wider">Max Entry Price</label>
                </div>
                <div className="relative">
                  <select
                    value={filters.maxEntryPrice}
                    onChange={(e) => onFiltersChange({ ...filters, maxEntryPrice: e.target.value })}
                    className="w-full px-4 py-3 bg-green-50/80 dark:bg-green-900/20 border border-green-200/50 dark:border-green-700/50 rounded-2xl text-gray-900 dark:text-white font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300 hover:shadow-md group-hover:bg-green-50 dark:group-hover:bg-green-900/30"
                  >
                    <option value="">💰 Any Price</option>
                    <option value="1000000">💵 Up to $1M</option>
                    <option value="3000000">💸 Up to $3M</option>
                    <option value="5000000">💎 Up to $5M</option>
                    <option value="10000000">👑 Up to $10M</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500 dark:text-green-400 pointer-events-none" />
                </div>
              </div>

              {/* Team Size */}
              <div className="group space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <label className="text-sm font-bold text-gray-700 dark:text-white uppercase tracking-wider">Max Teams</label>
                </div>
                <div className="relative">
                  <select
                    value={filters.maxTeams}
                    onChange={(e) => onFiltersChange({ ...filters, maxTeams: e.target.value })}
                    className="w-full px-4 py-3 bg-purple-50/80 dark:bg-purple-900/20 border border-purple-200/50 dark:border-purple-700/50 rounded-2xl text-gray-900 dark:text-white font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 hover:shadow-md group-hover:bg-purple-50 dark:group-hover:bg-purple-900/30"
                  >
                    <option value="">👥 Any Size</option>
                    <option value="8">🏃 Up to 8 teams</option>
                    <option value="16">⚡ Up to 16 teams</option>
                    <option value="32">🏆 Up to 32 teams</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-500 dark:text-purple-400 pointer-events-none" />
                </div>
              </div>

              {/* Sort By */}
              <div className="group space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <label className="text-sm font-bold text-gray-700 dark:text-white uppercase tracking-wider">Sort By</label>
                </div>
                <div className="relative">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value })}
                    className="w-full px-4 py-3 bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-700/50 rounded-2xl text-gray-900 dark:text-white font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duration-300 hover:shadow-md group-hover:bg-amber-50 dark:group-hover:bg-amber-900/30"
                  >
                    <option value="joined">✅ Joined Only</option>
                    <option value="newest">🆕 Newest First</option>
                    <option value="oldest">📅 Oldest First</option>
                    <option value="startDate">🗓️ Start Date</option>
                    <option value="entryPrice">💵 Entry Price</option>
                    <option value="rewardPrize">🏆 Prize Pool</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-500 dark:text-amber-400 pointer-events-none" />
                </div>
              </div>
            </div>
            
            {/* Filter Summary */}
            <div className="mt-6 pt-4 border-t border-gray-200/50 dark:border-stone-600/50">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500 dark:text-stone-400" />
                  <span className="text-sm font-medium text-gray-600 dark:text-stone-400">Active Filters:</span>
                </div>
                
                {Object.entries(filters).map(([key, value]) => {
                  if (value && key !== 'search') {
                    const labels: { [key: string]: string } = {
                      status: '📊 Status',
                      maxEntryPrice: '💰 Price',
                      maxTeams: '👥 Teams',
                      sortBy: '🔄 Sort'
                    };
                    
                    return (
                      <div key={key} className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl border border-indigo-200/50 dark:border-indigo-700/50">
                        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                          {labels[key] || key}: {typeof value === 'string' ? value : String(value)}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })}
                
                {Object.values(filters).some(value => value && typeof value === 'string' && value !== filters.search) && (
                  <button
                    onClick={() => onFiltersChange({ ...filters, status: '', maxEntryPrice: '', maxTeams: '', sortBy: 'newest' })}
                    className="px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentFilters;