import { DeliveryZone } from '@/types/commerce';

/**
 * NOVEQ Delivery Zones Configuration
 * 
 * Configurable lookup table for regional delivery fees and timeframes.
 * Once real logistics contracts are confirmed, update the rates and days below.
 */

export const DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: 'lagos-mainland',
    name: 'Lagos - Mainland',
    description: 'Yaba, Ikeja, Surulere, Maryland, Magodo, Festac, Gbagada',
    fee: 0,
    estimatedDays: '1-2 business days (Pay rider on delivery)',
  },
  {
    id: 'lagos-island',
    name: 'Lagos - Island & Environs',
    description: 'Ikoyi, Victoria Island, Lekki Phase 1, Ajah, Chevron',
    fee: 0,
    estimatedDays: '1-2 business days (Pay rider on delivery)',
  },
  {
    id: 'south-west',
    name: 'South-West Regional',
    description: 'Ogun, Oyo (Ibadan), Osun, Ondo, Ekiti',
    fee: 0,
    estimatedDays: '2-3 business days (Pay rider on delivery)',
  },
  {
    id: 'abuja-central',
    name: 'Abuja & FCT',
    description: 'Central Area, Maitama, Wuse, Garki, Jabi, Gwarinpa',
    fee: 0,
    estimatedDays: '2-4 business days (Pay rider on delivery)',
  },
  {
    id: 'south-south-east',
    name: 'South-South & South-East',
    description: 'Port Harcourt, Benin, Asaba, Enugu, Owerri, Calabar',
    fee: 0,
    estimatedDays: '3-5 business days (Pay rider on delivery)',
  },
  {
    id: 'northern-states',
    name: 'Northern Regional States',
    description: 'Kaduna, Kano, Jos, Plateau, Niger, Kwara',
    fee: 0,
    estimatedDays: '3-5 business days (Pay rider on delivery)',
  },
];

export const DEFAULT_DELIVERY_ZONE = DELIVERY_ZONES[0];

export function getDeliveryZoneById(id: string): DeliveryZone {
  return DELIVERY_ZONES.find((z) => z.id === id) || DEFAULT_DELIVERY_ZONE;
}
