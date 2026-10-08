import { Metadata } from 'next';
import ShopCatalogClient from '@/components/Shop/ShopCatalogClient';
import { getStorefrontProducts } from '@/lib/productStore';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Drop 001 - noveq collection | NOVEQ',
  description:
    'The inaugural release of contemporary women’s leather pams, handcrafted in Nigeria.',
  alternates: {
    canonical: '/shop',
  },
};

/**
 * Drop 001 Thin Wrapper Route
 * Reuses the central, robust Shop/Product system without template divergence.
 */
export default function Drop001Page() {
  const products = getStorefrontProducts(false);
  return <ShopCatalogClient initialProducts={products} isDropCampaign={true} />;
}

