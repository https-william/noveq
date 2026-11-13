export interface ShoeSizeSpec {
  eu: string;
  uk: string;
  us: string;
  cm: string;
}

/**
 * Worldwide Women's Shoe Sizing Standard (EU 34 to EU 44)
 * Paired with UK, US Women's, and Foot Length (cm) equivalents.
 */
export const WORLDWIDE_WOMEN_SIZES: ShoeSizeSpec[] = [
  { eu: 'EU 34', uk: 'UK 1.5', us: 'US 4.0', cm: '21.6 cm' },
  { eu: 'EU 35', uk: 'UK 2.5', us: 'US 5.0', cm: '22.3 cm' },
  { eu: 'EU 36', uk: 'UK 3.5', us: 'US 5.5', cm: '23.0 cm' },
  { eu: 'EU 37', uk: 'UK 4.0', us: 'US 6.0', cm: '23.7 cm' },
  { eu: 'EU 38', uk: 'UK 5.0', us: 'US 7.0', cm: '24.4 cm' },
  { eu: 'EU 39', uk: 'UK 6.0', us: 'US 8.0', cm: '25.0 cm' },
  { eu: 'EU 40', uk: 'UK 6.5', us: 'US 8.5', cm: '25.7 cm' },
  { eu: 'EU 41', uk: 'UK 7.5', us: 'US 9.5', cm: '26.4 cm' },
  { eu: 'EU 42', uk: 'UK 8.0', us: 'US 10.0', cm: '27.0 cm' },
  { eu: 'EU 43', uk: 'UK 9.0', us: 'US 11.0', cm: '27.7 cm' },
  { eu: 'EU 44', uk: 'UK 10.0', us: 'US 12.0', cm: '28.3 cm' },
];

export function getSizeConversion(euSize: string): ShoeSizeSpec | undefined {
  const normalized = euSize.trim().toUpperCase();
  return WORLDWIDE_WOMEN_SIZES.find((entry) => entry.eu === normalized);
}

export function formatInternationalSizeLabel(euSize: string): string {
  const spec = getSizeConversion(euSize);
  if (!spec) return euSize;
  return `${spec.eu} · ${spec.uk} / ${spec.us} (${spec.cm})`;
}

export function formatCompactInternationalSize(euSize: string): string {
  const spec = getSizeConversion(euSize);
  if (!spec) return euSize;
  return `${spec.eu} · ${spec.uk} / ${spec.us}`;
}
