'use client';
import React, { useEffect, useState, useMemo } from 'react';
import StadiumCard from './StadiumCard';
import { Stadium } from '@/types/Stadium';
import { getAllStadiums } from '@/lib/api/stadium';
import {
  Search,
  MapPin,
  Star,
  Clock,
  Grid3X3,
  List,
  SlidersHorizontal,
  RefreshCw,
  Users,
  ChevronDown,
  X,
  DollarSign
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type SortOption = 'name' | 'price-low' | 'price-high' | 'location';

const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 flex items-center justify-center">
    <div className="text-center space-y-6">
      <div className="relative w-20 h-20 mx-auto">
        <div className="w-20 h-20 border-4 border-blue-200 dark:border-stone-600 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>
        <div className="absolute inset-4 border-2 border-purple-200 dark:border-stone-700 rounded-full animate-spin border-t-purple-600 dark:border-t-purple-400 animate-reverse"></div>
      </div>
    </div>
  </div>
);

const StadiumClientPage = () => {
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/auth/signin");
    } else if (token) {
      setAuthChecked(true);
    }
  }, [router]);

  useEffect(() => {
    if (authChecked) {
      fetchStadiums();
    }
  }, [authChecked]);

  const fetchStadiums = async (showRefreshAnimation = false) => {
    try {
      if (showRefreshAnimation) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      const stadiumList = await getAllStadiums();
      setStadiums(stadiumList);

      // Set initial price range based on data
      if (stadiumList.length > 0) {
        const prices = stadiumList.map((s: Stadium) => s.pricePerMatch).filter((p: number) => p);
        setPriceRange({
          min: Math.min(...prices),
          max: Math.max(...prices)
        });
      }
    } catch (error) {
      console.error("Failed to fetch stadiums:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Get unique locations for filter
  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(stadiums.map(stadium => stadium.location).filter(Boolean)));
  }, [stadiums]);

  // Filter and sort stadiums
  const filteredAndSortedStadiums = useMemo(() => {
    const filtered = stadiums.filter(stadium => {
      const matchesSearch = stadium.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stadium.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = stadium.pricePerMatch >= priceRange.min && stadium.pricePerMatch <= priceRange.max;
      const matchesLocation = !selectedLocation || stadium.location === selectedLocation;

      return matchesSearch && matchesPrice && matchesLocation;
    });

    // Sort based on selected option
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.pricePerMatch - b.pricePerMatch;
        case 'price-high':
          return b.pricePerMatch - a.pricePerMatch;
        case 'location':
          return a.location.localeCompare(b.location);
        default:
          return 0;
      }
    });

    return filtered;
  }, [stadiums, searchTerm, sortBy, priceRange, selectedLocation]);

  if (!authChecked) {
    // Show spinner while auth check is running
    return <LoadingSpinner />;
  }

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLocation('');
    setSortBy('name');
    if (stadiums.length > 0) {
      const prices = stadiums.map(s => s.pricePerMatch).filter(p => p);
      setPriceRange({
        min: Math.min(...prices),
        max: Math.max(...prices)
      });
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-stone-800 rounded-2xl shadow-lg overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-300 dark:bg-stone-700"></div>
          <div className="p-6">
            <div className="h-6 bg-gray-300 dark:bg-stone-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-stone-700 rounded mb-3 w-3/4"></div>
            <div className="h-4 bg-gray-300 dark:bg-stone-700 rounded mb-3 w-1/2"></div>
            <div className="h-10 bg-gray-300 dark:bg-stone-700 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-stone-900 dark:via-stone-800 dark:to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/10 to-teal-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <main className="relative pt-24 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 dark:from-stone-800/90 dark:via-slate-800/90 dark:to-stone-700/90 px-6 py-2 text-sm font-semibold text-blue-800 dark:text-blue-200 ring-1 ring-blue-500/20 mb-6">
              <MapPin className="mr-2 h-4 w-4" />
              Stadium Directory
            </div>

            <h1 className="text-5xl font-black tracking-tight text-gray-900 dark:text-white sm:text-6xl" style={{ marginBottom: '1rem' }}>
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Explore
              </span>
              <br />
              <span className="text-gray-700 dark:text-stone-300">Premium Stadiums</span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-stone-300 mx-auto font-medium leading-relaxed" style={{ marginBottom: '1rem' }}>
              Discover world-class stadiums near you. Book your perfect venue for an unforgettable match experience.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
              {[
                { icon: MapPin, number: stadiums.length, label: "Stadiums Available", color: "from-blue-500 to-cyan-500" },
                { icon: Users, number: "50K+", label: "Happy Players", color: "from-purple-500 to-pink-500" },
                { icon: Star, number: "4.9", label: "Average Rating", color: "from-yellow-500 to-orange-500" },
                { icon: Clock, number: "24/7", label: "Support", color: "from-emerald-500 to-teal-500" }
              ].map((stat, index) => (
                <div key={index} className="group text-center p-4 rounded-2xl bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm border border-white/20 dark:border-stone-700/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} text-white mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className="text-2xl font-black text-gray-900 dark:text-white">{stat.number}</div>
                  <div className="text-xs font-semibold text-gray-600 dark:text-stone-400 uppercase tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Search and Filter Section */}
          <div className="bg-white/70 dark:bg-stone-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-stone-700/30 p-8 mb-12">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search stadiums by name or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-stone-900 border border-gray-200 dark:border-stone-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none bg-white dark:bg-stone-900 border border-gray-200 dark:border-stone-600 rounded-2xl px-6 py-4 pr-12 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="location">Sort by Location</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-6 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl ${showFilters
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-gray-100 dark:bg-stone-700 text-gray-700 dark:text-stone-300 hover:bg-gray-200 dark:hover:bg-stone-600'
                  }`}
              >
                <SlidersHorizontal className="mr-2 h-5 w-5" />
                Filters
              </button>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 dark:bg-stone-700 rounded-2xl p-1 shadow-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-xl transition-all duration-300 ${viewMode === 'grid'
                    ? 'bg-white dark:bg-stone-600 shadow-md text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-stone-400 hover:text-gray-800 dark:hover:text-stone-200'
                    }`}
                >
                  <Grid3X3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-xl transition-all duration-300 ${viewMode === 'list'
                    ? 'bg-white dark:bg-stone-600 shadow-md text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-stone-400 hover:text-gray-800 dark:hover:text-stone-200'
                    }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => fetchStadiums(true)}
                disabled={isRefreshing}
                className="flex items-center px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                <RefreshCw className={`mr-2 h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-8 p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-stone-900/50 dark:to-stone-800/30 rounded-3xl border border-gray-200/50 dark:border-stone-600/50 animate-slideDown shadow-xl backdrop-blur-sm">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Location Filter */}
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-800 dark:text-stone-200 mb-2 flex items-center">
                      <MapPin className="mr-2 h-4 w-4 text-blue-500" />
                      Location
                    </label>
                    <div className="relative">
                      <select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="w-full bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-stone-600 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-300 dark:hover:border-stone-500 appearance-none cursor-pointer"
                      >
                        <option value="">🌍 All Locations</option>
                        {uniqueLocations.map(location => (
                          <option key={location} value={location}>📍 {location}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-1">
                    <label className="block text-sm font-bold text-gray-800 dark:text-stone-200 mb-2 flex items-center">
                      <DollarSign className="mr-2 h-4 w-4 text-green-500" />
                      Price Range (LBP)
                    </label>
                    <div className="flex gap-1">
                      <div className="flex-1 relative group">
                        <input
                          type="number"
                          placeholder="0"
                          value={priceRange.min || ''}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) || 0 }))}
                          className="w-full bg-gradient-to-r from-white/90 to-gray-50/90 dark:from-stone-800/90 dark:to-stone-700/90 backdrop-blur-sm border-2 border-gray-200 dark:border-stone-600 rounded-2xl pl-14 pr-4 py-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 hover:border-green-300 dark:hover:border-green-500/50 group-hover:shadow-lg group-hover:shadow-green-100 dark:group-hover:shadow-green-900/20"
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-lg">Min</span>
                          </div>
                        </div>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                          <span className="text-xs text-gray-400 font-medium">LBP</span>
                        </div>
                      </div>

                      <div className="flex-1 relative group">
                        <input
                          type="number"
                          placeholder="∞"
                          value={priceRange.max || ''}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) || 1000000 }))}
                          className="w-full bg-gradient-to-r from-white/90 to-gray-50/90 dark:from-stone-800/90 dark:to-stone-700/90 backdrop-blur-sm border-2 border-gray-200 dark:border-stone-600 rounded-2xl pl-14 pr-4 py-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 hover:border-green-300 dark:hover:border-green-500/50 group-hover:shadow-lg group-hover:shadow-green-100 dark:group-hover:shadow-green-900/20"
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">Max</span>
                          </div>
                        </div>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                          <span className="text-xs text-gray-400 font-medium">LBP</span>
                        </div>
                      </div>
                    </div>
                  </div>


                  {/* Clear Filters */}
                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      className="w-full px-6 py-3.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-2xl font-bold transition-all duration-300 flex items-center justify-center transform hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Active Filters Display */}
                {(selectedLocation || priceRange.min > 0 || priceRange.max < 1000000 || sortBy !== 'name') && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-stone-600">
                    <div className="flex flex-wrap gap-2">
                      {selectedLocation && (
                        <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium flex items-center">
                          📍 {selectedLocation}
                          <button
                            onClick={() => setSelectedLocation('')}
                            className="ml-2 hover:text-blue-900 dark:hover:text-blue-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      )}
                      {(priceRange.min > 0 || priceRange.max < 1000000) && (
                        <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium flex items-center">
                          💰 {priceRange.min.toLocaleString()} - {priceRange.max.toLocaleString()} LBP
                          <button
                            onClick={() => {
                              if (stadiums.length > 0) {
                                const prices = stadiums.map(s => s.pricePerMatch).filter(p => p);
                                setPriceRange({
                                  min: Math.min(...prices),
                                  max: Math.max(...prices)
                                });
                              }
                            }}
                            className="ml-2 hover:text-green-900 dark:hover:text-green-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      )}
                      {sortBy !== 'name' && (
                        <span className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium flex items-center">
                          🔄 {sortBy === 'price-low' ? 'Price (Low to High)' : sortBy === 'price-high' ? 'Price (High to Low)' : 'Location'}
                          <button
                            onClick={() => setSortBy('name')}
                            className="ml-2 hover:text-purple-900 dark:hover:text-purple-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <p className="text-lg font-semibold text-gray-700 dark:text-stone-300">
                <span className="text-blue-600 dark:text-blue-400 font-black text-xl">{filteredAndSortedStadiums.length}</span> stadiums found
              </p>
              {(searchTerm || selectedLocation || sortBy !== 'name') && (
                <div className="flex items-center space-x-2">
                  {searchTerm && (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                      &ldquo;{searchTerm}&rdquo;
                    </span>
                  )}
                  {selectedLocation && (
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                      📍 {selectedLocation}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Stadium Grid/List */}
          {loading ? (
            <LoadingSkeleton />
          ) : filteredAndSortedStadiums.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 dark:bg-stone-800 mb-6">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No stadiums found</h3>
              <p className="text-gray-600 dark:text-stone-400 mb-8 max-w-md mx-auto">
                Try adjusting your search criteria or filters to find the perfect stadium for your match.
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className={`${viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
              : 'space-y-6'
              } animate-fadeIn`}>
              {filteredAndSortedStadiums.map((stadium, index) => (
                <div
                  key={stadium._id}
                  className="animate-slideUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <StadiumCard
                    id={stadium._id}
                    image={stadium.photos?.[0]}
                    name={stadium.name}
                    pricePerMatch={stadium.pricePerMatch}
                    location={stadium.location}
                    workingHours={stadium.workingHours}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Enhanced CSS Animations */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
          opacity: 0;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default StadiumClientPage;
