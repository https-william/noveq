import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getOrderById } from '@/lib/orders';
import OrderReceiptClient from '@/components/Order/OrderReceiptClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ orderId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderId } = await params;
  return {
    title: `Official Receipt - Order ${orderId} | NOVEQ`,
    description: `Official 1-page allocation receipt for NOVEQ order ${orderId}.`,
    robots: { index: false, follow: false },
  };
}

export default async function OrderReceiptPage({ params }: Props) {
  const { orderId } = await params;
  const order = getOrderById(orderId);

  if (!order) {
    notFound();
  }

  return <OrderReceiptClient order={order} />;
}
