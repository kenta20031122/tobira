'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Search, LayoutGrid, Map } from 'lucide-react';
import { spots } from '@/data/spots';
import SpotCard from '@/components/SpotCard';
import { CATEGORY_LABELS, PREFECTURE_LABELS } from '@/lib/utils';
import type { Category, Prefecture } from '@/types';

const SpotsMapView = dynamic(() => import('@/components/maps/SpotsMapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-stone-100 rounded-xl text-stone-400 text-sm">
      Loading map…
    </div>
  ),
});

const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];
const PREFECTURES = Object.keys(PREFECTURE_LABELS) as Prefecture[];

function SpotsContent() {
  const searchParams = useSearchParams();
  const initialPrefecture = searchParams.get('prefecture') as Prefecture | null;

  const [search, setSearch] = useState('');
  const [selectedPrefecture, setSelectedPrefecture] = useState<Prefecture | 'All'>(
    initialPrefecture ?? 'All'
  );
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const filtered = useMemo(() => {
    return spots.filter((s) => {
      const matchPrefecture =
        selectedPrefecture === 'All' || s.prefecture === selectedPrefecture;
      const matchCategory =
        selectedCategory === 'All' || s.categories.includes(selectedCategory);
      const matchSearch =
        search.trim() === '' ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase()) ||
        s.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      return matchPrefecture && matchCategory && matchSearch;
    });
  }, [selectedPrefecture, selectedCategory, search]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-stone-900 mb-2">
          Explore Kyushu
        </h1>
        <p className="text-stone-500 text-lg">
          {spots.length} hand-picked spots, sorted by authenticity — not
          popularity.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 mb-10">
        {/* Search + view toggle */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search spots, activities, keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition"
            />
          </div>

          {/* List / Map toggle */}
          <div className="flex rounded-xl border border-stone-200 bg-white overflow-hidden shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <LayoutGrid size={16} />
              List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors ${
                viewMode === 'map'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Map size={16} />
              Map
            </button>
          </div>
        </div>

        {/* Prefecture filter */}
        <div className="flex flex-wrap gap-2">
          {(['All', ...PREFECTURES] as const).map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPrefecture(p)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedPrefecture === p
                  ? 'bg-stone-900 text-white'
                  : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-400'
              }`}
            >
              {p === 'All' ? 'All Prefectures' : p}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          {(['All', ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === c
                  ? 'bg-red-600 text-white'
                  : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-400'
              }`}
            >
              {c === 'All' ? 'All Types' : CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p className="text-lg font-medium mb-2">No spots found</p>
          <p className="text-sm">Try adjusting your filters or search term</p>
        </div>
      ) : viewMode === 'map' ? (
        <div className="h-[600px] rounded-xl overflow-hidden border border-stone-200">
          <SpotsMapView spots={filtered} />
        </div>
      ) : (
        <>
          <p className="text-sm text-stone-400 mb-6">
            {filtered.length} spot{filtered.length !== 1 ? 's' : ''} found
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((spot) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function SpotsPage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto px-4 py-10 text-stone-500">Loading...</div>}>
      <SpotsContent />
    </Suspense>
  );
}
