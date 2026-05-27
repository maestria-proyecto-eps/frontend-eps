import React from 'react';
import { cn } from '../../../utils/cn';

const lightVariants = {
  primary: 'bg-primary-100 text-black',
  secondary: 'bg-secondary-100 text-black',
  success: 'bg-primary-100 text-black',
  warning: 'bg-accent-100 text-black',
  error: 'bg-emergency-100 text-black',
  neutral: 'bg-neutral-100 text-black',
  yellow: 'bg-amber-100 text-black',
  blue: 'bg-blue-100 text-black',
};

const darkVariants = {
  primary: 'bg-primary-700 text-white',
  secondary: 'bg-secondary-700 text-white',
  success: 'bg-primary-700 text-white',
  warning: 'bg-accent-800 text-white',
  error: 'bg-emergency-700 text-white',
  neutral: 'bg-neutral-700 text-white',
  yellow: 'bg-amber-700 text-white',
  blue: 'bg-blue-700 text-white',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

const iconSizes = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

/**
 * Badge para estados, categorías o etiquetas.
 * @param {string} children - Contenido del badge
 * @param {string} variant - Variante de color: primary|secondary|success|warning|error|neutral
 * @param {string} size - Tamaño: sm|md|lg
 * @param {boolean} dark - Si true, usa fondo oscuro con texto blanco. Si false (default), fondo claro con texto oscuro
 * @param {string} rightIcon - Icono Material a mostrar a la derecha
 * @param {string} className - Clases CSS adicionales
 */
export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  dark = false,
  rightIcon,
  className = '',
  ...props
}) {
  const variants = dark ? darkVariants : lightVariants;
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        'gap-1',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      <span>{children}</span>
      {rightIcon && (
        <span className={cn('material-icons', iconSizes[size])}>
          {rightIcon}
        </span>
      )}
    </span>
  );
}
