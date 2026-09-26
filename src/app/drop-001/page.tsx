import { Metadata } from 'next';
import ShopCatalogClient from '@/components/Shop/ShopCatalogClient';

export const metadata: Metadata = {
  title: 'Drop 001 — The First Ten Pairs | NOVEQ',
  description:
    'The inaugural 10-pair limited release of contemporary women’s leather pams, handmade in Lagos, Nigeria.',
  alternates: {
    canonical: '/shop',
  },
};

/**
 * Drop 001 Thin Wrapper Route
 * Reuses the central, robust Shop/Product system without template divergence.
 */
export default function Drop001Page() {
  return <ShopCatalogClient isDropCampaign={true} />;
}
