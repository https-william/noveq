'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '@/types/commerce';
import { trackEvent } from '@/lib/analytics';

export interface AddToCartOptions {
  engravedText?: string;
  withHeartCharm?: boolean;
  selectedColour?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, size: string, quantity?: number, options?: AddToCartOptions) => void;
  removeFromCart: (slug: string, size: string, colour?: string) => void;
  restoreLastRemoved: () => void;
  lastRemovedItem: CartItem | null;
  dismissUndo: () => void;
  updateQuantity: (slug: string, size: string, quantity: number, colour?: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [lastRemovedItem, setLastRemovedItem] = useState<CartItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load from local storage if available and refresh live product prices
  useEffect(() => {
    try {
      const stored = localStorage.getItem('noveq_cart');
      if (stored) {
        setCartItems(JSON.parse(stored));
      }
    } catch {
      // Ignore storage errors
    }

    // Refresh pricing and availability against authoritative endpoint
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.products) && data.products.length > 0) {
          const liveMap = new Map<string, Product>();
          data.products.forEach((p: Product) => liveMap.set(p.slug, p));

          setCartItems((prev) =>
            prev.map((item) => {
              const live = liveMap.get(item.product.slug);
              if (live) {
                return {
                  ...item,
                  product: {
                    ...item.product,
                    price: live.price,
                    compare_at_price: live.compare_at_price,
                    stock: live.stock,
                  },
                };
              }
              return item;
            })
          );
        }
      })
      .catch(() => {});
  }, []);

  // Save to local storage on change
  useEffect(() => {
    try {
      localStorage.setItem('noveq_cart', JSON.stringify(cartItems));
    } catch {
      // Ignore
    }
  }, [cartItems]);

  const addToCart = (
    product: Product,
    size: string,
    quantity = 1,
    options?: AddToCartOptions
  ) => {
    const chosenColour = options?.selectedColour || product.colour;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.slug === product.slug &&
          item.selectedSize === size &&
          (item.selectedColour === chosenColour || (!item.selectedColour && chosenColour === product.colour))
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
          engravedText: options?.engravedText ?? next[existingIndex].engravedText,
          withHeartCharm: options?.withHeartCharm ?? next[existingIndex].withHeartCharm,
        };
        return next;
      }

      return [
        ...prev,
        {
          product,
          selectedSize: size,
          selectedColour: chosenColour,
          quantity,
          engravedText: options?.engravedText,
          withHeartCharm: options?.withHeartCharm,
        },
      ];
    });

    // Dismiss any existing undo state
    setLastRemovedItem(null);

    // Track analytics event: add_to_cart
    trackEvent('add_to_cart', {
      currency: product.currency,
      value: product.price * quantity,
      items: [
        {
          item_id: product.slug,
          item_name: product.name,
          price: product.price,
          quantity,
          item_variant: `${size} - ${chosenColour}`,
        },
      ],
    });

    // Auto open drawer confirmation
    setIsDrawerOpen(true);
  };

  const removeFromCart = (slug: string, size: string, colour?: string) => {
    const itemToRemove = cartItems.find(
      (item) =>
        item.product.slug === slug &&
        item.selectedSize === size &&
        (!colour || item.selectedColour === colour || (!item.selectedColour && colour === item.product.colour))
    );

    if (itemToRemove) {
      setLastRemovedItem(itemToRemove);
      setCartItems((prev) => prev.filter((item) => item !== itemToRemove));
    }
  };

  const restoreLastRemoved = () => {
    if (!lastRemovedItem) return;
    setCartItems((prev) => [...prev, lastRemovedItem]);
    setLastRemovedItem(null);
  };

  const dismissUndo = () => {
    setLastRemovedItem(null);
  };

  const updateQuantity = (slug: string, size: string, quantity: number, colour?: string) => {
    if (quantity <= 0) {
      removeFromCart(slug, size, colour);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (
          item.product.slug === slug &&
          item.selectedSize === size &&
          (!colour || item.selectedColour === colour || (!item.selectedColour && colour === item.product.colour))
        ) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setLastRemovedItem(null);
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
    // Track view_cart analytics
    trackEvent('view_cart', {
      currency: 'NGN',
      value: subtotal,
      items: cartItems.map((item) => ({
        item_id: item.product.slug,
        item_name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        item_variant: `${item.selectedSize} - ${item.product.colour}`,
      })),
    });
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        restoreLastRemoved,
        lastRemovedItem,
        dismissUndo,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isDrawerOpen,
        openDrawer: handleOpenDrawer,
        closeDrawer: () => setIsDrawerOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
