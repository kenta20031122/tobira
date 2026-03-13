import { createAdminClient } from '@/lib/supabase/admin';

export interface SpotQuery {
  address_contains?: string;  // address に含まれる文字列（例: "Beppu"）
  prefecture?: string;        // 都道府県（例: "Oita"）
  categories?: string[];      // カテゴリ（例: ["onsen"]）
  limit?: number;             // 最大件数（デフォルト: 3）
}

export interface ArticleSection {
  heading: string;
  body: string;
  image?: string;         // セクション内画像URL（任意）
  spot_ids?: string[];    // spots テーブルの ID（手動指定・任意）
  spot_query?: SpotQuery; // DB クエリで自動取得（任意）
  section_link?: {        // セクション末尾のリンクボタン（任意）
    text: string;         // 例: "Explore Beppu spots"
    href: string;         // 例: "/spots/beppu-hells" or "/guides/oita"
  };
  travel_time?: string;   // 主要都市からの移動時間（例: "2.5 hrs from Tokyo"）
}

export interface Article {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readMinutes: number;
  coverImage?: string;
  intro: string;
  sections: ArticleSection[];
  ctaHeading: string;
  ctaBody: string;
  relatedRegion?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToArticle(row: any): Article {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    publishedAt: row.published_at ? row.published_at.slice(0, 10) : '',
    readMinutes: row.read_minutes,
    coverImage: row.cover_image ?? undefined,
    intro: row.intro,
    sections: Array.isArray(row.sections) ? (row.sections as ArticleSection[]) : [],
    ctaHeading: row.cta_heading,
    ctaBody: row.cta_body,
    relatedRegion: row.related_region ?? undefined,
  };
}

export async function getAllArticles(): Promise<Article[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  return (data ?? []).map(rowToArticle);
}

export async function getArticle(slug: string): Promise<Article | undefined> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  return data ? rowToArticle(data) : undefined;
}

export async function getRelatedArticles(currentSlug: string, count = 2): Promise<Article[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .neq('slug', currentSlug)
    .order('published_at', { ascending: false })
    .limit(count);
  return (data ?? []).map(rowToArticle);
}
