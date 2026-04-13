'use client';
import { Sparkles, Zap, ArrowRight, Users, MapPin, Trophy, GraduationCap, Target, CheckCircle, Clock, Star, TrendingUp, Heart, Award, Shield, Globe } from "lucide-react";
import Link from "next/link";
import StatsGrid from "./StatsGrid";
import { useUser } from "@/context/UserContext";


export default function HomeClient() {

    const { user } = useUser();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-stone-900 dark:via-stone-800 dark:to-slate-900">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Hero Section */}
            <section className="relative overflow-hidden px-6 py-32 sm:py-40">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-cyan-600/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-cyan-500/10" />
                <div className="relative mx-auto max-w-7xl">
                    <div className="text-center">
                        {/* Enhanced Badge */}
                        <div className="mb-12 inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 px-8 py-3 text-sm font-semibold text-blue-800 dark:from-stone-800/90 dark:via-slate-800/90 dark:to-stone-700/90 dark:text-blue-200 ring-2 ring-blue-500/20 dark:ring-blue-400/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <Sparkles className="mr-3 h-5 w-5 animate-pulse" />
                            Welcome to the Future of Sports
                            <Zap className="ml-3 h-5 w-5" />
                        </div>

                        {/* Enhanced Hero Title */}
                        <div className="relative">
                            <h1 className="text-6xl font-black tracking-tight text-gray-900 dark:text-white sm:text-8xl lg:text-9xl" style={{ marginBottom: '2rem' }}>
                                <span className="relative inline-block">
                                    <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent animate-pulse">
                                        SportsHub
                                    </span>
                                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 blur-xl opacity-70 animate-pulse"></div>
                                </span>
                                <br />
                                <span className="text-5xl sm:text-6xl lg:text-7xl text-gray-700 dark:text-stone-300 font-bold">
                                    Your Sports Universe
                                </span>
                            </h1>
                        </div>

                        {/* Enhanced Description */}
                        <p className="mx-auto text-2xl leading-relaxed text-gray-600 dark:text-stone-300 font-medium" style={{ marginBottom: '3rem' }}>
                            Your all-in-one platform to book football matches, join exciting tournaments,<br />
                            and connect with top academies and referees.<br /> Whether you&apos;re a casual player,
                            a team organizer,<br /> or a football academy, SportsHub has everything you need.
                        </p>

                        {/* Enhanced CTA Button */}
                        <div className="flex justify-center mb-20">
                            <Link href={!user ? '/auth/signin' : '/stadiums'} className="group relative">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                                <button className="relative px-12 py-6 text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-500 hover:from-blue-700 hover:to-cyan-700 border border-blue-500/20">
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                                    <span className="relative flex items-center">
                                        Get Started Now
                                        <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                                    </span>
                                </button>
                            </Link>
                        </div>

                        {/* Enhanced Stats with Animation */}
                        <StatsGrid />
                    </div>
                </div>
            </section>

            {/* Enhanced Main Features */}
            <section className="px-6 py-32 sm:py-40 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-blue-50/50 dark:from-stone-800/30 dark:to-stone-900/30"></div>
                <div className="relative mx-auto max-w-7xl">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-stone-800/80 dark:to-stone-700/80 px-6 py-2 text-sm font-semibold text-blue-800 dark:text-blue-200 ring-1 ring-blue-500/20 mb-8">
                            <Target className="mr-2 h-4 w-4" />
                            Our Services
                        </div>
                        <h2 className="text-5xl font-black tracking-tight text-gray-900 dark:text-white sm:text-6xl" style={{ marginBottom: '1.5rem' }}>
                            Everything You Need in One Place
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-stone-300 mx-auto font-medium">
                            Discover, book, and play with our comprehensive sports platform<br /> designed for modern athletes.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
                        {/* Enhanced Book a Stadium Card */}
                        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 dark:from-stone-800/70 dark:via-stone-700/50 dark:to-stone-800/70 p-10 hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-4 border-2 border-blue-100/50 dark:border-stone-600/30 hover:border-blue-200 dark:hover:border-stone-500/50">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-indigo-500/5 dark:from-blue-400/10 dark:via-cyan-400/10 dark:to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                            <div className="relative">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white mb-8 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 shadow-2xl">
                                    <MapPin className="h-10 w-10" />
                                </div>
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white">Book a Stadium</h3>
                                <p className="text-gray-600 dark:text-stone-300 leading-relaxed text-lg mb-8">
                                    Reserve your favorite stadium, pick a time slot, and invite your friends.
                                    Simple, fast, and reliable booking system with real-time availability.
                                </p>

                                {/* Feature badges */}
                                <div className="flex flex-wrap gap-3 my-6">
                                    <div className="flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full text-sm font-semibold text-green-700 dark:text-green-400">
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Real-time availability
                                    </div>
                                    <div className="flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-sm font-semibold text-blue-700 dark:text-blue-400">
                                        <Clock className="h-4 w-4 mr-2" />
                                        Instant booking
                                    </div>
                                </div>

                                <Link href={!user ? '/auth/signin' : '/stadiums'} className="group/btn block">
                                    <button className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 hover:from-blue-600 hover:via-cyan-600 hover:to-blue-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 flex items-center justify-center text-lg">
                                        Find Stadium
                                        <ArrowRight className="ml-3 h-5 w-5 group-hover/btn:translate-x-2 transition-transform duration-300" />
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Enhanced Join Tournament Card */}
                        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-stone-800/70 dark:via-stone-700/50 dark:to-stone-800/70 p-10 hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-4 border-2 border-purple-100/50 dark:border-stone-600/30 hover:border-purple-200 dark:hover:border-stone-500/50">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-rose-500/5 dark:from-purple-400/10 dark:via-pink-400/10 dark:to-rose-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                            <div className="relative">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 text-white mb-8 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 shadow-2xl">
                                    <Trophy className="h-10 w-10" />
                                </div>
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white">Join Tournaments</h3>
                                <p className="text-gray-600 dark:text-stone-300 leading-relaxed text-lg mb-8">
                                    Compete with teams, win prizes, and boost your rankings. Join upcoming
                                    tournaments or organize your own competitive events.
                                </p>

                                {/* Feature badges */}
                                <div className="flex flex-wrap gap-3 my-6">
                                    <div className="flex items-center px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                                        <Star className="h-4 w-4 mr-2" />
                                        Prize competitions
                                    </div>
                                    <div className="flex items-center px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-sm font-semibold text-purple-700 dark:text-purple-400">
                                        <TrendingUp className="h-4 w-4 mr-2" />
                                        Ranking system
                                    </div>
                                </div>

                                <Link href={!user ? '/auth/signin' : '/tournaments'} className="group/btn block">
                                    <button className="w-full px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 flex items-center justify-center text-lg">
                                        Explore Tournaments
                                        <ArrowRight className="ml-3 h-5 w-5 group-hover/btn:translate-x-2 transition-transform duration-300" />
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Enhanced Discover Academies Card */}
                        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-stone-800/70 dark:via-stone-700/50 dark:to-stone-800/70 p-10 hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-4 border-2 border-emerald-100/50 dark:border-stone-600/30 hover:border-emerald-200 dark:hover:border-stone-500/50">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-green-500/5 dark:from-emerald-400/10 dark:via-teal-400/10 dark:to-green-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                            <div className="relative">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white mb-8 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 shadow-2xl">
                                    <GraduationCap className="h-10 w-10" />
                                </div>
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white">Discover Academies</h3>
                                <p className="text-gray-600 dark:text-stone-300 leading-relaxed text-lg mb-8">
                                    Browse professional football academies near you. Learn, train, and grow
                                    your skills with the best coaches and world-class facilities.
                                </p>

                                {/* Feature badges */}
                                <div className="flex flex-wrap gap-3 my-6">
                                    <div className="flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full text-sm font-semibold text-green-700 dark:text-green-400">
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Professional coaching
                                    </div>
                                    <div className="flex items-center px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                        <Heart className="h-4 w-4 mr-2" />
                                        Certified trainers
                                    </div>
                                </div>

                                <Link href={!user ? '/auth/signin' : '/academies'} className="group/btn block">
                                    <button className="w-full px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 flex items-center justify-center text-lg">
                                        Search Academies
                                        <ArrowRight className="ml-3 h-5 w-5 group-hover/btn:translate-x-2 transition-transform duration-300" />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Enhanced Why Choose SportsHub */}
            <section className="px-6 py-32 bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 dark:from-stone-800 dark:via-stone-900 dark:to-slate-900 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-gradient-to-br from-cyan-400/10 to-teal-400/10 rounded-full blur-3xl"></div>
                </div>

                <div className="relative mx-auto max-w-7xl">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-stone-800/80 dark:to-stone-700/80 px-6 py-2 text-sm font-semibold text-blue-800 dark:text-blue-200 ring-1 ring-blue-500/20 mb-8">
                            <Zap className="mr-2 h-4 w-4" />
                            Why Choose Us
                        </div>
                        <h3 className="text-5xl font-black text-gray-900 dark:text-white mb-6">
                            Why Choose SportsHub?
                        </h3>
                        <p className="text-xl text-gray-600 dark:text-stone-300 mx-auto font-medium">
                            We&apos;re committed to providing the best sports booking and community experience
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Zap, title: "Real-time Booking", desc: "Instant booking confirmation and availability updates", color: "from-green-400 to-emerald-600" },
                            { icon: Users, title: "Community Focused", desc: "Connect with players, teams, and organize events together", color: "from-blue-400 to-indigo-600" },
                            { icon: Shield, title: "Secure & Reliable", desc: "Safe payment processing and verified venue partnerships", color: "from-purple-400 to-violet-600" },
                            { icon: Globe, title: "Mobile Friendly", desc: "Easy-to-use interface optimized for all devices", color: "from-orange-400 to-red-600" }
                        ].map((item, index) => (
                            <div key={index} className="group text-center p-8 rounded-3xl bg-white/70 dark:bg-stone-800/70 backdrop-blur-sm border border-white/20 dark:border-stone-700/30 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br ${item.color} text-white mb-6 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 shadow-xl`}>
                                    <item.icon className="h-10 w-10" />
                                </div>
                                <h4 className="text-xl font-black text-gray-900 dark:text-white mb-4">{item.title}</h4>
                                <p className="text-gray-600 dark:text-stone-300 leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Enhanced Call to Action */}
            <section className="px-6 py-32">
                <div className="mx-auto max-w-5xl">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 px-12 py-20 text-center shadow-3xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10" />
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>

                        <div className="relative">
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm text-white mb-8 shadow-2xl">
                                <Award className="h-12 w-12" />
                            </div>
                            <h3 className="text-4xl font-black text-white" style={{ marginBottom: "1rem" }}>
                                Ready to Level Up Your Game?
                            </h3>
                            <p className="text-2xl text-blue-100 mx-auto font-medium leading-relaxed" style={{ marginBottom: "1rem" }}>
                                Join thousands of players who have already transformed<br /> their sports experience with SportsHub
                            </p>
                            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
                                <Link href="/auth/signup" className="group">
                                    <button className="relative overflow-hidden px-10 py-5 text-xl font-bold bg-white text-blue-600 hover:bg-gray-50 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 flex items-center">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                                        <span className="relative flex items-center">
                                            Start Your Journey
                                            <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                                        </span>
                                    </button>
                                </Link>
                                <Link href={!user ? '/auth/signin' : '/stadiums'} className="group">
                                    <button className="px-10 py-5 text-xl font-bold text-white hover:text-blue-100 transition-all duration-500 border-3 border-white/40 rounded-2xl hover:border-white/70 hover:bg-white/10 backdrop-blur-sm flex items-center transform hover:-translate-y-1 shadow-xl">
                                        Browse Stadiums
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}