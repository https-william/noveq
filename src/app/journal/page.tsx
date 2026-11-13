import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { getAllPublishedArticles } from '@/data/journal';
import { ScrollReveal } from '@/components/Editorial/ScrollReveal';

export const metadata: Metadata = {
  title: 'Journal - Craft Notes & Silhouette Geometry | NOVEQ',
  description:
    'Notes on leather craft, workshop observations, and footwear design from the NOVEQ workshop in Lagos, Nigeria.',
  alternates: {
    canonical: '/journal',
  },
  openGraph: {
    title: 'Journal | NOVEQ Contemporary Leather Footwear',
    description:
      'Notes on leather craft, workshop observations, and footwear design from the NOVEQ workshop in Lagos, Nigeria.',
    url: '/journal',
    siteName: 'NOVEQ',
    type: 'website',
    images: [
      {
        url: '/images/editorial/artisan-workshop.jpg',
        width: 1200,
        height: 900,
        alt: 'NOVEQ craft notes and leather silhouette design',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Journal | NOVEQ Contemporary Leather Footwear',
    description:
      'Notes on leather craft, workshop observations, and footwear design from the NOVEQ workshop in Lagos, Nigeria.',
    images: ['/images/editorial/artisan-workshop.jpg'],
  },
};

export default function JournalPage() {
  const articles = getAllPublishedArticles();
  const leadArticle = articles[0];
  const archiveArticles = articles.slice(1);

  return (
    <div className="py-10 sm:py-16 lg:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Editorial Header */}
      <header className="pb-10 sm:pb-14 border-b border-cocoa/20 max-w-3xl space-y-3">
        <span className="text-xs uppercase tracking-[0.22em] text-cocoa block font-semibold">
          Notes &amp; Stories
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal tracking-[-0.02em] text-ink-black leading-[1.08]">
          The Journal
        </h1>
        <p className="text-[15px] sm:text-base text-muted-taupe leading-[1.7] text-pretty">
          Reflections from our workshop in Lagos: material balance, everyday comfort, and the quiet ideas shaping Drop 001.
        </p>
      </header>

      {/* Featured Lead Article */}
      {articles.length === 0 ? (
        <div className="my-12 py-16 text-center border border-dashed border-cocoa/20 rounded-2xl bg-warm-white">
          <p className="text-sm text-muted-taupe">New craft notes will be published soon.</p>
        </div>
      ) : (
        <div className="py-10 sm:py-14 space-y-12 sm:space-y-16">
          {leadArticle && (
            <ScrollReveal>
              <article className="bg-warm-white border border-cocoa/20 rounded-2xl overflow-hidden shadow-apple-sm group grid grid-cols-1 lg:grid-cols-12 items-stretch">
                {leadArticle.coverImage && (
                  <Link
                    href={`/journal/${leadArticle.slug}`}
                    className="lg:col-span-6 relative aspect-[4/3] lg:aspect-auto lg:min-h-[380px] bg-bone overflow-hidden block focus-dark"
                  >
                    <Image
                      src={leadArticle.coverImage}
                      alt={leadArticle.coverAlt || leadArticle.title}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover object-center hover-image-zoom"
                    />
                  </Link>
                )}

                <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2.5 text-[11px] uppercase tracking-[0.16em] text-muted-taupe">
                      <span className="px-2.5 py-0.5 bg-bone border border-cocoa/20 rounded-full text-cocoa font-semibold">
                        {leadArticle.tags[0]}
                      </span>
                      <time dateTime={leadArticle.date}>{leadArticle.date}</time>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        {leadArticle.readingTime}
                      </span>
                    </div>

                    <h2 className="font-editorial text-2xl sm:text-3xl lg:text-[2.15rem] font-normal tracking-[-0.015em] text-ink-black leading-[1.15] group-hover:text-espresso transition-colors">
                      <Link href={`/journal/${leadArticle.slug}`} className="focus-dark">
                        {leadArticle.title}
                      </Link>
                    </h2>

                    <p className="text-[15px] text-ink-black/80 leading-relaxed text-pretty">
                      {leadArticle.subtitle || leadArticle.excerpt}
                    </p>
                  </div>

                  <div>
                    <Link
                      href={`/journal/${leadArticle.slug}`}
                      className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-semibold text-espresso hover:text-ink-black underline underline-offset-8 decoration-cocoa/40 hover:decoration-ink-black transition-colors py-2 focus-dark"
                    >
                      <span>Read Lead Note</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </article>
            </ScrollReveal>
          )}

          {/* Secondary Notes Archive Grid */}
          {archiveArticles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {archiveArticles.map((article, index) => (
                <ScrollReveal key={article.slug} delayMs={index * 70}>
                  <article className="h-full bg-warm-white border border-cocoa/20 rounded-2xl overflow-hidden shadow-xs hover:shadow-apple-sm transition-shadow flex flex-col group">
                    {article.coverImage && (
                      <Link
                        href={`/journal/${article.slug}`}
                        className="relative aspect-[4/3] w-full bg-bone border-b border-cocoa/15 overflow-hidden block focus-dark"
                      >
                        <Image
                          src={article.coverImage}
                          alt={article.coverAlt || article.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover object-center hover-image-zoom"
                        />
                      </Link>
                    )}

                    <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-muted-taupe">
                          <span className="text-cocoa font-semibold">{article.tags[0]}</span>
                          <span>·</span>
                          <time dateTime={article.date}>{article.date}</time>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            {article.readingTime}
                          </span>
                        </div>

                        <h2 className="font-editorial text-2xl font-normal tracking-[-0.01em] text-ink-black leading-snug group-hover:text-espresso transition-colors">
                          <Link href={`/journal/${article.slug}`} className="focus-dark">
                            {article.title}
                          </Link>
                        </h2>

                        <p className="text-sm text-ink-black/75 leading-relaxed text-pretty">
                          {article.excerpt}
                        </p>
                      </div>

                      <div className="pt-1">
                        <Link
                          href={`/journal/${article.slug}`}
                          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-semibold text-espresso hover:text-ink-black underline underline-offset-4 py-2 focus-dark"
                        >
                          <span>Read Note</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer Callout back to Drop 001 & Care Guide */}
      <div className="pt-10 sm:pt-12 border-t border-cocoa/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-[0.18em] text-cocoa font-semibold block">
            Drop 001 · Lagos Studio
          </span>
          <p className="text-sm text-ink-black/80 max-w-md leading-relaxed">
            The Weave Slide Pam is open to order across EU 34–44, made by hand and delivered nationwide in 7 business days.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link
            href="/care"
            className="inline-flex items-center justify-center px-5 py-3 border border-cocoa/35 text-espresso text-xs uppercase tracking-[0.16em] font-semibold hover:border-ink-black hover:text-ink-black transition-colors rounded-full focus-dark min-h-[46px]"
          >
            Leather Care Guide
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-ink-black text-warm-white text-xs uppercase tracking-[0.18em] font-semibold hover:bg-espresso transition-[background-color,transform] duration-[180ms] rounded-full focus-dark min-h-[46px] shadow-apple-sm active:scale-[0.98]"
          >
            <span>Shop Drop 001</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
