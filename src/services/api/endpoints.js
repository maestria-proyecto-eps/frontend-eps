/**
 * Rutas del API organizadas por microservicio.
 * Basado en la configuración estable de Cuidarte EPS.
 */

// 1. Definición de Bases (Microservicios en Render)
const USERS_API_BASE = 'https://backend-eps-users-service-dev.onrender.com';
const PHARMACY_API_BASE = 'https://backend-eps-pharmacy-service.onrender.com';

export const endpoints = {
  // ── Auth Service ──────────────────────────────────
  auth: {
    login: "/api/auth/login",
  },
  login: "/login",

  // ── Users Service ─────────────────────────────────
  users: {
    doctorExample: "/api/users/doctor/example",
    /** GET lista paginada: ?pag=1&cantidad=30 */
    list: `${USERS_API_BASE}/api/users`,
    /** GET usuario por ID */
    getById: (id) => `${USERS_API_BASE}/api/users/${id}`,
    /** POST crear usuario */
    create: `${USERS_API_BASE}/api/users`,
    /** PUT actualizar usuario */
    updateById: (id) => `${USERS_API_BASE}/api/users/${id}`,
    /** PUT cambiar estado (activar/desactivar) */
    changeStatus: (id) => `${USERS_API_BASE}/api/users/${id}/change-status`,
    /** DELETE desactivar/eliminar usuario */
    deleteById: (id) => `${USERS_API_BASE}/api/users/${id}`,
  },

  // ── Specialties Service ───────────────────────────
  specialties: {
    list: '/api/specialties',
    remission: '/api/specialties/remission',
  },

  // ── Doctors Service ───────────────────────────────
  doctors: {
    list: '/api/doctors',
    create: '/api/doctors',
    updateSpecialty: (id) => `/api/doctors/${id}/specialty`,
  },

  // ── Persons Service ───────────────────────────────
  persons: {
    create: "/api/persons",
    updateById: (num_documento) => `/api/persons/${num_documento}`,
    getByDocument: (num_documento) => `/api/persons/${num_documento}`,
  },

  // ── Patients Service ──────────────────────────────
  patients: {
    create: "/api/patients",
  },

  // ── Pharmacy Service (TU MÓDULO + MEJORAS) ────────
  pharmacy: {
    // GET: Listar todos los medicamentos
    list: `${PHARMACY_API_BASE}/api/pharmacy/medications`,
    listMedications: `${PHARMACY_API_BASE}/api/pharmacy/medications`,
    
    // POST: Crear nuevo registro base de medicamento
    create: `${PHARMACY_API_BASE}/api/pharmacy/medications`,
    
    // POST: Registrar un nuevo lote
    createBatch: (codigo) => `${PHARMACY_API_BASE}/api/pharmacy/medications/inventory/${codigo}`,
    
    // GET: Ver inventario/lotes de un medicamento específico
    getInventory: (codigo) => `${PHARMACY_API_BASE}/api/pharmacy/medications/inventory/${codigo}`,
    listBatch: (codigo) => `${PHARMACY_API_BASE}/api/pharmacy/medications/inventory/${codigo}`,
    
    // Alertas
    lowStock: `${PHARMACY_API_BASE}/api/pharmacy/medications/low-stock`,
    getLowStock: `${PHARMACY_API_BASE}/api/pharmacy/medications/low-stock`,
    expiringSoon: `${PHARMACY_API_BASE}/api/pharmacy/medications/expiring-soon`,
    getExpiringSoon: `${PHARMACY_API_BASE}/api/pharmacy/medications/expiring-soon`,
    
    // PUT: Actualizar datos
    updateByCode: (codigo) => `${PHARMACY_API_BASE}/api/pharmacy/medications/${codigo}`,
    
    // DELETE: Limpiar base de datos (Uso de desarrollo)
    clearAll: `${PHARMACY_API_BASE}/api/pharmacy/debug/clear-all-data`,
  },

  // ── Agenda (horarios de médicos) ──────────────────
  schedules: {
    getByDoctor: (idDoctor) => `/api/schedules/doctor/${idDoctor}`,
    create: '/api/schedules/',
    update: (idAgenda) => `/api/schedules/${idAgenda}`,
    delete: (idAgenda) => `/api/schedules/${idAgenda}`,
  },

  // ── Appointments Service ──────────────────────────
  appointments: {
    list: "/api/appointments",
    availability: "/api/appointments/availability",
    create: "/api/appointments",
    getById: (id) => `/api/appointments/${id}`,
    consultationContext: (id) => `/api/appoinment/${id}/consultation-context`,
    cancel: (id) => `/api/appoinments/${id}/cancel`,
  },

  // ── Medical Records Service ───────────────────────
  medicalRecords: {
    getPatientHistory: (patientId) => `/api/pattient/${patientId}/medical-history`,
  },

  // ── Diagnósticos & Medicamentos (Búsqueda) ────────
  diagnosticos: {
    search: "/api/diagnosticos/search",
  },
  medicamentos: {
    search: "/api/medicamentos/search",
  },

  // ── Consultations & Referrals ─────────────────────
  consultations: {
    create: (appointmentId) => `/api/appoinment/${appointmentId}/consultation`,
  },
  referrals: {
    create: (appointmentId) => `/api/appoinment/${appointmentId}/remision`,
  },
};