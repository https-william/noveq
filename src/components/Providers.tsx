'use client';

import React from 'react';
import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/Cart/CartDrawer';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
    </CartProvider>
  );
}
