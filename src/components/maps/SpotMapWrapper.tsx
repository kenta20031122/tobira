'use client';

import dynamic from 'next/dynamic';
import type { Spot } from '@/types';

const SpotMap = dynamic(() => import('./SpotMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400 text-sm">
      Loading map…
    </div>
  ),
});

type Props = {
  spot: Pick<Spot, 'name' | 'lat' | 'lng' | 'address'>;
};

export default function SpotMapWrapper({ spot }: Props) {
  return <SpotMap spot={spot} />;
}
