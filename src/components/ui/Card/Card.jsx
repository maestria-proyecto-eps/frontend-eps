import React from 'react';
import { cn } from '../../../utils/cn';

/**
 * Card contenedor. Patrón compound: Card, Card.Header, Card.Body, Card.Footer
 */
function CardRoot({ children, className = '', padding = true, ...props }) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden',
        padding && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={cn('border-b border-neutral-200 pb-4 mb-4', className)} {...props}>
      {children}
    </div>
  );
}

function CardBody({ children, className = '', ...props }) {
  return <div className={cn('', className)} {...props}>{children}</div>;
}

function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={cn('border-t border-neutral-200 pt-4 mt-4', className)} {...props}>
      {children}
    </div>
  );
}

const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});

export default Card;
