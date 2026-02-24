import React from 'react';
import { cn } from '../../../utils/cn';

const variants = {
  success: 'bg-success-50 border-success-200 text-success-800',
  warning: 'bg-accent-50 border-accent-200 text-accent-800',
  error: 'bg-emergency-50 border-emergency-200 text-emergency-800',
  info: 'bg-secondary-50 border-secondary-200 text-secondary-800',
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
