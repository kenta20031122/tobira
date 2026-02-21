import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, Lock, MapPin, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import PricingCTA from '@/components/PricingCTA';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tobira Pro',
  description: 'Unlock all premium spots across Kyushu.',
};

const FEATURES = [
  'Access all 18+ premium spots',
  'Hidden local tips & insider timing',
  'Full location maps for every spot',
  'Access & duration details',
  'Highlights from locals who know',
  'All future premium spots included',
];

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const { success } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isPro = false;
  if (user) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .single();
    isPro = sub?.status === 'active';
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      {/* Success banner */}
      {success && (
        <div className="mb-8 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-700 text-sm font-medium text-center">
          Welcome to Tobira Pro! Your subscription is active.
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 text-sm font-medium px-4 py-2 rounded-full mb-4">
          <Lock size={14} />
          Tobira Pro
        </div>
        <h1 className="text-4xl font-bold text-stone-900 mb-3">
          Unlock Kyushu's Hidden Gems
        </h1>
        <p className="text-stone-500 text-lg">
          Go beyond the guidebook. Get access to handpicked secret spots locals actually visit.
        </p>
      </div>

      {/* Pricing card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-8 mb-6">
        {/* Price */}
        <div className="text-center mb-8">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-bold text-stone-900">$4.99</span>
            <span className="text-stone-400 text-lg">/ month</span>
          </div>
          <p className="text-stone-400 text-sm mt-1">Cancel anytime</p>
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-8">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0 mt-0.5">
                <Check size={12} strokeWidth={3} />
              </div>
              <span className="text-stone-700 text-sm">{f}</span>
            </li>
          ))}
        </ul>

        <PricingCTA isLoggedIn={!!user} isPro={isPro} />
      </div>

      {/* Preview links */}
      <div className="bg-stone-50 rounded-xl p-5 text-center">
        <p className="text-stone-500 text-sm mb-3">Want to see what's inside first?</p>
        <div className="flex items-center justify-center gap-4 text-sm">
          <Link
            href="/spots"
            className="flex items-center gap-1.5 text-stone-600 hover:text-red-600 transition-colors"
          >
            <MapPin size={13} />
            Browse all spots
          </Link>
          <span className="text-stone-300">·</span>
          <Link
            href="/plan"
            className="flex items-center gap-1.5 text-stone-600 hover:text-red-600 transition-colors"
          >
            <Sparkles size={13} />
            Try AI planner
          </Link>
        </div>
      </div>
    </div>
  );
}
