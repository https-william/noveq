import { StoryBlock } from '@/types/content';

/**
 * NOVEQ Brand Story Narrative
 * Flow: Origin -> Design Philosophy -> Craft Context -> Drop 001
 * Grounded photography & plain language without AI diagrams or filler jargon.
 */
export const STORY_BLOCKS: StoryBlock[] = [
  {
    id: 'origin-problem',
    eyebrow: 'Origin',
    heading: 'Why start with the pam?',
    body: [
      'In Nigeria and across West Africa, the leather pam is part of daily life — an effortless slip-on worn from morning errands to relaxed evenings. Yet too often the choice felt split: throwaway plastic slides that wear out in months, or overly ornate sandals weighed down by heavy metal.',
      'We set out to make an everyday leather pam with quiet confidence. Footwear shaped around clean lines, soft natural leather, and steady walking comfort.',
    ],
    accentQuote: 'Footwear already central to everyday life, reimagined with quiet restraint.',
    image: '/images/editorial/campaign-model.jpg',
    altText: 'Woman seated in natural linen wearing handcrafted NOVEQ leather pams in warm light',
    caption: 'Quiet confidence for effortless, all-day movement',
    imagePosition: 'right',
  },
  {
    id: 'design-philosophy',
    eyebrow: 'Design Philosophy',
    heading: 'Same purpose. A new perspective.',
    body: [
      'Everything begins with how the shoe sits against bare skin. We left out stiff buckles, loud logos, and shiny plastic linings. Instead, we focus on softly shaped straps, gently cushioned soles wrapped in real leather, and silhouettes that pair seamlessly with linen, denim, or native wear.',
      'Every millimeter is measured against one simple question: how does it feel on your foot after four hours of walking?',
    ],
    accentQuote: 'Pared back to line, balance, and soft natural grain.',
    image: '/images/models/the-weave-hero-model.jpg',
    altText: 'Close-up of NOVEQ The Weave hand-braided black leather pam worn barefoot in sunlight',
    caption: 'Hand-braided soft leather straps on a cushioned square-toe footbed',
    imagePosition: 'left',
  },
  {
    id: 'craft-context',
    eyebrow: 'Craft Context',
    heading: 'Handcrafted in Nigeria. Small batches by design.',
    body: [
      'Every NOVEQ pair is shaped side-by-side with experienced shoemakers in Lagos. We skip factory conveyor belts and hurried glue-line assemblies so every hide, strap edge, and sole stitch receives hands-on care.',
      'Crafting in focused small runs gives our workshop partners the time to trim sharp leather edges smooth and inspect every pair one by one before it leaves the studio.',
    ],
    image: '/images/editorial/artisan-workshop.jpg',
    altText: 'Experienced Nigerian shoemaker hand-stitching a NOVEQ leather strap at the Lagos workbench',
    caption: 'At the bench in Lagos: hand-cut straps, careful stitching, and natural beeswax edge smoothing',
    imagePosition: 'right',
  },
  {
    id: 'call-to-shop',
    eyebrow: 'Drop 001',
    heading: 'Crafted to move.',
    body: [
      'Drop 001 introduces NOVEQ through three signature shapes — with The Weave Slide Pam currently open for made-to-order crafting across EU 34 to EU 44, while The Ring and The Twist restock soon.',
      'Each pair arrives tucked inside a breathable cotton dust bag with its Drop 001 Edition Record, dispatched tracked across Nigeria.',
    ],
    image: '/images/brand/unboxing-suite-full.jpg',
    altText: 'NOVEQ matte espresso presentation box, woven cotton dust bag, and thank-you edition card',
    caption: 'Prepared for years of wear: breathable cotton dust bag and studio presentation box',
    imagePosition: 'left',
    ctaText: 'Shop The Weave',
    ctaHref: '/shop/the-weave-slide-pam',
    ctaVariant: 'button',
  },
];
