import React, { useEffect } from 'react';
import { cn } from '../../../utils/cn';

/**
 * Modal reutilizable con overlay, título y contenido.
 * Usa el sistema de diseño del proyecto.
 */
export default function Modal({
  open = false,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  className = '',
}) {
  useEffect(() => {
    if (open) {
      const handleEscape = (e) => e.key === 'Escape' && onClose?.();
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [open, onClose]);

  if (!open) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      <div
        className={cn(
          'relative w-full bg-white rounded-xl border border-neutral-200 shadow-xl overflow-hidden',
          sizeClasses[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
            <h2 id="modal-title" className="text-lg font-semibold text-neutral-800">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Cerrar"
            >
              <span className="text-xl leading-none">×</span>
            </button>
          </div>
        )}
        <div className="px-6 py-4">{children}</div>
        {footer != null && (
          <div className="border-t border-neutral-200 px-6 py-4 bg-neutral-50 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
