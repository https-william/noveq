import { Metadata } from 'next';
import HomeClient from '@/components/Home/HomeClient';
import { getStorefrontProductsAsync } from '@/lib/productStore';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "NOVEQ | Contemporary Women's Leather Pams - Crafted to Move",
  description:
    'Contemporary Nigerian female leather pams handcrafted in Lagos with full-grain hides. Discover Drop 001, built for effortless movement and refined style.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "NOVEQ | Contemporary Women's Leather Pams - Crafted to Move",
    description:
      'Contemporary Nigerian female leather pams handcrafted in Lagos with full-grain hides. Discover Drop 001, built for effortless movement and refined style.',
    url: 'https://www.noveq.com.ng',
    siteName: 'NOVEQ',
    type: 'website',
    images: [
      {
        url: 'https://www.noveq.com.ng/images/hero/landing-hero-photoshoot.jpg',
        width: 1152,
        height: 2048,
        alt: 'NOVEQ Contemporary Handcrafted Leather Footwear - Drop 001',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "NOVEQ | Contemporary Women's Leather Pams - Crafted to Move",
    description:
      'Contemporary Nigerian female leather pams handcrafted in Lagos with full-grain hides. Discover Drop 001, built for effortless movement and refined style.',
    images: ['https://www.noveq.com.ng/images/hero/landing-hero-photoshoot.jpg'],
  },
};

export default async function HomePage() {
  const products = await getStorefrontProductsAsync(false);
  return <HomeClient initialProducts={products} />;
}

