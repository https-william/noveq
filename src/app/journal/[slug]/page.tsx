import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Clock, Calendar } from 'lucide-react';
import { getJournalArticleBySlug, getAllPublishedArticles } from '@/data/journal';
import { getProductBySlug } from '@/lib/productStore';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = getAllPublishedArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getJournalArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Note Not Found',
    };
  }

  const coverImg = article.coverImage || '/images/products/cut-black-detail.svg';
  const pageTitle = article.seoTitle || `${article.title} | NOVEQ Journal`;
  const pageDesc = article.seoDescription || article.excerpt;

  return {
    title: pageTitle,
    description: pageDesc,
    alternates: {
      canonical: `/journal/${article.slug}`,
    },
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: `/journal/${article.slug}`,
      siteName: 'NOVEQ',
      type: 'article',
      publishedTime: article.date,
      images: [
        {
          url: coverImg,
          width: 1200,
          height: 900,
          alt: article.coverAlt || article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDesc,
      images: [coverImg],
    },
  };
}

export default async function JournalArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getJournalArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedProduct = article.relatedProductSlug
    ? getProductBySlug(article.relatedProductSlug)
    : null;

  return (
    <article className="py-12 sm:py-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back Navigation */}
      <nav aria-label="Breadcrumb" className="pb-8">
        <Link
          href="/journal"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-taupe hover:text-ink-black focus-dark transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Journal</span>
        </Link>
      </nav>

      {/* Article Header */}
      <header className="space-y-4 pb-8 border-b border-cocoa/15">
        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-muted-taupe">
          <span className="text-cocoa font-medium">{article.tags[0]}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <time dateTime={article.date}>{article.date}</time>
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {article.readingTime}
          </span>
        </div>

        <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal tracking-[-0.02em] text-ink-black leading-[1.12] text-balance">
          {article.title}
        </h1>

        {article.subtitle && (
          <p className="text-[15px] sm:text-lg text-muted-taupe font-normal leading-relaxed text-pretty">
            {article.subtitle}
          </p>
        )}
      </header>

      {/* Optional Featured Cover Image */}
      {article.coverImage && (
        <div className="my-8 sm:my-10">
          <figure className="space-y-2.5">
            <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-bone border border-cocoa/20 rounded-2xl overflow-hidden shadow-apple-md">
              <Image
                src={article.coverImage}
                alt={article.coverAlt || article.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 768px"
                className={article.coverImage.endsWith('.svg') ? 'object-contain p-6 sm:p-10' : 'object-cover object-center'}
              />
            </div>
            {article.coverAlt && (
              <figcaption className="text-[11px] uppercase tracking-[0.14em] text-muted-taupe px-1">
                {article.coverAlt}
              </figcaption>
            )}
          </figure>
        </div>
      )}

      {/* Article Body Content */}
      <div className="pt-2 space-y-6 text-ink-black/85 leading-[1.72] text-[15px] sm:text-[17px] font-normal text-pretty">
        {article.body.slice(0, 2).map((paragraph, idx) => (
          <p key={idx}>{paragraph}</p>
        ))}

        {/* Pull Quote */}
        {article.pullQuote && (
          <blockquote className="my-8 sm:my-10 pl-5 sm:pl-6 border-l-2 border-cocoa py-3.5 pr-4 bg-warm-white rounded-r-xl border border-l-2 border-cocoa/15">
            <p className="font-serif text-2xl sm:text-3xl text-espresso italic font-normal leading-snug">
              “{article.pullQuote}”
            </p>
          </blockquote>
        )}

        {/* Inline Article Image */}
        {article.inlineImage && (
          <figure className="my-8 space-y-2.5">
            <div className="relative aspect-[4/3] bg-bone border border-cocoa/20 rounded-2xl overflow-hidden shadow-apple-md">
              <Image
                src={article.inlineImage.src}
                alt={article.inlineImage.alt}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className={article.inlineImage.src.endsWith('.svg') ? 'object-contain p-6' : 'object-cover object-center'}
              />
            </div>
            {article.inlineImage.caption && (
              <figcaption className="text-xs text-muted-taupe italic px-1">
                {article.inlineImage.caption}
              </figcaption>
            )}
          </figure>
        )}

        {article.body.slice(2).map((paragraph, idx) => (
          <p key={idx + 2}>{paragraph}</p>
        ))}
      </div>

      {/* "Shop the Story" Product Card (Only if article relates to a product) */}
      {relatedProduct && (
        <section
          aria-labelledby="shop-the-story-heading"
          className="mt-12 sm:mt-14 pt-8 border-t border-cocoa/20"
        >
          <span
            id="shop-the-story-heading"
            className="text-xs uppercase tracking-[0.2em] text-cocoa font-medium block mb-4"
          >
            Shop The Story
          </span>
          <div className="p-5 sm:p-7 bg-warm-white border border-cocoa/25 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6 shadow-apple-sm">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-bone border border-cocoa/20 rounded-xl shrink-0 overflow-hidden mx-auto sm:mx-0">
              <Image
                src={relatedProduct.images[0]?.src || '/images/products/the-weave-black.jpg'}
                alt={relatedProduct.name}
                fill
                sizes="112px"
                className="object-cover"
              />
            </div>

            <div className="flex-1 space-y-1 text-center sm:text-left">
              <span className="text-[11px] uppercase tracking-wider text-muted-taupe">
                {relatedProduct.collection}
              </span>
              <h3 className="font-editorial text-xl sm:text-2xl font-normal text-ink-black">
                {relatedProduct.name}
              </h3>
              <p className="text-xs text-muted-taupe">
                {relatedProduct.colour} · ₦{relatedProduct.price.toLocaleString()}
              </p>
              <p className="text-xs text-ink-black/80 pt-1 line-clamp-2">
                {relatedProduct.description}
              </p>
            </div>

            <Link
              href={`/shop/${relatedProduct.slug}`}
              className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-ink-black text-warm-white text-xs uppercase tracking-[0.18em] font-semibold hover:bg-espresso transition-[background-color,transform] duration-[180ms] rounded-full focus-dark min-h-[46px] shadow-apple-sm active:scale-[0.98]"
            >
              <span>View Pair</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* Footer Navigation */}
      <footer className="mt-12 pt-8 border-t border-cocoa/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/journal"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-semibold text-cocoa hover:text-ink-black underline underline-offset-4 focus-dark"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Journal Notes</span>
        </Link>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-semibold text-espresso hover:text-ink-black underline underline-offset-4 focus-dark"
        >
          <span>Explore Drop 001</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </footer>

      {/* Schema.org BlogPosting Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: article.title,
            description: article.excerpt,
            datePublished: article.date,
            image: article.coverImage
              ? `https://noveq.com${article.coverImage}`
              : undefined,
            author: {
              '@type': 'Organization',
              name: 'NOVEQ',
              url: 'https://noveq.com',
            },
            publisher: {
              '@type': 'Organization',
              name: 'NOVEQ',
              url: 'https://noveq.com',
            },
          }),
        }}
      />
    </article>
  );
}
