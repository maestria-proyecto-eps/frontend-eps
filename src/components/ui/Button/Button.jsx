import React from 'react';
import { cn } from '../../../utils/cn';

const variants = {
  primary: 'bg-primary-600 hover:bg-primary-700 hover:shadow-lg text-white border-transparent',
  secondary: 'bg-secondary-600 hover:bg-secondary-700 hover:shadow-lg text-white border-transparent',
  outline: 'bg-transparent border-2 border-primary-600 text-primary-700 hover:bg-primary-50 hover:border-primary-700 hover:shadow-lg transition-all',
  ghost: 'bg-transparent hover:bg-neutral-100 hover:shadow-lg text-neutral-700 border-transparent',
  danger: 'bg-red-600 hover:bg-red-700 hover:shadow-lg text-white border-transparent',
  disabled: 'bg-neutral-300 hover:bg-neutral-300 text-neutral-600 border-transparent cursor-not-allowed',
  highlight: 'bg-amber-500 hover:bg-amber-600 hover:shadow-lg text-white border-transparent',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5 text-base',
  lg: 'px-8 py-3.5 text-lg',
  xl: 'px-10 py-4 text-xl',
};

/**
 * Botón reutilizable con variantes y tamaños.
 * Patrón: componente presentacional con composición por props.
 * Soporta iconos de Material Icons (leftIcon, rightIcon).
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  fullWidth = false,
  className = '',
  leftIcon,
  rightIcon,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2',
        disabled ? variants.disabled : variants[variant],
        disabled ? 'focus:ring-neutral-300' : 'focus:ring-secondary-500',
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {leftIcon && <span className="shrink-0 flex items-center justify-center">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="shrink-0 flex items-center justify-center">{rightIcon}</span>}
    </button>
  );
}
