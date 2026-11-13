import { Product, Collection } from '@/types/commerce';
import { WORLDWIDE_WOMEN_SIZES } from '@/config/sizing';

function buildWorldwideSizeList(available: boolean) {
  return WORLDWIDE_WOMEN_SIZES.map((spec) => ({
    size: spec.eu,
    available,
    stockCount: available ? 1 : 0,
  }));
}

/**
 * NOVEQ Product Catalog
 *
 * Exclusively featuring The Weave Slide Pam (open for orders),
 * alongside The Ring Slide Pam and The Twist Slide Pam (restocking soon) for Drop 001.
 */
export const DROP_001_PRODUCTS: Product[] = [
  {
    name: 'The Weave Slide Pam',
    slug: 'the-weave-slide-pam',
    collection: 'Drop 001',
    price: 20000,
    compare_at_price: 25000,
    currency: 'NGN',
    colour: 'Black',
    colourHex: '#141414',
    colours: [
      {
        name: 'Black',
        hex: '#141414',
        imageSrc: '/images/products/the-weave-black.jpg',
      },
      {
        name: 'Burgundy',
        hex: '#5B1E28',
        imageSrc: '/images/products/the-weave-burgundy.jpg',
      },
      {
        name: 'Off White',
        hex: '#EFE9DF',
        imageSrc: '/images/products/the-weave-off-white.jpg',
      },
      {
        name: 'Army Green',
        hex: '#4B5320',
        imageSrc: '/images/products/the-weave-army-green.jpg',
      },
      {
        name: 'Dark Brown',
        hex: '#3B2219',
        imageSrc: '/images/products/the-weave-dark-brown.jpg',
      },
    ],
    stock: 5,
    material:
      'Hand-braided straps in soft Nigerian leather, cushioned square-toe footbed, and flexible non-slip low sole.',
    care:
      'Wipe clean with a soft dry cloth after wear. Store flat inside your cotton dust bag away from direct sunlight.',
    dimensions_weight: 'Weight: ~380g per pair. Sole thickness: 12mm heel, 8mm forefoot.',
    description:
      'Braided leather straps for a textured finish. Stylish, refined, and timeless. Simple details, bigger impact. Effortlessly transforms everyday basics into an intentional, polished look.',
    design_note:
      'Hand-braided straps move gently as you walk, spreading pressure evenly across your foot while adding warm texture to everyday outfits.',
    charm_option: {
      supported: false,
    },
    publish_status: 'published',
    fit_notes:
      'Made to order across worldwide women’s sizes (EU 34 – EU 44). Woven leather provides gentle give to mirror foot contours.',
    shipping_notes:
      'Crafted to order in 5 business days, followed by 2 business days for delivery. You will receive your order within 7 business days nationwide.',
    sizes: buildWorldwideSizeList(true),
    images: [
      {
        src: '/images/products/the-weave-black.jpg',
        alt: 'NOVEQ The Weave Slide Pam in Deep Noir woven leather',
        viewType: 'hero',
      },
      {
        src: '/images/products/the-weave-burgundy.jpg',
        alt: 'NOVEQ The Weave Slide Pam in Burgundy woven leather',
        viewType: 'detail',
      },
      {
        src: '/images/products/the-weave-dark-brown.jpg',
        alt: 'NOVEQ The Weave Slide Pam in Dark Brown woven leather',
        viewType: 'detail',
      },
      {
        src: '/images/products/the-weave-army-green.jpg',
        alt: 'NOVEQ The Weave Slide Pam in Army Green woven leather',
        viewType: 'detail',
      },
      {
        src: '/images/products/the-weave-off-white.jpg',
        alt: 'NOVEQ The Weave Slide Pam in Off White woven leather',
        viewType: 'detail',
      },
      {
        src: '/images/campaign/the-weave-campaign-poster.png',
        alt: 'NOVEQ The Weave Campaign Poster - Now in more colours',
        viewType: 'detail',
      },
    ],
  },
  {
    name: 'The Ring Slide Pam',
    slug: 'the-ring-slide-pam',
    collection: 'Drop 001',
    price: 20000,
    compare_at_price: 27000,
    currency: 'NGN',
    colour: 'Warm Cognac',
    colourHex: '#7C3F1D',
    colours: [
      {
        name: 'Warm Cognac',
        hex: '#7C3F1D',
        imageSrc: '/images/products/the-ring-warm-cognac.jpg',
      },
      {
        name: 'Burgundy',
        hex: '#5B1E28',
        imageSrc: '/images/products/the-ring-burgundy.jpg',
      },
      {
        name: 'Black',
        hex: '#141414',
        imageSrc: '/images/products/the-ring-black.jpg',
      },
      {
        name: 'Off White',
        hex: '#EFE9DF',
        imageSrc: '/images/products/the-ring-off-white.jpg',
      },
    ],
    stock: 0,
    restocking: true,
    material:
      'Soft, hand-selected Nigerian leather paired with a smooth solid brass statement ring. Cushioned sole with gently rounded edges and a steady, low heel.',
    care:
      'Wipe with a soft dry cloth after wear. Rub in a little clear leather cream monthly to keep the straps soft. Polish the brass ring lightly with a dry cloth.',
    dimensions_weight: 'Weight: ~375g per pair. Low heel elevation: 12mm heel, 8mm forefoot.',
    description:
      'A clean cut design with a statement ring. Modern, chic, and refined. You know those outfits where the clothes are simple but the footwear completely changes the look? That’s what we designed this for.',
    design_note:
      'The smooth gold-toned ring rests gently across the front strap without pressing the top of your foot, lifting simple linen or denim effortlessly.',
    charm_option: {
      supported: false,
    },
    publish_status: 'published',
    fit_notes:
      'Made to order across worldwide women’s sizes (EU 34 – EU 44). The natural leather softens gently to match your foot width after 2–3 wears.',
    shipping_notes:
      'Currently restocking in our Lagos workshop. Sign up on this page to be notified first when pairs return.',
    sizes: buildWorldwideSizeList(false),
    images: [
      {
        src: '/images/products/the-ring-warm-cognac.jpg',
        alt: 'NOVEQ The Ring Slide Pam in Warm Cognac soft natural leather',
        viewType: 'hero',
      },
      {
        src: '/images/products/the-ring-burgundy.jpg',
        alt: 'NOVEQ The Ring Slide Pam in Burgundy soft natural leather',
        viewType: 'detail',
      },
      {
        src: '/images/products/the-ring-black.jpg',
        alt: 'NOVEQ The Ring Slide Pam in Noir Black soft natural leather',
        viewType: 'detail',
      },
      {
        src: '/images/products/the-ring-off-white.jpg',
        alt: 'NOVEQ The Ring Slide Pam in Off White cream leather',
        viewType: 'detail',
      },
      {
        src: '/images/campaign/the-ring-campaign-poster.png',
        alt: 'NOVEQ The Ring Campaign Poster - Modern. Chic. Refined.',
        viewType: 'detail',
      },
    ],
  },
  {
    name: 'The Twist Slide Pam',
    slug: 'the-twist-slide-pam',
    collection: 'Drop 001',
    price: 25000,
    compare_at_price: 27000,
    currency: 'NGN',
    colour: 'Leather Brown',
    colourHex: '#6A381F',
    colours: [
      {
        name: 'Leather Brown',
        hex: '#6A381F',
        imageSrc: '/images/products/the-twist.jpg',
      },
      {
        name: 'Burgundy',
        hex: '#5B1E28',
        imageSrc: '/images/products/the-twist-burgundy.jpg',
      },
      {
        name: 'Black',
        hex: '#141414',
        imageSrc: '/images/products/the-twist-black.jpg',
      },
    ],
    stock: 0,
    restocking: true,
    material:
      'Soft Nigerian leather with a gathered twist top strap, cushioned footbed with smooth finished edges, and a steady non-slip sole.',
    care:
      'Wipe clean with a soft dry cloth after wear. Condition lightly once a month and store flat inside your cotton dust bag.',
    dimensions_weight: 'Weight: ~370g per pair. Low heel elevation: 12mm heel, 8mm forefoot.',
    description:
      'A modern take on the classic pam, the Twist blends effortless comfort with a sculptural detail that sets it apart. Minimal, refined, and made to move with you.',
    design_note:
      'The gathered leather twist bends comfortably with every step, lifting simple linen or denim with a clean, sculptural line.',
    charm_option: {
      supported: false,
    },
    publish_status: 'published',
    fit_notes:
      'Made to order across worldwide women’s sizes (EU 34 – EU 44). The natural leather softens gently to match your foot width after 2–3 wears.',
    shipping_notes:
      'Currently restocking in our Lagos workshop. Sign up on this page to be notified first when pairs return.',
    sizes: buildWorldwideSizeList(false),
    images: [
      {
        src: '/images/products/the-twist.jpg',
        alt: 'NOVEQ The Twist Slide Pam in rich brown natural leather',
        viewType: 'hero',
      },
      {
        src: '/images/products/the-twist-detail.jpg',
        alt: 'NOVEQ The Twist Slide Pam gathered leather strap detail and stamped sole',
        viewType: 'detail',
      },
      {
        src: '/images/products/the-twist-burgundy.jpg',
        alt: 'NOVEQ The Twist Slide Pam in Burgundy sculptural leather',
        viewType: 'detail',
      },
      {
        src: '/images/products/the-twist-black.jpg',
        alt: 'NOVEQ The Twist Slide Pam in Noir Black',
        viewType: 'detail',
      },
    ],
  },
];

export const DROP_001_COLLECTION: Collection = {
  name: 'Drop 001',
  slug: 'drop-001',
  title: 'Drop 001 - noveq collection',
  short_intro: 'Drop 001 introduces NOVEQ through an exclusive focus on The Weave, The Ring, and The Twist.',
  products: DROP_001_PRODUCTS,
  editorial_copy:
    'Our inaugural release is intentionally focused: Drop 001 showcases designs crafted by our artisan shoemakers in Nigeria. Built around everyday movement, refined form, and honest craftsmanship.',
  publish_date: '2026-09-25',
  publish_status: 'published',
};

export function getProductBySlug(slug: string): Product | undefined {
  const bySlug = (targetSlug: string) =>
    DROP_001_PRODUCTS.find((p) => p.slug === targetSlug);

  if (slug === 'the-braid-slide-pam') {
    return bySlug('the-weave-slide-pam') || DROP_001_PRODUCTS[0];
  }
  const directMatch = bySlug(slug);
  if (directMatch) return directMatch;
  if (slug.includes('weave') || slug.includes('braid') || slug.includes('loop')) {
    return bySlug('the-weave-slide-pam') || DROP_001_PRODUCTS[0];
  }
  if (slug.includes('twist')) {
    return bySlug('the-twist-slide-pam') || DROP_001_PRODUCTS[0];
  }
  if (slug.includes('ring')) {
    return bySlug('the-ring-slide-pam') || DROP_001_PRODUCTS[0];
  }
  return DROP_001_PRODUCTS[0];
}

export function getAllProducts(): Product[] {
  return DROP_001_PRODUCTS;
}
