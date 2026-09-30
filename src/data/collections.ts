import { Collection } from '@/types/commerce';
import { DROP_001_PRODUCTS } from '@/data/products';

/**
 * NOVEQ Collections Data Layer
 * 
 * Scalable data model supporting Drop 001, Drop 002, and future releases
 * without requiring bespoke template redesigns per release.
 */
export const NOVEQ_COLLECTIONS: Collection[] = [
  {
    name: 'Drop 001',
    slug: 'drop-001',
    title: 'Drop 001 — noveq collection',
    short_intro: 'An initial release of contemporary women’s leather pams, handcrafted in Nigeria.',
    hero_image: '/images/models/the-ring-hero-model.jpg',
    products: DROP_001_PRODUCTS,
    editorial_copy:
      'NOVEQ introduces contemporary leather footwear through Drop 001. Featuring full-grain leather, hand-beveled edges, and signature strap geometry.',
    publish_date: '2026-09-25',
    publish_status: 'published',
  },
  {
    name: 'Drop 002',
    slug: 'drop-002',
    title: 'Drop 002 — In the Atelier',
    short_intro: 'Next-stage designs currently in development with our master shoemaker.',
    hero_image: '/images/editorial/artisan-workshop.jpg',
    products: [],
    editorial_copy:
      'Archival exploration of mules and closed-toe variations, maintaining our minimalist instep and natural arch support.',
    publish_date: '2027-01-15',
    publish_status: 'draft',
  },
];

export function getCollectionBySlug(slug: string): Collection | undefined {
  return NOVEQ_COLLECTIONS.find((c) => c.slug === slug);
}

export function getAllPublishedCollections(): Collection[] {
  return NOVEQ_COLLECTIONS.filter((c) => c.publish_status === 'published');
}
