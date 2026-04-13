'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, MapPin, Clock, Banknote, Calendar, User, Users, AlertCircle } from 'lucide-react';
import { bookStadium, getStadiumById } from '@/lib/api/stadium';
import { Stadium } from '@/types/Stadium';
import { toast } from 'react-toastify';

interface CalendarData {
    date: string;
    slots: Array<{
        startTime: string;
        endTime: string;
        isBooked: boolean;
    }>;
}

interface StadiumWithCalendar extends Stadium {
    calendar?: CalendarData[];
}

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

export default function StadiumClientPage() {
    const params = useParams();
    const id = typeof params.id === 'string' ? params.id : '';

    const [stadium, setStadium] = useState<StadiumWithCalendar | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<CalendarData['slots'][0] | null>(null);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [paymentError, setPaymentError] = useState('');
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
        const fetchStadium = async () => {
            if (!id || !authChecked) return;

            try {
                setLoading(true);
                const response = await getStadiumById(id);
                setStadium(response);
            } catch (err) {
                console.error("Error fetching stadium:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStadium();
    }, [id, authChecked]);

    if (!authChecked) {
        // Show spinner while auth check is running
        return <LoadingSpinner />;
    }

    const getDaysInMonth = (date: Date): (Date | null)[] => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days: (Date | null)[] = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const formatDate = (date: Date | null): string => {
        if (!date) return '';
        return date.toISOString().split('T')[0];
    };

    const getCalendarDataForDate = (date: Date | null): CalendarData | undefined => {
        if (!date || !stadium?.calendar) return undefined;

        const dateStr = formatDate(date);
        return stadium.calendar.find(cal => {
            const calDate = new Date(cal.date).toISOString().split('T')[0];
            return calDate === dateStr;
        });
    };

    const getDateStatus = (date: Date | null): string => {
        if (!date) return 'empty';

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (date < today) return 'past';

        const calendarData = getCalendarDataForDate(date);
        if (!calendarData) return 'no-data';

        const bookedSlots = calendarData.slots.filter(slot => slot.isBooked).length;
        const totalSlots = calendarData.slots.length;

        if (bookedSlots === 0) return 'available';
        if (bookedSlots === totalSlots) return 'fully-booked';
        return 'partially-booked';
    };

    const getAvailableSlots = (date: Date | null): CalendarData['slots'] => {
        const calendarData = getCalendarDataForDate(date);
        if (!calendarData) return [];

        const now = new Date();

        return calendarData.slots.filter(slot => {
            if (slot.isBooked) return false;

            // Construct full Date object from slot startTime
            const [hours, minutes] = slot.startTime.split(":").map(Number);
            const slotDateTime = new Date(date!);
            slotDateTime.setHours(hours, minutes, 0, 0);

            // Only include if slot start time is in the future
            return slotDateTime > now;
        });
    };

    const navigateMonth = (direction: number): void => {
        setCurrentMonth(prev => {
            const newMonth = new Date(prev);
            newMonth.setMonth(prev.getMonth() + direction);
            return newMonth;
        });
        setSelectedDate(null);
        setSelectedSlot(null);
    };

    const handleDateClick = (date: Date | null): void => {
        const status = getDateStatus(date);
        if (status === 'past' || status === 'fully-booked' || status === 'no-data') return;

        setSelectedDate(date);
        setSelectedSlot(null);
    };

    const handleBooking = async () => {
        if (!selectedDate || !selectedSlot || !stadium) return;

        setBookingLoading(true);
        try {
            const matchDate = selectedDate.toISOString();
            const timeSlot = selectedSlot.startTime;

            const bookingResponse = await bookStadium(stadium._id, matchDate, timeSlot);
            if (!bookingResponse) {
                toast.error('Booking failed');
                return;
            }

            toast.success('Booking successful');

            // Refresh stadium to show updated calendar
            const response = await getStadiumById(id);
            setStadium(response);

            setSelectedDate(null);
            setSelectedSlot(null);
        } catch (error) {
            console.error('Booking failed:', error);
            toast.error('Booking failed. Please try again.');
        } finally {
            setBookingLoading(false);
        }
    };

    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('en-US').format(price);
    };

    const formatTime = (time: string): string => {
        // Convert 24h format to 12h format
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const handleRefreshAvailableSlots = async () => {
        try {
            const response = await getStadiumById(id);
            setStadium(response);
            toast.success("Available slots refreshed");
        } catch (error) {
            console.error("Failed to refresh available slots:", error);
            toast.error("Failed to refresh slots");
        }
    };

    const handleOpenPaymentModal = () => {
        setShowPaymentModal(true);
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const days = getDaysInMonth(currentMonth);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 flex justify-center items-center">
                <div className="text-center space-y-4">
                    <div className="relative w-16 h-16 mx-auto">
                        <div className="w-16 h-16 border-4 border-blue-200 dark:border-stone-600 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-xl font-semibold text-gray-900 dark:text-white">Loading Stadium Details</p>
                        <p className="text-gray-600 dark:text-stone-400">Please wait while we fetch the information...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!stadium) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 flex justify-center items-center">
                <div className="text-center space-y-6 max-w-md mx-auto px-6">
                    <div className="w-24 h-24 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Stadium Not Found</h2>
                        <p className="text-gray-600 dark:text-stone-400">The stadium you&apos;re looking for doesn&apos;t exist or has been removed.</p>
                    </div>
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const imageUrl = stadium.photos?.[0]?.startsWith('http')
        ? stadium.photos[0]
        : `http://localhost:8080${stadium.photos?.[0]}`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900">
            {/* Enhanced Header */}
            <div className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-stone-700/50 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => window.history.back()}
                                className="group p-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
                            >
                                <ChevronLeft className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                            </button>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white truncate">
                                    <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                                        {stadium.name}
                                    </span>
                                </h1>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm sm:text-base">
                        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">Location</p>
                                <p className="font-semibold text-gray-900 dark:text-white truncate">{stadium.location}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                                <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">Owner</p>
                                <p className="font-semibold text-gray-900 dark:text-white truncate">{stadium.ownerId.username}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 sm:col-span-2 lg:col-span-1">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide">Capacity</p>
                                <p className="font-semibold text-gray-900 dark:text-white">Up to {stadium.maxPlayers} players</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Stadium Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Enhanced Stadium Image Card */}
                        <div className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border border-gray-200/50 dark:border-stone-700/50">
                            <div className="relative h-64 sm:h-72 overflow-hidden">
                                <Image
                                    src={imageUrl && "/images/grid-image/image-01.png"}
                                    alt={stadium.name}
                                    fill
                                    loading='lazy'
                                    className="object-cover transition-transform duration-700 hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="bg-white/20 backdrop-blur-md rounded-xl p-3">
                                        <p className="text-white font-semibold text-sm">Premium Stadium Experience</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Enhanced Price and Hours Cards */}
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="group bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-5 border border-green-200/50 dark:border-green-700/50 hover:shadow-lg transition-all duration-300">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-xl">
                                                <Banknote className="w-5 h-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <span className="font-bold text-green-800 dark:text-green-200">Price per Match</span>
                                        </div>
                                        <p className="text-3xl font-black text-green-700 dark:text-green-300 mb-1">
                                            {formatPrice(stadium.pricePerMatch)} <span className="text-lg font-semibold">LBP</span>
                                        </p>
                                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">per 1.5-hour premium slot</p>
                                    </div>

                                    <div className="group bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-5 border border-blue-200/50 dark:border-blue-700/50 hover:shadow-lg transition-all duration-300">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl">
                                                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <span className="font-bold text-blue-800 dark:text-blue-200">Working Hours</span>
                                        </div>
                                        <p className="text-2xl font-black text-blue-700 dark:text-blue-300 mb-1">
                                            {formatTime(stadium.workingHours.start)} - {formatTime(stadium.workingHours.end)}
                                        </p>
                                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Every day of the week</p>
                                    </div>
                                </div>

                                {/* Enhanced Penalty Policy */}
                                <div className="group bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-5 border border-orange-200/50 dark:border-orange-700/50 hover:shadow-lg transition-all duration-300">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-xl">
                                            <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <span className="font-bold text-orange-800 dark:text-orange-200">Cancellation Policy</span>
                                    </div>
                                    <p className="text-sm text-orange-700 dark:text-orange-300 font-medium leading-relaxed">
                                        Cancel at least <span className="font-bold">{stadium.penaltyPolicy.hoursBefore} hours</span> before your booking to avoid a <span className="font-bold">{formatPrice(Number(stadium.penaltyPolicy.penaltyAmount))} LBP</span> penalty fee.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Enhanced Calendar */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border border-gray-200/50 dark:border-stone-700/50">
                            <div className="p-6 sm:p-8 border-b border-gray-200/50 dark:border-stone-700/50 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
                                            <Calendar className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Book Your Slot</h2>
                                            <p className="text-sm text-gray-600 dark:text-stone-400 font-medium">Select your preferred date and time</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-2xl p-1">
                                        <button
                                            onClick={() => navigateMonth(-1)}
                                            className="group p-3 rounded-xl bg-white dark:bg-stone-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 hover:shadow-md"
                                        >
                                            <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                                        </button>
                                        <span className="font-black text-lg px-6 py-3 text-gray-900 dark:text-white min-w-0 text-center">
                                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                                        </span>
                                        <button
                                            onClick={() => navigateMonth(1)}
                                            className="group p-3 rounded-xl bg-white dark:bg-stone-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 hover:shadow-md"
                                        >
                                            <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                                        </button>
                                    </div>
                                </div>

                                {/* Enhanced Legend */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                    <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-xl">
                                        <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-lg" />
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">Available</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-xl">
                                        <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full shadow-lg" />
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">Partial</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-xl">
                                        <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-pink-500 rounded-full shadow-lg" />
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">Booked</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-xl">
                                        <div className="w-4 h-4 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full shadow-lg" />
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">Past</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 sm:p-8">
                                {/* Enhanced Calendar Grid */}
                                <div className="bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-2xl p-4 mb-8">
                                    <div className="grid grid-cols-7 gap-2 mb-4">
                                        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                                            <div key={day} className="text-center text-xs sm:text-sm font-black text-gray-600 dark:text-stone-400 py-3 bg-gray-50 dark:bg-stone-700/50 rounded-xl">
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-7 gap-2">
                                        {days.map((date, index) => {
                                            if (!date) {
                                                return <div key={index} className="h-12 sm:h-14" />;
                                            }

                                            const status = getDateStatus(date);
                                            const isSelected = selectedDate && formatDate(selectedDate) === formatDate(date);

                                            let bgColor = '';
                                            let isClickable = true;

                                            switch (status) {
                                                case 'available':
                                                    bgColor = 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 hover:from-green-200 hover:to-emerald-200 dark:hover:from-green-800/40 dark:hover:to-emerald-800/40 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700 hover:shadow-lg hover:scale-105';
                                                    break;
                                                case 'partially-booked':
                                                    bgColor = 'bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 hover:from-orange-200 hover:to-yellow-200 dark:hover:from-orange-800/40 dark:hover:to-yellow-800/40 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700 hover:shadow-lg hover:scale-105';
                                                    break;
                                                case 'fully-booked':
                                                    bgColor = 'bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700 cursor-not-allowed opacity-60';
                                                    isClickable = false;
                                                    break;
                                                case 'past':
                                                case 'no-data':
                                                    bgColor = 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-stone-700/30 dark:to-stone-600/30 text-gray-400 dark:text-stone-500 border-gray-200 dark:border-stone-600 cursor-not-allowed opacity-50';
                                                    isClickable = false;
                                                    break;
                                            }

                                            if (isSelected) bgColor += ' ring-4 ring-blue-500/50 dark:ring-blue-400/50 ring-offset-2 dark:ring-offset-stone-800 scale-110 shadow-xl';

                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => isClickable && handleDateClick(date)}
                                                    disabled={!isClickable}
                                                    className={`h-12 sm:h-14 rounded-2xl text-sm sm:text-base font-bold transition-all duration-300 border-2 ${bgColor}`}
                                                >
                                                    {date.getDate()}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Enhanced Time Slots */}
                                {selectedDate && (
                                    <div className="border-t border-gray-200/50 dark:border-stone-700/50 pt-8">
                                        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                                                    Available Time Slots
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-stone-400 font-medium">
                                                    {selectedDate.toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleRefreshAvailableSlots}
                                                className="group px-4 py-2.5 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 hover:from-blue-200 hover:to-purple-200 dark:hover:from-blue-800/40 dark:hover:to-purple-800/40 text-blue-800 dark:text-blue-200 font-bold rounded-xl text-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border border-blue-200 dark:border-blue-700"
                                            >
                                                <span className="group-hover:scale-110 transition-transform inline-block">🔄</span> Refresh Slots
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                                            {getAvailableSlots(selectedDate).map((slot, index) => {
                                                const isSelected = selectedSlot === slot;
                                                const timeRange = `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`;

                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => setSelectedSlot(slot)}
                                                        className={`group p-5 rounded-2xl text-sm font-bold transition-all duration-300 border-2 hover:shadow-xl hover:-translate-y-1 ${isSelected
                                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-500 shadow-2xl shadow-blue-500/25 scale-105'
                                                            : 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-800/30 dark:hover:to-emerald-800/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-lg font-black">{timeRange}</span>
                                                            {isSelected && <span className="text-xl">✓</span>}
                                                        </div>
                                                        <div className={`text-xs font-semibold ${isSelected ? 'text-blue-100' : 'text-green-600 dark:text-green-400 opacity-80'}`}>
                                                            ⏱️ 1.5 hours premium slot
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {getAvailableSlots(selectedDate).length === 0 && (
                                            <div className="text-center py-12 space-y-4">
                                                <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-stone-700 rounded-full flex items-center justify-center">
                                                    <Clock className="w-8 h-8 text-gray-400 dark:text-stone-500" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Available Slots</h4>
                                                    <p className="text-gray-600 dark:text-stone-400">All time slots are booked for this date. Please try another date.</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Enhanced Booking Summary */}
                                        {selectedSlot && (
                                            <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 rounded-3xl p-6 sm:p-8 border border-blue-200/60 dark:border-blue-600/40 shadow-2xl">
                                                {/* Animated background elements */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-cyan-400/5 animate-pulse"></div>
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
                                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-400/10 to-blue-400/10 rounded-full blur-2xl"></div>

                                                <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                                    <div className="flex-1 space-y-6">
                                                        {/* Enhanced Header */}
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative p-3 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-2xl shadow-lg">
                                                                <Calendar className="w-6 h-6 text-white" />
                                                                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-sm"></div>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-2xl font-black dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                                    Booking Summary
                                                                </h4>
                                                                <p className="text-sm text-gray-600 dark:text-stone-400 font-medium">
                                                                    Confirm your reservation details
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Enhanced Info Cards */}
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                            <div className="group relative bg-white/80 dark:bg-stone-800/80 backdrop-blur-md rounded-3xl p-5 border border-white/50 dark:border-stone-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                                <div className="relative">
                                                                    <div className="flex items-center gap-2 mb-3">
                                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                                        <p className="text-xs font-bold text-gray-500 dark:text-stone-400 uppercase tracking-wider">Date & Time</p>
                                                                    </div>
                                                                    <p className="text-xl font-black text-gray-900 dark:text-white mb-1">
                                                                        {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                    </p>
                                                                    <p className="text-sm font-semibold text-gray-600 dark:text-stone-400 flex items-center gap-2">
                                                                        <Clock className="w-4 h-4" />
                                                                        {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="group relative bg-white/80 dark:bg-stone-800/80 backdrop-blur-md rounded-3xl p-5 border border-white/50 dark:border-stone-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                                                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                                <div className="relative">
                                                                    <div className="flex items-center gap-2 mb-3">
                                                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                                        <p className="text-xs font-bold text-gray-500 dark:text-stone-400 uppercase tracking-wider">Total Price</p>
                                                                    </div>
                                                                    <p className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                                                        {formatPrice(stadium.pricePerMatch)}
                                                                    </p>
                                                                    <p className="text-sm font-semibold text-gray-600 dark:text-stone-400 flex items-center gap-2">
                                                                        <span className="text-lg">💎</span>
                                                                        <span>LBP</span>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Enhanced Booking Button */}
                                                    <div className="flex-shrink-0 mt-32">
                                                        <button
                                                            onClick={handleOpenPaymentModal}
                                                            disabled={bookingLoading}
                                                            className="group relative w-full lg:w-auto px-10 py-5 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:via-gray-500 disabled:to-gray-600 text-white rounded-3xl font-black text-lg transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/25 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden"
                                                        >
                                                            {/* Button background animation */}
                                                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                                                            {bookingLoading ? (
                                                                <>
                                                                    <div className="relative w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                                    <span className="relative">Processing...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span className="relative text-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">🎯</span>
                                                                    <span className="relative">Book Now</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {
                showPaymentModal && (
                    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
                        <div className="bg-white rounded-xl p-8 w-[95%] max-w-md shadow-xl relative">
                            <h2 className="text-2xl font-bold mb-4 text-center">Enter Card Details</h2>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                if (!cardNumber || !expiry || !cvc) {
                                    setPaymentError('All fields are required');
                                    return;
                                }
                                if (cardNumber.replaceAll(' ', '').length !== 16) {
                                    setPaymentError('Card number must be 16 digits');
                                    return;
                                }

                                setPaymentError('');
                                setShowPaymentModal(false); // Close modal
                                handleBooking(); // Call booking
                            }}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium">Card Number</label>
                                    <input
                                        type="text"
                                        value={cardNumber}
                                        onChange={(e) => {
                                            let val = e.target.value.replace(/\D/g, '').slice(0, 16);
                                            val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
                                            setCardNumber(val);
                                        }}
                                        className="w-full border px-4 py-2 rounded mt-1"
                                        placeholder="1234 5678 9012 3456"
                                        required
                                    />
                                </div>

                                <div className="mb-4 flex gap-4">
                                    <div className="w-1/2">
                                        <label className="block text-sm font-medium">Expiry Date</label>
                                        <input
                                            type="text"
                                            value={expiry}
                                            onChange={(e) => setExpiry(e.target.value)}
                                            className="w-full border px-4 py-2 rounded mt-1"
                                            placeholder="MM/YY"
                                            required
                                        />
                                    </div>
                                    <div className="w-1/2">
                                        <label className="block text-sm font-medium">CVC</label>
                                        <input
                                            type="text"
                                            value={cvc}
                                            onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                            className="w-full border px-4 py-2 rounded mt-1"
                                            placeholder="123"
                                            required
                                        />
                                    </div>
                                </div>

                                {paymentError && (
                                    <p className="text-red-600 text-sm mb-2">{paymentError}</p>
                                )}

                                <button
                                    type="submit"
                                    className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                                >
                                    Complete Payment
                                </button>
                            </form>

                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="absolute top-2 right-3 text-gray-400 hover:text-black text-xl"
                            >
                                &times;
                            </button>
                        </div>
                    </div>
                )
            }
        </div>


    );
}