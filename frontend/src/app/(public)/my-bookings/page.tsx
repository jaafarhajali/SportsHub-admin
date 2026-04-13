import React from 'react';
import { Metadata } from 'next';
import MyBookingClient from '@/components/ui/pages/myBookings/MyBookingClient';

export const metadata: Metadata = {
  title: 'SportsHub | My Bookings',
  description: 'All my bookings',
};

export default function MyBookingsPage() {

    return <MyBookingClient />;
}
