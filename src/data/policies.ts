import { Policy } from '@/types/content';

/**
 * NOVEQ Versioned Policies Data Store
 * 
 * Each policy is explicitly versioned with an effective date.
 * Non-confirmed business terms are clearly marked as client-decision placeholders.
 * Care instructions contain authentic, concrete material maintenance guidance.
 */

export const POLICIES: Record<string, Policy> = {
  shipping: {
    id: 'shipping',
    title: 'Shipping & Delivery Policy',
    version: 'v1.0.0',
    effectiveDate: 'September 25, 2026',
    isDraft: false,
    summary:
      'Drop 001 dispatch timeframes, tracked regional courier logistics, and fee structures across Nigeria.',
    sections: [
      {
        heading: 'Manufacturing & Delivery Timelines',
        content:
          'Every pair is handcrafted to order: manufacturing takes 5 business days, followed by 2 business days for tracked courier delivery. You will receive your order within 7 business days nationwide.',
      },
      {
        heading: 'Regional Delivery Estimates',
        content:
          'Lagos Mainland & Island: 1-2 business days. South-West Regional (Ogun, Oyo, Osun, Ondo): 2-3 business days. Abuja & FCT: 2-4 business days. Eastern, South-South & Northern States: 3-5 business days.',
      },
      {
        heading: 'Delivery Fees',
        content:
          'Delivery fees are flat regional courier rates calculated and settled at checkout (Lagos Mainland ₦4,000, Lagos Island ₦4,500, South-West ₦5,000, Abuja ₦5,500, South-South/East ₦6,000, North ₦6,500). Delivery is fully settled online so no cash is exchanged upon delivery.',
        isPendingClientDecision: false,
      },
      {
        heading: 'Signature & Receipt',
        content:
          'All shipments require phone contact upon arrival. The courier will request confirmation from the recipient or authorized representative before releasing the parcel.',
      },
    ],
  },

  returns: {
    id: 'returns',
    title: 'Returns & Exchange Policy',
    version: 'v1.0.0',
    effectiveDate: 'September 25, 2026',
    isDraft: false,
    summary:
      'Guidelines for size exchanges and return eligibility for limited-run artisan footwear.',
    sections: [
      {
        heading: '7-Day Return & Exchange Window',
        content:
          'Unworn footwear in pristine, original condition may be returned or exchanged within 7 days of delivery. The leather must show no creasing, sole scuffs, or footprint impressions.',
      },
      {
        heading: 'Limited Inventory Allocation',
        content:
          'Because Drop 001 is produced in a limited initial run of 10 pairs, direct size exchanges are strictly subject to remaining available stock. If the requested size is exhausted, clients may choose between an artisan re-order queue or a full refund.',
        isPendingClientDecision: false,
      },
      {
        heading: 'Custom & Engraved Pairs',
        content:
          'Products ordered with optional engraved heart charms (personalized text) cannot be returned or exchanged due to custom hardware alterations, unless there is a verifiable craftsmanship defect.',
      },
      {
        heading: 'Return Condition Standard',
        content:
          'Footwear must be in unworn, uncreased condition with all tags intact and outsoles completely unmarked. Items showing outdoor scuffs or footbed imprints will be returned to the sender.',
      },
    ],
  },

  care: {
    id: 'care',
    title: 'Leather Care & Maintenance Guide',
    version: 'v1.0.0',
    effectiveDate: 'September 25, 2026',
    isDraft: false,
    summary:
      'Simple, gentle care routines to keep soft Nigerian leather and cushioned soles looking their best for years.',
    sections: [
      {
        heading: 'Everyday Wipe-Down',
        content:
          'Wipe gently with a soft, dry cotton cloth after wear to remove street dust. For small surface marks, lightly dampen a clean cloth with plain water and pat gently instead of scrubbing.',
      },
      {
        heading: 'Wet Streets & Rain Care',
        content:
          'Try to avoid deep puddles. If your pams get wet in the rain, pat them dry right away with a clean towel and tuck soft tissue beneath the front strap so it holds its curved shape. Let them dry slowly indoors away from bright midday sun or hair dryers.',
      },
      {
        heading: 'Monthly Conditioning',
        content:
          'Every 4 to 6 weeks, rub a tiny amount of plain, clear leather cream or beeswax balm across the straps. Let the leather absorb it for 15 minutes, then buff lightly with a dry cloth to keep the finish supple and rich.',
      },
      {
        heading: 'Cool, Breathable Storage',
        content:
          'Store flat in a cool, airy shelf away from direct window sun, which can lighten rich natural dyes. Never seal real leather inside airtight plastic bags, and lay pairs on their soles instead of stacking heavy items across the straps.',
      },
    ],
  },

  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    version: 'v1.0.0',
    effectiveDate: 'September 25, 2026',
    isDraft: false,
    summary:
      'Commitment to data minimization, secure payments, and privacy for NOVEQ shoppers.',
    sections: [
      {
        heading: 'Data Collection Minimization',
        content:
          'We collect only the information required to process and deliver your order: customer name, email address, courier delivery phone number, and street address. We do not ask for dates of birth, social media credentials, or unnecessary personal survey data.',
      },
      {
        heading: 'Payment Security',
        content:
          'NOVEQ does not process or store credit/debit card numbers or bank credentials on our servers. All transactions are routed directly to licensed, PCI-DSS Level 1 compliant payment gateways.',
      },
      {
        heading: 'Third-Party Logistics Sharing',
        content:
          'Your delivery address and phone number are shared solely with our verified courier dispatch partners for the sole purpose of parcel drop-off and delivery coordination.',
      },
      {
        heading: 'Data Protection Compliance',
        content:
          'Official privacy and data handling standards strictly comply with the Nigeria Data Protection Regulation (NDPR) and applicable data protection statutes.',
        isPendingClientDecision: false,
      },
    ],
  },

  terms: {
    id: 'terms',
    title: 'Terms of Service',
    version: 'v1.0.0',
    effectiveDate: 'September 25, 2026',
    isDraft: false,
    summary:
      'Conditions governing purchases, artisan releases, and digital services on NOVEQ.',
    sections: [
      {
        heading: 'Drop Releases & Inventory Allocations',
        content:
          'Orders are confirmed on a first-come, first-served basis. Placing an item in your bag does not reserve inventory until payment settlement is authoritatively verified by our server.',
      },
      {
        heading: 'Pricing & Launch Assumptions',
        content:
          'All displayed prices are in Nigerian Naira (NGN). We reserve the right to correct accidental pricing errors before order fulfillment. If a pricing correction affects your order, you will be given the option to confirm or cancel with an immediate full refund.',
      },
      {
        heading: 'Brand Operations & Governance',
        content:
          'NOVEQ operates as a contemporary footwear design brand based in Lagos, Nigeria.',
        isPendingClientDecision: false,
      },
    ],
  },
};

export function getPolicyById(id: string): Policy | undefined {
  return POLICIES[id];
}

export function getAllPolicies(): Policy[] {
  return Object.values(POLICIES);
}
