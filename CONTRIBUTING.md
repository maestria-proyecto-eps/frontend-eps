
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

### Despliegue Continuo (CD) — `cd.yml`

Se ejecuta automáticamente al **mergear un PR** (push) a las ramas con entorno:

| Rama | Entorno | Plataforma |
|---|---|---|
| `develop` | Development (preview) | Vercel |
| `main` | Production | Vercel |

> `qa` no tiene despliegue — funciona como compuerta de calidad (solo CI).
