import React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../../utils/cn';

const iconMap = {
  success: 'check_circle',
  warning: 'warning',
  error: 'error',
  info: 'info',
};

const variants = {
  success: 'bg-success-50 border-success-200 text-success-800',
  warning: 'bg-accent-50 border-accent-200 text-accent-800',
  error: 'bg-emergency-50 border-emergency-200 text-emergency-800',
  info: 'bg-secondary-50 border-secondary-200 text-secondary-800',
};

const iconColors = {
  success: 'text-success-800',
  warning: 'text-accent-800',
  error: 'text-emergency-800',
  info: 'text-secondary-800',
};

/** Por encima de modales (z-[100]) y header sticky (z-50). */
export const FLOATING_ALERT_Z_INDEX = 'z-[200]';

/**
 * Alert para mensajes de feedback al usuario.
 * Con `fixed`, se renderiza en portal al tope de la pantalla (visible sobre modales).
 */
export default function Alert({
  children,
  variant = 'info',
  title,
  action,
  dismissible = false,
  onDismiss,
  fixed = false,
  className = '',
  ...props
}) {
  const [visible, setVisible] = React.useState(true);

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  if (!visible) return null;

  const icon = iconMap[variant] ?? iconMap.info;

  const alertBody = (
    <div
      role="alert"
      className={cn(
        'rounded-xl border p-4 flex items-center gap-4',
        variants[variant] ?? variants.info,
        fixed && 'shadow-lg',
        className
      )}
      {...props}
    >
      <span className={cn('material-icons flex-shrink-0 text-xl', iconColors[variant])}>
        {icon}
      </span>

      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold text-sm mb-1">{title}</p>}
        <div className={cn('text-sm', title ? '' : 'font-medium')}>{children}</div>
      </div>

      <div className="flex-shrink-0 flex items-center gap-2">
        {action && <div>{action}</div>}
        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            className={cn(
              'p-1 rounded-lg inline-flex items-center justify-center',
              'hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2',
              iconColors[variant]
            )}
            style={{
              backgroundColor:
                variant === 'success'
                  ? 'rgba(32, 168, 109, 0.1)'
                  : variant === 'warning'
                    ? 'rgba(244, 168, 32, 0.1)'
                    : variant === 'error'
                      ? 'rgba(219, 44, 40, 0.1)'
                      : 'rgba(32, 168, 109, 0.1)',
            }}
            aria-label="Cerrar"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        )}
      </div>
    </div>
  );

  if (!fixed) return alertBody;

  return createPortal(
    <div
      className={cn(
        'fixed top-4 left-0 right-0 flex justify-center px-4 pointer-events-none',
        FLOATING_ALERT_Z_INDEX
      )}
    >
      <div className="pointer-events-auto w-full max-w-2xl">{alertBody}</div>
    </div>,
    document.body
  );
}
