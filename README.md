# EPS Frontend – React + Vite + Tailwind CSS

Este proyecto corresponde al frontend de una **EPS**, desarrollado con **React**, **Vite** y **Tailwind CSS**, con el objetivo de construir una interfaz moderna, rápida y mantenible para la gestión de servicios de salud.

---

## 🛠️ Tecnologías utilizadas

- **React** – Librería para construir interfaces de usuario
- **Vite** – Herramienta de desarrollo y build rápido
- **Tailwind CSS** – Framework de estilos utility-first
- **JavaScript (ES6+)**
- **PostCSS**

---

## 🚀 Instalación y ejecución

### 1️⃣ Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd frontend-eps
```

### 2️⃣ Instalar dependencias

```bash
npm install
```

### 3️⃣ Ejecutar en modo desarrollo

```bash
npm run dev
```

La aplicación estará disponible en:

```
http://localhost:5173
```

---

## 🎨 Estilos

Los estilos del proyecto se manejan principalmente con **Tailwind CSS**, utilizando clases utilitarias directamente en los componentes React.

Esto permite:
- Desarrollo rápido
- Menor cantidad de CSS personalizado
- Consistencia visual
- Fácil mantenimiento

---

## 📁 Organización del proyecto y patrones

El código se organiza por capas y responsabilidades, con patrones que facilitan la reutilización y el mantenimiento.

### Estructura principal

| Carpeta | Uso |
|--------|-----|
| `src/components/ui` | Componentes base reutilizables (Button, Input, Card, Badge, Container, Spinner, Alert). Presentacionales, configurados por props. |
| `src/components/layout` | Componentes de estructura de página: Header, Footer, MainLayout, PageContainer. |
| `src/constants` | Tema (colores, espaciados) y constantes de rutas (ROUTES). Una sola fuente de verdad para diseño y navegación. |
| `src/utils` | Utilidades (p. ej. `cn` para clases CSS condicionales). |
| `src/services/api` | Cliente HTTP (axios) y endpoints para consumir el API del backend (repositorio externo). |
| `src/services/auth` | Contexto de autenticación (AuthProvider) y rutas protegidas (ProtectedRoute). |
| `src/pages` | Páginas/vistas por módulo (auth, doctor, etc.), que componen layout + componentes UI. |
