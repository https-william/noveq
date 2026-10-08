import { Metadata } from 'next';
import ShopCatalogClient from '@/components/Shop/ShopCatalogClient';
import { getStorefrontProductsAsync } from '@/lib/productStore';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Nigerian Female Leather Pams | Shop Drop 001 — NOVEQ",
  description:
    "Shop authentic Nigerian female leather pams handcrafted in Lagos. NOVEQ Drop 001 features full-grain vegetable-tanned women's leather slide pams, sculpted comfort, and fast nationwide delivery across Nigeria.",
  alternates: {
    canonical: '/shop',
  },
  keywords: [
    'Nigerian female leather pams',
    'female leather pams in Nigeria',
    'ladies leather pams Lagos',
    'women leather pams Nigeria',
    'handcrafted leather pams Nigeria',
    'female leather slides Nigeria',
    'NOVEQ Drop 001',
    'buy leather pams online Nigeria',
  ],
  openGraph: {
    title: "Nigerian Female Leather Pams | Shop Drop 001 — NOVEQ",
    description:
      "Shop authentic Nigerian female leather pams handcrafted in Lagos. NOVEQ Drop 001 features full-grain vegetable-tanned women's leather slide pams with nationwide dispatch.",
    url: '/shop',
    siteName: 'NOVEQ',
    type: 'website',
    images: [
      {
        url: '/images/brand/noveq-brand-sheet.jpg',
        width: 1200,
        height: 630,
        alt: "NOVEQ — Nigerian Female Leather Pams & Handcrafted Footwear",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Nigerian Female Leather Pams | Shop Drop 001 — NOVEQ",
    description:
      "Shop authentic Nigerian female leather pams handcrafted in Lagos. NOVEQ Drop 001 features full-grain vegetable-tanned women's leather slide pams.",
    images: ['/images/brand/noveq-brand-sheet.jpg'],
  },
};

export default async function ShopPage() {
  const products = await getStorefrontProductsAsync(false);
  return <ShopCatalogClient initialProducts={products} />;
}
