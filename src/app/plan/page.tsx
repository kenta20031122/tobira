'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Loader2, Clock, ChevronDown, ChevronUp, MapPin, Lock } from 'lucide-react';
import { spots, getSpotById } from '@/data/spots';

function findSpot(name: string) {
  const lower = name.toLowerCase();
  return spots.find(
    (s) =>
      s.name.toLowerCase().includes(lower) ||
      lower.includes(s.name.toLowerCase())
  );
}

type DayPlan = {
  day: number;
  title: string;
  spots: {
    name: string;
    description: string;
    time: string;
    tip: string;
  }[];
};

type ItineraryResult = {
  title: string;
  overview: string;
  days: DayPlan[];
};

const INTEREST_OPTIONS = [
  'Nature & Hiking',
  'Onsen & Wellness',
  'Culture & History',
  'Food & Local Cuisine',
  'Spiritual & Shrines',
  'Adventure',
  'Photography',
  'Off-the-beaten-path',
];

const PACE_OPTIONS = [
  { value: 'relaxed', label: 'Relaxed', desc: '1-2 spots/day, plenty of rest' },
  { value: 'moderate', label: 'Moderate', desc: '3-4 spots/day' },
  { value: 'packed', label: 'Packed', desc: '5+ spots/day, maximize everything' },
];

export default function PlanPage() {
  const searchParams = useSearchParams();
  const pinnedSpot = useMemo(() => {
    const id = searchParams.get('spot');
    return id ? getSpotById(id) : null;
  }, [searchParams]);

  const [days, setDays] = useState(3);
  const [interests, setInterests] = useState<string[]>([]);
  const [pace, setPace] = useState('moderate');
  const [prefecture, setPrefecture] = useState(() => pinnedSpot?.prefecture ?? 'all');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ItineraryResult | null>(null);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [expandedDay, setExpandedDay] = useState<number | null>(0);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleGenerate = async () => {
    if (interests.length === 0) {
      setError('Please select at least one interest.');
      return;
    }
    setError('');
    setErrorCode('');
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days, interests, pace, prefecture, spotId: pinnedSpot?.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.code) setErrorCode(data.code);
        throw new Error(data.error ?? 'Failed to generate itinerary');
      }

      const data: ItineraryResult = await res.json();
      setResult(data);
      setExpandedDay(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 text-sm font-medium px-4 py-2 rounded-full mb-4">
          <Sparkles size={15} />
          AI Trip Planner
        </div>
        <h1 className="text-4xl font-bold text-stone-900 mb-3">
          Build Your Kyushu Itinerary
        </h1>
        <p className="text-stone-500 text-lg">
          Tell us what you love. Get a day-by-day plan built around you.
        </p>
      </div>

      {/* Pinned Spot Banner */}
      {pinnedSpot && (
        <div className="flex items-center gap-4 bg-white border border-stone-200 rounded-2xl p-4 mb-8">
          <div className="relative w-20 h-16 rounded-xl overflow-hidden shrink-0">
            <Image
              src={pinnedSpot.image_url}
              alt={pinnedSpot.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-red-500 mb-0.5 flex items-center gap-1">
              <MapPin size={11} />
              Planning around this spot
            </p>
            <p className="font-semibold text-stone-900 truncate">{pinnedSpot.name}</p>
            <p className="text-xs text-stone-400 truncate">{pinnedSpot.prefecture}, Kyushu</p>
          </div>
          <Link
            href={`/spots/${pinnedSpot.id}`}
            className="text-xs text-stone-400 hover:text-stone-600 transition-colors shrink-0"
          >
            View spot
          </Link>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-2xl border border-stone-200 p-8 space-y-8 mb-8">
        {/* Days */}
        <div>
          <label className="block text-sm font-semibold text-stone-800 mb-3">
            How many days?
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={7}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="flex-1 accent-red-600"
            />
            <span className="text-stone-900 font-bold text-xl w-12 text-center">
              {days}
            </span>
          </div>
          <p className="text-stone-400 text-xs mt-1">
            {days === 1 ? '1 day' : `${days} days`} in Kyushu
          </p>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-semibold text-stone-800 mb-3">
            What do you love? (select all that apply)
          </label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  interests.includes(interest)
                    ? 'bg-red-600 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* Pace */}
        <div>
          <label className="block text-sm font-semibold text-stone-800 mb-3">
            Travel pace
          </label>
          <div className="grid grid-cols-3 gap-3">
            {PACE_OPTIONS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPace(p.value)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  pace === p.value
                    ? 'border-red-500 bg-red-50'
                    : 'border-stone-200 hover:border-stone-400'
                }`}
              >
                <p
                  className={`font-semibold text-sm ${
                    pace === p.value ? 'text-red-600' : 'text-stone-800'
                  }`}
                >
                  {p.label}
                </p>
                <p className="text-stone-400 text-xs mt-0.5">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Prefecture */}
        <div>
          <label className="block text-sm font-semibold text-stone-800 mb-3">
            Focus area
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All of Kyushu' },
              { value: 'Kumamoto', label: 'Kumamoto' },
              { value: 'Oita', label: 'Oita' },
              { value: 'Miyazaki', label: 'Miyazaki' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPrefecture(opt.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  prefecture === opt.value
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          errorCode === 'upgrade_required' ? (
            <div className="bg-stone-900 text-white rounded-xl p-5 text-center">
              <Lock size={20} className="mx-auto mb-2 text-red-400" />
              <p className="text-sm mb-4">{error}</p>
              <Link
                href="/pricing"
                className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
              >
                Upgrade to Pro — $4.99/mo
              </Link>
            </div>
          ) : errorCode === 'auth_required' ? (
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 text-center">
              <p className="text-stone-600 text-sm mb-4">{error}</p>
              <Link
                href="/login?next=/plan"
                className="inline-block bg-stone-900 hover:bg-stone-800 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
              >
                Sign in
              </Link>
            </div>
          ) : (
            <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">
              {error}
            </p>
          )
        )}

        {/* Free plan notice */}
        <p className="text-stone-400 text-xs text-center">
          Free accounts include 1 AI plan.{' '}
          <Link href="/pricing" className="underline hover:text-stone-600 transition-colors">
            Upgrade to Pro
          </Link>{' '}
          for unlimited.
        </p>

        {/* Submit */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold py-4 rounded-xl transition-colors text-base"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Building your itinerary...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Generate My Kyushu Itinerary</span>
            </>
          )}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold text-stone-900 mb-2">
              {result.title}
            </h2>
            <p className="text-stone-600 leading-relaxed">{result.overview}</p>
          </div>

          {result.days.map((day, i) => (
            <div
              key={day.day}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden"
            >
              <button
                onClick={() => setExpandedDay(expandedDay === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-stone-50 transition-colors"
              >
                <span className="block">
                  <span className="block text-stone-400 text-xs font-medium mb-0.5">
                    Day {day.day}
                  </span>
                  <span className="block font-semibold text-stone-900">{day.title}</span>
                </span>
                {expandedDay === i ? (
                  <ChevronUp size={18} className="text-stone-400 shrink-0" />
                ) : (
                  <ChevronDown size={18} className="text-stone-400 shrink-0" />
                )}
              </button>

              {expandedDay === i && (
                <div className="px-5 pb-5 space-y-4 border-t border-stone-100">
                  {day.spots.map((s, j) => {
                    const spotData = findSpot(s.name);
                    return (
                      <div key={j} className="pt-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {j + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1 flex-wrap">
                                  {spotData ? (
                                    <Link
                                      href={`/spots/${spotData.id}`}
                                      className="font-semibold text-stone-900 hover:text-red-600 transition-colors"
                                    >
                                      {s.name}
                                    </Link>
                                  ) : (
                                    <span className="font-semibold text-stone-900">{s.name}</span>
                                  )}
                                  <span className="flex items-center gap-1 text-xs text-stone-400">
                                    <Clock size={11} />
                                    {s.time}
                                  </span>
                                </div>
                                <p className="text-stone-600 text-sm mb-2">
                                  {s.description}
                                </p>
                                <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs text-amber-700">
                                  <span className="font-medium">Local tip:</span>{' '}
                                  {s.tip}
                                </div>
                              </div>
                              {spotData && (
                                <Link href={`/spots/${spotData.id}`} className="shrink-0">
                                  <div className="relative w-20 h-16 rounded-lg overflow-hidden">
                                    <Image
                                      src={spotData.image_url}
                                      alt={spotData.name}
                                      fill
                                      className="object-cover"
                                      unoptimized
                                    />
                                  </div>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          <div className="text-center pt-4">
            <button
              onClick={handleGenerate}
              className="text-sm text-stone-500 hover:text-stone-800 underline underline-offset-2 transition-colors"
            >
              Regenerate with different options
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
