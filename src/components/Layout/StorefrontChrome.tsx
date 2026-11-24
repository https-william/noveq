'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

interface StorefrontChromeProps {
  ribbon: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Hides consumer-facing storefront chrome (Black Friday ribbon, shopping nav, and footer)
 * on internal operational workspaces (/admin) and printable receipts (/receipt)
 * so each surface has clean, uncluttered visual hierarchy.
 */
export function StorefrontChrome({
  ribbon,
  header,
  footer,
  children,
}: StorefrontChromeProps) {
  const pathname = usePathname() || '';
  const isWorkspaceRoute =
    pathname.startsWith('/admin') || pathname.endsWith('/receipt');

  if (isWorkspaceRoute) {
    return (
      <main id="main-content" className="flex-1 focus:outline-none">
        {children}
      </main>
    );
  }

  return (
    <>
      {ribbon}
      {header}
      <main id="main-content" className="flex-1 focus:outline-none">
        {children}
      </main>
      {footer}
    </>
  );
}
