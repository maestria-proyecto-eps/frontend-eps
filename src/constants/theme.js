/**
 * Constantes de tema para la aplicación EPS.
 * Centraliza colores, espaciados y tokens de diseño.
 */
export const theme = {
  colors: {
    primary: {
      50: '#e6f4f8',
      100: '#b3dfe8',
      200: '#80cad9',
      300: '#4db5c9',
      400: '#26a3ba',
      500: '#0091ab',  // Principal EPS - azul salud
      600: '#007a91',
      700: '#006377',
      800: '#004d5e',
      900: '#003644',
    },
    secondary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',  // Verde - bienestar
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    success: '#22c55e',
    warning: '#eab308',
    error: '#ef4444',
    info: '#3b82f6',
  },
  spacing: {
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    section: 'py-12 md:py-16',
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
};

/** Nombre de la EPS (identidad de marca) */
export const BRAND_NAME = 'EPS';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DOCTOR: '/doctor',
};

export default theme;
