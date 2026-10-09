import { MetadataRoute } from 'next';
import { SITE_SETTINGS } from '@/config/siteSettings';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_SETTINGS.seo.baseUrl || 'https://www.noveq.com.ng';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/private/', '/api/', '/admin', '/admin/', '/order-confirmation/'],
      },
      {
        // Bingbot & MSNbot Crawlers
        userAgent: ['Bingbot', 'msnbot', 'BingPreview'],
        allow: '/',
        disallow: ['/private/', '/api/', '/admin', '/admin/', '/order-confirmation/'],
      },
      {
        // Googlebot Image & Favicon crawler
        userAgent: ['Googlebot-Image', 'Google-InspectionTool', 'Google Favicon'],
        allow: ['/favicon.ico', '/icon.png', '/icon-48.png', '/icon-96.png', '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png', '/images/', '/'],
        disallow: ['/admin', '/admin/'],
      },
      {
        // LLM & AI Search Engine Answer Crawlers (AEO / GEO)
        userAgent: [
          'GPTBot',
          'PerplexityBot',
          'ClaudeBot',
          'Google-Extended',
          'Applebot-Extended',
          'CCBot',
          'Bytespider',
        ],
        allow: ['/', '/shop', '/shop/*', '/journal', '/journal/*', '/story', '/policies', '/contact'],
        disallow: ['/admin', '/admin/', '/api/', '/private/', '/bag/', '/checkout/', '/order-confirmation/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
