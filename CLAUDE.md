# Tobira — Claude Code Project Guide

## プロジェクト概要

日本のスポット・観光ガイドサービス。旅行者が地域・季節・カテゴリでスポットを探せるマップベースのアプリ。

**スタック:** Next.js (App Router, Turbopack) / React 19 / TypeScript / Tailwind CSS 4 / Supabase / Stripe / Leaflet / react-simple-maps

---

## アーキテクチャ上のルール

### Next.js App Router

- `dynamic(() => import(...), { ssr: false })` は **`'use client'` ラッパーコンポーネントから**行う。サーバーコンポーネントから直接行わない。
  - 正しいパターン: Server Component → `JapanRegionMapWrapper` (`'use client'`) → `JapanRegionMap` (dynamic, ssr:false)
- npm install は必ず `--legacy-peer-deps` を付ける

### Japan Map (TopoJSON / react-simple-maps)

- TopoJSON オブジェクトキー: `"japan"`、都道府県名プロパティ: `nam`（例: "Kyoto Fu", "Tokyo To", "Saga Ken"）
- **Hokkaido の特殊ケース**: TopoJSON では `"Hokkai Do"` — `normalizePrefectureName` で必ず個別処理する
  ```ts
  if (nam === 'Hokkai Do') return 'Hokkaido'
  return nam.replace(/ (To|Fu|Ken|Do)$/, '').trim()
  ```
- プロジェクション: geoMercator, center [136.5, 34.8], scale 1100, width 520, height 570
- Okinawa の色: `#c026d3`（fuchsia）— 海色 `#bfdbfe` と区別するため
- kinki リージョンのラベル: `'Kansai'`（'Kinki (Kansai)' から短縮）

### データ層

- `src/lib/regions.ts` — Region メタデータ、PREFECTURE_TO_REGION、normalizePrefectureName
- `src/lib/utils.ts` — PREFECTURE_LABELS、PREFECTURE_MAP、isInSeason、getDurationBucket
- `src/types/index.ts` — Prefecture, Region, Category, Spot 型定義

**既知の技術的負債:** `src/app/guides/page.tsx` に独自の REGIONS 配列あり（`src/lib/regions.ts` と重複）

---

## TypeScript コーディングスタイル

### 型付け

- export 関数・共有ユーティリティには必ず引数と戻り値の型を明示する
- `any` は禁止。外部データには `unknown` を使い安全に narrowing する
- React コンポーネントの props は named `interface` または `type` で定義する。`React.FC` は使わない
- object shape の拡張・実装が想定される場合は `interface`、union/intersection/utility は `type`

```typescript
// NG
export function formatSpot(spot: any) { ... }

// OK
export function formatSpot(spot: Spot): string { ... }
```

### イミュータビリティ

- 既存オブジェクトを直接変更しない。スプレッド演算子で新しいオブジェクトを返す

```typescript
// NG: 直接変更
spot.name = newName

// OK: 新オブジェクト
return { ...spot, name: newName }
```

### エラーハンドリング

- async/await + try-catch を使う
- `catch (error: unknown)` で受け取り、`instanceof Error` で narrowing する
- エラーを黙って握りつぶさない

### ファイル構成

- 1ファイル 200〜400行が目安、800行を超えない
- ファイルは型・レイヤーではなく機能/ドメインで整理する

---

## Supabase ルール

- 型安全なクエリ: `generate_typescript_types` で生成した型を使う
- RLS (Row Level Security) を意識してデータアクセスを設計する
- クライアントサイドに秘密情報を漏らさない（`NEXT_PUBLIC_` のみ公開）
- Supabase クエリの最適化が必要な場合は `database-reviewer` エージェントを使う

---

## セキュリティ

- シークレットはハードコードしない。必ず環境変数から読む
- `console.log` を本番コードに残さない
- セキュリティ監査には `security-reviewer` エージェントを使う

---

## テスト

新機能を実装する際は TDD ワークフローを推奨:

1. テストを先に書く（RED）
2. テストが失敗することを確認する
3. 最小限の実装でパスさせる（GREEN）
4. リファクタリング（IMPROVE）

TDD サポートには `tdd-guide` エージェントを活用する。

---

## Git コミット規約

```
<type>: <説明>

<任意の本文>
```

type の種類: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`

---

## 利用可能なエージェント

| エージェント | 用途 |
|------------|------|
| `database-reviewer` | Supabase クエリ・RLS・インデックス最適化 |
| `security-reviewer` | セキュリティ脆弱性スキャン |
| `tdd-guide` | TDD ワークフロー支援 |
| `build-error-resolver` | TypeScript / Next.js ビルドエラー解消 |
| `code-reviewer` | コード品質レビュー（feature-dev プラグイン） |

---

## スポット追加ルール

新しいスポットを追加するときは **必ず全フィールドを埋める**。既存スクリプトにないからといって省略しない。

### 必須フィールド（全件）

| フィールド | 内容 |
|-----------|------|
| `id` | kebab-case スラッグ（英語） |
| `name` | 英語名 |
| `prefecture` | `src/types/index.ts` の Prefecture 型に合わせる |
| `region` | `hokkaido` / `tohoku` / `kanto` / `hokuriku` / `chubu` / `kinki` / `chugoku` / `shikoku` / `kyushu` / `okinawa` |
| `categories` | `nature` / `history` / `onsen` / `food` / `activity` / `spiritual` から複数可 |
| `description` | 3〜5文の英語説明 |
| `address` | 英語住所 |
| `lat` / `lng` | 座標（小数点4桁以上） |
| `image_url` | Unsplash プレースホルダー可 |
| `tags` | 5〜7個 |
| `is_premium` | `true` / `false` |
| `highlights` | 4項目 |
| `best_season` | 例: `'June–October'` |
| `access` | 最寄り駅・バスなどのアクセス方法 |
| `admission` | 入場料（無料なら `'Free'`） |
| `duration` | 例: `'2–3 hours'` |
| `opening_hours` | 営業時間（例: `'9:00–17:00 (Apr–Oct), 9:00–16:00 (Nov–Mar)'`） |
| `tips` | 現地での注意点・おすすめの過ごし方（1〜3文） |

### よくあるミス

- **既存シードスクリプトを参考にすると `opening_hours` / `tips` が抜ける** — 古いスクリプトにはこれらがないが、DB には列が存在し UI にも表示される。必ず入れること。
- `opening_hours` と `tips` を後から UPDATE するのは手間が倍になるため、INSERT 時点で必ず含める。

### SQL テンプレート

```sql
INSERT INTO spots (
  id, name, prefecture, region, categories, description,
  address, lat, lng, image_url, tags, is_premium,
  highlights, best_season, access, admission, duration,
  opening_hours, tips
) VALUES (
  'spot-id',
  'Spot Name',
  'Prefecture',
  'region',
  ARRAY['nature'],
  'Description text.',
  'Address, City, Prefecture',
  35.0000, 135.0000,
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop&q=80',
  ARRAY['tag1', 'tag2'],
  false,
  ARRAY['Highlight 1', 'Highlight 2', 'Highlight 3', 'Highlight 4'],
  'April–October',
  'Access description.',
  'Free',
  '2–3 hours',
  '9:00–17:00 (closed Mondays)',
  'Tips for visitors.'
);
```

---

## 写真追加ワークフロー

### 通常フロー
```bash
npm run list-unimaged          # 写真未設定スポット確認
npm run fetch-candidates       # Pexels + Wikimedia から候補を自動取得
npm run review-photos -- --upload  # キー1つで承認・アップロード
# 操作: [1-5]=承認  [p]=Pixtaキュー  [s]=スキップ  [o]=Finder  [q]=終了
```

### Pixta（手動）フロー
```bash
# Pixtaでまとめてダウンロード → ~/Downloads/pixta-import/ に移動
npm run batch-import -- ~/Downloads/pixta-import/
rm -rf ~/Downloads/pixta-import/

# 1枚だけの場合
node scripts/import-photo.mjs <spot-id> ~/Downloads/pixta_xxxxx.jpg
```

### 写真ソース
| ソース | APIキー | クレジット | 用途 |
|---|---|---|---|
| Pexels | `PEXELS_API_KEY`（無料） | 不要 | 自動取得メイン |
| Wikimedia Commons | 不要 | CC BY系は必要（自動保存） | 自動取得サブ |
| Pixta | なし（手動DL） | 不要 | 品質重視・ニッチなスポット |

### photo_credit
- Wikimedia 写真は承認時に `spots.photo_credit` へ自動保存
- スポット詳細ページの画像右下に表示
- Pixta / Pexels は不要（ライセンス上クレジット不要）

---

## よくある落とし穴

- Hokkaido は TopoJSON で `"Hokkai Do"` — 正規化を忘れずに
- `guides/page.tsx` の REGIONS 配列は `lib/regions.ts` と別物（将来的に統合予定）
- `/spots` の region フィルタは URL パラメータ `?region=kanto` で渡す（`SpotsClient` が読む）
- Featured spots: homepage では hokkaido/kinki/kyushu から非プレミアムスポットを動的に1件ずつ取得
