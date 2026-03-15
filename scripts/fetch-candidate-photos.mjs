#!/usr/bin/env node
/**
 * fetch-candidate-photos.mjs
 *
 * 写真未設定のスポットに対して Pexels + Unsplash から候補写真を自動取得する。
 * 各スポット 4〜5 枚の候補を scripts/review/{spot-id}/ に保存し、
 * manifest.json にメタデータを記録する。
 *
 * Usage:
 *   node scripts/fetch-candidate-photos.mjs
 *   node scripts/fetch-candidate-photos.mjs --limit 10      # 最初の10スポットのみ
 *   node scripts/fetch-candidate-photos.mjs --spot-id tojinbo-cliffs  # 1スポット指定
 *   node scripts/fetch-candidate-photos.mjs --region hokkaido
 *
 * Required env vars (.env.local):
 *   PEXELS_API_KEY
 *   UNSPLASH_ACCESS_KEY
 */

import { mkdir, writeFile, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../.env.local') });

// ─── Config ───────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PEXELS_KEY = process.env.PEXELS_API_KEY;
const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

if (!PEXELS_KEY && !UNSPLASH_KEY) {
  console.error('PEXELS_API_KEY か UNSPLASH_ACCESS_KEY のどちらか（または両方）を .env.local に設定してください');
  process.exit(1);
}

const REVIEW_DIR = join(__dirname, 'review');
const MANIFEST_PATH = join(REVIEW_DIR, 'manifest.json');
const CANDIDATES_PER_SPOT = 5;
const REQUEST_DELAY_MS = 2500; // レートリミット対策

// ─── CLI args ─────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const limitArg = args[args.indexOf('--limit') + 1];
const spotIdArg = args[args.indexOf('--spot-id') + 1] ?? null;
const regionArg = args[args.indexOf('--region') + 1] ?? null;
const limit = limitArg ? parseInt(limitArg, 10) : null;

// ─── Supabase ─────────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

let query = supabase
  .from('spots')
  .select('id, name, prefecture, region, categories, tags, description')
  .or('image_url.is.null,image_url.like.%unsplash%')
  .order('region')
  .order('name');

if (spotIdArg) {
  query = supabase.from('spots').select('id, name, prefecture, region, categories, tags, description').eq('id', spotIdArg);
} else if (regionArg) {
  query = query.eq('region', regionArg);
}

if (limit && !spotIdArg) {
  query = query.limit(limit);
}

const { data, error } = await query;

if (error) {
  console.error('Supabase error:', error.message);
  process.exit(1);
}

const spots = data ?? [];

if (spots.length === 0) {
  console.log('写真未設定のスポットが見つかりませんでした。');
  process.exit(0);
}

console.log(`\n🔍  ${spots.length}スポットの候補写真を取得します...\n`);

// ─── Load existing manifest ───────────────────────────────────────────────────

let manifest = {};
try {
  const raw = await readFile(MANIFEST_PATH, 'utf8');
  manifest = JSON.parse(raw);
} catch {
  // 新規作成
}

// ─── Pexels search ────────────────────────────────────────────────────────────

async function searchPexels(queries) {
  if (!PEXELS_KEY) return [];
  for (const q of queries) {
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=${CANDIDATES_PER_SPOT}&orientation=landscape`,
        { headers: { Authorization: PEXELS_KEY } }
      );
      if (!res.ok) continue;
      const json = await res.json();
      if ((json.photos ?? []).length > 0) {
        return json.photos.map((p) => ({
          source: 'pexels',
          id: String(p.id),
          query: q,
          downloadUrl: p.src.large2x || p.src.large,
          thumbUrl: p.src.medium,
          photographer: p.photographer,
          pageUrl: p.url,
        }));
      }
    } catch {
      // 次のクエリにフォールバック
    }
  }
  return [];
}

// ─── Unsplash search ──────────────────────────────────────────────────────────

async function searchUnsplash(queries) {
  if (!UNSPLASH_KEY) return [];
  for (const q of queries) {
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=${CANDIDATES_PER_SPOT}&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
      );
      if (!res.ok) continue;
      const json = await res.json();
      const results = json.results ?? [];
      if (results.length > 0) {
        return results.map((p) => ({
          source: 'unsplash',
          id: p.id,
          query: q,
          downloadUrl: p.urls.regular,
          thumbUrl: p.urls.small,
          photographer: p.user.name,
          pageUrl: p.links.html,
        }));
      }
    } catch {
      // 次のクエリにフォールバック
    }
  }
  return [];
}

// ─── Build search queries with fallback ───────────────────────────────────────

function buildQueries(spot) {
  const name = spot.name;
  const pref = spot.prefecture;
  const tag = (spot.tags ?? [])[0] ?? '';
  const cat = (spot.categories ?? [])[0] ?? '';

  return [
    `${name} ${pref} Japan`,    // 最も具体的
    `${name} Japan`,            // 地名のみ
    `${tag} Japan`,             // タグベース
    `${cat} Japan`,             // カテゴリベース
  ].filter(Boolean);
}

// ─── Download image ───────────────────────────────────────────────────────────

async function downloadImage(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer);
}

// ─── Process each spot ────────────────────────────────────────────────────────

let processed = 0;
let skipped = 0;

for (const spot of spots) {
  const spotDir = join(REVIEW_DIR, spot.id);

  // 既に候補がある場合はスキップ
  if (manifest[spot.id]?.candidates?.length > 0) {
    console.log(`⏭️   ${spot.id} — 候補あり、スキップ`);
    skipped++;
    continue;
  }

  console.log(`📥  ${spot.id} (${spot.prefecture})`);
  await mkdir(spotDir, { recursive: true });

  const queries = buildQueries(spot);

  // Pexels と Unsplash を並列検索
  const [pexelsResults, unsplashResults] = await Promise.all([
    searchPexels(queries),
    searchUnsplash(queries),
  ]);

  // 結果をマージ（Pexels優先、最大5件）
  const combined = [...pexelsResults, ...unsplashResults].slice(0, CANDIDATES_PER_SPOT);

  if (combined.length === 0) {
    console.log(`  ⚠️  候補なし → Pixtaキューに追加`);
    manifest[spot.id] = {
      spotName: spot.name,
      prefecture: spot.prefecture,
      status: 'pixta_needed',
      candidates: [],
      pixtaSuggestedQuery: `${spot.name} ${spot.prefecture}`,
    };
    await saveManifest();
    await delay(REQUEST_DELAY_MS);
    continue;
  }

  // 候補をダウンロード
  const candidates = [];
  for (let i = 0; i < combined.length; i++) {
    const c = combined[i];
    const filename = `${i + 1}.jpg`;
    const savePath = join(spotDir, filename);
    try {
      const imgBuf = await downloadImage(c.downloadUrl);
      await writeFile(savePath, imgBuf);
      candidates.push({
        number: i + 1,
        source: c.source,
        sourceId: c.id,
        query: c.query,
        photographer: c.photographer,
        pageUrl: c.pageUrl,
        filename,
      });
      process.stdout.write(`  ${i + 1}✓ `);
    } catch (err) {
      process.stdout.write(`  ${i + 1}✗ `);
    }
  }
  console.log();

  manifest[spot.id] = {
    spotName: spot.name,
    prefecture: spot.prefecture,
    region: spot.region,
    status: 'pending_review',
    candidates,
    pixtaSuggestedQuery: `${spot.name} ${spot.prefecture}`,
  };

  await saveManifest();
  processed++;

  await delay(REQUEST_DELAY_MS);
}

// ─── Summary ──────────────────────────────────────────────────────────────────

const needsPixta = Object.values(manifest).filter((v) => v.status === 'pixta_needed').length;
const pendingReview = Object.values(manifest).filter((v) => v.status === 'pending_review').length;

console.log(`\n${'─'.repeat(60)}`);
console.log(`✅  処理完了`);
console.log(`   候補取得: ${processed}スポット`);
console.log(`   スキップ: ${skipped}スポット`);
console.log(`   Pixtaが必要: ${needsPixta}スポット`);
console.log(`   レビュー待ち: ${pendingReview}スポット`);
console.log(`\n次のステップ:`);
console.log(`  自動選定: node scripts/auto-select-photos.mjs`);
console.log(`  手動承認: node scripts/approve-photo.mjs <spot-id> <候補番号>`);
console.log(`  一括アップロード: npm run upload-images\n`);

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function saveManifest() {
  await mkdir(REVIEW_DIR, { recursive: true });
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
