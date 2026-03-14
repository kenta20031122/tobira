'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Lock, MapPin, Sparkles } from 'lucide-react';

const SAMPLE_SPOTS = [
  {
    name: 'Shirogane Blue Pond',
    prefecture: 'Hokkaido',
    category: 'Nature',
    categoryColor: 'bg-emerald-100 text-emerald-700',
    tag: '🌿 In Season',
    tagColor: 'bg-emerald-500/90 text-white',
    image: 'https://images.unsplash.com/photo-1614182777629-b1debeefb5e4?w=600&auto=format&fit=crop',
  },
  {
    name: 'Ine Funaya Boat Houses',
    prefecture: 'Kyoto',
    category: 'History',
    categoryColor: 'bg-amber-100 text-amber-700',
    tag: '✦ Pro Exclusive',
    tagColor: 'bg-stone-900/75 text-amber-300',
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&auto=format&fit=crop',
  },
  {
    name: 'Kurokawa Onsen Village',
    prefecture: 'Kumamoto',
    category: 'Onsen',
    categoryColor: 'bg-blue-100 text-blue-700',
    tag: '🌿 In Season',
    tagColor: 'bg-emerald-500/90 text-white',
    image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&auto=format&fit=crop',
  },
];

interface Props {
  onStart: () => void;
  totalSpots: number;
}

export default function DiscoverPageHero({ onStart, totalSpots }: Props) {
  return (
    <div className="mb-10 space-y-14">

      {/* ── Section 1: Hero ──────────────────────────────────── */}
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 mb-4 leading-tight">
          {totalSpots}+ spots.<br />
          <span className="text-red-600">Find yours in 2 minutes.</span>
        </h1>
        <p className="text-stone-500 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Tell us how you travel — we&apos;ll narrow the whole database
          down to spots made for you.
        </p>

        {/* Input → Output */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 text-sm">
          <div className="flex flex-col gap-2 text-left">
            {['Your vibe & interests', 'Season & timing', 'Region of Japan', 'Travel style'].map((item) => (
              <div key={item} className="flex items-center gap-2 bg-stone-100 rounded-xl px-4 py-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0" />
                <span className="text-stone-600 font-medium">{item}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-600 text-white shrink-0">
            <ArrowRight size={18} />
          </div>
          <div className="flex flex-col gap-2 text-left">
            {[
              { icon: '✦', label: 'Hand-picked matched spots' },
              { icon: '🗺️', label: 'Hidden gems for your style' },
              { icon: '📅', label: '"Plan around this" links' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                <span className="text-base leading-none">{item.icon}</span>
                <span className="text-stone-700 font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-4 rounded-full transition-colors text-base"
        >
          <Sparkles size={18} />
          Start matching
          <ArrowRight size={16} />
        </button>
      </div>

      {/* ── Section 2: Sample Results ────────────────────────── */}
      <div>
        <div className="text-center mb-6">
          <p className="text-xs font-semibold text-red-600 uppercase tracking-widest mb-2">Example output</p>
          <h2 className="text-2xl font-bold text-stone-900">Here&apos;s what you&apos;ll get</h2>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SAMPLE_SPOTS.map((spot, i) => (
              <div
                key={spot.name}
                className={`rounded-2xl overflow-hidden bg-white border border-stone-200 flex flex-col transition-all ${i === 2 ? 'opacity-40 blur-[2px] pointer-events-none select-none' : ''}`}
              >
                <div className="relative h-44 bg-stone-100 overflow-hidden shrink-0">
                  <Image
                    src={spot.image}
                    alt={spot.name}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <span className={`absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full ${spot.categoryColor}`}>
                    {spot.category}
                  </span>
                  <span className={`absolute bottom-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm ${spot.tagColor}`}>
                    {spot.tag}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <p className="font-semibold text-stone-900 mb-1">{spot.name}</p>
                  <p className="flex items-center gap-1 text-xs text-stone-400 mb-3">
                    <MapPin size={11} />
                    {spot.prefecture}
                  </p>
                  <div className="mt-auto flex items-center justify-center gap-1.5 text-xs font-medium text-red-600 border border-red-200 bg-red-50 rounded-xl py-2">
                    <Sparkles size={11} />
                    Plan around this
                    <ArrowRight size={11} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Fade + more badge over 3rd card */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 flex items-center justify-center pointer-events-none">
            <span className="bg-white border border-stone-200 text-stone-600 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
              + more matches
            </span>
          </div>
        </div>

        <p className="text-center text-xs text-stone-400 mt-3">
          Your actual results are tailored to your answers.
        </p>
      </div>

      {/* ── Section 3: Pro strip ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-50 border border-stone-200 rounded-2xl px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-stone-900 flex items-center justify-center shrink-0">
            <Lock size={15} className="text-amber-300" />
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900">40+ hidden gem spots are Pro-only</p>
            <p className="text-xs text-stone-500">They appear in your results when you upgrade.</p>
          </div>
        </div>
        <Link
          href="/pricing"
          className="shrink-0 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-full transition-colors flex items-center gap-1.5"
        >
          See Pro — $4.99/mo
          <ArrowRight size={12} />
        </Link>
      </div>

    </div>
  );
}
