import React from 'react';
import { cn } from '../../../utils/cn';

const variants = {
  primary: 'bg-primary-500 hover:bg-primary-600 text-white border-transparent',
  secondary: 'bg-secondary-500 hover:bg-secondary-600 text-white border-transparent',
  outline: 'bg-transparent border-2 border-primary-500 text-primary-500 hover:bg-primary-50',
  ghost: 'bg-transparent hover:bg-neutral-100 text-neutral-700',
  danger: 'bg-red-500 hover:bg-red-600 text-white border-transparent',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

/**
 * Botón reutilizable con variantes y tamaños.
 * Patrón: componente presentacional con composición por props.
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
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}
