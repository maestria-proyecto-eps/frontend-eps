import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ConsultationTimeline from '../ConsultationTimeline';

vi.mock('../ConsultationItem', () => ({
  default: ({ consultation, isLast }) => (
    <div data-testid={`consultation-item-${consultation.id_consulta}`}>
      <span>{consultation.nombre_doctor}</span>
      <span>{consultation.motivo_consulta}</span>
    </div>
  ),
}));

describe('ConsultationTimeline', () => {
  it('debe renderizar el timeline con consultas', () => {
    const consultations = [
      {
        id_consulta: 1,
        nombre_doctor: 'Dr. García',
        motivo_consulta: 'Dolor de cabeza',
        fecha_consulta: '2026-04-15',
      },
      {
        id_consulta: 2,
        nombre_doctor: 'Dra. López',
        motivo_consulta: 'Chequeo general',
        fecha_consulta: '2026-03-20',
      },
    ];

    render(<ConsultationTimeline consultations={consultations} />);

    expect(screen.getByText('Dr. García')).toBeInTheDocument();
    expect(screen.getByText('Dra. López')).toBeInTheDocument();
  });

  it('debe renderizar estado vacío cuando no hay consultas', () => {
    render(<ConsultationTimeline consultations={[]} />);

    expect(screen.getByText(/Sin historia clínica/i)).toBeInTheDocument();
    expect(
      screen.getByText(/No tienes consultas registradas/i)
    ).toBeInTheDocument();
  });

  it('debe renderizar estado vacío cuando consultations es null', () => {
    render(<ConsultationTimeline consultations={null} />);

    expect(screen.getByText(/Sin historia clínica/i)).toBeInTheDocument();
  });

  it('debe renderi zar estado vacío cuando consultations es undefined', () => {
    render(<ConsultationTimeline />);

    expect(screen.getByText(/Sin historia clínica/i)).toBeInTheDocument();
  });
});
