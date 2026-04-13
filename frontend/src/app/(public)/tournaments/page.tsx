
import TournamentsClient from '@/components/ui/pages/tournaments/TournamentsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tournaments | SportsHub',
  description: 'Browse and join exciting football tournaments with your team on SportsHub.',
};

export default function TournamentsPage() {
  return <TournamentsClient />;
}
