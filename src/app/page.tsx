import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, MapPin, Compass } from 'lucide-react';
import { getAllSpots } from '@/lib/spots';
import SpotCard from '@/components/SpotCard';
import HomeSearchBar from '@/components/HomeSearchBar';

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

  const FEATURED_IDS = ['aso-caldera', 'beppu-hells', 'takachiho-gorge'];
  const featuredSpots = FEATURED_IDS.map((id) => spots.find((s) => s.id === id)!).filter(Boolean);

  const PH = 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop&q=80';
  const SB = (file: string) =>
    `https://khgpsvnrorfigvubxhmd.supabase.co/storage/v1/object/public/spot-images/${file}`;

  const PREFECTURE_DATA: Record<string, { tagline: string; image: string }> = {
    Hokkaido:  { tagline: 'Lavender Fields & Wild Frontiers',    image: SB('hokkaido.jpg') },
    Aomori:    { tagline: 'Sacred Mountains & Apple Blossoms',   image: SB('aomori.jpg') },
    Iwate:     { tagline: 'Golden Temples & Hidden Gorges',      image: SB('iwate.jpg') },
    Miyagi:    { tagline: 'Island Bays & Samurai Coast',         image: SB('miyagi.jpg') },
    Akita:     { tagline: 'Samurai Towns & Volcanic Lakes',      image: SB('akita.jpg') },
    Yamagata:  { tagline: 'Snow Onsen & Mountain Shrines',       image: SB('yamagata.jpg') },
    Fukushima: { tagline: 'Castle Towns & Emerald Lakes',        image: SB('fukushima.jpg') },
    Osaka:     { tagline: 'Street Food, Neon & Ancient Shrines', image: SB('osaka.jpg') },
    Kyoto:     { tagline: 'Temples, Geisha & Hidden Gardens',    image: SB('kyoto.jpg') },
    Nara:      { tagline: 'Sacred Deer & Ancient Capitals',      image: SB('nara.jpg') },
    Hyogo:     { tagline: 'Hot Springs, Clouds & Castle Towns',  image: SB('hyogo.jpg') },
    Shiga:     { tagline: 'Lake Country & Samurai Castles',      image: SB('shiga.jpg') },
    Wakayama:  { tagline: 'Sacred Mountains & Ocean Trails',     image: SB('wakayama.jpg') },
    Mie:       { tagline: "Japan's Holiest Shrine & Pearl Bays", image: SB('mie.jpg') },
    Aichi:     { tagline: 'Rivers, Castles & Meiji Heritage',    image: SB('aichi.jpg') },
    Shizuoka:  { tagline: 'Mt Fuji Views & Hot Spring Valleys',  image: SB('shizuoka.jpg') },
    Nagano:    { tagline: 'Alpine Valleys & Snow Monkeys',       image: SB('nagano.jpg') },
    Ishikawa:  { tagline: 'Geisha Districts & Wild Coastlines',  image: SB('ishikawa.jpg') },
    Gifu:      { tagline: 'Thatched Villages & Mountain Streams',image: SB('gifu.jpg') },
    Tokyo:     { tagline: 'Megacity, Temples & Hidden Alleys',   image: PH },
    Kanagawa:  { tagline: 'Samurai History & Mountain Bays',     image: PH },
    Saitama:   { tagline: 'Ancient Tombs & Edo Canals',          image: PH },
    Chiba:     { tagline: 'Pacific Coast & Hidden Waterfalls',   image: PH },
    Ibaraki:   { tagline: 'Plum Blossoms & Coastal Dunes',       image: PH },
    Tochigi:   { tagline: 'UNESCO Shrines & Onsen Gorges',       image: PH },
    Gunma:     { tagline: 'Silk Road & Mountain Hot Springs',    image: PH },
    Yamanashi: { tagline: 'Fuji Five Lakes & Wine Country',      image: PH },
    Niigata:   { tagline: 'Rice, Sake & Japan Sea Coast',        image: PH },
    Toyama:    { tagline: 'Black Dam & Northern Alps',           image: PH },
    Fukui:     { tagline: 'Dinosaur Country & Cliffside Coasts', image: PH },
    Hiroshima: { tagline: 'Peace, Islands & Inland Sea',         image: SB('hiroshima.jpg') },
    Yamaguchi: { tagline: 'Torii Cliffs & Karst Caves',          image: SB('yamaguchi.jpg') },
    Okayama:   { tagline: 'Canal Districts & Garden Art',        image: SB('okayama.jpg') },
    Tottori:   { tagline: 'Sand Dunes & Sacred Peaks',           image: SB('tottori.jpg') },
    Shimane:   { tagline: 'Ancient Shrines & Silver Mines',      image: SB('shimane.jpg') },
    Ehime:     { tagline: 'Oldest Onsen & Island Cycling',       image: SB('ehime.jpg') },
    Kochi:     { tagline: 'Wild Rivers & Pacific Coast',         image: SB('kochi.jpg') },
    Tokushima: { tagline: 'Whirlpools & Vine Bridges',           image: SB('tokushima.jpg') },
    Kagawa:    { tagline: 'Art Islands & Sacred Stairs',         image: SB('kagawa.jpg') },
    Fukuoka:   { tagline: 'Ramen, Shrines & City Life',          image: SB('fukuoka.jpg') },
    Saga:      { tagline: 'Pottery & Ancient Ruins',             image: SB('saga.jpg') },
    Nagasaki:  { tagline: 'History, Islands & Peace',            image: SB('nagasaki.jpg') },
    Kumamoto:  { tagline: 'Volcanoes & Onsen',                   image: SB('kumamoto.jpg') },
    Oita:      { tagline: 'Hot Springs & Highlands',             image: SB('oita.jpg') },
    Miyazaki:  { tagline: 'Myth & Pacific Coast',                image: SB('miyazaki.jpg') },
    Kagoshima: { tagline: 'Sakurajima & Wild South',             image: SB('kagoshima.jpg') },
    Okinawa:   { tagline: 'Coral Reefs & Ryukyu Culture',        image: SB('okinawa.jpg') },
  };

  const REGIONS = [
    { label: 'Hokkaido & Tohoku',  prefectures: ['Hokkaido', 'Aomori', 'Iwate', 'Miyagi', 'Akita', 'Yamagata', 'Fukushima'] },
    { label: 'Kanto',              prefectures: ['Tokyo', 'Kanagawa', 'Saitama', 'Chiba', 'Ibaraki', 'Tochigi', 'Gunma', 'Yamanashi'] },
    { label: 'Hokuriku',           prefectures: ['Niigata', 'Toyama', 'Fukui'] },
    { label: 'Chubu',              prefectures: ['Aichi', 'Shizuoka', 'Nagano', 'Ishikawa', 'Gifu'] },
    { label: 'Kinki',              prefectures: ['Osaka', 'Kyoto', 'Nara', 'Hyogo', 'Shiga', 'Wakayama', 'Mie'] },
    { label: 'Chugoku & Shikoku', prefectures: ['Hiroshima', 'Yamaguchi', 'Okayama', 'Tottori', 'Shimane', 'Ehime', 'Kochi', 'Tokushima', 'Kagawa'] },
    { label: 'Kyushu & Okinawa',  prefectures: ['Fukuoka', 'Saga', 'Nagasaki', 'Kumamoto', 'Oita', 'Miyazaki', 'Kagoshima', 'Okinawa'] },
  ];

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

          <p className="text-stone-500 text-sm mt-8">
            {spots.length} hand-picked spots across Japan
          </p>
        </div>
      </section>

      {/* ─── Browse by Interest ───────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-stone-900 mb-3">
            What are you looking for?
          </h2>
          <p className="text-stone-500 max-w-md mx-auto">
            Browse by interest — or let the AI weave everything into one trip.
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
          {[
            { label: 'Nature',   emoji: '🌋', category: 'nature'   },
            { label: 'Onsen',    emoji: '♨️',  category: 'onsen'    },
            { label: 'Food',     emoji: '🍜', category: 'food'     },
            { label: 'History',  emoji: '🏯', category: 'history'  },
            { label: 'Shrines',  emoji: '⛩',  category: 'spiritual'},
            { label: 'Activity', emoji: '🧗', category: 'activity' },
          ].map(({ label, emoji, category }) => (
            <Link
              key={category}
              href={`/spots?category=${category}`}
              className="group flex flex-col items-center gap-2 py-5 px-2 rounded-2xl border border-stone-200 bg-white hover:border-red-300 hover:bg-red-50 transition-colors"
            >
              <span className="text-3xl">{emoji}</span>
              <span className="text-sm font-medium text-stone-700 group-hover:text-red-700 transition-colors">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Prefecture Cards ─────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-stone-900 mb-3">
            All of Japan. Beyond the Guidebook.
          </h2>
          <p className="text-stone-500 max-w-lg mx-auto">
            All 47 prefectures — from Hokkaido to Okinawa — each curated by someone who has actually been there.
          </p>
        </div>

        <div className="space-y-10">
          {REGIONS.map((region) => (
            <div key={region.label}>
              <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-4">
                {region.label}
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                {region.prefectures.map((name) => {
                  const data = PREFECTURE_DATA[name];
                  const count = spots.filter((s) => s.prefecture === name).length;
                  return (
                    <Link
                      key={name}
                      href={`/guides/${name.toLowerCase()}`}
                      className="group relative rounded-2xl overflow-hidden flex-shrink-0 w-52 h-64 block"
                    >
                      <Image
                        src={data.image}
                        alt={name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-stone-300 text-xs mb-0.5">{data.tagline}</p>
                        <h3 className="text-white text-lg font-bold leading-tight">{name}</h3>
                        <p className="text-stone-400 text-xs mt-0.5">{count} spots</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
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
