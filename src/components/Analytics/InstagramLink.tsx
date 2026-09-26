'use client';

import React from 'react';
import { trackEvent } from '@/lib/analytics';

interface InstagramLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  placement: string;
  children: React.ReactNode;
}

export function InstagramLink({
  placement,
  children,
  onClick,
  ...props
}: InstagramLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    trackEvent('click_instagram', {
      placement,
      handle: '@noveq',
    });
    if (onClick) onClick(e);
  };

  return (
    <a {...props} onClick={handleClick}>
      {children}
    </a>
  );
}
