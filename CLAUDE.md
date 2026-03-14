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

## よくある落とし穴

- Hokkaido は TopoJSON で `"Hokkai Do"` — 正規化を忘れずに
- `guides/page.tsx` の REGIONS 配列は `lib/regions.ts` と別物（将来的に統合予定）
- `/spots` の region フィルタは URL パラメータ `?region=kanto` で渡す（`SpotsClient` が読む）
- Featured spots: homepage では hokkaido/kinki/kyushu から非プレミアムスポットを動的に1件ずつ取得
