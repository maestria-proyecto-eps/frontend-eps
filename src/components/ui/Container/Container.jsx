import React from 'react';
import { cn } from '../../../utils/cn';

const maxWidths = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  full: 'max-w-full',
};

/**
 * Contenedor centrado con ancho máximo para contenido.
 */
export default function Container({
  children,
  maxWidth = 'lg',
  className = '',
  ...props
}) {
  return (
    <div
      className={cn('mx-auto px-4 sm:px-6 lg:px-8', maxWidths[maxWidth], className)}
      {...props}
    >
      {children}
    </div>
  );
}
