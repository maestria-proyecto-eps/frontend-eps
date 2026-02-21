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

### 4.1 Color primario – Verde

Representa **bienestar, prevención y atención médica**.

**HEX:** `#009E7A` · **RGB:** 0, 158, 122

**Uso:** Botones principales (p. ej. Agendar cita), iconos médicos, estados activos, elementos del logo.

| Nombre   | HEX       | RGB              |
|----------|-----------|------------------|
| Primary 50  | `#e6f7f4` | 230, 247, 244   |
| Primary 100 | `#b3ebdf` | 179, 235, 223   |
| Primary 200 | `#80dfca` | 128, 223, 202   |
| Primary 300 | `#4dd3b5` | 77, 211, 181    |
| Primary 400 | `#26c79e` | 38, 199, 158    |
| **Primary 500** | **`#009E7A`** | **0, 158, 122** |
| Primary 600 | `#008566` | 0, 133, 102    |
| Primary 700 | `#006b52` | 0, 107, 82     |
| Primary 800 | `#00523e` | 0, 82, 62      |
| Primary 900 | `#00382a` | 0, 56, 42      |

### 4.2 Color secundario – Azul

Transmite **respaldo, seguridad y formalidad institucional**.

**HEX:** `#1E5AA8` · **RGB:** 30, 90, 168

**Uso:** Encabezados, tarjetas institucionales, títulos principales.

| Nombre   | HEX       | RGB              |
|----------|-----------|------------------|
| Secondary 50  | `#e8eef7` | 232, 238, 247   |
| Secondary 100 | `#c5d4eb` | 197, 212, 235   |
| Secondary 200 | `#9eb9df` | 158, 185, 223   |
| Secondary 300 | `#769ed3` | 118, 158, 211   |
| Secondary 400 | `#4a82c4` | 74, 130, 196    |
| **Secondary 500** | **`#1E5AA8`** | **30, 90, 168** |
| Secondary 600 | `#1a4d91` | 26, 77, 145    |
| Secondary 700 | `#16407a` | 22, 64, 122    |
| Secondary 800 | `#123363` | 18, 51, 99     |
| Secondary 900 | `#0d264b` | 13, 38, 75     |

### 4.3 Color acento – Amarillo

Aporta **dinamismo y resalta acciones importantes**.

**HEX:** `#F4B400` · **RGB:** 244, 180, 0

**Uso:** Alertas preventivas, notificaciones, elementos destacados.

### 4.4 Color emergencias – Rojo

Uso **exclusivo para urgencias y hospitalización**.

**HEX:** `#D32F2F` · **RGB:** 211, 47, 47

**Uso:** Botón “Urgencias”, estados críticos, alertas de riesgo.

### 4.5 Base neutra – Blanco

**HEX:** `#FFFFFF` · **RGB:** 255, 255, 255

**Uso:** Fondo principal, formularios.

### 4.6 Resumen semántico

| Uso           | Nombre    | HEX       |
|---------------|-----------|-----------|
| Primario      | Primary   | `#009E7A` |
| Secundario    | Secondary | `#1E5AA8` |
| Acento        | Accent    | `#F4B400` |
| Emergencias   | Emergency | `#D32F2F` |
| Base          | White     | `#FFFFFF` |

### 4.7 Neutros (textos y bordes)

Para textos, bordes y fondos secundarios se usa la escala de grises en `theme.js` (neutral-50 a neutral-900). Mantener contraste accesible (WCAG).

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
