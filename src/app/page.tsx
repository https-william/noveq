import { Metadata } from 'next';
import HomeClient from '@/components/Home/HomeClient';
import { getStorefrontProducts } from '@/lib/productStore';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "NOVEQ | Contemporary Women's Leather Pams — Crafted to Move",
  description:
    "Contemporary leather footwear, thoughtfully designed around everyday movement, refined form, and personal detail. Discover Drop 001 women's leather pams handcrafted in Lagos.",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "NOVEQ | Contemporary Women's Leather Pams — Crafted to Move",
    description:
      "Contemporary leather footwear, thoughtfully designed around everyday movement, refined form, and personal detail. Discover Drop 001 women's leather pams handcrafted in Lagos.",
    url: 'https://noveq.com',
    siteName: 'NOVEQ',
    type: 'website',
    images: [
      {
        url: '/images/products/the-twist.jpg',
        width: 1200,
        height: 900,
        alt: "NOVEQ The Twist Slide Pam in rich oxblood full-grain leather",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "NOVEQ | Contemporary Women's Leather Pams — Crafted to Move",
    description:
      "Contemporary leather footwear, thoughtfully designed around everyday movement, refined form, and personal detail. Discover Drop 001 women's leather pams handcrafted in Lagos.",
    images: ['/images/products/the-twist.jpg'],
  },
};

export default function HomePage() {
  const products = getStorefrontProducts(false);
  return <HomeClient initialProducts={products} />;
}

