import React from 'react';
import { cn } from '../../../utils/cn';

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-4',
};

/**
 * Spinner de carga reutilizable.
 */
export default function Spinner({ size = 'md', className = '' }) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-primary-500 border-t-transparent',
        sizes[size],
        className
      )}
      role="status"
      aria-label="Cargando"
    />
  );
}
