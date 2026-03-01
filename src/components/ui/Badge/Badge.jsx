import React from 'react';
import { cn } from '../../../utils/cn';

const variants = {
  primary: 'bg-primary-100 text-primary-800',
  secondary: 'bg-secondary-100 text-secondary-800',
  success: 'bg-primary-100 text-primary-800',
  /* Pendiente: fondo accent-40 (claro, un poco más oscuro), texto accent-800 */
  warning: 'bg-accent-40 text-accent-800',
  /* Rechazado: fondo emergency-25 (muy claro), texto emergency-800 */
  error: 'bg-emergency-25 text-emergency-800',
  neutral: 'bg-neutral-100 text-neutral-700',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

/**
 * Badge para estados, categorías o etiquetas.
 */
export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
