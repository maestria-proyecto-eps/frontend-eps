import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConsultationFilters from '../ConsultationFilters';

describe('ConsultationFilters', () => {
  it('debe renderizar todos los campos de filtro', () => {
    const doctors = [
      { id_doctor: 1, nombre_doctor: 'Dr. García' },
      { id_doctor: 2, nombre_doctor: 'Dra. López' },
    ];

    render(
      <ConsultationFilters
        doctors={doctors}
        filters={{}}
        onFilterChange={() => {}}
      />
    );

    expect(screen.getByLabelText(/Desde/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Hasta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Médico/i)).toBeInTheDocument();
  });

  it('debe llamar onFilterChange al cambiar la fecha desde', () => {
    const onFilterChange = vi.fn();
    const doctors = [];

    render(
      <ConsultationFilters
        doctors={doctors}
        filters={{}}
        onFilterChange={onFilterChange}
      />
    );

    const dateFromInput = screen.getByLabelText(/Desde/i);
    fireEvent.change(dateFromInput, { target: { value: '2026-04-01' } });

    expect(onFilterChange).toHaveBeenCalledWith({
      dateFrom: '2026-04-01',
      dateTo: null,
      doctorId: null,
    });
  });

  it('debe llamar onFilterChange al cambiar la fecha hasta', () => {
    const onFilterChange = vi.fn();
    const doctors = [];

    render(
      <ConsultationFilters
        doctors={doctors}
        filters={{}}
        onFilterChange={onFilterChange}
      />
    );

    const dateToInput = screen.getByLabelText(/Hasta/i);
    fireEvent.change(dateToInput, { target: { value: '2026-04-30' } });

    expect(onFilterChange).toHaveBeenCalledWith({
      dateFrom: null,
      dateTo: '2026-04-30',
      doctorId: null,
    });
  });

  it('debe llamar onFilterChange al seleccionar un doctor', () => {
    const onFilterChange = vi.fn();
    const doctors = [
      { id_doctor: 1, nombre_doctor: 'Dr. García' },
      { id_doctor: 2, nombre_doctor: 'Dra. López' },
    ];

    render(
      <ConsultationFilters
        doctors={doctors}
        filters={{}}
        onFilterChange={onFilterChange}
      />
    );

    const doctorSelect = screen.getByLabelText(/Médico/i);
    fireEvent.change(doctorSelect, { target: { value: 1 } });

    expect(onFilterChange).toHaveBeenCalledWith({
      dateFrom: null,
      dateTo: null,
      doctorId: 1,
    });
  });

  it('debe renderizar opciones de doctores en el selector', () => {
    const doctors = [
      { id_doctor: 1, nombre_doctor: 'Dr. García' },
      { id_doctor: 2, nombre_doctor: 'Dra. López' },
    ];

    render(
      <ConsultationFilters
        doctors={doctors}
        filters={{}}
        onFilterChange={() => {}}
      />
    );

    expect(screen.getByText('Dr. García')).toBeInTheDocument();
    expect(screen.getByText('Dra. López')).toBeInTheDocument();
  });

  it('debe mostrar botón Limpiar cuando hay filtros activos', () => {
    const doctors = [];

    render(
      <ConsultationFilters
        doctors={doctors}
        filters={{ dateFrom: '2026-04-01', dateTo: null, doctorId: null }}
        onFilterChange={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: /Limpiar/i })).toBeInTheDocument();
  });

  it('no debe mostrar botón Limpiar cuando no hay filtros activos', () => {
    const doctors = [];

    render(
      <ConsultationFilters
        doctors={doctors}
        filters={{ dateFrom: null, dateTo: null, doctorId: null }}
        onFilterChange={() => {}}
      />
    );

    expect(screen.queryByRole('button', { name: /Limpiar/i })).not.toBeInTheDocument();
  });

  it('debe llamar onClearFilters al hacer clic en Limpiar', () => {
    const onClearFilters = vi.fn();
    const doctors = [];

    render(
      <ConsultationFilters
        doctors={doctors}
        filters={{ dateFrom: '2026-04-01', dateTo: null, doctorId: null }}
        onFilterChange={() => {}}
        onClearFilters={onClearFilters}
      />
    );

    const clearBtn = screen.getByRole('button', { name: /Limpiar/i });
    fireEvent.click(clearBtn);

    expect(onClearFilters).toHaveBeenCalled();
  });

  it('debe renderizar con valores de filtros existentes', () => {
    const doctors = [
      { id_doctor: 1, nombre_doctor: 'Dr. García' },
    ];

    const { container } = render(
      <ConsultationFilters
        doctors={doctors}
        filters={{
          dateFrom: '2026-04-01',
          dateTo: '2026-04-30',
          doctorId: 1,
        }}
        onFilterChange={() => {}}
      />
    );

    const dateFromInput = container.querySelector('input[id="date-from"]');
    const dateToInput = container.querySelector('input[id="date-to"]');
    const doctorSelect = container.querySelector('select[id="doctor-select"]');

    expect(dateFromInput.value).toBe('2026-04-01');
    expect(dateToInput.value).toBe('2026-04-30');
    expect(doctorSelect.value).toBe('1');
  });
});
