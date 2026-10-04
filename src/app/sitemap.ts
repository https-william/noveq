import { MetadataRoute } from 'next';
import { getStorefrontProducts } from '@/lib/productStore';
import { getAllPublishedArticles } from '@/data/journal';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://noveq.com.ng';
  const currentDate = new Date();

  // Core static routes (admin excluded)
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/story`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/journal`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/policies`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Dynamic product routes
  const productRoutes: MetadataRoute.Sitemap = getStorefrontProducts(false).map((product) => ({
    url: `${baseUrl}/shop/${product.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Dynamic journal article routes
  const journalRoutes: MetadataRoute.Sitemap = getAllPublishedArticles().map((article) => ({
    url: `${baseUrl}/journal/${article.slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes, ...journalRoutes];
}
