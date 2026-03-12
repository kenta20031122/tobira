'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import type { Spot } from '@/types';
import { isGoodInSeason, getDurationBucket, CATEGORY_LABELS } from '@/lib/utils';
import SpotCard from '@/components/SpotCard';

// ─── Question definitions ──────────────────────────────────────────────────────

type OptionDef = {
  id: string;
  label: string;
  emoji: string;
  filter: (s: Spot) => boolean;
};

type QuestionDef = {
  id: string;
  text: string;
  options: OptionDef[];
  // Only include in pool if this condition holds based on prior answers
  condition?: (answers: Record<string, string>) => boolean;
};

const QUESTIONS: QuestionDef[] = [
  {
    id: 'vibe',
    text: 'What draws you to Japan?',
    options: [
      { id: 'nature', label: 'Nature & adventure', emoji: '🌿', filter: s => s.categories.some(c => ['nature', 'activity'].includes(c)) },
      { id: 'history', label: 'History & culture', emoji: '🏯', filter: s => s.categories.some(c => ['history', 'spiritual'].includes(c)) },
      { id: 'food', label: 'Food & local life', emoji: '🍜', filter: s => s.categories.includes('food') },
      { id: 'onsen', label: 'Onsen & wellness', emoji: '♨️', filter: s => s.categories.includes('onsen') },
    ],
  },
  {
    id: 'region',
    text: 'Which part of Japan?',
    options: [
      { id: 'north', label: 'Northern Japan', emoji: '❄️', filter: s => ['hokkaido', 'tohoku'].includes(s.region) },
      { id: 'central', label: 'Central Honshu', emoji: '🗻', filter: s => ['kanto', 'chubu', 'hokuriku'].includes(s.region) },
      { id: 'west', label: 'Western Japan', emoji: '⛩️', filter: s => ['kinki', 'chugoku', 'shikoku'].includes(s.region) },
      { id: 'south', label: 'Kyushu & Islands', emoji: '🌺', filter: s => ['kyushu', 'okinawa'].includes(s.region) },
    ],
  },
  {
    id: 'season',
    text: 'When are you visiting?',
    options: [
      { id: 'spring', label: 'Spring', emoji: '🌸', filter: s => isGoodInSeason(s.best_season, 'spring') },
      { id: 'summer', label: 'Summer', emoji: '☀️', filter: s => isGoodInSeason(s.best_season, 'summer') },
      { id: 'autumn', label: 'Autumn', emoji: '🍂', filter: s => isGoodInSeason(s.best_season, 'autumn') },
      { id: 'winter', label: 'Winter', emoji: '❄️', filter: s => isGoodInSeason(s.best_season, 'winter') },
    ],
  },
  {
    id: 'duration',
    text: 'How long do you spend at each spot?',
    options: [
      { id: 'short', label: 'Quick stop', emoji: '⚡', filter: s => getDurationBucket(s.duration) === 'short' },
      { id: 'medium', label: 'Half a day', emoji: '🕐', filter: s => getDurationBucket(s.duration) === 'medium' },
      { id: 'long', label: 'Full day +', emoji: '🌅', filter: s => getDurationBucket(s.duration) === 'long' },
    ],
  },
  {
    id: 'nature_type',
    text: 'What kind of nature?',
    condition: a => a.vibe === 'nature',
    options: [
      { id: 'mountain', label: 'Mountains & highlands', emoji: '🏔️', filter: s => s.tags.some(t => /mountain|peak|alp|highland|summit|ski/i.test(t)) || ['chubu', 'tohoku', 'hokkaido'].includes(s.region) },
      { id: 'coast', label: 'Coast & islands', emoji: '🏝️', filter: s => s.tags.some(t => /coast|beach|island|sea|coral|bay/i.test(t)) || ['Okinawa', 'Nagasaki', 'Kagoshima', 'Miyazaki', 'Kochi'].includes(s.prefecture) },
      { id: 'volcanic', label: 'Volcanic & dramatic', emoji: '🌋', filter: s => s.tags.some(t => /volcano|caldera|lava|volcanic|crater/i.test(t)) },
      { id: 'forest', label: 'Ancient forests', emoji: '🌳', filter: s => s.tags.some(t => /forest|cedar|bamboo|grove|woodland/i.test(t)) },
    ],
  },
  {
    id: 'history_type',
    text: 'What era calls to you?',
    condition: a => a.vibe === 'history',
    options: [
      { id: 'ancient', label: 'Ancient shrines & temples', emoji: '🛕', filter: s => s.categories.includes('spiritual') || s.tags.some(t => /ancient|shrine|temple|century|shinto|buddhist/i.test(t)) },
      { id: 'samurai', label: 'Samurai & castles', emoji: '⚔️', filter: s => s.tags.some(t => /samurai|castle|feudal|daimyo|shogun|warrior/i.test(t)) },
      { id: 'traditional', label: 'Traditional crafts & arts', emoji: '🎎', filter: s => s.tags.some(t => /craft|art|traditional|folk|pottery|weaving|textile/i.test(t)) },
      { id: 'heritage', label: 'World Heritage sites', emoji: '🏛️', filter: s => s.tags.some(t => /unesco|heritage|world heritage/i.test(t)) },
    ],
  },
  {
    id: 'crowd',
    text: 'Your ideal crowd level?',
    options: [
      { id: 'hidden', label: 'Hidden gems only', emoji: '🗺️', filter: s => s.is_premium || s.tags.some(t => /hidden|secret|remote|local|off.beaten/i.test(t)) },
      { id: 'any', label: "Whatever's best", emoji: '✨', filter: _s => true },
      { id: 'iconic', label: 'Iconic landmarks', emoji: '📸', filter: s => s.tags.some(t => /unesco|iconic|famous|landmark|must.see/i.test(t)) || !s.is_premium },
    ],
  },
  {
    id: 'atmosphere',
    text: 'Your perfect moment feels like…',
    options: [
      { id: 'serene', label: 'Complete tranquility', emoji: '🕯️', filter: s => s.categories.some(c => ['spiritual', 'onsen'].includes(c)) || getDurationBucket(s.duration) === 'long' },
      { id: 'wow', label: '"I had no idea this existed"', emoji: '🤩', filter: s => s.tags.some(t => /unique|rare|unusual|only|surprising|unexpected/i.test(t)) || s.is_premium },
      { id: 'cultural', label: 'Steeped in culture', emoji: '🎌', filter: s => s.categories.some(c => ['history', 'spiritual', 'food'].includes(c)) },
      { id: 'wild', label: 'Raw & wild', emoji: '🌊', filter: s => s.categories.some(c => ['nature', 'activity'].includes(c)) },
    ],
  },
];

// ─── Scoring: pick the question that splits the pool most evenly ───────────────

function getNextQuestion(
  pool: Spot[],
  askedIds: string[],
  answers: Record<string, string>,
): QuestionDef | null {
  const available = QUESTIONS.filter(q => {
    if (askedIds.includes(q.id)) return false;
    if (q.condition && !q.condition(answers)) return false;
    return true;
  });
  if (available.length === 0 || pool.length === 0) return null;

  let bestQ = available[0];
  let bestScore = -Infinity;

  for (const q of available) {
    const total = pool.length;
    const counts = q.options.map(opt => pool.filter(opt.filter).length);
    // Skip if every option returns the same count (useless split)
    if (counts.every(c => c === counts[0])) continue;
    // Score = how close to equal distribution (Herfindahl-style)
    const ideal = total / q.options.length;
    const deviation = counts.reduce((sum, c) => sum + Math.abs(c - ideal), 0);
    const score = 1 - deviation / (total * (q.options.length - 1));
    if (score > bestScore) {
      bestScore = score;
      bestQ = q;
    }
  }

  return bestQ;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SpotFinder({ spots }: { spots: Spot[] }) {
  const [pool, setPool] = useState<Spot[]>(spots);
  const [askedIds, setAskedIds] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<{ askedIds: string[]; pool: Spot[]; answers: Record<string, string> }[]>([]);
  const [done, setDone] = useState(false);

  const currentQ = useMemo(() => {
    if (done) return null;
    return getNextQuestion(pool, askedIds, answers);
  }, [pool, askedIds, answers, done]);

  function handleAnswer(q: QuestionDef, opt: OptionDef) {
    // Save undo state
    setHistory(h => [...h, { askedIds, pool, answers }]);

    const newPool = opt.id === 'any' ? pool : pool.filter(opt.filter);
    const filtered = newPool.length > 0 ? newPool : pool; // fallback if 0 results
    const newAsked = [...askedIds, q.id];
    const newAnswers = { ...answers, [q.id]: opt.id };

    setPool(filtered);
    setAskedIds(newAsked);
    setAnswers(newAnswers);

    // Stop when pool is small enough or no more useful questions
    if (filtered.length <= 4 || !getNextQuestion(filtered, newAsked, newAnswers)) {
      setDone(true);
    }
  }

  function handleUndo() {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setPool(prev.pool);
    setAskedIds(prev.askedIds);
    setAnswers(prev.answers);
    setHistory(h => h.slice(0, -1));
    setDone(false);
  }

  function restart() {
    setPool(spots);
    setAskedIds([]);
    setAnswers({});
    setHistory([]);
    setDone(false);
  }

  // ── Results ──
  if (done) {
    const topSpots = pool.slice(0, 3);
    const topRegion = topSpots[0]?.region;
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-stone-500 text-sm">
            <span className="font-semibold text-stone-800">{pool.length}</span> spot{pool.length !== 1 ? 's' : ''} match your vibe
          </p>
          <button onClick={restart} className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 transition-colors">
            <RotateCcw size={13} />
            Start over
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topSpots.map(s => <SpotCard key={s.id} spot={s} />)}
        </div>

        {pool.length > 3 && (
          <p className="text-center text-sm text-stone-500">
            +{pool.length - 3} more matches —{' '}
            <Link href="/spots" className="text-red-600 hover:text-red-700 font-medium">browse all</Link>
          </p>
        )}

        <div className="text-center">
          <Link
            href={topRegion ? `/plan?region=${topRegion}` : '/plan'}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            <Sparkles size={15} />
            Build a full itinerary
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  // ── Question ──
  if (!currentQ) return null;

  const cols = currentQ.options.length <= 2 ? 'grid-cols-2' : 'grid-cols-2';

  return (
    <div className="space-y-5">
      {/* Header: pool counter + undo */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex gap-2">
          {history.length > 0 && (
            <button onClick={handleUndo} className="text-stone-400 hover:text-stone-600 transition-colors text-xs underline underline-offset-2">
              ← Undo
            </button>
          )}
        </div>
        <span className="text-stone-500 tabular-nums">
          <span className="font-semibold text-stone-800">{pool.length}</span> spots left
        </span>
      </div>

      {/* Question */}
      <div>
        <p className="text-xs text-stone-400 font-medium uppercase tracking-wide mb-1">
          Question {askedIds.length + 1}
        </p>
        <h3 className="text-xl sm:text-2xl font-bold text-stone-900 mb-5">{currentQ.text}</h3>

        <div className={`grid ${cols} gap-3`}>
          {currentQ.options.map(opt => (
            <button
              key={opt.id}
              onClick={() => handleAnswer(currentQ, opt)}
              className="group flex flex-col items-center gap-2 p-4 sm:p-5 rounded-2xl border border-stone-200 bg-white hover:border-red-300 hover:bg-red-50 hover:shadow-sm transition-all text-center"
            >
              <span className="text-2xl sm:text-3xl">{opt.emoji}</span>
              <span className="text-sm font-medium text-stone-700 group-hover:text-red-700 transition-colors leading-snug">
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Previous answers */}
      {askedIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2">
          {askedIds.map(qId => {
            const q = QUESTIONS.find(q => q.id === qId);
            const optId = answers[qId];
            const opt = q?.options.find(o => o.id === optId);
            if (!opt) return null;
            return (
              <span key={qId} className="text-xs bg-stone-100 text-stone-500 px-2.5 py-1 rounded-full flex items-center gap-1">
                {opt.emoji} {opt.label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
