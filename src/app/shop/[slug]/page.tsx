import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug, getAllProducts } from '@/data/products';
import ProductDetailClient from '@/components/Product/ProductDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = getAllProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const formattedPrice = `₦${product.price.toLocaleString()}`;
  const canonicalTitle = `NOVEQ ${product.name} Women's Leather Pam, ${product.colour}`;
  const canonicalDesc = `${product.description} Handcrafted in Nigeria from full-grain leather. Available in Drop 001 for ${formattedPrice}.`;
  const heroImage = product.images[0]?.src || '/images/products/the-ring-burgundy.jpg';

  return {
    title: canonicalTitle,
    description: canonicalDesc,
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
          alt: canonicalTitle,
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
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
