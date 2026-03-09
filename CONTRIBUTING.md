
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



# 🌳 Convención de Ramas (GitFlow Simplificado)

Este proyecto utiliza un **GitFlow simplificado** con rama de QA como compuerta de calidad antes de producción.

### 📌 Estructura de ramas

```
main         ← producción
qa           ← quality gate (validación antes de prod)
develop      ← integración / entorno dev
feature/*
bugfix/*
hotfix/*
```

---

## 🔹 `main`

* Contiene únicamente código estable y listo para producción.
* Al hacer merge aquí se **despliega automáticamente a producción** (Vercel).
* No se permite hacer push directo.
* Solo recibe PRs desde:
  * `qa` (nuevas versiones validadas)
  * `hotfix/*` (correcciones críticas)

---

## 🔹 `qa`

* Rama de **quality gate** — validación final antes de producción.
* **No tiene entorno de despliegue propio**, solo ejecuta CI (lint + build).
* Recibe PRs desde `develop`.
* Desde aquí se abre PR hacia `main` para ir a producción.

---

## 🔹 `develop`

* Rama de integración y desarrollo.
* Al hacer merge aquí se **despliega automáticamente al entorno de desarrollo** (Vercel preview).
* Recibe merges desde:
  * `feature/*`
  * `bugfix/*`
  * `hotfix/*` (después de aplicar en `main`)

---

## 🚀 `feature/*`

Ramas para nuevas funcionalidades.

### 📌 Convención de nombres

```
feature/<descripcion-corta>
```

### ✅ Ejemplos

```
feature/login-jwt
feature/roi-editor
feature/notifications-module
```

### 🔄 Flujo

1. Se crea desde `develop`
2. Se implementa la funcionalidad
3. Se abre Pull Request hacia `develop`
4. CI valida automáticamente (lint + build)
5. Se elimina después del merge

---

## 🐛 `bugfix/*`

Ramas para corregir errores detectados en `develop` o `qa` antes de pasar a producción.

### 📌 Convención de nombres

```
bugfix/<descripcion-corta>
```

### ✅ Ejemplos

```
bugfix/fix-token-refresh
bugfix/null-camera-error
```

### 🔄 Flujo

1. Se crea desde `develop`
2. Se corrige el error
3. Se hace Pull Request hacia `develop`
4. Se elimina después del merge

> ⚠ Si el error está en producción, debe usarse `hotfix/*`, no `bugfix/*`.

---

## 🚑 `hotfix/*`

Ramas para correcciones críticas en producción.

### 📌 Convención de nombres

```
hotfix/<descripcion-corta>
```

### ✅ Ejemplos

```
hotfix/security-patch
hotfix/crash-on-startup
```

### 🔄 Flujo

1. Se crea desde `main`
2. Se corrige el problema
3. Se hace PR hacia:
   * `main` (se despliega a producción automáticamente)
   * `develop` (obligatorio para evitar regresiones)
4. Se elimina después del merge

---

## 📌 Reglas Generales

* ❌ No hacer push directo a `main`, `qa` ni `develop`
* ✅ Todo cambio debe pasar por Pull Request
* ✅ Los PRs ejecutan CI automáticamente (lint + build)
* ✅ Mantener nombres descriptivos y en kebab-case
* ✅ Eliminar ramas después del merge
* ✅ Mantener commits claros y atómicos

---

## 🔁 Flujo General

```
feature/* ──PR──→ develop ──PR──→ qa ──PR──→ main
bugfix/*  ──PR──→ develop ──PR──→ qa ──PR──→ main
hotfix/*  ──PR──→ main + develop
```

---

## 🚀 CI/CD y Entornos

### Integración Continua (CI) — `ci.yml`

Se ejecuta automáticamente al abrir un **Pull Request** hacia `develop`, `qa` o `main`:

* **Lint** — ESLint
* **Build** — Valida que `vite build` compile correctamente

> El PR no debe mergearse si CI falla.

### Despliegue Continuo (CD) — Vercel Auto-Deploy

Vercel está conectado directamente al repositorio de GitHub y despliega automáticamente cuando se hace push a una rama. Gracias a las **Branch Protection Rules**, el push solo ocurre después de mergear un PR que haya pasado CI.

El flujo es:

1. Se abre PR → CI (`ci.yml`) valida lint + build
2. CI pasa ✅ → se permite mergear el PR
3. Merge genera push a la rama destino → Vercel despliega automáticamente

| Rama | Entorno | Tipo de Deploy |
|---|---|---|
| `develop` | Preview | Vercel genera una URL de preview |
| `main` | Production | Vercel despliega a producción |

> `qa` no tiene despliegue — funciona como compuerta de calidad (solo CI).
>
> **No se necesita workflow de CD** (`cd.yml`) para el frontend — Vercel maneja el deploy de forma nativa.

---

## 🌐 API Gateway (Vercel Rewrites)

El frontend actúa como **punto de entrada único** a todos los microservicios backend gracias a **Vercel Rewrites** (`vercel.json`).

### ¿Cómo funciona?

```
Browser → https://frontend.vercel.app/api/auth/login
                    │
              Vercel Rewrite (proxy transparente)
                    │
                    ▼
         https://backend-eps-auth-service.onrender.com/login
```

### Mapeo de rutas

| Prefijo en el frontend | Microservicio en Render |
|---|---|
| `/api/auth/*` | `backend-eps-auth-service` |
| `/api/users/*` | `backend-eps-users-service` |
| `/api/appointments/*` | `backend-eps-appointments-service` |
| `/api/emergency/*` | `backend-eps-emergency-service` |
| `/api/pharmacy/*` | `backend-eps-pharmacy-service` |
| `/api/medical-records/*` | `backend-eps-medical-records-service` |

### Archivos clave

| Archivo | Función |
|---|---|
| `vercel.json` | Define los rewrites con `$ENV_VAR` por entorno |
| `src/services/api/endpoints.js` | Rutas con prefijo `/api/{servicio}/` |
| `src/services/api/http.js` | Cliente Axios con `baseURL: ""` (mismo dominio) |
| `vite.config.js` | Proxy local para desarrollo (`npm run dev`) |

### Variables de entorno en Vercel

Cada microservicio tiene una variable con su URL en Render. Se configura por entorno en **Vercel Dashboard → Settings → Environment Variables**:

| Variable | Preview (`develop`) | Production (`main`) |
|---|---|---|
| `AUTH_SERVICE_URL` | URL del servicio DEV | URL del servicio PROD |
| `USERS_SERVICE_URL` | URL del servicio DEV | URL del servicio PROD |
| `APPOINTMENTS_SERVICE_URL` | URL del servicio DEV | URL del servicio PROD |
| `EMERGENCY_SERVICE_URL` | URL del servicio DEV | URL del servicio PROD |
| `PHARMACY_SERVICE_URL` | URL del servicio DEV | URL del servicio PROD |
| `MEDICAL_RECORDS_SERVICE_URL` | URL del servicio DEV | URL del servicio PROD |

### Desarrollo local

En local, `vite.config.js` configura un proxy que redirige `/api/*` a los servicios corriendo en `localhost`. Ajusta los puertos según tu setup.

---

### ➕ Agregar un nuevo microservicio

Si se crea un nuevo microservicio (ej: `backend-eps-notifications-service`), hay que actualizar **4 archivos + Vercel Dashboard**:

1. **`vercel.json`** — agregar el rewrite:
   ```json
   { "source": "/api/notifications/:path*", "destination": "$NOTIFICATIONS_SERVICE_URL/:path*" }
   ```

2. **`vite.config.js`** — agregar la entrada en `server.proxy`:
   ```js
   '/api/notifications': 'http://localhost:800X',
   ```

3. **`src/services/api/endpoints.js`** — agregar la sección:
   ```js
   notifications: {
     list: "/api/notifications/",
   },
   ```

4. **Vercel Dashboard → Settings → Environment Variables** — agregar:
   * `NOTIFICATIONS_SERVICE_URL` → Preview: URL del servicio DEV en Render
   * `NOTIFICATIONS_SERVICE_URL` → Production: URL del servicio PROD en Render

5. **Redeploy en Vercel** para que tome las nuevas variables.

---

### ➖ Eliminar un microservicio

Si se elimina un microservicio, quitar las referencias en los mismos 4 lugares:

1. **`vercel.json`** — eliminar el rewrite correspondiente
2. **`vite.config.js`** — eliminar la entrada del proxy
3. **`src/services/api/endpoints.js`** — eliminar la sección de endpoints
4. **Vercel Dashboard** — eliminar las variables de entorno (Preview + Production)
5. **Código** — buscar y eliminar todas las importaciones y llamadas a esos endpoints en `src/`

> 💡 Tip: Busca en todo el proyecto con `grep -rn "/api/nombre-servicio/" src/` para asegurarte de no dejar referencias huérfanas.

---

## 📝 Estructura de Commits

Para mantener un historial claro y útil, sigue esta convención de commits:

### Formato

```
<tipo>(<alcance>): <descripción corta>

[descripción larga opcional]
```

### Tipos de commit

* `feat`: Nueva funcionalidad
* `fix`: Corrección de bug
* `docs`: Cambios en documentación
* `style`: Cambios de formato (sin afectar código)
* `refactor`: Refactorización de código
* `test`: Agregar o modificar tests
* `chore`: Tareas de mantenimiento (dependencias, config, etc.)

### Ejemplos

```bash
feat(auth): agregar página de login

fix(users): corregir validación de formulario

docs(readme): actualizar instrucciones de instalación

refactor(api): optimizar llamadas HTTP

test(login): agregar tests para componente Login
```

### Reglas

* Usa el presente del indicativo ("agregar" no "agregué")
* No termines la descripción con punto
* La descripción corta debe tener máximo 50 caracteres
* El alcance es opcional pero recomendado (módulo afectado)