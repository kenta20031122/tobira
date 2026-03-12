import type { Metadata } from 'next';
import { getAllSpots } from '@/lib/spots';
import SpotFinder from '@/components/SpotFinder';

export const metadata: Metadata = {
  title: 'Find Your Perfect Japan Spot',
  description: 'Answer a few questions and discover the Japan experiences that match your travel style — from hidden onsen to ancient temples.',
  openGraph: {
    title: 'Find Your Perfect Japan Spot',
    description: 'Answer a few questions and discover the Japan experiences that match your travel style.',
    images: [{ url: '/og.jpg', width: 1200, height: 630 }],
  },
};

export default async function DiscoverPage() {
  const spots = await getAllSpots();

  return (
    <main className="min-h-screen">
      <div className="max-w-xl mx-auto px-4 pt-24 pb-4 text-center">
        <p className="text-xs text-red-600 font-semibold uppercase tracking-widest mb-3">Discover</p>
        <h1 className="text-3xl font-bold text-stone-900 mb-2">What are you looking for?</h1>
        <p className="text-stone-500">Answer a few questions and we&apos;ll find your perfect match.</p>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <SpotFinder spots={spots} />
      </div>
    </main>
  );
}
