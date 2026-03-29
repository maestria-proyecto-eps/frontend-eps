import React from 'react';
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

/**
 * Alert para mensajes de feedback al usuario.
 * Diseño moderno con icono a la izquierda, contenido centrado y acción (botón) a la derecha.
 * @param {string} children - Contenido del alert
 * @param {string} variant - Tipo: success|warning|error|info
 * @param {string} title - Título del alert
 * @param {ReactNode} action - Componente/botón a la derecha (opcional)
 * @param {boolean} dismissible - Si true, muestra botón X para cerrar
 * @param {function} onDismiss - Callback cuando se cierra
 */
export default function Alert({
  children,
  variant = 'info',
  title,
  action,
  dismissible = false,
  onDismiss,
  className = '',
  ...props
}) {
  const [visible, setVisible] = React.useState(true);

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  if (!visible) return null;

  const icon = iconMap[variant];

  return (
    <div
      role="alert"
      className={cn(
        'rounded-xl border p-4 flex items-center gap-4',
        variants[variant],
        className
      )}
      {...props}
    >
      {/* Icono a la izquierda */}
      <span className={cn('material-icons flex-shrink-0 text-xl', iconColors[variant])}>
        {icon}
      </span>

      {/* Contenido en el centro */}
      <div className="flex-1 min-w-0">
        {title && (
          <p className="font-semibold text-sm mb-1">{title}</p>
        )}
        <div className={cn('text-sm', title ? '' : 'font-medium')}>
          {children}
        </div>
      </div>

      {/* Acción a la derecha (botón o cerrar) */}
      <div className="flex-shrink-0 flex items-center gap-2">
        {action && (
          <div>
            {action}
          </div>
        )}
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
}
