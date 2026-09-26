import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ShopCatalogClient from '@/components/Shop/ShopCatalogClient';
import { getCollectionBySlug, NOVEQ_COLLECTIONS } from '@/data/collections';

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return NOVEQ_COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (!collection) return { title: 'Collection Not Found | NOVEQ' };

  return {
    title: `${collection.title} | NOVEQ`,
    description: collection.short_intro,
    alternates: {
      canonical: `/collections/${slug}`,
    },
  };
}

export default async function CollectionDetailPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  return (
    <ShopCatalogClient
      eyebrow={`Collection // ${collection.name}`}
      title={collection.title}
      intro={collection.short_intro}
    />
  );
}
