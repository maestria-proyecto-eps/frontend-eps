/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Primario – Verde: bienestar, prevención, atención médica */
        primary: {
          50: '#e6f7f4',
          100: '#b3ebdf',
          200: '#80dfca',
          500: '#009E7A',
          600: '#008566',
          700: '#006b52',
          800: '#00523e',
        },
        /* Secundario – Azul: respaldo, seguridad, formalidad institucional */
        secondary: {
          50: '#e8eef7',
          100: '#c5d4eb',
          200: '#9eb9df',
          500: '#1E5AA8',
          600: '#1a4d91',
          700: '#16407a',
          800: '#123363',
        },
        /* Acento – Amarillo: warning, pendiente (50/100/200/800 usados en Alert y Badge) */
        accent: {
          25: '#fffef5',  /* tono muy claro */
          40: '#fffce0',  /* Badge Pendiente: un poco más oscuro que 25 */
          50: '#fffde7',
          100: '#fff9c4',
          200: '#fff59d',
          800: '#b38f00',
        },
        /* Emergencias / Danger – Rojo: errores, desactivar (50/100/200/500/600/800 usados) */
        emergency: {
          25: '#fff5f5',  /* Badge Rechazado: tono muy claro */
          50: '#ffebee',
          100: '#ffcdd2',
          200: '#ef9a9a',
          500: '#D32F2F',
          600: '#c62828',
          800: '#8e0f0f',
        },
        /* Success – solo 50/200/800 usados en Alert (Badge success usa primary) */
        success: {
          50: '#e8f5e9',
          200: '#a5d6a7',
          800: '#2e7d32',
        },
        /* Neutral – Grises: textos, bordes, fondos neutros */
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
        },
      },
    },
  },
  plugins: [],
}
