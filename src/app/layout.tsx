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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_SETTINGS.seo.baseUrl,
    siteName: SITE_SETTINGS.brandName,
    title: SITE_SETTINGS.seo.defaultTitle,
    description: SITE_SETTINGS.seo.defaultDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_SETTINGS.seo.defaultTitle,
    description: SITE_SETTINGS.seo.defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_SETTINGS.brandName,
    url: SITE_SETTINGS.seo.baseUrl,
    description: SITE_SETTINGS.seo.defaultDescription,
    slogan: SITE_SETTINGS.slogan,
    sameAs: [SITE_SETTINGS.socialLinks.instagram],
  };

  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} ${rayleighGlamour.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
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
