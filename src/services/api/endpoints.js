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

  /** GET lista: nombre_especialidad, descripcion, id_especialidad */
  specialties: {
    list:      '/api/specialties',
    remissions: '/api/specialties/remission',
  },

  doctors: {
    /** GET lista: ?id_especialidad=&num_licencia= */
    list:            '/api/doctors',
    /** POST crear médico */
    create:          '/api/doctors',
    /** PUT cambiar especialidad */
    updateSpecialty: (id) => `/api/doctors/${id}/specialty`,
  },

  persons: {
    /** POST crear persona */
    create: "/api/persons",
    /** PUT actualizar persona por número de documento */
    updateById: (num_documento) => `/api/persons/${num_documento}`,
    getByDocument: (num_documento) => `/api/persons/${num_documento}`,
  },

  patients: {
    create: "/api/patients",
  },

  // ── Agenda (horarios de médicos) ──────────────────
  schedules: {
    /** GET bloques de agenda por médico */
    getByDoctor: (idDoctor) => `/api/schedules/doctor/${idDoctor}`,
    /** POST crear bloque de agenda */
    create: '/api/schedules/',
    /** PUT actualizar bloque de agenda */
    update: (idAgenda) => `/api/schedules/${idAgenda}`,
    /** DELETE eliminar bloque de agenda */
    delete: (idAgenda) => `/api/schedules/${idAgenda}`,
  },

  // ── Appointments Service ──────────────────────────
  appointments: {
    /** GET lista: ?fecha=&estado=&id_especialidad=&id_doctor=&id_paciente= */
    list: "/api/appointments",
    /** GET disponibilidad de citas id_especialidad, fecha_inicio, fecha_fin, id_paciente */
    availability: "/api/appointments/availability",
    /** POST crear cita fecha, hora_inicio, id_doctor, id_especialidad */
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
