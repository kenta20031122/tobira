import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, MapPin, Compass } from 'lucide-react';
import { spots } from '@/data/spots';
import SpotCard from '@/components/SpotCard';

const FEATURES = [
  {
    icon: Compass,
    title: 'Curated by Locals',
    description:
      "Every spot is hand-picked by people who actually live in Kyushu — not scraped from TripAdvisor.",
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

const PREFECTURES = [
  {
    name: 'Kumamoto',
    tagline: 'Volcanoes & Onsen',
    image:
      'https://khgpsvnrorfigvubxhmd.supabase.co/storage/v1/object/public/spot-images/kumamoto.jpg',
    count: spots.filter((s) => s.prefecture === 'Kumamoto').length,
  },
  {
    name: 'Oita',
    tagline: 'Hot Springs & Highlands',
    image:
      'https://khgpsvnrorfigvubxhmd.supabase.co/storage/v1/object/public/spot-images/oita.jpg',
    count: spots.filter((s) => s.prefecture === 'Oita').length,
  },
  {
    name: 'Miyazaki',
    tagline: 'Myth & Pacific Coast',
    image:
      'https://khgpsvnrorfigvubxhmd.supabase.co/storage/v1/object/public/spot-images/miyazaki.jpg',
    count: spots.filter((s) => s.prefecture === 'Miyazaki').length,
  },
];

export default function HomePage() {
  const FEATURED_IDS = ['aso-caldera', 'beppu-hells', 'takachiho-gorge'];
  const featuredSpots = FEATURED_IDS.map((id) => spots.find((s) => s.id === id)!).filter(Boolean);

  return (
    <div>
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-stone-900">
        <Image
          src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600&auto=format&fit=crop"
          alt="Kyushu landscape"
          fill
          className="object-cover opacity-40"
          priority
          unoptimized
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
            Hand-curated guides to Kyushu&apos;s most authentic experiences —
            volcanoes, hidden onsen, sea-cave shrines, and wild horses on
            Pacific cliffs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/spots"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-4 rounded-full transition-colors text-base"
            >
              Explore Kyushu
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

          <p className="text-stone-500 text-sm mt-8">
            {spots.length} hand-picked spots · Kumamoto · Oita · Miyazaki
          </p>
        </div>
      </section>

      {/* ─── Prefecture Cards ─────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-stone-900 mb-3">
            Three Prefectures. Endless Discovery.
          </h2>
          <p className="text-stone-500 max-w-lg mx-auto">
            Each region of Kyushu has its own soul. Pick one, or let the AI
            planner weave them together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PREFECTURES.map((p) => (
            <Link
              key={p.name}
              href={`/spots?prefecture=${p.name}`}
              className="group relative rounded-2xl overflow-hidden h-72 block"
            >
              <Image
                src={p.image}
                alt={p.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-stone-300 text-sm mb-1">{p.tagline}</p>
                <h3 className="text-white text-2xl font-bold">{p.name}</h3>
                <p className="text-stone-400 text-sm mt-1">
                  {p.count} spots curated
                </p>
              </div>
            </Link>
          ))}
        </div>
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
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
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
                <li>✓ All 3 regions — full spot browsing</li>
                <li>✓ More regions & spots added regularly</li>
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
                <li>✓ All 18+ premium spots unlocked</li>
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
