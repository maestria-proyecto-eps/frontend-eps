import React from 'react';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { cn } from '../../../utils/cn';

/**
 * Layout principal: Header + contenido + Footer.
 * Patrón: Layout compuesto para páginas públicas.
 */
export default function MainLayout({ children, className = '', showHeader = true, showFooter = true }) {
  return (
    <div className={cn('min-h-screen flex flex-col bg-neutral-50', className)}>
      {showHeader && <Header />}
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
