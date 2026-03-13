# Tobira Blog Article Generator

## プロジェクト概要
tobira.app は日本旅行ガイドサイト。Supabase の `blog_posts` テーブルに記事を保存し、
Next.js で表示する。記事は Supabase SQL Editor に直接 INSERT して公開する。

---

## 作成する記事

- タイトル: `{TITLE}`
- スラッグ: `{SLUG}`
- Brief: `{BRIEF}`

---

## ライティングスタイル（必ず守ること）

- 自信を持った編集スタイル。リスト記事のような書き方はしない
- 具体的：実際の地名・詳細・正直な評価
- British English (travelling, colour, favour)
- 禁止ワード: "nestled", "breathtaking", "must-visit", "hidden gem"
- 各セクション末尾に「なぜ2回目の訪日者向きか」を1文含める
- 各セクションに `travel_time`（主要都市からのアクセス時間）を含める

---

## 既存記事との重複に注意

「Best Places in Japan Beyond Tokyo」が以下をカバー済み。
全く同じ場所の組み合わせにしないこと（一部被りはOK）:

> Kanazawa / Yakushima / Matsumoto / Beppu / Aomori / Noto Peninsula / Naoshima

---

## blog_posts テーブルスキーマ

| カラム | 型 | 説明 |
|---|---|---|
| slug | text | URLスラッグ（例: where-to-go-japan-second-trip） |
| title | text | 記事タイトル |
| description | text | SEOメタ説明文（140-160文字） |
| read_minutes | int | 読了時間（5〜10） |
| cover_image | text | カバー画像URL |
| intro | text | リード文（2〜3文） |
| sections | jsonb | セクション配列（下記参照） |
| cta_heading | text | CTA見出し |
| cta_body | text | CTA本文 |
| related_region | text | 関連リージョン（null可） |
| status | text | 'published' |
| published_at | timestamptz | now() |

---

## sections JSONB構造（7〜8セクション + closing 1セクション）

```json
[
  {
    "heading": "セクション見出し（場所名だけでなく視点を込める）",
    "travel_time": "2.5 hrs from Tokyo by Shinkansen",
    "best_season": "Apr–May for cherry blossoms · Oct–Nov for autumn colour",
    "body": "段落1\n\n段落2\n\n段落3（各段落200〜300文字）",
    "spot_query": { "address_contains": "都市名（英語）", "limit": 3 },
    "section_link": { "text": "Explore XX", "href": "/guides/prefecture-lowercase" }
  },
  {
    "heading": "How to Choose",
    "body": "締めの文章（spot_queryとsection_linkは不要）"
  }
]
```

**フィールド補足:**
- `travel_time`: 主要都市からのアクセス時間。省略可
- `best_season`: ベストシーズン。複数シーズンある場合は `·` 区切りで記述。省略するとDBのspot値が自動表示される
- `spot_query`: 特定の都市・エリアを扱うセクションに追加。締めセクションには不要
- `section_link`: `spot_query` と同じタイミングで追加

`section_link` の `href` に使える prefecture 値:

```
hokkaido, aomori, iwate, miyagi, akita, yamagata, fukushima,
ibaraki, tochigi, gunma, saitama, chiba, tokyo, kanagawa,
niigata, toyama, ishikawa, fukui, yamanashi, nagano, shizuoka,
aichi, mie, shiga, kyoto, osaka, hyogo, nara, wakayama,
tottori, shimane, okayama, hiroshima, yamaguchi,
tokushima, kagawa, ehime, kochi,
fukuoka, saga, nagasaki, kumamoto, oita, miyazaki, kagoshima, okinawa
```

---

## SQL 注意事項

- 文中の `'`（シングルクォート）は `''`（2個）にエスケープする
- body の改行は `\n` で表現する
- sections は末尾に `::jsonb` キャストをつける

---

## 出力形式

以下の SQL INSERT 文を出力すること:

```sql
insert into blog_posts (
  slug, title, description, read_minutes, cover_image,
  intro, sections, cta_heading, cta_body, related_region, status, published_at
)
values (
  '{SLUG}',
  '{TITLE}',
  '{DESCRIPTION}',
  {READ_MINUTES},
  '{COVER_IMAGE_URL}',
  '{INTRO}',
  '[...sections JSON...]'::jsonb,
  '{CTA_HEADING}',
  '{CTA_BODY}',
  null,
  'published',
  now()
);
```

---

## 公開手順

1. **SQL Editor で INSERT 実行**
   Supabase Dashboard → SQL Editor に上記 INSERT 文を貼り付けて実行

2. **カバー画像をアップロード**
   Supabase Dashboard → Storage → `spot-images/blog/` にファイルをアップロード
   URL 形式:
   ```
   https://khgpsvnrorfigvubxhmd.supabase.co/storage/v1/object/public/spot-images/blog/{ファイル名}
   ```

3. **カバー画像 URL を UPDATE**
   ```sql
   update blog_posts
   set cover_image = '{画像URL}'
   where slug = '{SLUG}';
   ```

4. **本番で確認**
   `https://tobira.app/blog/{SLUG}`

---

## 使い方

このファイルを丸ごと AI に渡し、以下の4箇所を書き換えるだけ:

| 変数 | 例 |
|---|---|
| `{TITLE}` | Where to Go in Japan for a Second Trip |
| `{SLUG}` | where-to-go-japan-second-trip |
| `{BRIEF}` | ターゲット: 2回目訪日者。東京・京都・大阪は経験済み。各セクションに travel_time を含める。 |
| `{COVER_IMAGE_URL}` | https://khgpsvnrorfigvubxhmd.supabase.co/storage/v1/object/public/spot-images/blog/xxx.jpg |
