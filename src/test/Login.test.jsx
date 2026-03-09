import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

/* ── Mocks ─────────────────────────────────────────────────────── */

const { mockNavigate, mockHttpPost } = vi.hoisted(() => ({   // ← CAMBIO
    mockNavigate: vi.fn(),
    mockHttpPost: vi.fn(),
  }));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});


vi.mock('../services/api/http', () => ({
  http: { post: mockHttpPost },
}));

vi.mock('../services/api/endpoints', () => ({
  endpoints: { auth: { login: '/auth/login' } },
}));

vi.mock('../components/layout', () => ({
  MainLayout: ({ children }) => <>{children}</>,
}));

vi.mock('../components/ui', () => ({
  Button: ({ children, disabled, type }) => (
    <button type={type} disabled={disabled}>{children}</button>
  ),
  Input: ({ error, rightIcon, onChange, value, placeholder, type, name, required }) => (
    <div>
      <input
        data-testid={name}
        name={name}
        type={type || 'text'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        aria-invalid={!!error}
      />
      {rightIcon}
      {error && <span role="alert">{error}</span>}
    </div>
  ),
  Card: Object.assign(
    ({ children }) => <div>{children}</div>,
    {
      Header: ({ children }) => <div>{children}</div>,
      Body:   ({ children }) => <div>{children}</div>,
    }
  ),
  Spinner: () => <span data-testid="spinner" />,
}));

vi.mock('../services/auth/AuthContext', async () => {
  const { createContext } = await import('react');
  return { AuthContext: createContext(null) };
});

import { AuthContext } from '../services/auth/AuthContext';
import Login from '../pages/auth/Login';

/* ── Helpers ───────────────────────────────────────────────────── */

function makeJwt(payload) {
  const encoded = btoa(JSON.stringify(payload));
  return `header.${encoded}.signature`;
}

const mockAuthLogin  = vi.fn();
const mockAuthLogout = vi.fn();
const authValue = { login: mockAuthLogin, logout: mockAuthLogout };

function renderLogin() {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

/* ── Tests ─────────────────────────────────────────────────────── */

describe('Login — render', () => {
  it('renderiza el título', () => {
    renderLogin();
    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument();
  });

  it('renderiza el campo de documento', () => {
    renderLogin();
    expect(screen.getByTestId('num_documento')).toBeInTheDocument();
  });

  it('renderiza el campo de contraseña', () => {
    renderLogin();
    expect(screen.getByTestId('password')).toBeInTheDocument();
  });

  it('renderiza el botón de submit con texto "Entrar"', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });
});

describe('Login — toggle contraseña', () => {
  it('el campo password empieza como tipo password', () => {
    renderLogin();
    expect(screen.getByTestId('password')).toHaveAttribute('type', 'password');
  });

  it('al hacer click en el toggle cambia a tipo text', async () => {
    renderLogin();
    const toggle = screen.getByLabelText(/mostrar contraseña/i);
    await userEvent.click(toggle);
    expect(screen.getByTestId('password')).toHaveAttribute('type', 'text');
  });

  it('al hacer click dos veces vuelve a password', async () => {
    renderLogin();
    const toggle = screen.getByLabelText(/mostrar contraseña/i);
    await userEvent.click(toggle);
    await userEvent.click(toggle);
    expect(screen.getByTestId('password')).toHaveAttribute('type', 'password');
  });
});

describe('Login — error del API (hasError)', () => {
  beforeEach(() => {
    mockHttpPost.mockResolvedValue({
      data: { hasError: true, Message: 'Credenciales inválidas' },
    });
  });

  it('muestra el mensaje de error del servidor', async () => {
    renderLogin();
    await userEvent.type(screen.getByTestId('num_documento'), '123456');
    await userEvent.type(screen.getByTestId('password'), 'pass123');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Credenciales inválidas');
    });
  });

  it('NO navega si hay error', async () => {
    renderLogin();
    await userEvent.type(screen.getByTestId('num_documento'), '123456');
    await userEvent.type(screen.getByTestId('password'), 'pass123');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => screen.getByRole('alert'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe('Login — error de red', () => {
  beforeEach(() => {
    mockHttpPost.mockRejectedValue(new Error('Network Error'));
  });

  it('muestra mensaje de error de conexión', async () => {
    renderLogin();
    await userEvent.type(screen.getByTestId('num_documento'), '123456');
    await userEvent.type(screen.getByTestId('password'), 'pass123');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Error de conexión');
    });
  });
});

describe('Login — login exitoso y navegación por rol', () => {
  const casos = [
    { role: 'Médico',         path: '/doctor'       },
    { role: 'Paciente',       path: '/patient'      },
    { role: 'Enfermero',      path: '/nurse'        },
    { role: 'Farmaceuta',     path: '/pharmacy'     },
    { role: 'Recepcionista',  path: '/receptionist' },
    { role: 'Talento Humano', path: '/hr'           },
  ];

  casos.forEach(({ role, path }) => {
    it(`navega a ${path} cuando el rol es "${role}"`, async () => {
      const token = makeJwt({ role, num_documento: '999' });
      mockHttpPost.mockResolvedValue({
        data: { hasError: false, Data: { access_token: token } },
      });
      mockNavigate.mockClear();
      mockAuthLogin.mockClear();

      renderLogin();
      await userEvent.type(screen.getByTestId('num_documento'), '123456');
      await userEvent.type(screen.getByTestId('password'), 'pass123');
      await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

      await waitFor(() => {
        expect(mockAuthLogin).toHaveBeenCalledWith(token);
        expect(mockNavigate).toHaveBeenCalledWith(path);
      });
    });
  });

  it('llama logout y muestra error si el rol no tiene permisos', async () => {
    const token = makeJwt({ role: 'Desconocido' });
    mockHttpPost.mockResolvedValue({
      data: { hasError: false, Data: { access_token: token } },
    });

    renderLogin();
    await userEvent.type(screen.getByTestId('num_documento'), '123456');
    await userEvent.type(screen.getByTestId('password'), 'pass123');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(mockAuthLogout).toHaveBeenCalled();
      expect(screen.getByRole('alert')).toHaveTextContent('no tiene permisos');
    });
  });
});

describe('Login — estado de carga', () => {
  it('muestra spinner mientras carga', async () => {
    mockHttpPost.mockImplementation(() => new Promise(() => {}));

    renderLogin();
    await userEvent.type(screen.getByTestId('num_documento'), '123456');
    await userEvent.type(screen.getByTestId('password'), 'pass123');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('el botón queda deshabilitado mientras carga', async () => {
    mockHttpPost.mockImplementation(() => new Promise(() => {}));

    renderLogin();
    await userEvent.type(screen.getByTestId('num_documento'), '123456');
    await userEvent.type(screen.getByTestId('password'), 'pass123');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(document.querySelector('button[type="submit"]')).toBeDisabled();
  });
});