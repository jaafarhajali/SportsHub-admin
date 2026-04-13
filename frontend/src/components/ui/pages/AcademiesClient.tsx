'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { getAllAcademies } from '@/lib/api/academy';
import { Academy } from '@/types/Academy';
import { toast } from 'react-toastify';
import {
  Search,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Trophy,
  Users,
  Filter,
  ChevronDown,
  SlidersHorizontal,
  Sparkles,
  AlertCircle,
  Grid,
  List
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Enhanced Loading Component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 flex items-center justify-center">
    <div className="text-center space-y-6">
      <div className="relative w-20 h-20 mx-auto">
        <div className="w-20 h-20 border-4 border-green-200 dark:border-stone-600 rounded-full animate-spin border-t-green-600 dark:border-t-green-400"></div>
        <div className="absolute inset-4 border-2 border-blue-200 dark:border-stone-700 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400 animate-reverse"></div>
      </div>
    </div>
  </div>
);

// Enhanced Error Component  
const ErrorMessage = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 flex items-center justify-center">
    <div className="text-center space-y-8 max-w-md mx-auto px-6">
      <div className="relative">
        <div className="w-24 h-24 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
        </div>
        <div className="absolute inset-0 w-24 h-24 mx-auto bg-red-500/20 rounded-full animate-ping"></div>
      </div>
      <div className="space-y-3">
        <h3 className="text-2xl font-black text-gray-900 dark:text-white">Oops! Something went wrong</h3>
        <p className="text-gray-600 dark:text-stone-400 font-medium leading-relaxed">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="group px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-2xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl flex items-center justify-center gap-3"
      >
        <span className="group-hover:scale-110 transition-transform">🔄</span>
        Try Again
      </button>
    </div>
  </div>
);

export default function AcademiesClient() {
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    sortBy: 'newest',
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

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
      fetchAcademies();
      setIsClient(true);
    }
  }, [authChecked]);

  const fetchAcademies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllAcademies();
      setAcademies(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch academies';
      setError(errorMessage);
      toast.error('Failed to fetch academies');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Default image URL for academies without photos
  const DEFAULT_ACADEMY_IMAGE = "https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1993&q=80";

  // Filter and sort academies
  const filteredAcademies = useMemo(() => {
    if (!Array.isArray(academies)) return [];

    const filtered = academies.filter(academy => {
      if (!academy || typeof academy !== 'object') return false;

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          (academy.name && academy.name.toLowerCase().includes(searchLower)) ||
          (academy.location && academy.location.toLowerCase().includes(searchLower)) ||
          (academy.email && academy.email.toLowerCase().includes(searchLower)) ||
          (academy.description && academy.description.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Location filter
      if (filters.location) {
        if (!academy.location || !academy.location.toLowerCase().includes(filters.location.toLowerCase())) {
          return false;
        }
      }

      return true;
    });

    // Sort academies
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'oldest':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'location':
          return (a.location || '').localeCompare(b.location || '');
        case 'newest':
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });

    return filtered;
  }, [academies, filters]);

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  const handleRetry = () => {
    fetchAcademies();
  };

  if (!authChecked) {
    return <LoadingSpinner />;
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={handleRetry} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900">
      {/* Enhanced Page Header */}
      <div className="relative overflow-hidden bg-white/80 dark:bg-stone-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-stone-700/50">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-blue-500/5 to-cyan-500/5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full blur-3xl -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-cyan-400/10 to-green-400/10 rounded-full blur-2xl translate-y-32 -translate-x-32"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative p-4 bg-gradient-to-br from-green-400 to-blue-500 rounded-3xl shadow-xl">
                <Trophy className="w-12 h-12 text-white" />
                <div className="absolute inset-0 bg-white/20 rounded-3xl blur-sm"></div>
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 dark:text-white">
                <span className="bg-gradient-to-r from-green-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                  Football Academies
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-stone-300 font-medium mx-auto leading-relaxed">
                Discover top-rated football academies. Find the perfect training environment to develop <br /> your skills and pursue your dreams!
              </p>
            </div>

            {/* Quick Stats Preview */}
            <div className="flex flex-wrap justify-center gap-6 pt-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-stone-700/50">
                <Trophy className="w-5 h-5 text-green-500" />
                <span className="font-bold text-gray-900 dark:text-white">{academies.length} Academies</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-stone-700/50">
                <span className="text-xl">⚽</span>
                <span className="font-bold text-gray-900 dark:text-white">Elite Training</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-stone-700/50">
                <span className="text-xl">🏆</span>
                <span className="font-bold text-gray-900 dark:text-white">Professional Coaches</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Enhanced Search and Filters */}
        <div className="relative overflow-hidden bg-white/80 dark:bg-stone-800/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/50 dark:border-stone-700/50 p-6 min-h-full">
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-blue-500/5 to-cyan-500/5 rounded-3xl"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-400/10 to-green-400/10 rounded-full blur-xl"></div>

          <div className="relative space-y-6">
            {/* Enhanced Search Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl shadow-lg">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">Find Your Academy</h3>
                  <p className="text-sm text-gray-600 dark:text-stone-400 font-medium">Search by name, location, contact info, or description</p>
                </div>
              </div>

              {/* Enhanced Search Bar */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-stone-500 w-5 h-5 group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search academies by name, location, email, or description..."
                    className="w-full pl-12 pr-6 py-4 bg-gray-50/80 dark:bg-stone-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-stone-600/50 rounded-2xl placeholder-gray-500 dark:placeholder-stone-400 text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300 hover:shadow-lg"
                    value={filters.search}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                  {/* Search glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>
              </div>
            </div>

            {/* Enhanced Filter Section */}
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

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-stone-700 rounded-2xl">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-xl transition-all duration-300 ${viewMode === 'grid'
                    ? 'bg-white dark:bg-stone-600 shadow-md text-green-600 dark:text-green-400'
                    : 'text-gray-500 dark:text-stone-400 hover:text-green-600 dark:hover:text-green-400'
                    }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-xl transition-all duration-300 ${viewMode === 'list'
                    ? 'bg-white dark:bg-stone-600 shadow-md text-green-600 dark:text-green-400'
                    : 'text-gray-500 dark:text-stone-400 hover:text-green-600 dark:hover:text-green-400'
                    }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Enhanced Filters Section */}
            {isFilterOpen && (
              <div className="mt-6 pt-6 border-t border-gradient-to-r from-gray-200/50 via-indigo-200/50 to-purple-200/50 dark:from-stone-600/50 dark:via-indigo-700/50 dark:to-purple-700/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Location Filter */}
                  <div className="group space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <label className="text-sm font-bold text-gray-700 dark:text-white uppercase tracking-wider">Location</label>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Filter by location..."
                        value={filters.location}
                        onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-4 py-3 bg-green-50/80 dark:bg-green-900/20 border border-green-200/50 dark:border-green-700/50 rounded-2xl text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300 hover:shadow-md group-hover:bg-green-50 dark:group-hover:bg-green-900/30"
                      />
                    </div>
                  </div>

                  {/* Sort By */}
                  <div className="group space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <label className="text-sm font-bold text-gray-700 dark:text-white uppercase tracking-wider">Sort By</label>
                    </div>
                    <div className="relative">
                      <select
                        value={filters.sortBy}
                        onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                        className="w-full px-4 py-3 bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-700/50 rounded-2xl text-gray-900 dark:text-white font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:shadow-md group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30"
                      >
                        <option value="newest">🆕 Newest First</option>
                        <option value="oldest">📅 Oldest First</option>
                        <option value="name">🔤 Name A-Z</option>
                        <option value="location">📍 Location A-Z</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500 dark:text-blue-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Results Count */}
                  <div className="group space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <label className="text-sm font-bold text-gray-700 dark:text-white uppercase tracking-wider">Results</label>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50/80 dark:bg-purple-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
                      <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span className="text-lg font-black text-purple-700 dark:text-purple-300">
                        {filteredAcademies.length} Found
                      </span>
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
                      if (value && key !== 'sortBy') {
                        const labels: { [key: string]: string } = {
                          search: '🔍 Search',
                          location: '📍 Location'
                        };

                        return (
                          <div key={key} className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl border border-indigo-200/50 dark:border-indigo-700/50">
                            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                              {labels[key] || key}: {value}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    })}

                    {(filters.search || filters.location) && (
                      <button
                        onClick={() => setFilters({ search: '', location: '', sortBy: 'newest' })}
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

        {/* Results Section */}
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-stone-800/80 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-stone-700/50 shadow-lg">
              <Trophy className="w-5 h-5 text-green-500" />
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                {filteredAcademies.length} Academ{filteredAcademies.length !== 1 ? 'ies' : 'y'} Found
              </h2>
            </div>
          </div>

          {filteredAcademies.length === 0 ? (
            <div className="text-center py-16 space-y-6">
              <div className="relative">
                <div className="w-24 h-24 mx-auto bg-gray-100 dark:bg-stone-700 rounded-full flex items-center justify-center">
                  <Trophy className="w-12 h-12 text-gray-400 dark:text-stone-500" />
                </div>
                <div className="absolute inset-0 w-24 h-24 mx-auto bg-gray-500/20 rounded-full animate-ping"></div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">No Academies Found</h3>
                <p className="text-gray-600 dark:text-stone-400 font-medium max-w-md mx-auto">
                  No academies match your current filters. Try adjusting your search criteria or check back later for new academies!
                </p>
              </div>
            </div>
          ) : (
            <div className={viewMode === 'grid'
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
              : "space-y-6"
            }>
              {filteredAcademies.map((academy, index) => (
                <div
                  key={academy._id}
                  className={isClient ? "animate-fadeInUp" : ""}
                  style={isClient ? { animationDelay: `${index * 100}ms` } : {}}
                  suppressHydrationWarning={true}
                >
                  <div className={`group relative bg-white/80 dark:bg-stone-800/80 backdrop-blur-md rounded-3xl shadow-lg hover:shadow-2xl border border-gray-200/50 dark:border-stone-700/50 transition-all duration-500 ${isClient ? 'transform hover:-translate-y-2' : ''} overflow-hidden ${viewMode === 'list' ? 'flex flex-col md:flex-row gap-6' : ''
                    }`} suppressHydrationWarning={true}>
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Academy Image */}
                    <div className={`relative overflow-hidden ${viewMode === 'list'
                      ? 'w-full md:w-48 lg:w-56 xl:w-64 md:flex-shrink-0 h-48 md:h-auto'
                      : 'w-full h-48 sm:h-56 md:h-64 lg:h-72'
                      }`} suppressHydrationWarning={true}>
                      <Image
                        src={
                          academy.photos && academy.photos.length > 0
                            ? `http://localhost:8080${academy.photos[0]}`
                            : DEFAULT_ACADEMY_IMAGE
                        }
                        alt={academy.name || 'Football Academy'}
                        width={400}
                        height={250}
                        className={`object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110 ${viewMode === 'list'
                          ? 'w-full h-full rounded-t-3xl md:rounded-l-3xl md:rounded-t-none'
                          : 'w-full h-48 sm:h-56 md:h-64 lg:h-72 rounded-t-3xl'
                          }`}
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          if (target.src !== DEFAULT_ACADEMY_IMAGE) {
                            target.src = DEFAULT_ACADEMY_IMAGE;
                          }
                        }}
                      />

                      {/* Enhanced gradient overlay with responsive opacity */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                      {/* Responsive status badge */}
                      <div className="absolute top-3 left-3" suppressHydrationWarning={true}>
                        <div className="px-2 py-1 bg-green-500/90 backdrop-blur-sm rounded-full text-xs font-bold text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          Active
                        </div>
                      </div>

                      {/* Default Image Overlay with enhanced responsive design */}
                      {(!academy.photos || academy.photos.length === 0) && (
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-blue-500/15 to-cyan-500/10 flex items-center justify-center" suppressHydrationWarning={true}>
                          <div className="text-center space-y-3 p-4 sm:p-6">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all duration-300">
                              <Trophy className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs sm:text-sm font-bold text-white bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                                Football Academy
                              </p>
                              <p className="text-xs text-white/80 bg-black/20 px-2 py-1 rounded-full">
                                Professional Training
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Loading shimmer effect */}
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        suppressHydrationWarning={true}
                      ></div>
                    </div>

                    <div className="relative p-6 space-y-4 flex-1">
                      {/* Academy Header */}
                      <div className="space-y-3">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                          {academy.name}
                        </h2>

                        {/* Academy Description */}
                        {academy.description && (
                          <div className="flex items-start gap-3 p-3 bg-amber-50/50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/50">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex-shrink-0">
                              <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">About</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed" title={academy.description}>
                                {academy.description.length > 120
                                  ? `${academy.description.substring(0, 110)}...`
                                  : academy.description
                                }
                              </p>
                              {academy.description.length > 110 && (
                                <button
                                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors mt-1"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const element = e.currentTarget.previousElementSibling as HTMLElement;
                                    if (element.title === academy.description) {
                                      if (element.textContent?.includes('...')) {
                                        element.textContent = academy.description;
                                        e.currentTarget.textContent = 'Show Less';
                                      } else {
                                        element.textContent = `${academy.description.substring(0, 120)}...`;
                                        e.currentTarget.textContent = 'Read More';
                                      }
                                    }
                                  }}
                                >
                                  Read More
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Academy Details */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-green-50/50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800/50">
                          <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-xl">
                            <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">Location</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={academy.location}>
                              {academy.location}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex items-center gap-3 p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl">
                              <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Phone</p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate font-mono" title={academy.phoneNumber}>
                                {academy.phoneNumber}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-purple-50/50 dark:bg-purple-900/20 rounded-2xl border border-purple-100 dark:border-purple-800/50">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-xl">
                              <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">Email</p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={academy.email}>
                                {academy.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Created Date */}
                      <div className="flex items-center gap-3 p-3 bg-gray-50/80 dark:bg-stone-700/50 rounded-2xl border border-gray-200/50 dark:border-stone-600/50">
                        <div className="p-2 bg-gray-100 dark:bg-stone-600 rounded-xl">
                          <Calendar className="w-4 h-4 text-gray-600 dark:text-stone-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-500 dark:text-stone-400 uppercase tracking-wide">Established</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {new Date(academy.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
