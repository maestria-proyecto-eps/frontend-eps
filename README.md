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

## 📁 Estructura del proyecto

```text
src/
 ├── components/
 ├── pages/
 ├── services/
 ├── utils/
 ├── App.jsx
 ├── main.jsx
 └── index.css
```

---

## 📂 Descripción de carpetas

### `/components`
Contiene **componentes reutilizables de interfaz de usuario (UI)** que pueden ser utilizados en múltiples vistas de la aplicación.

Ejemplos:
- Botones
- Modales
- Cards
- Barras de navegación

---

### `/pages`
Contiene las **vistas principales** de la aplicación, normalmente asociadas a rutas.

Ejemplos:
- Login
- Dashboard
- Gestión de afiliados
- Citas médicas

---

### `/services`
Contiene la **lógica de comunicación con el backend**.  
Aquí se definen funciones para consumir APIs REST, manejar autenticación y obtener información del sistema.

Ejemplos:
- `auth.service.js`
- `afiliados.service.js`
- `citas.service.js`

---

### `/utils`
Contiene **funciones utilitarias y helpers** reutilizables en toda la aplicación.  
No debe contener lógica específica de React.

Ejemplos:
- Formateo de fechas
- Validaciones
- Helpers de strings o números

---

## 📌 Buenas prácticas

- Mantener los componentes pequeños y reutilizables
- Evitar lógica de negocio dentro de componentes de UI
- Centralizar llamadas al backend en `/services`
- Usar `/utils` solo para funciones puras
- Seguir una estructura clara y escalable

---

## 🎨 Estilos

Los estilos del proyecto se manejan principalmente con **Tailwind CSS**, utilizando clases utilitarias directamente en los componentes React.

Esto permite:
- Desarrollo rápido
- Menor cantidad de CSS personalizado
- Consistencia visual
- Fácil mantenimiento

---