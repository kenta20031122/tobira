'use client';

import { useRef } from 'react';
import type { Spot } from '@/types';
import DiscoverPageHero from '@/components/DiscoverPageHero';
import SpotFinder from '@/components/SpotFinder';

export default function DiscoverClient({ spots }: { spots: Spot[] }) {
  const finderRef = useRef<HTMLDivElement>(null);

  function handleStart() {
    finderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <>
      <DiscoverPageHero onStart={handleStart} totalSpots={spots.length} />
      <div ref={finderRef} className="scroll-mt-20">
        <SpotFinder spots={spots} />
      </div>
    </>
  );
}
