import { describe, it, expect } from 'vitest';
import {
  buildPrescriptionApiPayload,
  getValidPrescriptionItems,
  validatePrescriptionItems,
} from '../components/prescriptions/prescriptionFormUtils';

describe('prescriptionFormUtils', () => {
  it('builds the prescription payload with id_atencion and sanitized items', () => {
    const payload = buildPrescriptionApiPayload(123, [
      {
        localId: 'a',
        codigo: '1001',
        dosis: ' 1 mg ',
        duracion: ' 3 ',
        cantidad: ' 2 ',
      },
      {
        localId: 'b',
        codigo: '1002',
        dosis: '',
        duracion: '4',
        cantidad: '1',
      },
    ]);

    expect(payload).toEqual({
      id_atencion: 123,
      tipo: 1,
      prescripciones_items: [
        {
          id_medicamento: 1001,
          dosis: '1 mg',
          duracion: '3',
          cantidad: 2,
        },
      ],
    });
  });

  it('keeps only complete prescription items', () => {
    const items = [
      {
        localId: 'a',
        codigo: '1001',
        dosis: '1 mg',
        duracion: '3',
        cantidad: '2',
      },
      {
        localId: 'b',
        codigo: '1002',
        dosis: '2 mg',
        duracion: '',
        cantidad: '',
      },
    ];

    expect(getValidPrescriptionItems(items)).toHaveLength(1);
  });

  it('flags incomplete prescription items', () => {
    const errors = validatePrescriptionItems(
      [
        {
          localId: 'a',
          codigo: '1001',
          dosis: '',
          duracion: '3',
          cantidad: '2',
        },
      ],
      {}
    );

    expect(errors).toMatchObject({
      a_dosis: 'La dosis es obligatoria.',
      a_principio_activo: 'Debe seleccionar un principio activo.',
    });
  });
});