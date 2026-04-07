/**
 * Constantes de tema para la aplicación EPS.
 * Centraliza colores, espaciados y tokens de diseño.
 */
export const theme = {
  colors: {
    /* Primario – Verde: bienestar, prevención, atención médica */
    primary: {
      50: '#e6f7f4',
      100: '#b3ebdf',
      200: '#80dfca',
      300: '#4dd3b5',
      400: '#26c79e',
      500: '#009E7A',
      600: '#008566',
      700: '#006b52',
      800: '#00523e',
      900: '#00382a',
    },
    /* Secundario – Azul: respaldo, seguridad, formalidad institucional */
    secondary: {
      50: '#e8eef7',
      100: '#c5d4eb',
      200: '#9eb9df',
      300: '#769ed3',
      400: '#4a82c4',
      500: '#1E5AA8',
      600: '#1a4d91',
      700: '#16407a',
      800: '#123363',
      900: '#0d264b',
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
    /* Base neutra – fondo principal, formularios */
    white: '#FFFFFF',
    /* Acento – Amarillo: alertas preventivas, notificaciones, destacados */
    accent: '#F4B400',
    /* Emergencias – Rojo: urgencias, hospitalización, estados críticos */
    emergency: '#D32F2F',
    /* Semánticos (compatibilidad con componentes) */
    success: '#009E7A',
    warning: '#F4B400',
    error: '#D32F2F',
    info: '#1E5AA8',
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
export const BRAND_NAME = 'Cuidarte EPS';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  COMPONENTS: '/components',
  DOCTOR: '/doctor',
  USUARIOS: '/usuarios',
  DOCTOR_SCHEDULE: (id) => `/admin/doctors/${id}/schedule`,
};

export default theme;
