import { SiteSettings } from '@/types/content';
import { DELIVERY_ZONES } from '@/config/deliveryZones';

/**
 * NOVEQ Global Site Settings Record
 * 
 * Single source of truth for site identity, support channels,
 * social links, announcement banner, SEO defaults, and asset slots.
 */

export const SITE_SETTINGS: SiteSettings = {
  brandName: 'NOVEQ',
  legalEntityName: '[Legal Entity Name Pending Official RC Confirmation]',
  slogan: 'Crafted to move.',
  supportingTheme: 'Same purpose. A new perspective.',
  currency: 'NGN',
  currencySymbol: '₦',

  // Support channel abstraction (Update here to change across Contact, PDP, and Order Confirmation)
  supportContact: {
    primaryChannel: 'whatsapp',
    email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'concierge@noveq.com',
    phone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || '2348000000000',
    displayPhone: process.env.NEXT_PUBLIC_SUPPORT_DISPLAY_PHONE || '+234 800 000 0000',
    operatingHours: 'Monday – Saturday: 9:00 AM – 6:00 PM WAT',
    conciergePrompt: 'Hello NOVEQ Concierge, I have an inquiry regarding Drop 001 footwear.',
    isPendingClientConfirmation: true, // Needs decision item from client handoff
  },

  socialLinks: {
    instagram: 'https://instagram.com',
    instagramHandle: '@noveq',
  },

  announcement: {
    enabled: true,
    text: 'DROP 001 IS LIVE — WOMEN’S LEATHER PAMS IN LIMITED RUN',
    linkText: 'Discover Drop 001',
    linkHref: '/shop',
    dismissible: true,
  },

  seo: {
    baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://noveq.com',
    defaultTitle: 'NOVEQ | Contemporary Leather Footwear',
    titleTemplate: '%s | NOVEQ',
    defaultDescription:
      'Contemporary leather footwear, thoughtfully designed around everyday movement, refined form, and personal detail.',
    keywords: [
      'NOVEQ',
      'leather footwear',
      'women leather pams',
      'Drop 001',
      'Nigerian leather craft',
      'contemporary footwear',
      'artisan slippers',
    ],
  },

  // Asset slot registry & explicit documentation of asset gap
  assets: {
    logoSvgPath: '/images/brand/logo.svg',
    logoPngPath: '/images/brand/logo.png',
    faviconPath: '/images/brand/favicon.svg',
    isMasterLogoSupplied: false, // Flagged per section 20 of handoff
    isMasterFaviconSupplied: false,
    assetGapNotice:
      'Approved master NOVEQ vector SVG/PNG logo files and master favicon have not yet been supplied by brand assets. Structured placeholder slots are configured.',
  },

  // Social proof configuration (honest architecture: NO fake reviews, toggleable press mentions)
  socialProof: {
    instagramHandle: '@noveq',
    instagramUrl: 'https://instagram.com',
    pressMentionsEnabled: false, // OFF by default; turns on only when confirmed press links are added
    pressMentions: [],
    customerProofEnabled: false, // OFF for launch; activates when verified customer testimonials arrive
    customerProofPlaceholderText:
      'Drop 001 is on its way to its first owners. Tag @noveq to be featured.',
  },

  // Launch sequence & campaign state (Config-driven toggle: 'live' | 'pre-launch' | 'reveal' | 'sold-out')
  campaign: {
    state: (process.env.NEXT_PUBLIC_CAMPAIGN_STATE as 'live' | 'pre-launch' | 'sold-out' | 'reveal') || 'live',
    preLaunchEyebrow: 'COMING SOON · ATELIER LAUNCH PREVIEW',
    preLaunchDateText: 'October 2026',
  },

  shippingZones: DELIVERY_ZONES,
};

