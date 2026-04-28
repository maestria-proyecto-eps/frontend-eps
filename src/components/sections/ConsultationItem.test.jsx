import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ConsultationItem from '../ConsultationItem';
import { AuthContext } from '../../../services/auth/AuthContext';

vi.mock('../PrescriptionList', () => ({
  default: ({ prescriptions }) => (
    <div data-testid="prescription-list">
      {prescriptions && prescriptions.length > 0 ? (
        <div>{prescriptions.length} prescriptions</div>
      ) : (
        <div>Sin prescripciones</div>
      )}
    </div>
  ),
}));

const mockAuthContext = {
  payload: {
    num_documento: '12345678',
  },
};

describe('ConsultationItem', () => {
  it('debe mostrar información resumida en estado colapsado', () => {
    const consultation = {
      id_consulta: 1,
      fecha_consulta: '2026-04-15',
      nombre_doctor: 'Dr. García',
      motivo_consulta: 'Dolor de cabeza',
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <ConsultationItem consultation={consultation} />
      </AuthContext.Provider>
    );

    expect(screen.getByText(/Dr\. García/i)).toBeInTheDocument();
    expect(screen.getByText(/Dolor de cabeza/i)).toBeInTheDocument();
  });

  it('debe expandirse al hacer clic en el header', async () => {
    const consultation = {
      id_consulta: 1,
      fecha_consulta: '2026-04-15',
      nombre_doctor: 'Dr. García',
      motivo_consulta: 'Dolor de cabeza',
      notas: 'Reposo recomendado',
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <ConsultationItem consultation={consultation} />
      </AuthContext.Provider>
    );

    const header = screen.getByRole('button');
    fireEvent.click(header);

    await waitFor(() => {
      expect(screen.getByText(/Información de la Consulta/i)).toBeInTheDocument();
      expect(screen.getByText(/Reposo recomendado/i)).toBeInTheDocument();
    });
  });

  it('debe colapsarse al hacer clic nuevamente', async () => {
    const consultation = {
      id_consulta: 1,
      fecha_consulta: '2026-04-15',
      nombre_doctor: 'Dr. García',
      motivo_consulta: 'Dolor de cabeza',
      notas: 'Reposo recomendado',
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <ConsultationItem consultation={consultation} />
      </AuthContext.Provider>
    );

    const header = screen.getByRole('button');

    // Expandir
    fireEvent.click(header);
    await waitFor(() => {
      expect(screen.getByText(/Información de la Consulta/i)).toBeInTheDocument();
    });

    // Colapsar
    fireEvent.click(header);
    await waitFor(() => {
      expect(
        screen.queryByText(/Información de la Consulta/i)
      ).not.toBeInTheDocument();
    });
  });

  it('debe mostrar prescripciones cuando se expande', async () => {
    const consultation = {
      id_consulta: 1,
      fecha_consulta: '2026-04-15',
      nombre_doctor: 'Dr. García',
      motivo_consulta: 'Dolor de cabeza',
      prescripciones: [
        {
          id_prescripcion: 1,
          nombre_compuesto: 'Ibupirac 400',
          presentacion: 'Tableta 400mg',
          dosis: '400mg cada 8 horas',
        },
      ],
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <ConsultationItem consultation={consultation} />
      </AuthContext.Provider>
    );

    const header = screen.getByRole('button');
    fireEvent.click(header);

    await waitFor(() => {
      expect(screen.getByTestId('prescription-list')).toBeInTheDocument();
      expect(screen.getByText(/1 prescriptions/i)).toBeInTheDocument();
    });
  });

  it('debe mostrar estado vacío de prescripciones cuando no hay', async () => {
    const consultation = {
      id_consulta: 1,
      fecha_consulta: '2026-04-15',
      nombre_doctor: 'Dr. García',
      motivo_consulta: 'Dolor de cabeza',
      prescripciones: [],
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <ConsultationItem consultation={consultation} />
      </AuthContext.Provider>
    );

    const header = screen.getByRole('button');
    fireEvent.click(header);

    await waitFor(() => {
      expect(screen.getByText(/Sin prescripciones/i)).toBeInTheDocument();
    });
  });

  it('debe mostrar solo la sección de notas si existen', async () => {
    const consultation = {
      id_consulta: 1,
      fecha_consulta: '2026-04-15',
      nombre_doctor: 'Dr. García',
      motivo_consulta: 'Dolor de cabeza',
      notas: 'Reposo recomendado',
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <ConsultationItem consultation={consultation} />
      </AuthContext.Provider>
    );

    const header = screen.getByRole('button');
    fireEvent.click(header);

    await waitFor(() => {
      expect(screen.getByText(/Notas e Indicaciones/i)).toBeInTheDocument();
      expect(screen.getByText(/Reposo recomendado/i)).toBeInTheDocument();
    });
  });

  it('debe omitir la hora si no está disponible', () => {
    const consultation = {
      id_consulta: 1,
      fecha_consulta: '2026-04-15',
      nombre_doctor: 'Dr. García',
      motivo_consulta: 'Dolor de cabeza',
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <ConsultationItem consultation={consultation} />
      </AuthContext.Provider>
    );

    // Debería mostrar el formato de fecha pero no la hora
    expect(screen.getByText(/Dr\. García/i)).toBeInTheDocument();
  });
});
