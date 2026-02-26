import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { getAllSpots } from '@/lib/spots';
import { CATEGORY_LABELS } from '@/lib/utils';
import type { Prefecture } from '@/types';

export const metadata: Metadata = {
  title: 'Japan Travel Guides — Kyushu & Okinawa',
  description:
    'In-depth travel guides for every prefecture in Kyushu and Okinawa. Discover hidden gems, local tips, and authentic experiences beyond the tourist trail.',
  openGraph: {
    title: 'Japan Travel Guides — Kyushu & Okinawa | Tobira',
    description: 'Discover the real Japan, prefecture by prefecture.',
  },
};

const PREFECTURE_SLUGS: { slug: string; prefecture: Prefecture }[] = [
  { slug: 'fukuoka',   prefecture: 'Fukuoka' },
  { slug: 'saga',      prefecture: 'Saga' },
  { slug: 'nagasaki',  prefecture: 'Nagasaki' },
  { slug: 'kumamoto',  prefecture: 'Kumamoto' },
  { slug: 'oita',      prefecture: 'Oita' },
  { slug: 'miyazaki',  prefecture: 'Miyazaki' },
  { slug: 'kagoshima', prefecture: 'Kagoshima' },
  { slug: 'okinawa',   prefecture: 'Okinawa' },
];

export default async function GuidesPage() {
  const allSpots = await getAllSpots();

  const prefectureData = PREFECTURE_SLUGS.map(({ slug, prefecture }) => {
    const spots = allSpots.filter((s) => s.prefecture === prefecture);
    const heroImage = spots[0]?.image_url ?? '';
    const categories = [...new Set(spots.flatMap((s) => s.categories))];
    return { slug, prefecture, spots, heroImage, categories };
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-14">
        <p className="text-stone-500 text-sm font-medium tracking-widest uppercase mb-3">
          Destination Guides
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 mb-4">
          Explore Japan,{' '}
          <span className="text-red-600">Prefecture by Prefecture</span>
        </h1>
        <p className="text-stone-500 text-lg max-w-xl mx-auto">
          In-depth guides to Kyushu and Okinawa's hidden gems — curated by locals, not algorithms.
        </p>
      </div>

      {/* Prefecture grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {prefectureData.map(({ slug, prefecture, spots, heroImage, categories }) => (
          <Link
            key={slug}
            href={`/guides/${slug}`}
            className="group relative rounded-2xl overflow-hidden h-64 block"
          >
            {heroImage && (
              <Image
                src={heroImage}
                alt={prefecture}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                unoptimized
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/85 via-stone-900/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="flex items-center gap-1.5 text-stone-300 text-xs mb-1.5">
                <MapPin size={11} />
                <span>{spots.length} curated spots</span>
              </div>
              <h2 className="text-white text-xl font-bold mb-2">{prefecture}</h2>
              <div className="flex flex-wrap gap-1">
                {categories.slice(0, 3).map((cat) => (
                  <span
                    key={cat}
                    className="text-xs bg-white/15 text-white/90 px-2 py-0.5 rounded-full"
                  >
                    {CATEGORY_LABELS[cat]}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
