/**
 * Rutas del API organizadas por microservicio.
 *
 * Users service: se apunta directamente a Render (o usar proxy con pathRewrite).
 * Resto de servicios usan prefijo /api/{servicio}/ con proxy o Vercel rewrites.
 */
const USERS_API_BASE = 'https://backend-eps-users-service-dev.onrender.com';

export const endpoints = {
  // ── Auth Service ──────────────────────────────────
  auth: {
    login: "/api/auth/login",
  },

  // ── Users Service (URL base directa a Render) ─────
  users: {
    doctorExample: "/api/users/doctor/example",
    /** GET lista paginada: ?pag=1&cantidad=30 */
    list: `${USERS_API_BASE}/users/`,
    /** POST crear usuario */
    create: `${USERS_API_BASE}/users/`,
    /** PUT actualizar usuario (id numérico) */
    updateById: (id) => `${USERS_API_BASE}/users/${id}`,
    /** PUT cambiar estado (activar/desactivar) */
    changeStatus: (id) => `${USERS_API_BASE}/users/${id}/change-status`,
    /** DELETE desactivar/eliminar usuario (id numérico) - legacy, preferir changeStatus */
    deleteById: (id) => `${USERS_API_BASE}/users/${id}`,
  },

  // ── Appointments Service ──────────────────────────
  appointments: {
    // list: "/api/appointments/",
  },

  // ── Emergency Service ─────────────────────────────
  emergency: {
    // list: "/api/emergency/",
  },

  // ── Pharmacy Service ──────────────────────────────
  pharmacy: {
    // list: "/api/pharmacy/",
  },

  // ── Medical Records Service ───────────────────────
  medicalRecords: {
    // list: "/api/medical-records/",
  },
};
