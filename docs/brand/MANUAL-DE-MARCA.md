# Manual de marca — EPS

Documento de identidad visual y uso de la marca para la Entidad Promotora de Salud (EPS). Sirve como referencia para diseño, desarrollo y comunicaciones.

---

## 1. Introducción

Este manual define los elementos de identidad de la EPS y cómo aplicarlos de forma coherente en:

- Aplicación web y productos digitales
- Comunicaciones internas y externas
- Material impreso o audiovisual (cuando se definan)

El cumplimiento de estas pautas garantiza reconocimiento y consistencia de marca.

---

## 2. Nombre de la marca

- **Nombre oficial:** EPS (o el nombre comercial definido).
- En código se usa la constante `BRAND_NAME` (`src/constants/theme.js`).
- **Uso:** Siempre con la grafía aprobada. En interfaces: header, footer, títulos de contexto y mensajes de bienvenida.

---

## 3. Logo

### 3.1 Variantes

| Variante      | Uso principal                          | Archivo (en `public/`)   |
|---------------|----------------------------------------|---------------------------|
| **Horizontal**| Header, firmas, espacios anchos        | `logo-horizontal.svg`     |
| **Vertical**  | Espacios altos y estrechos             | `logo-vertical.svg`       |
| **B/N**       | Fondos oscuros, fotocopias, una tinta  | `logo-bn.svg`             |

### 3.2 Uso correcto

- **Fondo claro:** usar logo a color o logo B/N (negro).
- **Fondo oscuro:** usar logo B/N en blanco o versión clara si existe.
- Respetar **espacio libre** alrededor del logo (mínimo equivalente a la altura de la “E” del logotipo).
- Mantener **proporciones**: no deformar ni estirar.

### 3.3 Qué no hacer

- No cambiar los colores del logo (salvo variantes oficiales B/N).
- No añadir efectos (sombras, contornos, degradados) no aprobados.
- No colocar el logo sobre fondos de bajo contraste.
- No usar versiones pixeladas o de baja resolución.

### 3.4 Tamaños mínimos recomendados

- **Digital:** altura mínima ~24px para el logotipo principal.
- **Impreso:** consultar con diseño según soporte.

---

## 4. Paleta de colores

### 4.1 Color primario (azul — salud, confianza)

Uso: acciones principales, enlaces, elementos de foco, header.

| Nombre   | HEX       | RGB              |
|----------|-----------|------------------|
| Primary 50  | `#e6f4f8` | 230, 244, 248   |
| Primary 100 | `#b3dfe8` | 179, 223, 232   |
| Primary 200 | `#80cad9` | 128, 202, 217   |
| Primary 300 | `#4db5c9` | 77, 181, 201    |
| Primary 400 | `#26a3ba` | 38, 163, 186    |
| **Primary 500** | **`#0091ab`** | **0, 145, 171** |
| Primary 600 | `#007a91` | 0, 122, 145    |
| Primary 700 | `#006377` | 0, 99, 119     |
| Primary 800 | `#004d5e` | 0, 77, 94      |
| Primary 900 | `#003644` | 0, 54, 68      |

### 4.2 Color secundario (verde — bienestar, éxito)

Uso: confirmaciones, estados positivos, mensajes de éxito.

| Nombre   | HEX       | RGB              |
|----------|-----------|------------------|
| **Secondary 500** | **`#22c55e`** | **34, 197, 94** |
| Secondary 600 | `#16a34a` | 22, 163, 74    |

### 4.3 Colores de acento (semánticos)

| Uso      | Nombre  | HEX       |
|----------|---------|-----------|
| Éxito    | Success | `#22c55e` |
| Advertencia | Warning | `#eab308` |
| Error    | Error   | `#ef4444` |
| Información | Info  | `#3b82f6` |

### 4.4 Neutros (textos y fondos)

Para textos, bordes y fondos usar la escala de grises definida en el sistema (p. ej. neutral-50 a neutral-900 en `theme.js`). Mantener contraste accesible (texto sobre fondo según WCAG).

---

## 5. Tipografía

### 5.1 Familias

- **Títulos:** `var(--font-heading)` → system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif.
- **Cuerpo:** `var(--font-body)` → misma pila por defecto.

### 5.2 Tamaños (variables CSS)

| Variable     | Valor    | Uso recomendado   |
|--------------|----------|--------------------|
| `--text-h1`  | 2.25rem (36px) | Título principal |
| `--text-h2`  | 1.875rem (30px) | Secciones        |
| `--text-h3`  | 1.5rem (24px)  | Subtítulos       |
| `--text-lg`  | 1.125rem       | Destacados       |
| `--text-base`| 1rem           | Texto cuerpo     |
| `--text-sm`  | 0.875rem       | Texto secundario |
| `--text-xs`  | 0.75rem        | Etiquetas, hints |

### 5.3 Buenas prácticas

- Mantener jerarquía clara (h1 > h2 > h3).
- No usar más de dos familias en la misma pantalla salvo justificación.
- Asegurar contraste suficiente respecto al fondo.

---

## 6. Iconografía

- Usar un **conjunto único** de iconos en toda la aplicación (p. ej. Heroicons, Lucide o set propio en `public/brand/`).
- Mantener **mismo peso** (outline o filled) dentro de un mismo contexto (navegación, botones, listas).
- Tamaños coherentes por contexto (p. ej. 20–24px en navegación, 16px en listas).

---

## 7. Aplicación en producto digital

- **Header:** logo horizontal sobre fondo claro; botones y enlaces en primary.
- **Footer:** logo B/N o horizontal según fondo; textos en neutros.
- **Botones principales:** primary; secundarios en outline o secondary.
- **Estados:** success (verde), error (rojo), warning (ámbar), info (azul) según variables del sistema.
- Variables CSS en `src/index.css` (`:root`); en componentes usar preferentemente clases de Tailwind que referencien el tema.

Para más detalle técnico ver **Guía de aplicación en interfaces** (`GUIA-APLICACION.md`).

---

## 8. Archivos y recursos

| Recurso        | Ubicación                    |
|----------------|------------------------------|
| Logos (SVG)    | `public/` (ej. `logo-horizontal.svg`, `logo-bn.svg`, `logo-vertical.svg`) |
| Constantes JS  | `src/constants/theme.js`     |
| Variables CSS  | `src/index.css` (`:root`)    |
| Guía de aplicación | `docs/brand/GUIA-APLICACION.md` |

---

## 9. Contacto y actualizaciones

Para dudas sobre uso de marca o solicitud de nuevos recursos (variantes de logo, formatos), contactar al responsable de diseño o producto. Este manual debe actualizarse cuando se aprueben cambios en la identidad.
