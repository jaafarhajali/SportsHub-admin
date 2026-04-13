'use client'
import React from 'react';
import { Badge, Button } from 'lebify-ui';
import { MapPin, Calendar, Clock, AlertCircle } from 'lucide-react';
import { TableRow, TableCell } from '../../table';

interface BookingTableRowProps {
    booking: any;
    onCancelBooking: (bookingId: string) => void;
}

export function BookingTableRow({ booking, onCancelBooking }: BookingTableRowProps) {
    const getStatusBadge = (status: string) => {
        const statusConfig = {
            approved: { color: '#10b981', label: 'Approved' },
            cancelled: { color: '#ef4444', label: 'Cancelled' },
            completed: { color: '#8b5cf6', label: 'Completed' },
        };
        
        const config = statusConfig[status as keyof typeof statusConfig];
        return config ? (
            <Badge variant="light" propColor={config.color}>
                {config.label}
            </Badge>
        ) : null;
    };

    const isActionDisabled = ['cancelled', 'completed'].includes(booking.status);

    return (
        <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <TableCell className="px-6 py-4">
                <div className="flex items-center justify-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-center">
                        <p className="font-medium text-gray-900 dark:text-white">
                            {booking.stadiumId?.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Stadium</p>
                    </div>
                </div>
            </TableCell>

            <TableCell className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                        {new Date(booking.matchDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })}
                    </span>
                </div>
            </TableCell>

            <TableCell className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white font-medium">
                        {booking.timeSlot}
                    </span>
                </div>
            </TableCell>

            <TableCell className="px-6 py-4 text-center">
                {getStatusBadge(booking.status)}
            </TableCell>

            <TableCell className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                    {booking.penaltyApplied && booking.penaltyAmount > 0 && (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                    )}
                    <Badge variant="light" propColor="#f59e0b">
                        {booking.penaltyAmount > 0 ? `${booking.penaltyAmount} LBP` : 'No Penalty'}
                    </Badge>
                </div>
            </TableCell>

            <TableCell className="px-6 py-4 text-center">
                <Button
                    variant="sea"
                    disabled={isActionDisabled}
                    onClick={() => onCancelBooking(booking._id)}
                    className={`transition-all duration-200 ${
                        isActionDisabled 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:shadow-lg hover:shadow-red-500/25'
                    }`}
                >
                    Cancel
                </Button>
            </TableCell>
        </TableRow>
    );
}