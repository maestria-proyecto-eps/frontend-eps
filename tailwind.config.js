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
        /* Acento – Amarillo: dinamismo, acciones destacadas */
        accent: {
          DEFAULT: '#F4B400',
          500: '#F4B400',
        },
        /* Emergencias – Rojo: urgencias, estados críticos */
        emergency: {
          DEFAULT: '#D32F2F',
          500: '#D32F2F',
        },
      },
    },
  },
  plugins: [],
}
