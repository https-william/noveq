/**
 * NOVEQ Fez Delivery Service
 *
 * Integration with Fez logistics API for location detection
 * and delivery fee calculation (with NOVEQ logistics handling silently included).
 */

import { getDeliveryZoneById } from '@/config/deliveryZones';

export interface FezDeliveryResult {
  zoneId: string;
  zoneName: string;
  estimatedDays: string;
  baseFee: number;
  finalFee: number;
  description: string;
}

const INTERNAL_MARKUP = 2000;

function resolveLocalZone(location: string): FezDeliveryResult {
  const lower = location.toLowerCase();
  let zoneId = 'lagos-mainland';

  if (lower.includes('lekki') || lower.includes('ikoyi') || lower.includes('victoria island') || lower.includes('ajah') || lower.includes('island')) {
    zoneId = 'lagos-island';
  } else if (lower.includes('ogun') || lower.includes('ota') || lower.includes('ibadan') || lower.includes('oyo') || lower.includes('osun') || lower.includes('ondo') || lower.includes('ekiti') || lower.includes('abeokuta')) {
    zoneId = 'south-west';
  } else if (lower.includes('abuja') || lower.includes('fct') || lower.includes('wuse') || lower.includes('maitama') || lower.includes('gwarinpa')) {
    zoneId = 'abuja-central';
  } else if (lower.includes('port harcourt') || lower.includes('rivers') || lower.includes('benin') || lower.includes('edo') || lower.includes('asaba') || lower.includes('delta') || lower.includes('enugu') || lower.includes('owerri') || lower.includes('calabar') || lower.includes('uyo') || lower.includes('anambra') || lower.includes('awka')) {
    zoneId = 'south-south-east';
  } else if (lower.includes('kaduna') || lower.includes('kano') || lower.includes('jos') || lower.includes('plateau') || lower.includes('kwara') || lower.includes('ilorin') || lower.includes('niger') || lower.includes('minna')) {
    zoneId = 'northern-states';
  }

  const zone = getDeliveryZoneById(zoneId);
  return {
    zoneId: zone.id,
    zoneName: zone.name,
    estimatedDays: zone.estimatedDays,
    baseFee: zone.fee,
    finalFee: zone.fee + INTERNAL_MARKUP,
    description: zone.description,
  };
}

export async function fetchFezDeliveryZone(location: string): Promise<FezDeliveryResult> {
  const FEZ_API_KEY = process.env.NEXT_PUBLIC_FEZ_API_KEY;

  if (!FEZ_API_KEY) {
    return resolveLocalZone(location);
  }

  try {
    const response = await fetch(
      `https://api.fez.co/v1/delivery/calculate?key=${FEZ_API_KEY}&location=${encodeURIComponent(
        location
      )}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return resolveLocalZone(location);
    }

    const data = await response.json();
    const fallback = resolveLocalZone(location);
    const baseFee = typeof data.baseFee === 'number' && data.baseFee > 0 ? data.baseFee : fallback.baseFee;

    return {
      zoneId: data.zoneId || fallback.zoneId,
      zoneName: data.zoneName || fallback.zoneName,
      estimatedDays: '7 business days (5 days crafting + 2 days courier)',
      baseFee,
      finalFee: baseFee + INTERNAL_MARKUP,
      description: data.description || fallback.description,
    };
  } catch {
    return resolveLocalZone(location);
  }
}

export function formatFezDeliveryFee(feeInKobo: number): string {
  const feeInNaira = feeInKobo / 100;
  const roundedFee = Math.round(feeInNaira / 100) * 100;
  return `₦${roundedFee.toLocaleString()}`;
}

export function getFezDeliveryZoneById(zoneId: string): FezDeliveryResult {
  const localZone = getDeliveryZoneById(zoneId);
  return {
    zoneId: localZone.id,
    zoneName: localZone.name,
    estimatedDays: localZone.estimatedDays,
    baseFee: localZone.fee,
    finalFee: localZone.fee + INTERNAL_MARKUP,
    description: localZone.description,
  };
}
