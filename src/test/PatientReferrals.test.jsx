import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

/* ── Mocks ─────────────────────────────────────────────────────── */

const { mockHttpGet } = vi.hoisted(() => ({
  mockHttpGet: vi.fn(),
}));

vi.mock('../services/api/http', () => ({
  http: {
    get: mockHttpGet,
  },
}));

vi.mock('../services/api/endpoints', () => ({
  endpoints: {
    referrals: {
      list: '/api/referrals',
    },
    specialties: {
      list: '/api/specialties',
    },
  },
}));

vi.mock('../components/layout', () => ({
  PageContainer: ({ children }) => <div>{children}</div>,
}));

vi.mock('../components/ui', () => ({
  Alert: ({ variant, title, children }) => (
    <div data-testid="alert" data-variant={variant}>
      <strong>{title}</strong>
      {children}
    </div>
  ),
  Badge: ({ variant, children }) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
  DataTable: ({
    columns,
    data,
    loading,
    onReload,
    pagination,
    keyExtractor,
    emptyMessage,
  }) => (
    <div data-testid="datatable">
      {loading ? (
        <div data-testid="loading">Cargando...</div>
      ) : data.length === 0 ? (
        <div data-testid="empty-message">{emptyMessage}</div>
      ) : (
        <table data-testid="referrals-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={keyExtractor(row)}>
                {columns.map((col) => (
                  <td key={col.key} data-testid={`cell-${col.key}`}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div data-testid="pagination-info">
        Page: {pagination?.page}, PageSize: {pagination?.pageSize}, Total: {pagination?.total}
      </div>
      <button data-testid="reload-button" onClick={onReload}>
        Recargar
      </button>
    </div>
  ),
}));

vi.mock('../services/auth/AuthContext', async () => {
  const { createContext } = await import('react');
  return { AuthContext: createContext(null) };
});

import { AuthContext } from '../services/auth/AuthContext';
import PatientReferrals from '../pages/patient/PatientReferrals';

/* ── Helpers ───────────────────────────────────────────────────── */

const mockReferralsData = [
  {
    id_remision: 1,
    expiracion: '2026-12-31',
    id_paciente: 10,
    id_registro: 5,
    id_especialidad: 3,
  },
  {
    id_remision: 2,
    expiracion: '2024-01-15', // Fecha pasada = expirada
    id_paciente: 10,
    id_registro: 6,
    id_especialidad: 1,
  },
];

const mockSpecialties = [
  { id_especialidad: 1, nombre_especialidad: 'Neurología' },
  { id_especialidad: 3, nombre_especialidad: 'Cardiología' },
];

const mockReferralsResponse = {
  hasError: false,
  message: 'Success',
  data: mockReferralsData,
};

const mockEmptyResponse = {
  hasError: false,
  message: 'Success',
  data: [],
};

const mockErrorResponse = {
  hasError: true,
  message: 'Error al cargar remisiones',
  data: null,
};

const mockAuthValue = {
  payload: { num_documento: 10 },
};

function renderPatientReferrals() {
  return render(
    <AuthContext.Provider value={mockAuthValue}>
      <MemoryRouter>
        <PatientReferrals />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

/* ── Tests ─────────────────────────────────────────────────────── */

describe('PatientReferrals', () => {
  beforeEach(() => {
    mockHttpGet.mockClear();
    // Por defecto: mockea especialidades exitosamente
    mockHttpGet.mockImplementation((endpoint) => {
      if (endpoint.includes('/api/specialties')) {
        return Promise.resolve({ data: mockSpecialties });
      }
      if (endpoint === '/api/referrals') {
        return Promise.resolve({ data: mockReferralsResponse });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  describe('render', () => {
    it('debe renderizar el título', async () => {
      renderPatientReferrals();

      await waitFor(() => {
        expect(screen.getByText('Mis remisiones')).toBeInTheDocument();
      });
    });

    it('debe renderizar la descripción', async () => {
      renderPatientReferrals();

      await waitFor(() => {
        expect(screen.getByText('Revisa tus remisiones a otras especialidades.')).toBeInTheDocument();
      });
    });

    it('debe renderizar la DataTable', async () => {
      renderPatientReferrals();

      await waitFor(() => {
        expect(screen.getByTestId('datatable')).toBeInTheDocument();
      });
    });
  });

  describe('data loading', () => {
    it('debe cargar remisiones al montar', async () => {
      renderPatientReferrals();

      await waitFor(() => {
        // mockHttpGet es llamado 2 veces: especialidades + remisiones
        // Verificar que una de las llamadas es al endpoint de remisiones con query param
        const calls = mockHttpGet.mock.calls;
        const hasReferralsCall = calls.some((call) =>
          call[0] === '/api/referrals' && call[1]?.params?.id_paciente === 10
        );
        expect(hasReferralsCall).toBe(true);
      });
    });

    it('debe mostrar remisiones cuando la carga es exitosa', async () => {
      renderPatientReferrals();

      await waitFor(() => {
        expect(screen.getByTestId('referrals-table')).toBeInTheDocument();
      });
    });

    it('debe mostrar tabla vacía cuando no hay remisiones', async () => {
      mockHttpGet.mockImplementation((endpoint) => {
        if (endpoint.includes('/api/specialties')) {
          return Promise.resolve({ data: mockSpecialties });
        }
        if (endpoint === '/api/referrals') {
          return Promise.resolve({ data: mockEmptyResponse });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      renderPatientReferrals();

      await waitFor(() => {
        expect(screen.getByTestId('empty-message')).toBeInTheDocument();
        expect(screen.getByText('No tienes remisiones para mostrar.')).toBeInTheDocument();
      });
    });

    it('debe mostrar mensaje de error cuando hasError es true', async () => {
      mockHttpGet.mockImplementation((endpoint) => {
        if (endpoint.includes('/api/specialties')) {
          return Promise.resolve({ data: mockSpecialties });
        }
        return Promise.resolve({ data: mockErrorResponse });
      });

      renderPatientReferrals();

      await waitFor(() => {
        const alert = screen.getByTestId('alert');
        expect(alert).toHaveAttribute('data-variant', 'error');
        expect(screen.getByText('Error al cargar remisiones')).toBeInTheDocument();
      });
    });

    it('debe mostrar mensaje de error en caso de excepción en http.get', async () => {
      mockHttpGet.mockImplementation((endpoint) => {
        if (endpoint.includes('/api/specialties')) {
          return Promise.resolve({ data: mockSpecialties });
        }
        return Promise.reject(new Error('Network error'));
      });

      renderPatientReferrals();

      await waitFor(() => {
        const alert = screen.getByTestId('alert');
        expect(alert).toHaveAttribute('data-variant', 'error');
        expect(screen.getByText(/No fue posible cargar/)).toBeInTheDocument();
      });
    });
  });

  describe('columns configuration', () => {
    it('debe tener columnas: ID Remisión, Especialidad, ID Registro, Expiración, Estado', async () => {
      renderPatientReferrals();

      await waitFor(() => {
        const table = screen.getByTestId('referrals-table');
        const headers = table.querySelectorAll('th');
        const headerTexts = Array.from(headers).map((h) => h.textContent);

        expect(headerTexts).toContain('ID Remisión');
        expect(headerTexts).toContain('Especialidad');
        expect(headerTexts).toContain('ID Registro');
        expect(headerTexts).toContain('Expiración');
        expect(headerTexts).toContain('Estado');
      });
    });
  });

  describe('vigencia calculation', () => {
    it('debe mostrar "Vigente" para remisión con expiracion futura', async () => {
      renderPatientReferrals();

      await waitFor(() => {
        const badges = screen.getAllByTestId('badge');
        // Primera remisión (id_remision=1) tiene expiracion futura
        expect(badges.length).toBeGreaterThan(0);
        expect(badges[0]).toHaveTextContent('Vigente');
      });
    });

    it('debe mostrar "Expirada" para remisión con expiracion pasada', async () => {
      renderPatientReferrals();

      await waitFor(() => {
        const badges = screen.getAllByTestId('badge');
        // Segunda remisión (id_remision=2) tiene expiracion pasada
        expect(badges.length).toBeGreaterThanOrEqual(2);
        expect(badges[1]).toHaveTextContent('Expirada');
      });
    });
  });

  describe('specialty mapping', () => {
    it('debe mostrar nombre de especialidad en lugar de ID', async () => {
      renderPatientReferrals();

      await waitFor(() => {
        const table = screen.getByTestId('referrals-table');
        // Primera remisión tiene id_especialidad=3 -> Cardiología
        expect(table.textContent).toContain('Cardiología');
        // Segunda remisión tiene id_especialidad=1 -> Neurología
        expect(table.textContent).toContain('Neurología');
      });
    });
  });

  describe('pagination client-side', () => {
    it('debe paginar resultados del lado del cliente', async () => {
      // Crea 15 remisiones para probar paginación (pageSize=10)
      const many = Array.from({ length: 15 }, (_, i) => ({
        id_remision: i + 1,
        expiracion: '2026-12-31',
        id_paciente: 10,
        id_registro: i,
        id_especialidad: 1,
      }));

      mockHttpGet.mockImplementation((endpoint) => {
        if (endpoint.includes('/api/specialties')) {
          return Promise.resolve({ data: mockSpecialties });
        }
        return Promise.resolve({
          data: { hasError: false, message: 'Success', data: many },
        });
      });

      renderPatientReferrals();

      await waitFor(() => {
        const paginationInfo = screen.getByTestId('pagination-info');
        expect(paginationInfo).toHaveTextContent('Total: 15');
      });
    });
  });

  describe('reload', () => {
    it('debe recargar datos cuando se presiona el botón recargar', async () => {
      renderPatientReferrals();

      await waitFor(() => {
        expect(screen.getByTestId('reload-button')).toBeInTheDocument();
      });

      const reloadButton = screen.getByTestId('reload-button');
      await userEvent.click(reloadButton);

      await waitFor(() => {
        // Llamada 1: mount, Llamada 2: reload, Llamada 3+ especialidades
        expect(mockHttpGet).toHaveBeenCalledTimes(3);
      });
    });
  });
});
