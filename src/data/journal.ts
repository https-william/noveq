import { JournalArticle } from '@/types/content';

/**
 * NOVEQ Atelier Journal Articles
 * 
 * Genuine notes on shoemaking craft, silhouette design, and leather care.
 * Strictly free from filler, fake quotes, or synthetic marketing hype.
 */
export const JOURNAL_ARTICLES: JournalArticle[] = [
  {
    slug: 'drop-001-the-first-ten-pairs',
    title: 'Drop 001: The First Ten Pairs',
    subtitle: 'Why we began with ten pairs, the asymmetric cut, and the deliberate pace of small-batch shoemaking.',
    excerpt: 'Why we started with ten pairs, the geometry behind the cut, and building a foundation before scaling.',
    coverImage: '/images/models/the-ring-hero-model.jpg',
    coverAlt: 'NOVEQ The Ring Slide Pam on model feet on stone pavement',
    body: [
      'When we prepared the launch for NOVEQ, conventional retail logic urged releasing twenty styles across hundreds of units. We decided against it.',
      'Drop 001 began with a singular focus: footwear made by hand in intimate collaboration with our artisan partner in Nigeria. We wanted to touch every hide, test the flexion on real feet across sunlit pavements, and ensure each design felt personal and intentional.',
      'Central to Drop 001 is The Ring Slide Pam. Anchored by a polished gold statement ring, the strap is sculpted to allow the instep to flex naturally during stride without cutting into the foot.',
      'Every pair in this release is inspected pair-by-pair in our studio before dispatch. For us, this is not just a product launch; it is setting our standard for everything that follows.',
    ],
    pullQuote: 'Small-batch production is not artificial scarcity — it is an obsession with getting every edge, sole angle, and temper right.',
    inlineImage: {
      src: '/images/editorial/craft-spec-grid.jpg',
      alt: 'Artisan hand-crafting Drop 001 leather pams at the bench in Nigeria',
      caption: 'Workbench precision: vegetable-tanned hides selected and finished by hand.',
    },
    date: 'October 14, 2026',
    readingTime: '3 min read',
    type: 'editorial',
    tags: ['Drop 001', 'Atelier', 'Launch'],
    relatedProductSlug: 'the-ring-slide-pam',
    seoTitle: 'Drop 001: The First Ten Pairs | NOVEQ Journal',
    seoDescription:
      'Why NOVEQ launched with ten pairs, the craft behind The Ring, and our small-batch artisan philosophy.',
    publishStatus: 'published',
  },
  {
    slug: 'the-pam-considered',
    title: 'The Pam, Considered',
    subtitle: 'How an indispensable West African staple became the foundation of modern everyday footwear.',
    excerpt: 'Examining the cultural familiarity of the leather slip-on pam and reimagining it through minimal form.',
    coverImage: '/images/models/the-weave-hero-model.jpg',
    coverAlt: 'NOVEQ The Weave Pam on model along sunlit stone pavement',
    body: [
      'To live in Lagos or any West African city is to know the pam. It is the pair by the front door you slide into for a quick errand, the pair you wear to meet friends on Sunday afternoon, the natural accompaniment to both crisp linen trousers and easy weekend wear.',
      'Yet for decades, this silhouette was treated either as disposable utility or smothered in gilded embellishment to justify luxury price tags. We saw an opportunity to celebrate the pam on its own structural merits.',
      'We began by paring the form back to its essential elements: a sculpted leather footbed, an unlined strap that breathes against bare skin, and subtle, hand-burnished edge finishing. No loud logos. No synthetic compromises.',
      'By respecting the silhouette’s cultural familiarity while applying contemporary architectural discipline, the pam becomes what it always had the potential to be: a quiet, refined everyday staple.',
    ],
    pullQuote: 'The best design does not reinvent what is already beloved; it strips away everything that was getting in the way.',
    inlineImage: {
      src: '/images/products/the-loop.jpg',
      alt: 'Minimalist pam overhead silhouette with clean vamp line',
      caption: 'Architectural purity: wide band and wrapped toe loop on dark stone.',
    },
    date: 'October 02, 2026',
    readingTime: '4 min read',
    type: 'craft_story',
    tags: ['Design Philosophy', 'Heritage', 'Silhouette'],
    relatedProductSlug: 'the-loop-pam',
    seoTitle: 'The Pam, Considered | NOVEQ Journal',
    seoDescription:
      'How NOVEQ reinterprets the culturally indispensable leather pam with modern restraint and craftsmanship.',
    publishStatus: 'published',
  },
  {
    slug: 'notes-on-leather',
    title: 'Notes on Leather',
    subtitle: 'Grain density, dual wax conditioning, and why temper defines how footwear feels on bare skin.',
    excerpt: 'An artisan log on leather temper, edge beveling, and how full-grain calfskin molds to your stride.',
    coverImage: '/images/editorial/artisan-workshop.jpg',
    coverAlt: 'Artisan workbench in Lagos with leather soles and brass calipers',
    body: [
      'In shoemaking, “temper” refers to the balance of pliability and firmness in a hide. A strap that is too stiff bites the top of your foot; one that is too soft stretches out of shape within weeks.',
      'For Drop 001, we selected full-grain calfskin hides with uniform tensile strength. Before cutting, each hide is conditioned with natural beeswax and oils, allowing the fibers to relax while preserving their structural memory.',
      'One critical step often skipped in modern commercial footwear is edge beveling. We shave the bottom corners of every strap at a gentle 45-degree angle before hand-burnishing the raw edge. When you slip your foot in barefoot, there are no sharp leather edges — only a smooth, supple boundary.',
      'With proper care — a simple wipe-down after wear and periodic light conditioning — this leather does not degrade. It deepens in character, forming a gentle patina unique to the way you walk.',
    ],
    pullQuote: 'Leather is not a static material; it is a responsive medium that records the story of how you move.',
    inlineImage: {
      src: '/images/products/the-bar.jpg',
      alt: 'Hand-finished edge profile of Drop 001 oxblood pam with solid brass bar',
      caption: 'Natural edge burnishing and sole contour on the workbench.',
    },
    date: 'September 28, 2026',
    readingTime: '3 min read',
    type: 'product_note',
    tags: ['Materials', 'Leather Care', 'Craft'],
    relatedProductSlug: 'the-artisan-pam-oxblood',
    seoTitle: 'Notes on Leather: Temper, Edging & Care | NOVEQ Journal',
    seoDescription:
      'Workshop notes on calfskin temper, hand-beveled strap edges, and longevity care for Drop 001.',
    publishStatus: 'published',
  },
];

export function getJournalArticleBySlug(slug: string): JournalArticle | undefined {
  return JOURNAL_ARTICLES.find(
    (article) => article.slug === slug && article.publishStatus === 'published'
  );
}

export function getAllPublishedArticles(): JournalArticle[] {
  return JOURNAL_ARTICLES.filter((article) => article.publishStatus === 'published');
}
