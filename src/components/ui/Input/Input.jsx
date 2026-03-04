import React, { useId } from 'react';
import { cn } from '../../../utils/cn';

/**
 * Input reutilizable con label, error y soporte para iconos.
 */
export default function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  className = '',
  containerClassName = '',
  id,
  ...props
}) {
  const reactId = useId();
  const inputId = id || props.name || `input-${reactId}`;

  return (
    <div className={cn('space-y-1', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            'block w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-neutral-100 disabled:cursor-not-allowed',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-emergency-500 focus:border-emergency-500 focus:ring-emergency-500',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-neutral-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-emergency-600" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-sm text-neutral-500">
          {hint}
        </p>
      )}
    </div>
  );
}
