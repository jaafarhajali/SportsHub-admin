
import HomeClient from '@/components/ui/pages/home/HomeClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SportsHub | Home',
  description: 'Book matches, join tournaments, and explore football academies with SportsHub.',
};

export default function HomePage() {
  return <HomeClient />;
}
