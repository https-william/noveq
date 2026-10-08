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
  legalEntityName: 'NOVEQ',
  slogan: 'Crafted to move.',
  supportingTheme: 'Same purpose. A new perspective.',
  currency: 'NGN',
  currencySymbol: '₦',

  // Support channel abstraction
  supportContact: {
    primaryChannel: 'whatsapp',
    email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'noveqthebrand@gmail.com',
    phone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || '2349038555997',
    displayPhone: process.env.NEXT_PUBLIC_SUPPORT_DISPLAY_PHONE || '+234 903 855 5997',
    operatingHours: 'Monday - Saturday: 9:00 AM - 6:00 PM WAT',
    supportPrompt: 'Hello NOVEQ team, I have an inquiry regarding Drop 001 footwear.',
    conciergePrompt: 'Hello NOVEQ team, I have an inquiry regarding Drop 001 footwear.',
    isPendingClientConfirmation: false,
  },

  socialLinks: {
    instagram: 'https://instagram.com/noveqthebrand',
    instagramHandle: '@noveqthebrand',
  },

  announcement: {
    enabled: true,
    text: 'DROP 001 IS LIVE - LIMITED RUN OF LEATHER PAMS',
    linkText: 'Discover',
    linkHref: '/shop',
    dismissible: true,
  },

  seo: {
    baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.noveq.com.ng',
    defaultTitle: "NOVEQ | Nigerian Female Leather Pams & Handcrafted Footwear",
    titleTemplate: '%s | NOVEQ',
    defaultDescription:
      "NOVEQ. Contemporary Nigerian female leather pams handcrafted in Lagos with full-grain vegetable-tanned hides. Built for effortless daily movement, personal detail, and nationwide delivery within 7 business days across Nigeria.",
    keywords: [
      'Nigerian female leather pams',
      'female leather pams in Nigeria',
      'ladies leather pams Lagos',
      'women leather pams Nigeria',
      'NOVEQ',
      'NOVEQ Footwear',
      'handcrafted female leather slippers',
      'artisan leather slides Nigeria',
      'Drop 001',
      'The Ring Slide Pam',
      'The Twist Slide Pam',
      'The Weave Slide Pam',
      'contemporary Nigerian footwear',
    ],
  },

  // Asset slot registry
  assets: {
    logoSvgPath: '/images/brand/logo.svg',
    logoPngPath: '/images/brand/logo.png',
    faviconPath: '/images/brand/favicon.svg',
    isMasterLogoSupplied: true,
    isMasterFaviconSupplied: true,
    assetGapNotice: '',
  },

  // Social proof configuration
  socialProof: {
    instagramHandle: '@noveqthebrand',
    instagramUrl: 'https://instagram.com/noveqthebrand',
    pressMentionsEnabled: false, // OFF by default; turns on when press features are confirmed
    pressMentions: [],
    customerProofEnabled: false, // OFF for launch; activates when verified customer reviews arrive
    customerProofPlaceholderText:
      'Drop 001 is on its way to its first owners. Tag @noveqthebrand to be featured.',
  },

  // Launch sequence & campaign state (Config-driven toggle: 'live' | 'pre-launch' | 'reveal' | 'sold-out')
  campaign: {
    state: (process.env.NEXT_PUBLIC_CAMPAIGN_STATE as 'live' | 'pre-launch' | 'sold-out' | 'reveal') || 'live',
    preLaunchEyebrow: 'COMING SOON · LAUNCH PREVIEW',
    preLaunchDateText: 'October 2026',
  },

  shippingZones: DELIVERY_ZONES,
};

