import React from 'react';

import { Metadata } from 'next';
import AcademiesClient from '@/components/ui/pages/AcademiesClient';

export const metadata: Metadata = {
  title: 'Academies | Explore',
  description: 'Browse all available football academies.',
};

export default function AcademiesPage() {
  return <AcademiesClient />;
}
