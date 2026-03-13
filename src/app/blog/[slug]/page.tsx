import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowRight, Clock, Sparkles, ChevronRight } from 'lucide-react';
import { getArticle, getAllArticles, getRelatedArticles } from '@/lib/articles';

export function generateStaticParams() {
  return getAllArticles().map(a => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: `${article.title} | Tobira Japan`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      publishedTime: article.publishedAt,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const related = getRelatedArticles(slug, 2);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      {/* Cover image */}
      {article.coverImage && (
        <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-stone-100 mb-10">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
            priority
          />
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-stone-400 mb-8">
        <Link href="/" className="hover:text-stone-600 transition-colors">Home</Link>
        <ChevronRight size={12} />
        <Link href="/blog" className="hover:text-stone-600 transition-colors">Blog</Link>
        <ChevronRight size={12} />
        <span className="text-stone-600 line-clamp-1">{article.title}</span>
      </nav>

      {/* Article header */}
      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 leading-tight mb-4">
          {article.title}
        </h1>
        <div className="flex items-center gap-3 text-sm text-stone-400">
          <time dateTime={article.publishedAt}>
            {new Date(article.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </time>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock size={13} />
            {article.readMinutes} min read
          </span>
        </div>
      </header>

      {/* Intro */}
      {article.intro && (
        <p className="text-stone-600 text-lg leading-relaxed mb-10 border-l-2 border-red-200 pl-4">
          {article.intro}
        </p>
      )}

      {/* Sections */}
      {article.sections.length > 0 && (
        <div className="prose prose-stone max-w-none mb-12 space-y-8">
          {article.sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-xl font-bold text-stone-900 mb-3">{section.heading}</h2>
              {section.body.split('\n').filter(Boolean).map((para, j) => (
                <p key={j} className="text-stone-600 leading-relaxed mb-3">{para}</p>
              ))}
            </section>
          ))}
        </div>
      )}

      {/* CTA block */}
      <div className="bg-stone-900 rounded-2xl p-8 mb-12">
        <p className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-2">
          <Sparkles size={11} className="inline mr-1" />
          Find your Japan
        </p>
        <h2 className="text-xl font-bold text-white mb-3">{article.ctaHeading}</h2>
        <p className="text-stone-400 text-sm mb-5 leading-relaxed">{article.ctaBody}</p>
        <Link
          href="/discover"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-full transition-colors text-sm"
        >
          <Sparkles size={15} />
          Find match spots
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Related articles */}
      {related.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-widest mb-4">More from the blog</h3>
          <div className="space-y-px rounded-2xl border border-stone-200 overflow-hidden">
            {related.map((rel, i) => (
              <Link
                key={rel.slug}
                href={`/blog/${rel.slug}`}
                className={`group flex items-center justify-between gap-4 bg-white hover:bg-stone-50 transition-colors px-5 py-4 ${
                  i < related.length - 1 ? 'border-b border-stone-100' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-900 group-hover:text-red-600 transition-colors text-sm leading-snug">
                    {rel.title}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1">
                    <Clock size={10} />
                    {rel.readMinutes} min read
                  </p>
                </div>
                <ArrowRight size={14} className="shrink-0 text-stone-300 group-hover:text-red-400 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
