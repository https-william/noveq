import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { SITE_SETTINGS } from '@/config/siteSettings';

export const metadata: Metadata = {
  title: 'Leather Care Guide · Keeping Your Pair for Years',
  description:
    'Simple, gentle care routines for NOVEQ natural leather pams: monthly conditioning, breathable dust-bag storage, and recovering after Lagos rain.',
  alternates: {
    canonical: '/care',
  },
  openGraph: {
    title: 'Leather Care Guide | NOVEQ',
    description:
      'Simple, gentle care routines for NOVEQ natural leather pams: monthly conditioning, breathable dust-bag storage, and recovering after Lagos rain.',
    url: '/care',
    siteName: 'NOVEQ',
    type: 'website',
  },
};

const CARE_CHAPTERS = [
  {
    number: '01',
    title: 'Everyday Dust & Wipe-Down',
    cadence: 'After Wear',
    summary:
      'City dust settles along the edges of natural leather faster than you notice. Thirty seconds with a soft, dry cotton cloth after you take them off keeps the surface fresh and prevents grit from marking the finish.',
    steps: [
      'Gently sweep the top strap and sole rim with a dry cotton cloth.',
      'For minor marks, lightly dampen a corner with clean water and blot softly.',
      'Avoid household soaps, baby wipes, or alcohol, which dry out natural leather oils.',
    ],
  },
  {
    number: '02',
    title: 'Monthly Conditioning Ritual',
    cadence: 'Every 4 to 6 Weeks',
    summary:
      'Just like skin in dry harmattan air or coastal humidity, real leather stays supple when nourished lightly. A thin touch of clear leather balm keeps the straps soft where your foot bends.',
    steps: [
      'Use a pea-sized drop of plain, clear leather cream or beeswax balm on a soft cloth.',
      'Rub gently in small circles across the straps, avoiding any heavy build-up around stitching.',
      'Let the leather drink it in for 15 minutes, then buff lightly for a quiet satin sheen.',
    ],
  },
  {
    number: '03',
    title: 'Storing Inside Your Cotton Dust Bag',
    cadence: 'Between Wears',
    summary:
      'Every NOVEQ pair arrives with a breathable cotton dust bag built for humid closets. Never trap real leather inside sealed plastic bags, and keep your pairs resting flat away from strong window sun.',
    steps: [
      'Slip both pams inside their cotton dust bag once completely cool and dry.',
      'Lay pairs side by side on their soles rather than stacking boxes or bags on top of the straps.',
      'Keep away from sunlit windowsills, which can lighten rich cognac and burgundy dyes over time.',
    ],
  },
  {
    number: '04',
    title: 'Navigating Wet Lagos Streets',
    cadence: 'Rainy Days',
    summary:
      'Real leather resists light mist well, but puddles and heavy downpours call for slow, patient drying. Never rush wet leather under hot sun or with a hairdryer, as high heat stiffens the strap.',
    steps: [
      'If caught in rain, pat away standing water promptly with a clean dry towel as soon as you get indoors.',
      'Tuck a small ball of plain tissue or unprinted paper gently beneath the front strap so it holds its rounded curve.',
      'Set your pair in an airy, shaded spot indoors and allow 24 hours to dry slowly before conditioning lightly.',
    ],
  },
];

export default function CareGuidePage() {
  const conciergeText = encodeURIComponent(
    'Hello NOVEQ team, I would like quick advice on caring for my leather pams.'
  );
  const conciergeUrl = `https://wa.me/${SITE_SETTINGS.supportContact.phone}?text=${conciergeText}`;

  return (
    <div className="bg-bone text-ink-black">
      {/* Serene Editorial Header */}
      <section className="py-10 sm:py-16 lg:py-24 border-b border-cocoa/15">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-4 sm:space-y-5">
          <span className="text-xs uppercase tracking-[0.22em] text-cocoa font-medium block">
            Drop 001 · Ownership &amp; Longevity
          </span>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal tracking-[-0.02em] text-ink-black leading-[1.08] text-balance">
            Caring for Your Leather
          </h1>
          <p className="font-editorial italic text-xl sm:text-2xl text-espresso/85 leading-relaxed max-w-xl mx-auto text-pretty">
            Fine leather does not wear out easily. With four quiet habits, every pair softens to your stride and stays beautiful for years.
          </p>
        </div>
      </section>

      {/* Editorial Ritual Chapters */}
      <section className="py-14 sm:py-20 border-b border-cocoa/15">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 divide-y divide-cocoa/15">
          {CARE_CHAPTERS.map((chapter) => (
            <article
              key={chapter.number}
              className="py-12 first:pt-2 last:pb-2 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start"
            >
              <div className="md:col-span-4 space-y-1.5">
                <span className="text-xs uppercase tracking-[0.2em] text-cocoa font-medium block">
                  {chapter.number} · {chapter.cadence}
                </span>
                <h2 className="font-editorial text-2xl sm:text-[1.65rem] font-normal text-ink-black leading-snug text-balance">
                  {chapter.title}
                </h2>
              </div>

              <div className="md:col-span-8 space-y-5">
                <p className="text-[15px] sm:text-base text-ink-black/85 leading-[1.7] text-pretty">
                  {chapter.summary}
                </p>

                <ul className="bg-warm-white border border-cocoa/15 rounded-xl p-5 sm:p-6 divide-y divide-cocoa/10 text-sm text-espresso/90">
                  {chapter.steps.map((step, idx) => (
                    <li key={idx} className="py-3 first:pt-0.5 last:pb-0.5 leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Hardware & Sole Touch */}
      <section className="py-14 sm:py-20 bg-warm-white border-b border-cocoa/15">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-[0.2em] text-cocoa font-medium block">
              Brass Hardware
            </span>
            <h3 className="font-editorial text-2xl font-normal text-ink-black">
              On The Ring Silhouette
            </h3>
            <p className="text-sm sm:text-[15px] text-muted-taupe leading-relaxed">
              Our hardware is solid brass rather than painted metal, so the colour will never peel away. Wipe the ring gently with a dry glasses-style cloth after wear if coastal air leaves faint finger marks.
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-xs uppercase tracking-[0.2em] text-cocoa font-medium block">
              Need Re-Edging Later?
            </span>
            <h3 className="font-editorial text-2xl font-normal text-ink-black">
              Our Lagos Studio Refresh
            </h3>
            <p className="text-sm sm:text-[15px] text-muted-taupe leading-relaxed">
              After heavy seasonal wear, soles and edges can always be refreshed. Message our team in Lagos whenever your pair needs fresh edge sealing or a deep conditioning polish.
            </p>
          </div>
        </div>
      </section>

      {/* Calm Studio CTA */}
      <section className="py-16 sm:py-20 text-center">
        <div className="max-w-xl mx-auto px-5 sm:px-8 space-y-5">
          <span className="text-xs uppercase tracking-[0.2em] text-cocoa font-medium block">
            Lagos Atelier Care
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-normal text-ink-black leading-tight">
            Ask Us About Your Pair
          </h2>
          <p className="text-sm sm:text-base text-muted-taupe leading-relaxed">
            Unsure how to treat a rain spot or which leather balm works best? Send a quick photo to our studio on WhatsApp.
          </p>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={conciergeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-espresso text-warm-white text-xs uppercase tracking-[0.18em] font-semibold hover:bg-ink-black transition-all duration-200 rounded-full focus-dark min-h-[48px] shadow-apple-sm active:scale-[0.97]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Consult Lagos Studio</span>
            </a>

            <Link
              href="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-warm-white border border-cocoa/35 text-ink-black text-xs uppercase tracking-[0.18em] font-semibold hover:border-ink-black transition-all duration-200 rounded-full focus-dark min-h-[48px] active:scale-[0.97]"
            >
              <span>Explore Drop 001</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
