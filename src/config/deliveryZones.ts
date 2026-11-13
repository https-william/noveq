import { DeliveryZone } from '@/types/commerce';

/**
 * NOVEQ Delivery Zones Configuration
 * 
 * Configurable lookup table for regional delivery fees and timeframes.
 * Rates include bench-to-door courier dispatch.
 * Every pair is crafted in 5 business days + 2 business days courier delivery (7 business days nationwide).
 */

export const DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: 'lagos-mainland',
    name: 'Lagos - Mainland',
    description: 'Yaba, Ikeja, Surulere, Maryland, Magodo, Festac, Gbagada',
    fee: 4000,
    estimatedDays: '7 business days nationwide',
  },
  {
    id: 'lagos-island',
    name: 'Lagos - Island & Environs',
    description: 'Ikoyi, Victoria Island, Lekki Phase 1, Ajah, Chevron',
    fee: 4500,
    estimatedDays: '7 business days nationwide',
  },
  {
    id: 'south-west',
    name: 'South-West Regional',
    description: 'Ogun, Oyo (Ibadan), Osun, Ondo, Ekiti',
    fee: 5000,
    estimatedDays: '7 business days nationwide',
  },
  {
    id: 'abuja-central',
    name: 'Abuja & FCT',
    description: 'Central Area, Maitama, Wuse, Garki, Jabi, Gwarinpa',
    fee: 5500,
    estimatedDays: '7 business days nationwide',
  },
  {
    id: 'south-south-east',
    name: 'South-South & South-East',
    description: 'Port Harcourt, Benin, Asaba, Enugu, Owerri, Calabar',
    fee: 6000,
    estimatedDays: '7 business days nationwide',
  },
  {
    id: 'northern-states',
    name: 'Northern Regional States',
    description: 'Kaduna, Kano, Jos, Plateau, Niger, Kwara',
    fee: 6500,
    estimatedDays: '7 business days nationwide',
  },
];

export const DEFAULT_DELIVERY_ZONE = DELIVERY_ZONES[0];

export function getDeliveryZoneById(id: string): DeliveryZone {
  return DELIVERY_ZONES.find((z) => z.id === id) || DEFAULT_DELIVERY_ZONE;
}
