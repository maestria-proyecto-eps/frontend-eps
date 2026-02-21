import React from 'react';
import { Container } from '../../ui';
import { cn } from '../../../utils/cn';

/**
 * Envuelve el contenido de una página con Container y espaciado estándar.
 */
export default function PageContainer({
  children,
  className = '',
  maxWidth = 'lg',
  ...props
}) {
  return (
    <Container maxWidth={maxWidth} className={cn('py-8 md:py-12', className)} {...props}>
      {children}
    </Container>
  );
}
