import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Sparkles } from 'lucide-react';
import { getAllSpots } from '@/lib/spots';
import { CATEGORY_LABELS } from '@/lib/utils';
import SpotCard from '@/components/SpotCard';
import WhenToVisitSection from '@/components/WhenToVisitSection';
import type { Prefecture } from '@/types';

const PREFECTURE_MAP: Record<string, Prefecture> = {
  fukuoka:   'Fukuoka',
  saga:      'Saga',
  nagasaki:  'Nagasaki',
  kumamoto:  'Kumamoto',
  oita:      'Oita',
  miyazaki:  'Miyazaki',
  kagoshima: 'Kagoshima',
  okinawa:   'Okinawa',
  hiroshima: 'Hiroshima',
  yamaguchi: 'Yamaguchi',
  okayama:   'Okayama',
  tottori:   'Tottori',
  shimane:   'Shimane',
  ehime:     'Ehime',
  kochi:     'Kochi',
  tokushima: 'Tokushima',
  kagawa:    'Kagawa',
  hokkaido:  'Hokkaido',
  aomori:    'Aomori',
  iwate:     'Iwate',
  miyagi:    'Miyagi',
  akita:     'Akita',
  yamagata:  'Yamagata',
  fukushima: 'Fukushima',
  osaka:     'Osaka',
  kyoto:     'Kyoto',
  nara:      'Nara',
  hyogo:     'Hyogo',
  shiga:     'Shiga',
  wakayama:  'Wakayama',
  mie:       'Mie',
  aichi:     'Aichi',
  shizuoka:  'Shizuoka',
  nagano:    'Nagano',
  ishikawa:  'Ishikawa',
  gifu:      'Gifu',
  tokyo:     'Tokyo',
  kanagawa:  'Kanagawa',
  saitama:   'Saitama',
  chiba:     'Chiba',
  ibaraki:   'Ibaraki',
  tochigi:   'Tochigi',
  gunma:     'Gunma',
  yamanashi: 'Yamanashi',
  niigata:   'Niigata',
  toyama:    'Toyama',
  fukui:     'Fukui',
};


export async function generateStaticParams() {
  return Object.keys(PREFECTURE_MAP).map((slug) => ({ prefecture: slug }));
}

type Props = { params: Promise<{ prefecture: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { prefecture: slug } = await params;
  const prefecture = PREFECTURE_MAP[slug];
  if (!prefecture) return {};

  const allSpots = await getAllSpots();
  const spots = allSpots.filter((s) => s.prefecture === prefecture);
  const heroImage = spots[0]?.image_url;

  const region =
    prefecture === 'Hokkaido' ? 'Hokkaido' :
    ['Aomori', 'Iwate', 'Miyagi', 'Akita', 'Yamagata', 'Fukushima'].includes(prefecture) ? 'Tohoku' :
    ['Osaka', 'Kyoto', 'Nara', 'Hyogo', 'Shiga', 'Wakayama', 'Mie'].includes(prefecture) ? 'Kinki' :
    ['Aichi', 'Shizuoka', 'Nagano', 'Ishikawa', 'Gifu'].includes(prefecture) ? 'Chubu' :
    ['Tokyo', 'Kanagawa', 'Saitama', 'Chiba', 'Ibaraki', 'Tochigi', 'Gunma', 'Yamanashi'].includes(prefecture) ? 'Kanto' :
    ['Niigata', 'Toyama', 'Fukui'].includes(prefecture) ? 'Hokuriku' :
    ['Hiroshima', 'Yamaguchi', 'Okayama', 'Tottori', 'Shimane'].includes(prefecture) ? 'Chugoku Region' :
    ['Ehime', 'Kochi', 'Tokushima', 'Kagawa'].includes(prefecture) ? 'Shikoku' :
    prefecture === 'Okinawa' ? 'Ryukyu Islands' : 'Kyushu';
  return {
    title: `${prefecture} Travel Guide: Hidden Gems & Local Spots`,
    description: `Discover ${spots.length} curated spots in ${prefecture}, ${region}. Authentic local experiences, hidden gems, and off-the-beaten-path destinations — beyond the tourist trail.`,
    openGraph: {
      title: `${prefecture} Travel Guide | Tobira`,
      description: `${spots.length} hidden gems in ${prefecture}, ${region} — curated by locals.`,
      ...(heroImage && {
        images: [{ url: heroImage, width: 1200, height: 630, alt: prefecture }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      ...(heroImage && { images: [heroImage] }),
    },
  };
}

export default async function PrefectureGuidePage({ params }: Props) {
  const { prefecture: slug } = await params;
  const prefecture = PREFECTURE_MAP[slug];
  if (!prefecture) notFound();

  const allSpots = await getAllSpots();
  const spots = allSpots.filter((s) => s.prefecture === prefecture);
  if (spots.length === 0) notFound();

  const heroSpot = spots[0];
  const categories = [...new Set(spots.flatMap((s) => s.categories))];
  const region =
    prefecture === 'Hokkaido' ? 'Hokkaido' :
    ['Aomori', 'Iwate', 'Miyagi', 'Akita', 'Yamagata', 'Fukushima'].includes(prefecture) ? 'Tohoku' :
    ['Osaka', 'Kyoto', 'Nara', 'Hyogo', 'Shiga', 'Wakayama', 'Mie'].includes(prefecture) ? 'Kinki' :
    ['Aichi', 'Shizuoka', 'Nagano', 'Ishikawa', 'Gifu'].includes(prefecture) ? 'Chubu' :
    ['Tokyo', 'Kanagawa', 'Saitama', 'Chiba', 'Ibaraki', 'Tochigi', 'Gunma', 'Yamanashi'].includes(prefecture) ? 'Kanto' :
    ['Niigata', 'Toyama', 'Fukui'].includes(prefecture) ? 'Hokuriku' :
    ['Hiroshima', 'Yamaguchi', 'Okayama', 'Tottori', 'Shimane'].includes(prefecture) ? 'Chugoku Region' :
    ['Ehime', 'Kochi', 'Tokushima', 'Kagawa'].includes(prefecture) ? 'Shikoku' :
    prefecture === 'Okinawa' ? 'Ryukyu Islands' : 'Kyushu';

  return (
    <>
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] flex items-end overflow-hidden">
        <Image
          src={heroSpot.image_url}
          alt={prefecture}
          fill
          className="object-cover"
          priority
          sizes="100vw"
          quality={80}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/40 to-stone-900/10" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 pb-14 w-full">
          <div className="flex items-center gap-2 text-stone-300 text-sm mb-3">
            <MapPin size={14} />
            <span>{region}, Japan</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-4">
            {prefecture} Travel Guide
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-stone-300 text-sm">
              {spots.length} curated spots
            </span>
            <span className="text-stone-600">·</span>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="text-xs bg-white/15 text-white/90 px-2.5 py-1 rounded-full"
                >
                  {CATEGORY_LABELS[cat]}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-14">
        {/* Spots grid */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-stone-900 mb-2">
            Hidden Gems in {prefecture}
          </h2>
          <p className="text-stone-500 mb-8">
            Hand-picked spots off the tourist trail — all personally curated.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {spots.map((spot) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </div>
        </div>

        {/* Best seasons */}
        <WhenToVisitSection spots={spots} prefecture={prefecture} />

        {/* CTA */}
        <div className="bg-stone-900 rounded-2xl p-8 text-center">
          <Sparkles className="mx-auto text-red-400 mb-3" size={28} />
          <h2 className="text-white text-2xl font-bold mb-2">
            Ready to visit {prefecture}?
          </h2>
          <p className="text-stone-400 mb-6 max-w-sm mx-auto">
            Let AI build a personalized day-by-day itinerary based on your interests and travel style.
          </p>
          <Link
            href="/plan"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-full transition-colors"
          >
            <Sparkles size={16} />
            Create a {prefecture} Itinerary
          </Link>
        </div>
      </div>
    </>
  );
}
