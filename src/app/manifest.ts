import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NOVEQ | Nigerian Female Leather Pams',
    short_name: 'NOVEQ',
    description:
      'Contemporary Nigerian female leather pams and handcrafted footwear designed in Lagos, Nigeria.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1C120C',
    theme_color: '#1C120C',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
