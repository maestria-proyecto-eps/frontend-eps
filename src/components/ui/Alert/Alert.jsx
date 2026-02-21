import React from 'react';
import { cn } from '../../../utils/cn';

const variants = {
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

/**
 * Alert para mensajes de feedback al usuario.
 */
export default function Alert({
  children,
  variant = 'info',
  title,
  className = '',
  ...props
}) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-lg border p-4',
        variants[variant],
        className
      )}
      {...props}
    >
      {title && <p className="font-semibold mb-1">{title}</p>}
      <div className="text-sm">{children}</div>
    </div>
  );
}
