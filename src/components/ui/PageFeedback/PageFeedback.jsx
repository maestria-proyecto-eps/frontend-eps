import React from 'react';
import { createPortal } from 'react-dom';
import Alert, { FLOATING_ALERT_Z_INDEX } from '../Alert/Alert';
import { cn } from '../../../utils/cn';

/**
 * Mensajes de página (éxito, error, advertencia) flotantes sobre modales.
 */
export default function PageFeedback({
  message,
  error,
  warning,
  info,
  messageTitle,
  errorTitle = 'Error',
  warningTitle,
  infoTitle,
}) {
  const items = [];

  const infoContent = info ?? message;
  if (infoContent) {
    items.push({
      key: 'info',
      variant: 'info',
      title: messageTitle ?? infoTitle,
      content: infoContent,
    });
  }
  if (warning) {
    items.push({
      key: 'warning',
      variant: 'warning',
      title: warningTitle,
      content: warning,
    });
  }
  if (error) {
    items.push({
      key: 'error',
      variant: 'error',
      title: errorTitle,
      content: error,
    });
  }

  if (items.length === 0) return null;

  return createPortal(
    <div
      className={cn(
        'fixed top-4 left-0 right-0 flex flex-col items-center gap-2 px-4 pointer-events-none',
        FLOATING_ALERT_Z_INDEX
      )}
    >
      {items.map((item) => (
        <div key={item.key} className="pointer-events-auto w-full max-w-2xl">
          <Alert variant={item.variant} title={item.title} className="shadow-lg">
            {item.content}
          </Alert>
        </div>
      ))}
    </div>,
    document.body
  );
}
