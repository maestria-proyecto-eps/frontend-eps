/**
 * Rutas del API organizadas por microservicio.
 *
 * Users service: se apunta directamente a Render (o usar proxy con pathRewrite).
 * Resto de servicios usan prefijo /api/{servicio}/ con proxy o Vercel rewrites.
 */
//const USERS_API_BASE = 'https://backend-eps-users-service-dev.onrender.com';

export const endpoints = {
  // ── Auth Service ──────────────────────────────────
  auth: {
    login: "/api/auth/login",
  },

  // ── Users Service (URL base directa a Render) ─────
  users: {
    doctorExample: "/api/users/doctor/example",
    /** GET lista paginada: ?pag=1&cantidad=30 */
    list: "/api/users",
    /** POST crear usuario */
    create: "/api/users",
    /** PUT actualizar usuario (id numérico) */
    updateById: (id) => `/api/users/${id}`,
    /** PUT cambiar estado (activar/desactivar) */
    changeStatus: (id) => `/api/users/${id}/change-status`,
    /** DELETE desactivar/eliminar usuario (id numérico) - legacy, preferir changeStatus */
    deleteById: (id) => `/api/users/${id}`,
  },
  
  patients: {
    create: "/api/patients",
  },

  // ── Agenda (horarios de médicos) ──────────────────
  agenda: {
    /** GET bloques de agenda por médico */
    getByDoctor: (idDoctor) => `/api/appointments/agenda/doctor/${idDoctor}`,
    /** POST insertar múltiples bloques: { blocks: [...] } */
    createBulk: '/api/appointments/agenda/bulk',
    /** PUT actualizar estado de un bloque: { estado } */
    updateEstado: (idAgenda) => `/api/appointments/agenda/${idAgenda}`,
  },

  // ── Especialidades ────────────────────────────────
  especialidades: {
    /** GET lista de especialidades */
    list: '/api/users/especialidades',
  },

  // ── Citas ─────────────────────────────────────────
  citas: {
    /** GET citas asociadas a un bloque de agenda */
    getByAgenda: (idAgenda) => `/api/appointments/citas/agenda/${idAgenda}`,
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
