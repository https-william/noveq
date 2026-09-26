import { Metadata } from 'next';
import ShopCatalogClient from '@/components/Shop/ShopCatalogClient';

export const metadata: Metadata = {
  title: "NOVEQ Drop 001 | Contemporary Women's Leather Pams",
  description:
    "Explore Drop 001: ten pairs of handcrafted women's leather pams. Made in Lagos, Nigeria with full-grain leather, asymmetrical strap geometry, and barefoot comfort.",
  alternates: {
    canonical: '/shop',
  },
  openGraph: {
    title: "NOVEQ Drop 001 | Contemporary Women's Leather Pams",
    description:
      "Explore Drop 001: ten pairs of handcrafted women's leather pams. Made in Lagos, Nigeria with full-grain leather, asymmetrical strap geometry, and barefoot comfort.",
    url: '/shop',
    siteName: 'NOVEQ',
    type: 'website',
    images: [
      {
        url: '/images/products/cut-black-hero.svg',
        width: 1200,
        height: 900,
        alt: "NOVEQ Drop 001 Women's Leather Pams",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "NOVEQ Drop 001 | Contemporary Women's Leather Pams",
    description:
      "Explore Drop 001: ten pairs of handcrafted women's leather pams. Made in Lagos, Nigeria with full-grain leather, asymmetrical strap geometry, and barefoot comfort.",
    images: ['/images/products/cut-black-hero.svg'],
  },
};

export default function ShopPage() {
  return <ShopCatalogClient />;
}
