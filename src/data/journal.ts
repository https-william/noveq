import { JournalArticle } from '@/types/content';

/**
 * NOVEQ Journal Articles
 *
 * Genuine notes on shoemaking craft, silhouette design, and leather care.
 * Coherent real photography and plain-English descriptions throughout.
 */
export const JOURNAL_ARTICLES: JournalArticle[] = [
  {
    slug: 'drop-001-the-first-ten-pairs',
    title: 'Drop 001: The First Ten Pairs',
    subtitle:
      'Why we began with small batches, clean cuts, and the deliberate pace of hand-finished shoemaking in Lagos.',
    excerpt:
      'Why we started small instead of mass-producing, the balance behind our first silhouettes, and setting our craft standard.',
    coverImage: '/images/models/the-ring-hero-model.jpg',
    coverAlt: 'NOVEQ The Ring Slide Pam worn on stone steps in warm sunlight',
    body: [
      'When we prepared to introduce NOVEQ, standard retail wisdom pushed for releasing twenty silhouettes across hundreds of pairs. We chose the opposite path.',
      'Drop 001 started with focused small runs crafted by hand alongside our shoemaker partner in Lagos. We wanted to inspect every piece of leather ourselves, test how the cushioned footbed flexes over a full afternoon walk, and refine each curve before scaling.',
      'Central to that approach is restraint: letting clean leather edges, balanced footbeds, and quiet hardware speak without excess. Every pair is checked individually in our studio before it is boxed in a cotton dust bag.',
      'While The Ring and The Twist are currently resting between workshop batches, The Weave remains open to order to your exact size across EU 34 to EU 44.',
    ],
    pullQuote:
      'Small-batch production is not artificial scarcity — it is taking the time to get every strap curve, cushioned sole, and stitch right.',
    inlineImage: {
      src: '/images/brand/unboxing-suite-full.jpg',
      alt: 'NOVEQ presentation box, cotton dust bag, and edition card prepared in Lagos',
      caption: 'Studio preparation: breathable cotton dust bag and Drop 001 Edition Record.',
    },
    date: 'October 14, 2026',
    readingTime: '3 min read',
    type: 'editorial',
    tags: ['Drop 001', 'Craft', 'Launch'],
    relatedProductSlug: 'the-weave-slide-pam',
    seoTitle: 'Drop 001: The First Ten Pairs | NOVEQ Journal',
    seoDescription:
      'Why NOVEQ launched in small batches in Lagos and our deliberate pace of handcrafted Nigerian shoemaking.',
    publishStatus: 'published',
  },
  {
    slug: 'the-pam-considered',
    title: 'The Pam, Considered',
    subtitle:
      'How an indispensable West African staple became the foundation of quiet everyday footwear.',
    excerpt:
      'Examining the everyday leather slip-on worn across Lagos and reimagining its proportions through modern restraint.',
    coverImage: '/images/editorial/campaign-model.jpg',
    coverAlt: 'Woman in relaxed cream linen seated wearing handcrafted NOVEQ leather pams',
    body: [
      'To live in Lagos or any West African city is to know the pam. It is the pair waiting by your front door for early errands, relaxed Sunday lunches, and unhurried evenings paired with crisp linen or denim.',
      'Yet for decades, the everyday slide was treated either as disposable utility or crowded with heavy, loud accents. We saw space to honour the silhouette purely on balance and feel.',
      'We stripped the shape down to what genuinely serves the foot: a gently cushioned leather base, breathable hand-shaped straps, and smooth rounded borders that never dig against bare skin.',
      'When quiet structure meets familiar cultural ease, the pam stops being an afterthought and becomes an effortless anchor in your wardrobe.',
    ],
    pullQuote:
      'The best design does not reinvent what is already beloved; it clears away everything that was getting in the way.',
    inlineImage: {
      src: '/images/models/the-weave-hero-model.jpg',
      alt: 'Close-up of NOVEQ The Weave hand-braided black leather strap on foot',
      caption: 'Hand-braided soft leather strips flex naturally with your stride.',
    },
    date: 'October 02, 2026',
    readingTime: '4 min read',
    type: 'craft_story',
    tags: ['Design Philosophy', 'Heritage', 'Silhouette'],
    relatedProductSlug: 'the-weave-slide-pam',
    seoTitle: 'The Pam, Considered | NOVEQ Journal',
    seoDescription:
      'How NOVEQ reinterprets the everyday West African leather pam with calm geometry and lasting comfort.',
    publishStatus: 'published',
  },
  {
    slug: 'notes-on-leather',
    title: 'Notes on Leather',
    subtitle:
      'Softness, edge finishing, and four quiet habits that help real leather last for years.',
    excerpt:
      'Workshop notes from Lagos on selecting supple Nigerian leather, smoothing strap edges, and caring for your pair.',
    coverImage: '/images/editorial/artisan-workshop.jpg',
    coverAlt: 'Lagos shoemaker hand-stitching a NOVEQ leather pam strap at a wooden bench',
    body: [
      'When you slip on leather barefoot, two details decide whether a pair becomes your daily favourite or stays in the box: softness and strap balance. Too stiff, and the top edge rubs; too thin, and the shape collapses within a season.',
      'For Drop 001, we source supple Nigerian leather trimmed and lightly nourished with beeswax and natural oils before stitching so each strap yields smoothly from the very first walk.',
      'One step often rushed in everyday footwear is finishing the strap border. Our makers trim, bevel, and seal every leather edge by hand so bare feet feel a smooth, rounded cushion rather than a sharp cut.',
      'With a quick dry wipe after wear and a monthly touch of clear leather balm, real leather never flakes like coated synthetics — it quietly warms and shapes to your own step.',
    ],
    pullQuote:
      'Good leather does not wear out easily — it softens quietly to trace everywhere you have walked.',
    inlineImage: {
      src: '/images/models/the-weave-on-model.jpg',
      alt: 'NOVEQ The Weave Slide Pam showing woven leather grain and square-toe profile',
      caption: 'Supple hand-braided leather paired with a steady square-toe outsole.',
    },
    date: 'September 28, 2026',
    readingTime: '3 min read',
    type: 'product_note',
    tags: ['Materials', 'Leather Care', 'Craft'],
    relatedProductSlug: 'the-weave-slide-pam',
    seoTitle: 'Notes on Leather: Softness, Edging & Care | NOVEQ Journal',
    seoDescription:
      'Workshop notes on soft Nigerian leather, smooth rounded strap edges, and simple everyday leather care.',
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
