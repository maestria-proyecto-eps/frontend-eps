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
    /** GET usuario por ID */
    getById: (id) => `/api/users/${id}`,
    /** POST crear usuario */
    create: "/api/users",
    /** PUT actualizar usuario (id numérico) */
    updateById: (id) => `/api/users/${id}`,
    /** PUT cambiar estado (activar/desactivar) */
    changeStatus: (id) => `/api/users/${id}/change-status`,
    /** DELETE desactivar/eliminar usuario (id numérico) - legacy, preferir changeStatus */
    deleteById: (id) => `/api/users/${id}`,
  },

  // ── Persons Service ───────────────────────────────
  persons: {
    /** GET persona por número de documento */
    getByDocument: (num_documento) => `/api/persons/${num_documento}`,
  },

  patients: {
    create: "/api/patients",
  },

  // ── Appointments Service ──────────────────────────
  appointments: {
    list: "/api/appointments",
    create: "/api/appointments",
    /** GET cita específica por ID */
    getById: (id) => `/api/appointments/${id}`,
    /** GET contexto de consulta para una cita (nombre paciente, especialidad) */
    consultationContext: (id) => `/api/appoinment/${id}/consultation-context`,
    cancel: (id) => `/api/appoinments/${id}/cancel`,
  },

  // ── Emergency Service ─────────────────────────────
  emergency: {
    // list: "/api/emergency/",
  },

  // ── Pharmacy Service ──────────────────────────────
  pharmacy: {
    /** GET lista de medicamentos */
    listMedications: "/api/pharmacy/medications",
    /** GET inventario de medicamento específico */
    getInventory: (codigo) => `/api/pharmacy/medications/inventory/${codigo}`,
    /** GET alertas de bajo stock */
    getLowStock: "/api/pharmacy/medications/low-stock",
    /** GET alertas de medicamentos que vencen próximamente */
    getExpiringSoon: "/api/pharmacy/medications/expiring-soon",
  },

  // ── Medical Records Service ───────────────────────
  medicalRecords: {
    /** GET historial médico del paciente (nota: endpoint tiene typo "pattient") */
    getPatientHistory: (patientId) => `/api/pattient/${patientId}/medical-history`,
  },

  // ── Diagnósticos Service ──────────────────────────
  diagnosticos: {
    /** GET búsqueda de diagnósticos: ?nombre=...&id=... */
    search: "/api/diagnosticos/search",
  },

  // ── Medicamentos Service ──────────────────────────
  medicamentos: {
    /** GET búsqueda de medicamentos: ?nombre=... */
    search: "/api/medicamentos/search",
  },

  // ── Specialties Service ───────────────────────────
  specialties: {
    /** GET especialidades que pueden recibir remisiones, con relación de quien remite */
    remission: "/api/specialties/remission",
  },

  // ── Consultations Service ──────────────────────────
  consultations: {
    /** POST crear consulta para una cita */
    create: (appointmentId) => `/api/appoinment/${appointmentId}/consultation`,
  },

  // ── Referrals Service ──────────────────────────────
  referrals: {
    /** POST crear remisión para una cita */
    create: (appointmentId) => `/api/appoinment/${appointmentId}/remision`,
  },
};
