'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Search, LayoutGrid, Map, SlidersHorizontal, X } from 'lucide-react';
import SpotCard from '@/components/SpotCard';
import { CATEGORY_LABELS, PREFECTURE_LABELS, isInSeason, isGoodInSeason, getDurationBucket } from '@/lib/utils';
import type { Category, Prefecture, Region, Spot } from '@/types';
import { REGION_META, REGION_IDS } from '@/lib/regions';

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

type SeasonFilter = 'All' | 'now' | 'spring' | 'summer' | 'autumn' | 'winter';
type DurationFilter = 'All' | 'short' | 'medium' | 'long';

const SEASON_OPTIONS: { value: SeasonFilter; label: string; sub?: string }[] = [
  { value: 'All', label: 'All Seasons' },
  { value: 'now', label: '🌿 In Season Now' },
  { value: 'spring', label: 'Spring', sub: 'Mar–May' },
  { value: 'summer', label: 'Summer', sub: 'Jun–Aug' },
  { value: 'autumn', label: 'Autumn', sub: 'Sep–Nov' },
  { value: 'winter', label: 'Winter', sub: 'Dec–Feb' },
];

const DURATION_OPTIONS: { value: DurationFilter; label: string; sub?: string }[] = [
  { value: 'All', label: 'Any Duration' },
  { value: 'short', label: 'Quick', sub: '<2h' },
  { value: 'medium', label: 'Half Day', sub: '2–4h' },
  { value: 'long', label: 'Full Day', sub: '4h+' },
];

export default function SpotsClient({ spots }: { spots: Spot[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initialPrefecture = searchParams.get('prefecture') as Prefecture | null;
  const initialCategory = searchParams.get('category') as Category | null;
  const initialRegion = searchParams.get('region') as Region | null;
  const initialSearch = searchParams.get('q') ?? '';
  const initialSeason = (searchParams.get('season') ?? 'All') as SeasonFilter;
  const initialDuration = (searchParams.get('duration') ?? 'All') as DurationFilter;

  const [favIds, setFavIds] = useState<string[]>([]);
  const [search, setSearch] = useState(initialSearch);
  const [selectedPrefecture, setSelectedPrefecture] = useState<Prefecture | 'All'>(
    initialPrefecture ?? 'All'
  );
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>(
    initialCategory ?? 'All'
  );
  const [selectedRegion, setSelectedRegion] = useState<Region | 'All'>(initialRegion ?? 'All');
  const [selectedSeason, setSelectedSeason] = useState<SeasonFilter>(initialSeason);
  const [selectedDuration, setSelectedDuration] = useState<DurationFilter>(initialDuration);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(!!(initialPrefecture || initialCategory || initialRegion || initialSeason !== 'All' || initialDuration !== 'All'));

  const currentMonth = new Date().getMonth() + 1;

  const syncURL = useCallback((params: {
    q: string;
    region: Region | 'All';
    prefecture: Prefecture | 'All';
    category: Category | 'All';
    season: SeasonFilter;
    duration: DurationFilter;
  }) => {
    const p = new URLSearchParams();
    if (params.q) p.set('q', params.q);
    if (params.region !== 'All') p.set('region', params.region);
    if (params.prefecture !== 'All') p.set('prefecture', params.prefecture);
    if (params.category !== 'All') p.set('category', params.category);
    if (params.season !== 'All') p.set('season', params.season);
    if (params.duration !== 'All') p.set('duration', params.duration);
    const qs = p.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [router, pathname]);

  const activeFilterCount = [
    selectedPrefecture !== 'All',
    selectedCategory !== 'All',
    selectedRegion !== 'All',
    selectedSeason !== 'All',
    selectedDuration !== 'All',
  ].filter(Boolean).length;

  function clearAllFilters() {
    setSelectedPrefecture('All');
    setSelectedCategory('All');
    setSelectedRegion('All');
    setSelectedSeason('All');
    setSelectedDuration('All');
  }

  useEffect(() => {
    fetch('/api/user/favorites')
      .then((r) => r.json())
      .then((ids: string[]) => setFavIds(ids))
      .catch(() => {});
  }, []);

  // Sync filter state → URL (debounce search to avoid excessive history entries)
  useEffect(() => {
    const timer = setTimeout(() => {
      syncURL({
        q: search,
        region: selectedRegion,
        prefecture: selectedPrefecture,
        category: selectedCategory,
        season: selectedSeason,
        duration: selectedDuration,
      });
    }, search !== initialSearch ? 400 : 0);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedRegion, selectedPrefecture, selectedCategory, selectedSeason, selectedDuration]);

  const filtered = useMemo(() => {
    return spots.filter((s) => {
      const matchRegion = selectedRegion === 'All' || s.region === selectedRegion;
      const matchPrefecture =
        selectedPrefecture === 'All' || s.prefecture === selectedPrefecture;
      const matchCategory =
        selectedCategory === 'All' || s.categories.includes(selectedCategory);
      const matchSearch =
        search.trim() === '' ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase()) ||
        s.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchSeason =
        selectedSeason === 'All' ? true
        : selectedSeason === 'now' ? isInSeason(s.best_season, currentMonth)
        : isGoodInSeason(s.best_season, selectedSeason);
      const matchDuration =
        selectedDuration === 'All' ? true
        : getDurationBucket(s.duration) === selectedDuration;
      return matchRegion && matchPrefecture && matchCategory && matchSearch && matchSeason && matchDuration;
    });
  }, [spots, selectedRegion, selectedPrefecture, selectedCategory, search, selectedSeason, selectedDuration, currentMonth]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-stone-900 mb-2">
          Explore Japan
        </h1>
        <p className="text-stone-500 text-lg">
          {spots.length} hand-picked spots, sorted by authenticity — not
          popularity.
        </p>
      </div>

      {/* Search bar row */}
      <div className="flex gap-3 mb-4">
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

        {/* Filters toggle */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors shrink-0 ${
            showFilters
              ? 'bg-stone-900 text-white border-stone-900'
              : 'bg-white border-stone-200 text-stone-600 hover:border-stone-400'
          }`}
        >
          <SlidersHorizontal size={16} />
          Filters
          {activeFilterCount > 0 && (
            <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${showFilters ? 'bg-white text-stone-900' : 'bg-red-500 text-white'}`}>
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Active region chip */}
      {selectedRegion !== 'All' && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-stone-500">Region:</span>
          <button
            onClick={() => setSelectedRegion('All')}
            className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-full text-white"
            style={{ backgroundColor: REGION_META[selectedRegion].color }}
          >
            {REGION_META[selectedRegion].label}
            <X size={13} />
          </button>
        </div>
      )}

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-6 space-y-5">
          {/* Region */}
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Region</p>
            <div className="flex flex-wrap gap-2">
              {(['All', ...REGION_IDS] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRegion(r)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedRegion === r
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-50 border border-stone-200 text-stone-600 hover:border-stone-400'
                  }`}
                >
                  {r === 'All' ? 'All Regions' : REGION_META[r].label}
                </button>
              ))}
            </div>
          </div>

          {/* Prefecture */}
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Prefecture</p>
            <div className="flex flex-wrap gap-2">
              {(['All', ...PREFECTURES] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPrefecture(p)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedPrefecture === p
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-50 border border-stone-200 text-stone-600 hover:border-stone-400'
                  }`}
                >
                  {p === 'All' ? 'All' : p}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {(['All', ...CATEGORIES] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === c
                      ? 'bg-red-600 text-white'
                      : 'bg-stone-50 border border-stone-200 text-stone-600 hover:border-stone-400'
                  }`}
                >
                  {c === 'All' ? 'All' : CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          </div>

          {/* Season */}
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Season</p>
            <div className="flex flex-wrap gap-2">
              {SEASON_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedSeason(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedSeason === opt.value
                      ? opt.value === 'now'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-900 text-white'
                      : opt.value === 'now'
                        ? 'bg-stone-50 border border-emerald-300 text-emerald-700 hover:border-emerald-500'
                        : 'bg-stone-50 border border-stone-200 text-stone-600 hover:border-stone-400'
                  }`}
                >
                  {opt.label}
                  {opt.sub && <span className="ml-1 text-xs opacity-60">{opt.sub}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Visit Duration</p>
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedDuration(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedDuration === opt.value
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-50 border border-stone-200 text-stone-600 hover:border-stone-400'
                  }`}
                >
                  {opt.label}
                  {opt.sub && <span className="ml-1 text-xs opacity-60">{opt.sub}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Clear all */}
          {activeFilterCount > 0 && (
            <div className="pt-1 border-t border-stone-100">
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 transition-colors"
              >
                <X size={13} />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-4">🗾</div>
          <p className="text-lg font-semibold text-stone-700 mb-1">No spots match these filters</p>
          <p className="text-sm text-stone-400 mb-6">Try adjusting your filters or search term</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-full border border-stone-200 text-stone-600 hover:border-stone-400 transition-colors"
            >
              <X size={14} />
              Clear all filters
            </button>
            <a
              href="/discover"
              className="flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
            >
              ✦ Find My Match instead
            </a>
          </div>
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
              <SpotCard key={spot.id} spot={spot} isFavorited={favIds.includes(spot.id)} backHref="/spots" />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
