import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, MapPin, Compass } from 'lucide-react';
import { getAllSpots } from '@/lib/spots';
import SpotCard from '@/components/SpotCard';
import HomeSearchBar from '@/components/HomeSearchBar';
import SpotFinder from '@/components/SpotFinder';
import type { Prefecture } from '@/types';
import JapanRegionMapWrapper from '@/components/JapanRegionMapWrapper';

const FEATURES = [
  {
    icon: Compass,
    title: 'Curated by Locals',
    description:
      "Every spot is hand-picked by someone who has been there — not scraped from TripAdvisor or trained on influencer content.",
  },
  {
    icon: Sparkles,
    title: 'AI Itinerary Builder',
    description:
      "Tell us your dates, interests and pace. Get a day-by-day plan built around your actual travel style.",
  },
  {
    icon: MapPin,
    title: 'Off the Beaten Path',
    description:
      'No Fushimi Inari queues. No Shibuya Crossing selfies. Just Japan as it actually is.',
  },
];

export default async function HomePage() {
  const spots = await getAllSpots();

  // Pick 1 non-premium spot from each of 3 geographically diverse regions (north / central / south)
  const FEATURED_REGIONS = ['hokkaido', 'kinki', 'kyushu'] as const;
  const featuredSpots = FEATURED_REGIONS
    .map((region) => spots.find((s) => s.region === region && !s.is_premium) ?? spots.find((s) => s.region === region))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const spotCountByPrefecture = Object.fromEntries(
    spots.reduce((acc, s) => {
      acc.set(s.prefecture, (acc.get(s.prefecture) ?? 0) + 1);
      return acc;
    }, new Map<Prefecture, number>()),
  ) as Partial<Record<Prefecture, number>>;

  const prefectureCount = new Set(spots.map((s) => s.prefecture)).size;



  return (
    <div>
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-stone-900">
        <Image
          src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600&auto=format&fit=crop"
          alt="Japanese landscape"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/20 via-transparent to-stone-900/60" />

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <p className="text-stone-300 text-sm font-medium tracking-widest uppercase mb-4">
            扉 · tobira
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight mb-6">
            Beyond Tokyo.
            <br />
            <span className="text-red-400">Real Japan.</span>
          </h1>
          <p className="text-stone-300 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            Hand-curated guides to Japan&apos;s most authentic experiences —
            from Hokkaido&apos;s wild frontiers and Tohoku&apos;s snow onsen
            to Kyushu&apos;s volcanoes and Okinawa&apos;s coral reefs.
          </p>

          {/* Search */}
          <HomeSearchBar />

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/guides"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-4 rounded-full transition-colors text-base"
            >
              Browse Destinations
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-full transition-colors border border-white/20 text-base"
            >
              <Sparkles size={18} />
              Plan with AI
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-8">
            <span className="text-stone-400 text-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
              {spots.length}+ hand-picked spots
            </span>
            <span className="text-stone-400 text-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
              {prefectureCount} prefectures
            </span>
            <span className="text-stone-400 text-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
              Updated monthly
            </span>
          </div>
        </div>
      </section>

      {/* ─── Spot Finder ──────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-stone-900 mb-3">
            What are you looking for?
          </h2>
          <p className="text-stone-500 max-w-md mx-auto">
            Answer a few questions — we&apos;ll find your perfect spot.
          </p>
        </div>
        <SpotFinder spots={spots} />
      </section>

      {/* ─── Explore by Region — Interactive Map ─────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-stone-900 mb-3">
            Where in Japan?
          </h2>
          <p className="text-stone-500 max-w-md mx-auto">
            Click any region to explore hand-picked spots —
            from Hokkaido&apos;s frozen north to Okinawa&apos;s coral reefs.
          </p>
        </div>

        <JapanRegionMapWrapper spotCountByPrefecture={spotCountByPrefecture} />
      </section>

      {/* ─── Featured Spots ───────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-stone-900 mb-2">
                Must-See Spots
              </h2>
              <p className="text-stone-500">
                Chosen for uniqueness, accessibility, and the &quot;I
                can&apos;t believe this is real&quot; factor.
              </p>
            </div>
            <Link
              href="/spots"
              className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSpots.map((spot) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/spots"
              className="inline-flex items-center gap-2 border border-stone-300 text-stone-700 font-medium px-6 py-3 rounded-full hover:bg-stone-100 transition-colors"
            >
              See all {spots.length} spots
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-stone-900 mb-3">
            Not just another travel app
          </h2>
          <p className="text-stone-500 max-w-md mx-auto">
            Built by someone who lives here, not an algorithm trained on
            influencer content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {FEATURES.map((f) => (
            <div key={f.title} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-50 text-red-600 mb-4">
                <f.icon size={22} />
              </div>
              <h3 className="font-semibold text-stone-900 text-lg mb-2">
                {f.title}
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Pricing ──────────────────────────────────────────── */}
      <section id="pricing" className="bg-stone-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-3">Simple Pricing</h2>
          <p className="text-stone-400 mb-12">
            Start free. Go Pro when you&apos;re planning your trip.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="rounded-2xl border border-stone-700 p-8 text-left">
              <p className="text-stone-400 text-sm font-medium mb-1">Free</p>
              <p className="text-3xl font-bold mb-4">$0</p>
              <ul className="text-stone-400 text-sm space-y-2 mb-8">
                <li>✓ All regions — full spot browsing</li>
                <li>✓ More prefectures & spots added regularly</li>
                <li>✓ 1 AI itinerary plan</li>
              </ul>
              <Link
                href="/spots"
                className="block text-center border border-stone-600 text-stone-300 py-2.5 rounded-full text-sm hover:bg-stone-800 transition-colors"
              >
                Start Free
              </Link>
            </div>

            <div className="rounded-2xl bg-red-600 p-8 text-left relative">
              <div className="absolute top-4 right-4 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                Most Popular
              </div>
              <p className="text-red-200 text-sm font-medium mb-1">Pro</p>
              <p className="text-3xl font-bold mb-4">
                $4.99
                <span className="text-red-200 text-base font-normal">/mo</span>
              </p>
              <ul className="text-red-100 text-sm space-y-2 mb-8">
                <li>✓ All premium spots unlocked</li>
                <li>✓ Insider tips & hidden highlights</li>
                <li>✓ Unlimited AI trip plans</li>
                <li>✓ New premium spots added monthly</li>
              </ul>
              <Link
                href="/pricing"
                className="block text-center bg-white text-red-600 py-2.5 rounded-full text-sm font-semibold hover:bg-red-50 transition-colors"
              >
                Get Pro — $4.99/mo
              </Link>
            </div>
          </div>

          <div className="mt-8 space-y-2">
            <p className="text-stone-500 text-xs flex items-center justify-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Payments secured by Stripe. Cancel anytime.
            </p>
            <p className="text-stone-600 text-xs">
              <Link href="/tokushoho" className="underline hover:text-stone-400 transition-colors">
                特定商取引法に基づく表記
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h2 className="text-4xl font-bold text-stone-900 mb-4">
          Your Japan trip starts here.
        </h2>
        <p className="text-stone-500 text-lg mb-10">
          No queues. No crowds. Just the Japan most visitors never find.
        </p>
        <Link
          href="/spots"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-10 py-4 rounded-full transition-colors text-lg"
        >
          Open the Door
          <ArrowRight size={20} />
        </Link>
      </section>
    </div>
  );
}
