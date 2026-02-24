import React from 'react';
import { cn } from '../../../utils/cn';

/**
 * DatePicker reutilizable basado en <input type="date" />.
 * Soporta label, error, hint y modo controlado/no controlado.
 */
export default function DatePicker({
  label,
  error,
  hint,
  className = '',
  containerClassName = '',
  id,
  value,
  onChange,
  ...props
}) {
  const inputId = id || props.name || `date-${Math.random().toString(36).slice(2)}`;

  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value, e);
    }
  };

  return (
    <div className={cn('space-y-1', containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-neutral-700"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        type="date"
        value={value}
        onChange={handleChange}
        className={cn(
          'block w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 ' +
            'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 ' +
            'disabled:bg-neutral-100 disabled:cursor-not-allowed',
          error && 'border-emergency-500 focus:border-emergency-500 focus:ring-emergency-500',
          className
        )}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
        }
        {...props}
      />

      {error && (
        <p
          id={`${inputId}-error`}
          className="text-sm text-emergency-600"
          role="alert"
        >
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

