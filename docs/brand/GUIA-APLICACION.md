# Guía de aplicación en interfaces

Resumen de cómo aplicar la identidad de marca en las pantallas del proyecto.

## Nombre de la EPS
- Usar la constante `BRAND_NAME` (o el nombre definido) en header, footer y títulos de contexto.

## Logo
- **Header**: logo horizontal, color (sobre fondo claro) o B/N (sobre fondo oscuro).
- **Favicon**: versión simplificada o icono.
- Assets en `docs/brand/assets/`.

## Paleta
- **Primario**: acciones principales, links, elementos de foco (variables `--color-primary-*`).
- **Secundario**: éxito, confirmaciones, bienestar (variables `--color-secondary-*`).
- **Acentos**: destacados puntuales (variables `--color-accent-*`).
- Colores semánticos: success, warning, error, info (variables CSS correspondientes).

## Tipografía
- **Títulos**: `--font-heading`, tamaños `--text-h1` a `--text-h3`.
- **Cuerpo**: `--font-body`, tamaños `--text-base`, `--text-sm`, `--text-lg`.
- Mantener jerarquía clara (h1 > h2 > h3) y contraste suficiente.

## Iconografía
- Usar un conjunto coherente (ej. Heroicons, Lucide, o set custom en `docs/brand/assets/`).
- Mismo peso y tamaño dentro de cada contexto (botones, listas, navegación).

## Variables CSS
- Todas las variables de diseño están en `src/index.css` (`:root`).
- En componentes, preferir clases de Tailwind que usen el tema; para casos puntuales, `var(--variable-name)`.
