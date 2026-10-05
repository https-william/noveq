import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/private/', '/api/', '/admin/', '/admin', '/order-confirmation/'],
      },
      {
        userAgent: [
          'GPTBot',
          'PerplexityBot',
          'ClaudeBot',
          'Google-Extended',
          'Applebot-Extended',
          'CCBot',
        ],
        allow: ['/', '/shop/', '/journal/', '/story/', '/policies/', '/contact/'],
        disallow: ['/admin/', '/api/', '/private/', '/bag/', '/checkout/', '/order-confirmation/'],
      },
    ],
    sitemap: 'https://noveq.com.ng/sitemap.xml',
  };
}
