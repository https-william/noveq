'use client';

import React from 'react';
import { trackEvent } from '@/lib/analytics';

interface WhatsAppLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  placement: string;
  orderId?: string;
  children: React.ReactNode;
}

export function WhatsAppLink({
  placement,
  orderId,
  children,
  onClick,
  ...props
}: WhatsAppLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    trackEvent('click_whatsapp', {
      placement,
      order_id: orderId,
    });
    if (onClick) onClick(e);
  };

  return (
    <a {...props} onClick={handleClick}>
      {children}
    </a>
  );
}
