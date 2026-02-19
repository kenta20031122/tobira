import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Clock, Lock } from 'lucide-react';
import type { Spot } from '@/types';
import { cn, CATEGORY_LABELS } from '@/lib/utils';

const CATEGORY_COLORS: Record<string, string> = {
  nature: 'bg-emerald-100 text-emerald-700',
  history: 'bg-amber-100 text-amber-700',
  onsen: 'bg-blue-100 text-blue-700',
  food: 'bg-orange-100 text-orange-700',
  activity: 'bg-purple-100 text-purple-700',
  spiritual: 'bg-rose-100 text-rose-700',
};

type Props = {
  spot: Spot;
};

export default function SpotCard({ spot }: Props) {
  return (
    <Link href={`/spots/${spot.id}`} className="group block">
      <div className="rounded-2xl overflow-hidden bg-white border border-stone-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          <Image
            src={spot.image_url}
            alt={spot.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
          {/* Premium badge */}
          {spot.is_premium && (
            <div className="absolute top-3 right-3 bg-stone-900/80 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Lock size={10} />
              Pro
            </div>
          )}
          {/* Category badge(s) */}
          <div className="absolute top-3 left-3 flex gap-1 flex-wrap max-w-[70%]">
            {spot.categories.map((cat) => (
              <span
                key={cat}
                className={cn(
                  'text-xs font-medium px-2.5 py-1 rounded-full',
                  CATEGORY_COLORS[cat]
                )}
              >
                {CATEGORY_LABELS[cat]}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-stone-900 text-base leading-snug group-hover:text-red-600 transition-colors">
              {spot.name}
            </h3>
          </div>

          <div className="flex items-center gap-1 text-xs text-stone-500 mb-2">
            <MapPin size={12} />
            <span>{spot.prefecture}</span>
          </div>

          <p className="text-sm text-stone-600 line-clamp-2 mb-3">
            {spot.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {spot.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Duration */}
          {spot.duration && (
            <div className="flex items-center gap-1 text-xs text-stone-400 mt-3 pt-3 border-t border-stone-100">
              <Clock size={11} />
              <span>{spot.duration}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
