# Tobira — Claude Code Project Guide

## プロジェクト概要

日本のスポット・観光ガイドサービス。旅行者が地域・季節・カテゴリでスポットを探せるマップベースのアプリ。

**スタック:** Next.js (App Router, Turbopack) / React 19 / TypeScript / Tailwind CSS 4 / Supabase / Stripe / Leaflet / react-simple-maps

---

## タスク委任ルール（Codex 連携）

コスト最適化のため、タスクの種類によって担当を分ける。

### コード実装フロー（必ず守ること）

```
STEP 1  実装方針をユーザーに確認（大きなタスクの場合）
STEP 2  Codex に実装を委任
        npx @openai/codex --approval-mode auto-edit "<詳細な指示。ファイルパス・期待する動作を含める>"
STEP 3  Claude が変更ファイルを読んでレビュー
        - CLAUDE.md のコーディングスタイル・アーキテクチャルールに違反していないか
        - バグ・セキュリティリスク・型安全性の問題がないか
        - 不要なコード・コメントがないか
STEP 4  問題があれば Codex に修正指示（STEP 2 に戻る）、なければユーザーに報告
        報告内容: 変更ファイル一覧 / 変更概要 / レビュー結果
```

### 調べ物・リサーチフロー

```bash
npx @openai/codex --approval-mode auto-edit "<調査タスクの詳細>"
```

Codex の調査結果を Claude が要約してユーザーに報告する。

### スポット追加フロー

```
STEP 1  Codex にスポット候補のリサーチを委任
        npx @openai/codex --approval-mode auto-edit "日本の<都道府県>で観光スポットを追加したい。現在のスポット一覧: <一覧>。カバーできていないカテゴリ・エリアを考慮して5件程度の追加候補を提案してください。"
STEP 2  Claude がリストをユーザーに提示して確認
STEP 3  Claude が seed SQL ファイルを作成（scripts/seed-{地域}-extra.sql）
STEP 4  Claude が Supabase MCP で SQL を実行
STEP 5  Codex にファクトチェックを委任
        npx @openai/codex --approval-mode auto-edit "以下のスポットデータのファクトチェックをしてください。admission・access・opening_hours・tips の4フィールドを日本語の公式・一次情報源（公式サイト、観光協会、自治体サイト等）で検証し、誤りを特定してください。結果を scripts/spot-factcheck-report-{地域}.md に保存し、末尾に ## SQL更新候補 として id | field | 修正後の値 の表を出力してください。対象スポット: <スポット一覧>"
STEP 6  Claude がファクトチェック結果を apply-factcheck-{地域}.sql に反映して Supabase で実行
STEP 7  ユーザーが写真を追加して公開
```

### Claude Code が直接行うタスク
- 計画・設計・アーキテクチャの提案
- コードレビュー（Codex 実装後の STEP 3）
- ユーザーとの会話・質問回答
- SQL 作成・Supabase MCP 実行
- ファクトチェック結果の適用（apply SQL 作成・実行）

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

### 🚨 環境変数ファイルの操作禁止

**絶対にやらないこと:**
- `.env.local` を読む、編集、作成、削除する（ユーザーが手動で管理する）
- `.env.production` など本番環境変数ファイルを操作する
- `.env.*` ファイルに値を書き込む
- `.env.local.example` を編集したら、`.env.local` に反映させようとする

**.env.local に何か修正が必要な場合は：**
1. ユーザーに通知する
2. 修正内容を説明する
3. ユーザーが手動で対応するまで待つ

**理由:** `.env.local` はクレデンシャル・シークレットを含む重要ファイル。Git に記録されないため復元不可。誤った操作でプロジェクトが動作不可能になる。

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

## ブログ記事作成ワークフロー

詳細は **docs/ブログ記事作成マニュアル.md** を参照。

### 記事タイプ

| `article_type` | 内容 | 追加フィールド |
|---|---|---|
| `generic` | 複数エリア横断のリスト系記事 | なし |
| `prefecture` | 特定都道府県を深掘りするガイド記事 | `character` / `quick_facts` / `how_to_get_there` |

### 作成フロー

```
STEP 1  場所・構成をユーザーに確認
STEP 2  SQL INSERT 文を生成（cover_image は必ず null）
STEP 3  Supabase SQL Editor で実行
STEP 4  カバー画像を Storage (spot-images/blog/) にアップロード
STEP 5  cover_image を UPDATE
STEP 6  本番で確認（tobira-travel.com/blog/{slug}）
STEP 7  docs/blog-article-prompt.md の既存記事リストを更新
```

### prefecture タイプの追加フィールド

- **`character`**: その都道府県の「性格」を語る文章（3〜5文、観光情報でなく空気感・文化感）
- **`quick_facts`**: `{ access, best_season, vibe_tags }` の JSONB
- **`how_to_get_there`**: 飛行機・新幹線・フェリーなど主要アクセス手段の詳細テキスト

### ライティングルール（必ず守ること）

- British English（travelling, colour, favour）
- **禁止ワード:** nestled / breathtaking / must-visit / hidden gem
- セクション見出しは場所名 + 視点・角度を込める（例: "Beppu — Where the Earth Is Still Boiling"）
- INSERT 時 `cover_image = null`（後で UPDATE する）

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

## スポット ファクトチェック

スポットの **admission（入場料）・access（アクセス）・opening_hours（営業時間）・tips（アドバイス）** の4項目を、公式・一次情報で検証し、誤りを DB に反映する運用。

- **取得:** `node scripts/fetch-unchecked-spots.mjs <region>` で未チェック（`fact_checked_at IS NULL`）のスポットを地域別に取得。取得 JSON には上記4項目を含む。
- **検証:** japan-tourism-fact-checker に JSON を渡し、4項目をまとめて検証。報告書に「## SQL更新候補」表（id | field | 修正後の値）を出力させる。
- **適用:** `node scripts/extract-factcheck-sql.mjs scripts/spot-factcheck-report-<region>.md` で報告書から UPDATE 文を生成し、`apply-factcheck-<region>.sql` の末尾に `fact_checked_at = NOW()` を足して Supabase で実行。

詳細は **scripts/FACTCHECK-WORKFLOW.md** と **docs/ファクトチェックマニュアル.md** を参照。

---

## Instagram 半自動投稿システム

テーマ型カルーセル投稿（例:「北海道の絶景5選」）を半自動化するシステム。AI不使用・テンプレートエンジンのみでコストゼロ生成。

### ファイル構成

```
src/lib/instagram/
  themes.ts           — テーマ定義（静的配列、17テーマ）
  selectSpots.ts      — スポット選択ロジック（ハードフィルター + スコアリング）
  validateImageUrl.ts — 画像URLバリデーション
  generateSlides.ts   — スライドデータ生成（OGエンドポイントURL組み立て）
  generateCaption.ts  — キャプション生成
  generateHashtags.ts — ハッシュタグ生成（≤30タグ）
  instagramClient.ts  — Instagram Graph API ラッパー
  draftBuilder.ts     — オーケストレーター（スライド生成→Storage保存→DB INSERT）

src/app/api/og/
  instagram-cover/route.tsx  — 表紙スライド画像生成（1080×1440）
  instagram-spot/route.tsx   — スポットスライド画像生成（1080×1440）

src/app/api/instagram/
  generate/route.ts    — POST: ドラフト生成
  preview/route.ts     — POST: 選出スポット確認（ドラフト未作成）
  publish/route.ts     — POST: Instagram 投稿
  insights/route.ts    — POST: Insights 取得
  drafts/route.ts      — GET: 一覧
  drafts/[id]/route.ts — GET/PATCH: 単件・承認・ステータスリセット

src/app/admin/instagram/
  page.tsx                   — 管理画面（Server Component）
  InstagramAdminClient.tsx   — 操作UI（プレビュー・生成・承認・投稿・再試行）
  CarouselPreview.tsx        — スライドビューア
```

### スポット選択アルゴリズム

**フェーズ1: ハードフィルター**
- `region` — 地域一致
- `category` — カテゴリ完全一致
- `requireCategories` — いずれか1つを持たないと除外
- `excludeCategories` — 該当カテゴリを持つと除外
- `season` — `isGoodInSeason()` で季節一致
- `months` — 月次テーマ用
- `accessKeywords` — access フィールドにキーワードが含まれるか

**フェーズ2: スコアリング → sort → slice**
- `instagram_priority` (0/1/2) × 3 = 主スコア（0/3/6点）
- `requireCategories` に全カテゴリ一致 → +2ボーナス

### `instagram_priority` スコア基準
| 値 | 意味 | 例 |
|---|---|---|
| 2 | SNS映え最高 | 青い池、高千穂峡、桜島 |
| 1 | 良いスポット | 城、温泉街、文化施設 |
| 0 | SNS不向き | 食市場、ラーメン街、港 |

### 環境変数
```
INSTAGRAM_ACCESS_TOKEN=...         # 長期トークン（60日で失効、要更新）
INSTAGRAM_BUSINESS_ACCOUNT_ID=... # IG Business Account ID
INSTAGRAM_ADMIN_SECRET=...         # 管理UI/API保護
```

### トークン更新
```bash
curl "https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_id=APP_ID&client_secret=APP_SECRET&access_token=SHORT_TOKEN"
```
Vercel 環境変数 `INSTAGRAM_ACCESS_TOKEN` を更新 → Redeploy。

詳細は **docs/Instagram投稿マニュアル.md** を参照。

---

## デプロイ

```bash
git push
```

`main` ブランチへの push で Vercel が自動デプロイ。追加作業不要。

---

## よくある落とし穴

- Hokkaido は TopoJSON で `"Hokkai Do"` — 正規化を忘れずに
- `guides/page.tsx` の REGIONS 配列は `lib/regions.ts` と別物（将来的に統合予定）
- `/spots` の region フィルタは URL パラメータ `?region=kanto` で渡す（`SpotsClient` が読む）
- Featured spots: homepage では hokkaido/kinki/kyushu から非プレミアムスポットを動的に1件ずつ取得
