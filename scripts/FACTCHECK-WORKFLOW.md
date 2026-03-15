# スポット ファクトチェック運用フロー

## 1. 未チェックスポットの取得

```bash
cd tobira
node scripts/fetch-unchecked-spots.mjs          # 全件JSONで標準出力
node scripts/fetch-unchecked-spots.mjs batch1   # 神奈川・埼玉 → factcheck-batch1.json
node scripts/fetch-unchecked-spots.mjs batch2   # 栃木・東京 → factcheck-batch2.json
```

Supabase で直接SQLする場合:

```sql
SELECT id, name, prefecture, address, access, admission, best_season, website_url, description
FROM spots
WHERE prefecture IN ('Kanagawa', 'Saitama', 'Tochigi', 'Tokyo')
  AND fact_checked_at IS NULL
ORDER BY prefecture, name;
```

## 2. エージェントに渡す（2分割推奨）

- **前半**: 神奈川（10件）・埼玉（10件） → `factcheck-batch1.json`
- **後半**: 栃木（10件）・東京（10件） → `factcheck-batch2.json`

プロンプト冒頭に必ず入れる検証手順:

```
**検証手順（必須）:**
1. WebSearch で「施設名 入場料 公式 2024」「施設名 アクセス 所要時間」を検索
2. ヒットしたURLを WebFetch で取得
3. 取得失敗なら https://web.archive.org/web/*/[URL] を試す
4. それでも取れない場合は ❓ 未確認 として報告

出力: スポットごとに ✅⚠️❌❓ で分類。最後に優先修正リスト（表形式）をまとめること。
```

エージェント: **japan-tourism-fact-checker**

## 3. 修正をDBに反映

- 前半の修正: `scripts/apply-factcheck-batch1.sql`（❌要修正＋⚠️要注意 両方入り）
- 後半の修正: `scripts/apply-factcheck-batch2.sql`（❌要修正＋⚠️要注意 両方入り）

**SQL の実行方法**は **docs/SQL-RUN-SETUP.md** を参照。

- **Supabase MCP**: Cursor の MCP で Supabase を有効にすると、チャットから「この SQL を実行して」と依頼できる
- **ローカル実行**: `.env.local` に `SUPABASE_DB_URL` を設定し、`pnpm add -D pg` のあと  
  `node scripts/run-sql.mjs scripts/apply-factcheck-batch1.sql` で実行可能

## 4. チェック済みフラグを立てる

全件の修正が終わったら:

```bash
# Supabase SQL Editor で実行
# または
psql $DATABASE_URL -f scripts/mark-factchecked-kanto.sql
```

```sql
-- 中身
UPDATE spots SET fact_checked_at = NOW()
WHERE prefecture IN ('Kanagawa', 'Saitama', 'Tochigi', 'Tokyo') AND fact_checked_at IS NULL;
```

## 進捗確認クエリ

```sql
SELECT prefecture, COUNT(*) AS total,
  COUNT(fact_checked_at) AS checked,
  COUNT(*) - COUNT(fact_checked_at) AS remaining
FROM spots
GROUP BY prefecture
ORDER BY prefecture;
```

## 今回の結果（東京エリア4県 40件）

- **前半（神奈川・埼玉）**: 完了。報告書 `scripts/spot-factcheck-report.md`、修正SQL `scripts/apply-factcheck-batch1.sql`
- **後半（栃木・東京）**: 完了。報告書 `scripts/spot-factcheck-report-batch2.md`、修正SQL `scripts/apply-factcheck-batch2.sql`
- **チェック済みフラグ**: 修正をすべて反映したら `scripts/mark-factchecked-kanto.sql` を実行
