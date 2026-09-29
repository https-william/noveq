/**
 * NOVEQ Commerce & Content Data Types
 * Separable data layer for Drop 001 and future footwear collections.
 */

export interface ProductSize {
  size: string; // e.g. "EU 37", "EU 38", "EU 39", "EU 40", "EU 41"
  available: boolean;
  stockCount: number;
}

export interface ProductImage {
  src: string;
  alt: string;
  viewType: 'hero' | 'side' | 'top' | 'sole' | 'detail' | 'foot' | 'packaging';
}

export interface CharmOption {
  supported: boolean;
  enabledByDefault?: boolean;
  charmType?: 'heart';
  supportsEngraving?: boolean;
  maxEngravingLength?: number;
}

export interface Product {
  name: string;
  slug: string;
  collection: string;
  price: number;
  compare_at_price?: number;
  currency: 'NGN' | 'USD';
  images: ProductImage[];
  colour: string;
  colourHex?: string;
  sizes: ProductSize[];
  stock: number; // Real remaining inventory (e.g. 2, 4)
  material: string;
  care: string;
  dimensions_weight?: string;
  description: string;
  design_note: string;
  charm_option: CharmOption;
  publish_status: 'published' | 'draft' | 'archived';
  fit_notes: string;
  shipping_notes: string;
}

export interface Collection {
  name: string;
  slug: string;
  title: string;
  short_intro: string;
  hero_image?: string;
  products: Product[];
  editorial_copy: string;
  publish_date: string;
  publish_status: 'published' | 'draft';
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  quantity: number;
  engravedText?: string;
  withHeartCharm?: boolean;
}

export interface DeliveryZone {
  id: string;
  name: string;
  description: string;
  fee: number;
  estimatedDays: string;
}

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zoneId: string;
  deliveryNotes?: string;
}

export type PaymentStatus =
  | 'idle'
  | 'processing'
  | 'success'
  | 'failed'
  | 'cancelled'
  | 'timed_out';

export interface Order {
  id: string; // e.g. "NVQ-2026-89104"
  createdAt: string;
  customer: CustomerDetails;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: 'NGN';
  status: 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'cancelled';
  payment: {
    status: PaymentStatus;
    reference: string;
    provider: 'paystack_mock' | 'paystack' | 'flutterwave';
    paidAt?: string;
    errorMessage?: string;
  };
  deliveryExpectation: string;
  notes?: string;
}

export interface PaymentInitResponse {
  orderId: string;
  reference: string;
  authorizationUrl?: string;
  amount: number;
  currency: string;
}
