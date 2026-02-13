
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

Este proyecto utiliza un **GitFlow simplificado** para mantener orden, claridad y estabilidad en el desarrollo.

### 📌 Estructura de ramas

```
main
develop
feature/*
bugfix/*
hotfix/*
```

---

## 🔹 `main`

* Contiene únicamente código estable y listo para producción.
* Siempre debe estar en estado **deployable**.
* No se permite hacer push directo.
* Solo recibe cambios desde:

  * `develop` (nuevas versiones)
  * `hotfix/*` (correcciones críticas)

---

## 🔹 `develop`

* Rama de integración.
* Base para nuevas funcionalidades.
* Puede contener cambios en validación antes de llegar a producción.
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
4. Se elimina después del merge

---

## 🐛 `bugfix/*`

Ramas para corregir errores detectados en `develop` antes de pasar a producción.

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
3. Se hace merge hacia:

   * `main`
   * `develop` (obligatorio para evitar regresiones)
4. Se elimina después del merge

---

## 📌 Reglas Generales

* ❌ No hacer push directo a `main` ni `develop`
* ✅ Todo cambio debe pasar por Pull Request
* ✅ Mantener nombres descriptivos y en kebab-case
* ✅ Eliminar ramas después del merge
* ✅ Mantener commits claros y atómicos

---

## 🔁 Flujo General

```
feature/* → develop → main
bugfix/*  → develop → main
hotfix/*  → main → develop
```

Este modelo permite:

* Separar desarrollo de producción
* Mantener estabilidad en `main`
* Trabajar en paralelo sin conflictos
* Aplicar correcciones críticas sin afectar el flujo normal

```
```
