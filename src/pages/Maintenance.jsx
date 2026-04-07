import React from 'react';
import { PageContainer } from '../components/layout';
import { Card } from '../components/ui';

export default function Maintenance() {
  return (
    <PageContainer>
      <Card>
        <Card.Body>
          <h1 className="text-2xl font-bold text-neutral-800">Módulo en mantenimiento</h1>
          <p className="mt-2 text-neutral-600">
            Esta página aún no está implementada. Estamos trabajando para habilitarla pronto.
          </p>
        </Card.Body>
      </Card>
    </PageContainer>
  );
}

