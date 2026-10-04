import { Product, Collection, DeliveryZone } from '@/types/commerce';

/**
 * NOVEQ Content & Data Architecture
 * Separable, platform-agnostic typed models.
 */

export interface StoryBlock {
  id: string;
  eyebrow: string;
  heading: string;
  body: string[];
  accentQuote?: string;
  image: string;
  altText: string;
  caption?: string;
  imagePosition?: 'left' | 'right';
  ctaText?: string;
  ctaHref?: string;
  ctaVariant?: 'button' | 'underline';
}

export interface JournalArticle {
  slug: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  coverImage?: string;
  coverAlt?: string;
  body: string[];
  pullQuote?: string;
  inlineImage?: {
    src: string;
    alt: string;
    caption?: string;
  };
  date: string;
  readingTime: string;
  type: 'product_note' | 'craft_story' | 'editorial';
  tags: string[];
  relatedProductSlug?: string;
  seoTitle: string;
  seoDescription: string;
  publishStatus: 'published' | 'draft';
}

export interface CustomerProof {
  id: string;
  quote: string;
  author: string; // e.g., "Chioma"
  location: string; // e.g., "Lagos"
  productPurchased: string;
  photo?: string;
  verifiedPurchase: boolean;
}

export interface PressMention {
  id: string;
  publication: string;
  quote: string;
  url?: string;
  date: string;
}


export type PolicyType = 'shipping' | 'returns' | 'privacy' | 'terms' | 'care';

export interface PolicySection {
  heading: string;
  content: string;
  isPendingClientDecision?: boolean;
}

export interface Policy {
  id: PolicyType;
  title: string;
  version: string; // e.g. "v1.0.0-draft"
  effectiveDate: string;
  summary: string;
  sections: PolicySection[];
  isDraft: boolean;
}

export interface SupportContactConfig {
  primaryChannel: 'whatsapp' | 'email' | 'hybrid';
  email: string;
  phone: string; // E.164 formatted without plus, e.g. "2348000000000"
  displayPhone: string; // Human-friendly display, e.g. "+234 800 000 0000"
  operatingHours: string;
  supportPrompt: string;
  conciergePrompt?: string;
  isPendingClientConfirmation: boolean;
}

export type CampaignState = 'live' | 'pre-launch' | 'sold-out' | 'reveal';

export interface CampaignConfig {
  state: CampaignState;
  preLaunchEyebrow?: string;
  preLaunchDateText?: string;
}

export interface SiteSettings {
  brandName: string;
  legalEntityName: string;
  slogan: string;
  supportingTheme: string;
  currency: 'NGN' | 'USD';
  currencySymbol: string;
  supportContact: SupportContactConfig;
  socialLinks: {
    instagram: string;
    instagramHandle: string;
    twitter?: string;
  };
  announcement: {
    enabled: boolean;
    text: string;
    linkText?: string;
    linkHref?: string;
    dismissible: boolean;
  };
  seo: {
    baseUrl: string;
    defaultTitle: string;
    titleTemplate: string;
    defaultDescription: string;
    keywords: string[];
  };
  assets: {
    logoSvgPath: string; // Flagged pending master asset
    logoPngPath: string;
    faviconPath: string;
    isMasterLogoSupplied: boolean;
    isMasterFaviconSupplied: boolean;
    assetGapNotice: string;
  };
  socialProof: {
    instagramHandle: string;
    instagramUrl: string;
    pressMentionsEnabled: boolean;
    pressMentions: PressMention[];
    customerProofEnabled: boolean;
    customerProofPlaceholderText: string;
  };
  campaign?: CampaignConfig;
  shippingZones: DeliveryZone[];
}

