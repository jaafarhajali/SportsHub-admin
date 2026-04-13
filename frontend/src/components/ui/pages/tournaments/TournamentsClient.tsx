'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Trophy, AlertCircle } from 'lucide-react';
import { getAllTournaments, joinTournament } from '@/lib/api/tournaments';
import TournamentStats from '@/components/ui/pages/tournaments/TournamentStats';
import TournamentFilters from '@/components/ui/pages/tournaments/TournamentFilters';
import TournamentCard from '@/components/ui/pages/tournaments/TournamentCard';
import { getTournamentStatus } from '@/lib/utils/utils';
import { useUser } from '@/context/UserContext';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

interface Tournament {
  _id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  teams: (string | { _id: string })[];
  maxTeams: number;
  entryPricePerTeam: number;
  rewardPrize: number;
  createdAt: string;
  createdBy?: {
    username: string;
  };
  stadiumId?: {
    name: string;
  };
}

// Enhanced Loading Component
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

// Enhanced Error Component
const ErrorMessage = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 flex items-center justify-center">
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

// Main Tournaments Page Component
export default function TournamentsClient() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    maxEntryPrice: '',
    maxTeams: '',
    sortBy: 'newest',
    joinedOnly: false,
  });
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  const fetchTournaments = async () => {
    try {
      const response = await getAllTournaments();

      // Normalize tournament data
      const tournaments = Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.tournaments || response.data?.results;

      if (!Array.isArray(tournaments)) {
        console.warn('Expected an array of tournaments but got:', tournaments);
        return [];
      }

      return tournaments;
    } catch (error) {
      console.error('Error fetching tournaments:', error);

      if (typeof error === 'object' && error !== null && 'response' in error) {
        // Server responded with a non-2xx status
        const err = error as { response: { status: number; data?: { message?: string } } };
        throw new Error(
          `Server error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`
        );
      } else if (typeof error === 'object' && error !== null && 'request' in error) {
        // Request made but no response
        throw new Error('Network error: No response received from server');
      } else {
        // Other unexpected errors
        throw new Error(`Unexpected error: ${(error as Error).message}`);
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/auth/signin");
    } else if (token) {
      setAuthChecked(true);
    }
  }, [router]);

  // Fetch tournaments on component mount
  useEffect(() => {
    const loadTournaments = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchTournaments();
        setTournaments(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tournaments';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (authChecked) {
      loadTournaments();
    }
  }, [authChecked]);

  // Retry function
  const handleRetry = () => {
    const loadTournaments = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchTournaments();
        setTournaments(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tournaments';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadTournaments();
  };

  // Filter and sort tournaments
  const filteredTournaments = useMemo(() => {
    if (!Array.isArray(tournaments)) return [];

    const filtered = tournaments.filter(tournament => {
      if (!tournament || typeof tournament !== 'object') return false;

      // If 'joined' is selected in sortBy, filter only joined tournaments
      if (filters.sortBy === 'joined') {
        const joined = Array.isArray(tournament.teams)
          ? tournament.teams.some(team =>
            typeof team === 'string'
              ? team === user?.team
              : team?._id === user?.team
          )
          : false;
        return joined;
      }

      // Regular filters
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          (tournament.name && tournament.name.toLowerCase().includes(searchLower)) ||
          (tournament.description && tournament.description.toLowerCase().includes(searchLower)) ||
          (tournament.createdBy?.username && tournament.createdBy.username.toLowerCase().includes(searchLower)) ||
          (tournament.stadiumId?.name && tournament.stadiumId.name.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      if (filters.status) {
        const status = getTournamentStatus(tournament.startDate, tournament.endDate);
        if (status !== filters.status) return false;
      }

      if (filters.maxEntryPrice) {
        if (!tournament.entryPricePerTeam || tournament.entryPricePerTeam > parseInt(filters.maxEntryPrice)) return false;
      }

      if (filters.maxTeams) {
        if (!tournament.maxTeams || tournament.maxTeams > parseInt(filters.maxTeams)) return false;
      }

      return true;
    });

    // Sort only if sortBy is not 'joined'
    if (filters.sortBy !== 'joined') {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'oldest':
            return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          case 'startDate':
            return new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime();
          case 'entryPrice':
            return (a.entryPricePerTeam || 0) - (b.entryPricePerTeam || 0);
          case 'rewardPrize':
            return (b.rewardPrize || 0) - (a.rewardPrize || 0);
          case 'newest':
          default:
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
      });
    }

    return filtered;
  }, [tournaments, filters, user]);

  const isTeamLeader = user?.role === 'teamLeader';

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  const handleJoinTournament = async (tournamentId: string) => {
    try {
      const teamId = user?.team;

      if (!teamId) {
        toast.error('User team not found');
        return;
      }

      const response = await joinTournament({ tournamentId, teamId });

      setTournaments(prevTournaments =>
        prevTournaments.map(t => {
          if (t._id === tournamentId) {
            return {
              ...t,
              teams: [...(t.teams || []), { _id: teamId }]
            };
          }
          return t;
        })
      );

      toast.success(response.message);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to join tournament';
      toast.error(errorMessage);
    }
  };

  const handleLeaveTournament = (tournamentId: string, teamId: string) => {
    setTournaments(prevTournaments =>
      prevTournaments.map(t => {
        if (t._id === tournamentId) {
          return {
            ...t,
            teams: Array.isArray(t.teams)
              ? t.teams.filter(team => (typeof team === 'string' ? team !== teamId : team?._id !== teamId))
              : []
          };
        }
        return t;
      })
    );
  };

  if (!authChecked) {
    // Show spinner while auth check is running
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900">
      {/* Loading State */}
      {loading && <LoadingSpinner />}

      {/* Error State */}
      {error && <ErrorMessage message={error} onRetry={handleRetry} />}

      {/* Content - Only show when not loading and no error */}
      {!loading && !error && (
        <>
          {/* Enhanced Page Header */}
          <div className="relative overflow-hidden bg-white/80 dark:bg-stone-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-stone-700/50">
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl -translate-y-48 translate-x-48"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-cyan-400/10 to-blue-400/10 rounded-full blur-2xl translate-y-32 -translate-x-32"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="relative p-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl shadow-xl">
                    <Trophy className="w-12 h-12 text-white" />
                    <div className="absolute inset-0 bg-white/20 rounded-3xl blur-sm"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 dark:text-white" style={{ marginBottom: '1rem' }}>
                    <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                      Epic Tournaments
                    </span>
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-stone-300 font-medium mx-auto leading-relaxed">
                    Discover and join thrilling competitions. Battle for glory, earn amazing prizes, and become a champion in your favorite sports!
                  </p>
                </div>

                {/* Quick Stats Preview */}
                <div className="flex flex-wrap justify-center gap-6 pt-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-stone-700/50">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <span className="font-bold text-gray-900 dark:text-white">{tournaments.length} Active</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-stone-700/50">
                    <span className="text-xl">🏆</span>
                    <span className="font-bold text-gray-900 dark:text-white">Epic Prizes</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-stone-700/50">
                    <span className="text-xl">⚡</span>
                    <span className="font-bold text-gray-900 dark:text-white">Join Now</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Tournament Stats */}
            <TournamentStats tournaments={tournaments} />

            {/* Filters */}
            <TournamentFilters
              filters={filters}
              onFiltersChange={setFilters}
              onSearch={handleSearch}
            />

            {/* Tournament Grid */}
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-stone-800/80 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-stone-700/50 shadow-lg">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">
                    {filteredTournaments.length} Tournament{filteredTournaments.length !== 1 ? 's' : ''} Found
                  </h2>
                </div>
              </div>

              {filteredTournaments.length === 0 ? (
                <div className="text-center py-16 space-y-6">
                  <div className="relative">
                    <div className="w-24 h-24 mx-auto bg-gray-100 dark:bg-stone-700 rounded-full flex items-center justify-center">
                      <Trophy className="w-12 h-12 text-gray-400 dark:text-stone-500" />
                    </div>
                    <div className="absolute inset-0 w-24 h-24 mx-auto bg-gray-500/20 rounded-full animate-ping"></div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">No Tournaments Found</h3>
                    <p className="text-gray-600 dark:text-stone-400 font-medium max-w-md mx-auto">
                      No competitions match your current filters. Try adjusting your search criteria or check back later for new tournaments!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {filteredTournaments.map((tournament, index) => (
                    <div
                      key={tournament._id}
                      className="animate-fadeInUp"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <TournamentCard
                        key={tournament._id}
                        tournament={tournament}
                        onJoin={handleJoinTournament}
                        userTeamId={user?.team}
                        isTeamLeader={isTeamLeader}
                        onLeave={handleLeaveTournament}
                      />

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}