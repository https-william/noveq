import type { Metadata } from 'next';
import { Inter, Instrument_Serif } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import AnnouncementBar from '@/components/AnnouncementBar/AnnouncementBar';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

const rayleighGlamour = localFont({
  src: '../../public/fonts/RayleighglamourRegular.otf',
  variable: '--font-rayleigh-glamour',
  display: 'swap',
});

import { SITE_SETTINGS } from '@/config/siteSettings';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_SETTINGS.seo.baseUrl),
  title: {
    default: SITE_SETTINGS.seo.defaultTitle,
    template: SITE_SETTINGS.seo.titleTemplate,
  },
  description: SITE_SETTINGS.seo.defaultDescription,
  keywords: SITE_SETTINGS.seo.keywords,
  authors: [{ name: SITE_SETTINGS.brandName }],
  creator: SITE_SETTINGS.brandName,
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: SITE_SETTINGS.seo.baseUrl,
    siteName: 'NOVEQ',
    title: SITE_SETTINGS.seo.defaultTitle,
    description: SITE_SETTINGS.seo.defaultDescription,
    images: [
      {
        url: '/images/brand/noveq-brand-sheet.jpg',
        width: 1200,
        height: 630,
        alt: 'NOVEQ — Contemporary Nigerian Female Leather Pams',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_SETTINGS.seo.defaultTitle,
    description: SITE_SETTINGS.seo.defaultDescription,
    images: ['/images/brand/noveq-brand-sheet.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_SETTINGS.seo.baseUrl}/#organization`,
        name: 'NOVEQ',
        legalName: 'NOVEQ',
        alternateName: [
          'NOVEQ Studio',
          'NOVEQ Footwear',
          'NOVEQ Nigeria',
          'NOVEQ The Brand',
          'NOVEQ Leather Pams',
        ],
        url: SITE_SETTINGS.seo.baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_SETTINGS.seo.baseUrl}/icon-512.png`,
          width: 512,
          height: 512,
        },
        image: `${SITE_SETTINGS.seo.baseUrl}/images/brand/noveq-brand-sheet.jpg`,
        description:
          "NOVEQ is a contemporary Nigerian footwear brand in Lagos, Nigeria, specializing in handcrafted female leather pams, women's slip-on slides, and vegetable-tanned footwear.",
        disambiguatingDescription:
          "Contemporary Nigerian female leather footwear brand founded in Lagos, Nigeria, designing handcrafted slide pams with vegetable-tanned hides. Distinct from software templates or musical artists.",
        slogan: 'Crafted to move.',
        foundingLocation: {
          '@type': 'Place',
          name: 'Lagos, Nigeria',
        },
        areaServed: {
          '@type': 'Country',
          name: 'Nigeria',
        },
        knowsAbout: [
          'Nigerian Female Leather Pams',
          'Female Leather Pams in Nigeria',
          "Women's Leather Footwear",
          'Nigerian Leather Craft',
          'Handcrafted Leather Slides',
          'Ladies Leather Pams Lagos',
        ],
        sameAs: [
          SITE_SETTINGS.socialLinks.instagram,
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_SETTINGS.seo.baseUrl}/#website`,
        url: SITE_SETTINGS.seo.baseUrl,
        name: 'NOVEQ | Nigerian Female Leather Pams',
        description:
          "Handcrafted female leather pams and contemporary footwear from Lagos, Nigeria.",
        publisher: {
          '@id': `${SITE_SETTINGS.seo.baseUrl}/#organization`,
        },
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} ${rayleighGlamour.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <meta name="google-site-verification" content="jt5krer4ijvcuvvmshyx8cqv2jgxsc6ws-vuygm9pdy" />
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/icon-48.png" type="image/png" sizes="48x48" />
        <link rel="icon" href="/icon-96.png" type="image/png" sizes="96x96" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      </head>
      <body
        className="min-h-full flex flex-col bg-bone text-ink-black"
        suppressHydrationWarning
      >
        <Providers>
          {/* Skip to main content link for keyboard accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-ink-black focus:text-warm-white focus-dark"
          >
            Skip to main content
          </a>

          {/* Global Brand Shell: Announcement Bar + Sticky Header */}
          {SITE_SETTINGS.announcement.enabled && (
            <AnnouncementBar
              message={SITE_SETTINGS.announcement.text}
              linkText={SITE_SETTINGS.announcement.linkText}
              linkHref={SITE_SETTINGS.announcement.linkHref}
              isDismissible={SITE_SETTINGS.announcement.dismissible}
            />
          )}
          <Header />

          {/* Primary Page Canvas */}
          <main id="main-content" className="flex-1 focus:outline-none">
            {children}
          </main>

          {/* Global Brand Shell: Footer */}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
