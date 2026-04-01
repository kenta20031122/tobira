# セキュリティ設定チェックリスト

このドキュメントは、Tobira プロジェクトをセキュアな状態で運用するためのセットアップガイドです。

## デプロイ前に確認すること

### 1. クレデンシャルのローテーション（初回デプロイまたは脆弱性発覚時）

以下のサービスのクレデンシャルが公開または漏洩した場合は、**直ちに以下をローテーション**してください。

| サービス | キー | 更新場所 |
|----------|------|---------|
| Google Gemini | `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| Supabase | `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase ダッシュボード → Settings → API |
| Stripe | `STRIPE_SECRET_KEY` | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| Stripe Webhook | `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Webhooks |
| Resend | `RESEND_API_KEY` | [Resend Dashboard](https://resend.com/api-keys) |
| Instagram | `INSTAGRAM_ACCESS_TOKEN` | Meta App Dashboard → Instagram Basics |
| Pexels | `PEXELS_API_KEY` | [Pexels API](https://www.pexels.com/api/) |

### 2. 環境変数の設定（Vercel）

Vercel ダッシュボード → Project Settings → Environment Variables で以下を設定してください：

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_ID
GEMINI_API_KEY
RESEND_API_KEY
INSTAGRAM_ACCESS_TOKEN
INSTAGRAM_BUSINESS_ACCOUNT_ID
INSTAGRAM_ADMIN_SECRET（非推奨 — 廃止予定）
ADMIN_USER_IDS（カンマ区切りのSupabase user IDs）
CRON_SECRET
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_GA_ID
NEXT_PUBLIC_ADSENSE_CLIENT
NEXT_PUBLIC_ADSENSE_SLOT
PEXELS_API_KEY
```

**重要:** `SUPABASE_SERVICE_ROLE_KEY` と `STRIPE_SECRET_KEY` は **Production 環境のみ**に設定し、Preview/Development には設定しないでください。

### 3. Cron ジョブの認証設定

Instagram 自動投稿の cron `/api/instagram/cron` を保護しています：

1. Vercel ダッシュボードで `CRON_SECRET` を設定してください（強力なランダム文字列推奨）。
2. `vercel.json` の `crons` セクションで `/api/instagram/cron` が定義されていることを確認してください。
3. デプロイ後、設定した `CRON_SECRET` で Authorization ヘッダー `Bearer {CRON_SECRET}` が送信されることを確認してください。

### 4. Admin 機能へのアクセス制御

`/admin/instagram` ページは Supabase 認証でアクセスが制限されています：

1. `ADMIN_USER_IDS` 環境変数に admin ユーザーの Supabase user ID を設定してください（カンマ区切り）。
   - Supabase ダッシュボード → Authentication → Users から user ID を確認できます。
2. Supabase auth provider （メール/パスワード、OAuth等）で admin ユーザーでログインしてからアクセスしてください。

### 5. API 認証・レート制限（実装予定）

現在、以下の API エンドポイントにはレート制限がありません。高トラフィック運用時は `@upstash/ratelimit` 導入を検討してください：

- `POST /api/leads` — リード送信
- `POST /api/plan` — AI プランナー（Gemini API 呼び出し）
- `POST /api/spots` — スポット一覧取得（プレミアム情報漏洩のため要注意）
- `POST /api/user/trips` — トリップ保存
- `POST /api/user/favorites` — お気に入り操作

### 6. セキュリティヘッダー設定（実装予定）

現在、`next.config.ts` にセキュリティヘッダーが設定されていません。本番環境では以下の設定を追加してください：

```typescript
// next.config.ts の headers() 関数で設定
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com ...",
        },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'geolocation=(), microphone=()' },
      ],
    },
  ]
}
```

### 7. ローカル開発での注意

- `.env.local` はクレデンシャルを含むため、**決してコミット、共有、または zip ファイルに含めないでください**。
- `.gitignore` が `.env*` を除外していることを確認してください（現在は正しく設定済み）。
- 開発チームメンバーに `.env.local.example` をコピーして使用するよう指示してください。

## 既知の脆弱性と対応状況

| CVE | パッケージ | 重要度 | 状態 |
|-----|-----------|--------|------|
| GHSA-mq59-m269-xvcx | next@16.1.6 | 高 | アップグレード推奨 |
| GHSA-jcc7-9wpm-mj36 | next@16.1.6 | 中 | アップグレード推奨 |
| GHSA-36jr-mh4h-2g58 | d3-color | 中 | react-simple-maps アップグレード |

```bash
npm install next@latest
npm audit fix
```

## インシデント対応フロー

クレデンシャルが漏洩したと判明した場合：

1. **直ちに該当するキーをローテーション**（上記テーブルを参照）
2. `.env.local` の古いキーを削除
3. Vercel 環境変数を新しいキーで更新
4. デプロイをテスト環境で検証
5. 本番環境にデプロイ

## 定期セキュリティレビュー

毎月以下を実施してください：

- `npm audit` を実行し、脆弱性を確認
- `.env.local.example` が最新のキー一覧を含んでいるか確認
- API ログで異常なアクセスパターンを確認
- Admin 機能へのアクセスログを確認

---

質問や問題がある場合は、CLAUDE.md の「利用可能なエージェント」セクションで `security-reviewer` を使用してください。
