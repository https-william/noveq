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

  return (
    <div className="py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Editorial Header */}
      <header className="pb-12 sm:pb-16 border-b border-cocoa/20">
        <span className="text-xs uppercase tracking-[0.2em] text-cocoa block mb-3 font-semibold">
          Notes & Stories
        </span>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink-black leading-tight">
          The Journal
        </h1>
        <p className="mt-4 text-sm sm:text-base text-muted-taupe max-w-2xl leading-relaxed">
          Reflections from the workshop bench: material temper, silhouette development, and the considered process behind Drop 001.
        </p>
      </header>

      {/* Clean Article Grid / List */}
      <div className="py-12 sm:py-16">
        {articles.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-cocoa/20 rounded-xs bg-warm-white">
            <p className="text-sm text-muted-taupe">New craft notes will be published soon.</p>
          </div>
        ) : (
          <div className="divide-y divide-cocoa/15">
            {articles.map((article, index) => (
              <ScrollReveal key={article.slug} delayMs={index * 80}>
                <article className="py-10 sm:py-14 first:pt-0 last:pb-0 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center group">
                  {/* Article Cover Image (Optional, Clean) */}
                  {article.coverImage && (
                    <div className="md:col-span-4 w-full">
                      <Link
                        href={`/journal/${article.slug}`}
                        className="block relative aspect-[4/3] bg-bone border border-cocoa/20 rounded-xs overflow-hidden focus-dark"
                      >
                        <Image
                          src={article.coverImage}
                          alt={article.coverAlt || article.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-contain p-4 group-hover:scale-102 transition-transform duration-300"
                        />
                      </Link>
                    </div>
                  )}

                  {/* Article Metadata & Details */}
                  <div className={`${article.coverImage ? 'md:col-span-8' : 'md:col-span-12'} space-y-3`}>
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-muted-taupe">
                      <time dateTime={article.date}>{article.date}</time>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted-taupe" />
                        {article.readingTime}
                      </span>
                      <span>·</span>
                      <span className="text-cocoa font-medium">{article.tags[0]}</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink-black group-hover:text-espresso transition-colors">
                      <Link href={`/journal/${article.slug}`} className="focus-dark">
                        {article.title}
                      </Link>
                    </h2>

                    <p className="text-sm text-ink-black/75 leading-relaxed font-normal">
                      {article.excerpt}
                    </p>

                    <div className="pt-2">
                      <Link
                        href={`/journal/${article.slug}`}
                        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-semibold text-espresso hover:text-ink-black underline underline-offset-4 focus-dark min-h-[44px]"
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

      {/* Simple Footer Callout back to Drop 001 */}
      <div className="pt-12 border-t border-cocoa/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.18em] text-cocoa font-medium block">
            Drop 001
          </span>
          <p className="text-sm text-ink-black/80 mt-1">
            Ten pairs crafted in Lagos. Currently available in limited sizes.
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-5 py-3 bg-ink-black text-warm-white text-xs uppercase tracking-[0.18em] font-semibold hover:bg-espresso transition-colors rounded-xs focus-dark min-h-[44px]"
        >
          <span>Shop Drop 001</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
