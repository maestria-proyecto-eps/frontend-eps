import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PrescriptionList from '../PrescriptionList';

describe('PrescriptionList', () => {
  it('debe renderizar la lista de prescripciones', () => {
    const prescriptions = [
      {
        id_prescripcion: 1,
        nombre_compuesto: 'Ibupirac 400',
        nombre_generico: 'Ibuprofen',
        presentacion: 'Tableta 400mg',
        dosis: '400mg cada 8 horas',
      },
      {
        id_prescripcion: 2,
        nombre_compuesto: 'Amoxicilina 500',
        nombre_generico: 'Amoxicillin',
        presentacion: 'Cápsula 500mg',
        dosis: '500mg cada 6 horas',
      },
    ];

    render(<PrescriptionList prescriptions={prescriptions} />);

    expect(screen.getByText('Ibupirac 400')).toBeInTheDocument();
    expect(screen.getByText('(Ibuprofen)')).toBeInTheDocument();
    expect(screen.getByText('Amoxicilina 500')).toBeInTheDocument();
    expect(screen.getByText('(Amoxicillin)')).toBeInTheDocument();
  });

  it('debe mostrar formato correcto: Nombre Compuesto - Nombre Genérico', () => {
    const prescriptions = [
      {
        id_prescripcion: 1,
        nombre_compuesto: 'Ibupirac 400',
        nombre_generico: 'Ibuprofen',
        presentacion: 'Tableta 400mg',
        dosis: '400mg cada 8 horas',
      },
    ];

    render(<PrescriptionList prescriptions={prescriptions} />);

    expect(screen.getByText('Ibupirac 400')).toBeInTheDocument();
    expect(screen.getByText('(Ibuprofen)')).toBeInTheDocument();
    expect(screen.getByText(/Tableta 400mg/i)).toBeInTheDocument();
    expect(screen.getByText(/400mg cada 8 horas/i)).toBeInTheDocument();
  });

  it('debe mostrar estado vacío cuando no hay prescripciones', () => {
    render(<PrescriptionList prescriptions={[]} />);

    expect(screen.getByText(/Sin prescripciones en esta consulta/i)).toBeInTheDocument();
  });

  it('debe mostrar estado vacío cuando prescriptions es null', () => {
    render(<PrescriptionList prescriptions={null} />);

    expect(screen.getByText(/Sin prescripciones en esta consulta/i)).toBeInTheDocument();
  });

  it('debe mostrar estado vacío cuando prescriptions es undefined', () => {
    render(<PrescriptionList />);

    expect(screen.getByText(/Sin prescripciones en esta consulta/i)).toBeInTheDocument();
  });

  it('debe renderizar sin nombre genérico si no está disponible', () => {
    const prescriptions = [
      {
        id_prescripcion: 1,
        nombre_compuesto: 'Ibupirac 400',
        presentacion: 'Tableta 400mg',
        dosis: '400mg cada 8 horas',
      },
    ];

    render(<PrescriptionList prescriptions={prescriptions} />);

    expect(screen.getByText('Ibupirac 400')).toBeInTheDocument();
    expect(screen.queryByText(/\(/)).not.toBeInTheDocument();
  });
});
