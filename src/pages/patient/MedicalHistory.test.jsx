import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MedicalHistory from '../MedicalHistory';
import { AuthContext } from '../../../services/auth/AuthContext';
import * as httpModule from '../../../services/api/http';

// Mock del módulo http
vi.mock('../../../services/api/http', () => ({
  http: {
    get: vi.fn(),
  },
}));

// Mock de react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Datos mock
const mockConsultations = [
  {
    id_consulta: 1,
    fecha_consulta: '2026-04-15',
    nombre_doctor: 'Dr. García',
    motivo_consulta: 'Dolor de cabeza',
    diagnostico: 'Migraña',
    hora_inicio: '10:00:00',
    id_doctor: 1,
    notas: 'Reposo recomendado',
    prescripciones: [
      {
        id_prescripcion: 1,
        nombre_compuesto: 'Ibupirac 400',
        nombre_generico: 'Ibuprofen',
        presentacion: 'Tableta 400mg',
        dosis: '400mg cada 8 horas',
      },
    ],
  },
  {
    id_consulta: 2,
    fecha_consulta: '2026-03-20',
    nombre_doctor: 'Dra. López',
    motivo_consulta: 'Chequeo general',
    diagnostico: 'Sin hallazgos',
    hora_inicio: '14:30:00',
    id_doctor: 2,
    notas: '',
    prescripciones: [],
  },
];

const mockAuthContext = {
  token: 'mock-token',
  role: 'Paciente',
  payload: {
    num_documento: '12345678',
    role: 'Paciente',
  },
  isAuthenticated: true,
};

describe('MedicalHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar el spinner durante la carga', async () => {
    httpModule.http.get.mockImplementation(
      () => new Promise(() => {}) // Nunca resuelve para mantener el loading
    );

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MedicalHistory />
      </AuthContext.Provider>
    );

    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('debe mostrar error cuando falla la carga', async () => {
    httpModule.http.get.mockRejectedValue({
      response: { status: 500 },
      message: 'Server error',
    });

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MedicalHistory />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Error al cargar el historial clínico/i)
      ).toBeInTheDocument();
    });
  });

  it('debe mostrar error de sesión expirada si el token es inválido', async () => {
    httpModule.http.get.mockRejectedValue({
      response: { status: 401 },
    });

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MedicalHistory />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Sesión expirada/i)
      ).toBeInTheDocument();
    });
  });

  it('debe llamar al endpoint con el ID del paciente correcto', async () => {
    httpModule.http.get.mockResolvedValue({
      data: mockConsultations,
    });

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MedicalHistory />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(httpModule.http.get).toHaveBeenCalledWith(
        '/api/pattient/12345678/medical-history'
      );
    });
  });

  it('debe renderizar el timeline con las consultas cargadas', async () => {
    httpModule.http.get.mockResolvedValue({
      data: mockConsultations,
    });

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MedicalHistory />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Dr\. García/i)).toBeInTheDocument();
      expect(screen.getByText(/Dra\. López/i)).toBeInTheDocument();
    });
  });

  it('debe mostrar estado vacío cuando no hay consultas', async () => {
    httpModule.http.get.mockResolvedValue({
      data: [],
    });

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MedicalHistory />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Sin historia clínica/i)
      ).toBeInTheDocument();
    });
  });

  it('debe filtrar por fecha desde', async () => {
    httpModule.http.get.mockResolvedValue({
      data: mockConsultations,
    });

    const { container } = render(
      <AuthContext.Provider value={mockAuthContext}>
        <MedicalHistory />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Dr\. García/i)).toBeInTheDocument();
    });

    const dateFromInput = container.querySelector('input[id="date-from"]');
    fireEvent.change(dateFromInput, { target: { value: '2026-04-01' } });

    await waitFor(() => {
      expect(screen.getByText(/Dr\. García/i)).toBeInTheDocument();
      expect(screen.queryByText(/Dra\. López/i)).not.toBeInTheDocument();
    });
  });

  it('debe filtrar por fecha hasta', async () => {
    httpModule.http.get.mockResolvedValue({
      data: mockConsultations,
    });

    const { container } = render(
      <AuthContext.Provider value={mockAuthContext}>
        <MedicalHistory />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Dr\. García/i)).toBeInTheDocument();
    });

    const dateToInput = container.querySelector('input[id="date-to"]');
    fireEvent.change(dateToInput, { target: { value: '2026-04-01' } });

    await waitFor(() => {
      expect(screen.queryByText(/Dr\. García/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Dra\. López/i)).toBeInTheDocument();
    });
  });

  it('debe filtrar por doctor', async () => {
    httpModule.http.get.mockResolvedValue({
      data: mockConsultations,
    });

    const { container } = render(
      <AuthContext.Provider value={mockAuthContext}>
        <MedicalHistory />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Dr\. García/i)).toBeInTheDocument();
    });

    const doctorSelect = container.querySelector('select[id="doctor-select"]');
    fireEvent.change(doctorSelect, { target: { value: 1 } });

    await waitFor(() => {
      expect(screen.getByText(/Dr\. García/i)).toBeInTheDocument();
      expect(screen.queryByText(/Dra\. López/i)).not.toBeInTheDocument();
    });
  });

  it('debe limpiar filtros y restaurar el listado completo', async () => {
    httpModule.http.get.mockResolvedValue({
      data: mockConsultations,
    });

    const { container } = render(
      <AuthContext.Provider value={mockAuthContext}>
        <MedicalHistory />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Dr\. García/i)).toBeInTheDocument();
    });

    // Aplicar filtro
    const doctorSelect = container.querySelector('select[id="doctor-select"]');
    fireEvent.change(doctorSelect, { target: { value: 1 } });

    await waitFor(() => {
      expect(screen.queryByText(/Dra\. López/i)).not.toBeInTheDocument();
    });

    // Limpiar filtros
    const clearBtn = screen.getByRole('button', { name: /Limpiar/i });
    fireEvent.click(clearBtn);

    await waitFor(() => {
      expect(screen.getByText(/Dr\. García/i)).toBeInTheDocument();
      expect(screen.getByText(/Dra\. López/i)).toBeInTheDocument();
    });
  });
});
