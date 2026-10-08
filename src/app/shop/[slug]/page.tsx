import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlugAsync, getStorefrontProductsAsync } from '@/lib/productStore';
import ProductDetailClient from '@/components/Product/ProductDetailClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await getStorefrontProductsAsync(true);
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlugAsync(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const formattedPrice = `₦${product.price.toLocaleString()}`;
  const canonicalTitle = `${product.name} | Nigerian Female Leather Pam (${product.colour}) — NOVEQ`;
  const canonicalDesc = `Discover ${product.name} in ${product.colour}. Handcrafted Nigerian female leather pam built from 100% full-grain calfskin with beveled sole comfort. Buy online for ${formattedPrice} with delivery within 7 business days across Nigeria.`;
  const heroImage = product.images[0]?.src.startsWith('http')
    ? product.images[0]?.src
    : `https://www.noveq.com.ng${product.images[0]?.src || '/images/products/the-ring-burgundy.jpg'}`;

  return {
    title: canonicalTitle,
    description: canonicalDesc,
    keywords: [
      'Nigerian female leather pams',
      'female leather pams in Nigeria',
      `${product.name} leather pam`,
      'ladies leather pams Lagos',
      'handcrafted female leather slippers',
      'NOVEQ Drop 001',
    ],
    alternates: {
      canonical: `/shop/${product.slug}`,
    },
    openGraph: {
      title: canonicalTitle,
      description: canonicalDesc,
      url: `/shop/${product.slug}`,
      siteName: 'NOVEQ',
      type: 'website',
      images: [
        {
          url: heroImage,
          width: 1200,
          height: 900,
          alt: `${canonicalTitle} — Handcrafted in Lagos, Nigeria`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: canonicalTitle,
      description: canonicalDesc,
      images: [heroImage],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlugAsync(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
