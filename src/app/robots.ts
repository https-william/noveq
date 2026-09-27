import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/private/', '/api/', '/admin/', '/admin'],
    },
    sitemap: 'https://noveq.com.ng/sitemap.xml',
  };
}
