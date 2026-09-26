import { StoryBlock } from '@/types/content';

/**
 * NOVEQ Brand Story Narrative
 * Flow: Origin / Problem → Design Philosophy → Craft Context → Call to Shop
 * Concise, grounded, free from artificial heritage or luxury tropes.
 */
export const STORY_BLOCKS: StoryBlock[] = [
  {
    id: 'origin-problem',
    eyebrow: '01 / The Origin',
    heading: 'Why start with the pam?',
    body: [
      'In Nigeria and across West Africa, the leather pam is ubiquitous — an effortless slip-on worn from dawn errands to relaxed evenings. Yet the market presented a compromise: either mass-market synthetic slides that fall apart in months, or ornate pieces weighed down by excessive hardware.',
      'We wanted to make a contemporary pam that required no compromise. Footwear pared back to line, leather temper, and walking balance.',
    ],
    accentQuote: 'Footwear that is already culturally indispensable, reimagined with deliberate restraint.',
    image: '/images/products/the-twist.jpg',
    altText: 'Full-grain leather texture and hand-beveled edge finish on NOVEQ The Twist',
    caption: 'Beveled leather edging and sculptural twist geometry',
    imagePosition: 'right',
  },
  {
    id: 'design-philosophy',
    eyebrow: '02 / Design Philosophy',
    heading: 'Same purpose. A new perspective.',
    body: [
      'Our approach centers on quiet confidence. We removed decorative buckles, printed logos, and synthetic linings. What remains is intentional form: an asymmetrical strap cut that relieves instep pressure, cushioned footbeds wrapped in supple calfskin, and a silhouette that pairs as naturally with tailored trousers as it does with denim.',
      'Every millimeter is measured against one standard: how does it feel on the foot after four hours of movement?',
    ],
    accentQuote: 'Stripped of unnecessary ornamentation, focused entirely on silhouette, line, and grain.',
    image: '/images/products/the-double-skin.jpg',
    altText: 'Layered leather upper and architectural silhouette of The Double Skin',
    caption: 'Clean geometric lines of Drop 001 silhouettes',
    imagePosition: 'left',
  },
  {
    id: 'craft-context',
    eyebrow: '03 / Craft Context',
    heading: 'Made in Lagos. Ten pairs at a time.',
    body: [
      'NOVEQ is made in partnership with an independent master shoemaker in Lagos. We do not mass-produce in anonymous facilities, nor do we invent multi-generational folklore.',
      'Drop 001 is limited to ten pairs — not as a marketing stunt, but because true small-batch production allows our artisan partner to hand-cut each leather hide, bevel every strap border, and inspect each sole before it leaves the bench.',
    ],
    image: '/images/editorial/artisan-workshop.jpg',
    altText: 'Master shoemaker hand-stitching leather footwear at workshop bench in Lagos',
    caption: 'Artisan workshop hand-stitching in Lagos, Nigeria',
    imagePosition: 'right',
  },
  {
    id: 'call-to-shop',
    eyebrow: '04 / Drop 001',
    heading: 'Crafted to move.',
    body: [
      'Drop 001 represents our foundational offering: six distinct silhouettes including The Twist, The Bar, and The Double Skin in classic tones.',
      'Each pair is numbered, packaged in our custom luxury chocolate kraft box with a handwritten care card, and shipped directly to your door.',
    ],
    image: '/images/brand/packaging.jpg',
    altText: 'NOVEQ unboxing suite showing rigid chocolate box and presentation materials',
    caption: 'NOVEQ luxury unboxing presentation with debossed wordmark and thank-you card',
    imagePosition: 'left',
    ctaText: 'Explore Drop 001',
    ctaHref: '/shop',
    ctaVariant: 'button',
  },
];
