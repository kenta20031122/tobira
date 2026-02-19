import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  Calendar,
  Ticket,
  Train,
  ArrowLeft,
  Lock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { spots, getSpotById } from '@/data/spots';
import SpotCard from '@/components/SpotCard';
import SpotMapWrapper from '@/components/maps/SpotMapWrapper';
import { CATEGORY_LABELS, cn } from '@/lib/utils';

const CATEGORY_COLORS: Record<string, string> = {
  nature: 'bg-emerald-100 text-emerald-700',
  history: 'bg-amber-100 text-amber-700',
  onsen: 'bg-blue-100 text-blue-700',
  food: 'bg-orange-100 text-orange-700',
  activity: 'bg-purple-100 text-purple-700',
  spiritual: 'bg-rose-100 text-rose-700',
};

export async function generateStaticParams() {
  return spots.map((s) => ({ id: s.id }));
}

type Props = { params: Promise<{ id: string }> };

export default async function SpotDetailPage({ params }: Props) {
  const { id } = await params;
  const spot = getSpotById(id);

  if (!spot) notFound();

  const related = spots
    .filter((s) => s.id !== spot.id && s.prefecture === spot.prefecture)
    .slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Back */}
      <Link
        href="/spots"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors mb-6"
      >
        <ArrowLeft size={15} />
        Back to all spots
      </Link>

      {/* Hero Image */}
      <div className="relative h-80 sm:h-[420px] rounded-2xl overflow-hidden mb-8">
        <Image
          src={spot.image_url}
          alt={spot.name}
          fill
          className="object-cover"
          priority
          unoptimized
        />
        {spot.is_premium && (
          <div className="absolute top-4 right-4 bg-stone-900/80 text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Lock size={13} />
            Pro Spot
          </div>
        )}
        <div className="absolute top-4 left-4 flex gap-1.5 flex-wrap max-w-[60%]">
          {spot.categories.map((cat) => (
            <span
              key={cat}
              className={cn(
                'text-sm font-medium px-3 py-1.5 rounded-full',
                CATEGORY_COLORS[cat]
              )}
            >
              {CATEGORY_LABELS[cat]}
            </span>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-stone-500 text-sm mb-2">
          <MapPin size={14} />
          <span>{spot.prefecture}, Kyushu</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
          {spot.name}
        </h1>
        <p className="text-stone-600 text-lg leading-relaxed">
          {spot.description}
        </p>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {spot.duration && (
          <div className="bg-white rounded-xl p-4 border border-stone-200">
            <div className="flex items-center gap-1.5 text-stone-400 text-xs mb-1">
              <Clock size={13} />
              Duration
            </div>
            <p className="text-stone-800 text-sm font-medium">{spot.duration}</p>
          </div>
        )}
        {spot.admission && (
          <div className="bg-white rounded-xl p-4 border border-stone-200">
            <div className="flex items-center gap-1.5 text-stone-400 text-xs mb-1">
              <Ticket size={13} />
              Admission
            </div>
            <p className="text-stone-800 text-sm font-medium">{spot.admission}</p>
          </div>
        )}
        <div className="bg-white rounded-xl p-4 border border-stone-200">
          <div className="flex items-center gap-1.5 text-stone-400 text-xs mb-1">
            <Calendar size={13} />
            Best Season
          </div>
          <p className="text-stone-800 text-sm font-medium">{spot.best_season}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-stone-200">
          <div className="flex items-center gap-1.5 text-stone-400 text-xs mb-1">
            <Train size={13} />
            Access
          </div>
          <p className="text-stone-800 text-sm font-medium">{spot.access}</p>
        </div>
      </div>

      {/* Map */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-stone-900 mb-3 flex items-center gap-2">
          <MapPin size={16} className="text-red-500" />
          Location
        </h2>
        <div className="h-64 sm:h-80 rounded-xl overflow-hidden border border-stone-200">
          <SpotMapWrapper spot={spot} />
        </div>
      </div>

      {/* Official Website */}
      {spot.website_url && (
        <div className="mb-8">
          <a
            href={spot.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-red-600 border border-stone-200 hover:border-red-200 bg-white px-4 py-2 rounded-full transition-colors"
          >
            <ExternalLink size={14} />
            Official Website
          </a>
        </div>
      )}

      {/* Premium gate */}
      {spot.is_premium ? (
        <div className="bg-stone-900 rounded-2xl p-8 mb-10 text-center">
          <Lock className="mx-auto text-stone-400 mb-3" size={28} />
          <h2 className="text-white text-xl font-semibold mb-2">
            Pro Spot
          </h2>
          <p className="text-stone-400 mb-6 max-w-sm mx-auto">
            Upgrade to Pro for full local tips, secret timing advice, and
            insider highlights for this spot.
          </p>
          <Link
            href="#pricing"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-full transition-colors"
          >
            Unlock with Pro — $4.99/mo
          </Link>
        </div>
      ) : (
        /* Highlights */
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-stone-900 mb-4">
            Why Visit
          </h2>
          <ul className="space-y-3">
            {spot.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-stone-700">{h}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tags */}
      <div className="mb-10">
        <div className="flex flex-wrap gap-2">
          {spot.tags.map((tag) => (
            <span
              key={tag}
              className="text-sm bg-stone-100 text-stone-600 px-3 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* AI Plan CTA */}
      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-stone-900 mb-1 flex items-center gap-2">
            <Sparkles size={16} className="text-red-500" />
            Add to your AI itinerary
          </h3>
          <p className="text-stone-500 text-sm">
            Let AI build a multi-day Kyushu trip around this spot.
          </p>
        </div>
        <Link
          href={`/plan?spot=${spot.id}`}
          className="shrink-0 bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2.5 rounded-full text-sm transition-colors"
        >
          Plan a Trip
        </Link>
      </div>

      {/* Related Spots */}
      {related.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-stone-900 mb-6">
            More in {spot.prefecture}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {related.map((s) => (
              <SpotCard key={s.id} spot={s} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
