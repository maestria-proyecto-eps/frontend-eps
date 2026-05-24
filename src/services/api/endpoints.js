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
    list: "/api/users/",
    /** GET usuario por ID */
    getById: (id) => `/api/users/${id}`,
    /** POST crear usuario */
    create: "/api/users/",
    /** PUT actualizar usuario (id numérico) */
    updateById: (id) => `/api/users/${id}`,
    /** PUT cambiar estado (activar/desactivar) */
    changeStatus: (id) => `/api/users/${id}/change-status`,
    /** DELETE desactivar/eliminar usuario (id numérico) - legacy, preferir changeStatus */
    deleteById: (id) => `/api/users/${id}`,
    /** PUT cambiar contraseña por ID de usuario */
    changePassword: (id) => `/api/users/${id}/reset-password`,
  },

  // ── Specialties Service ───────────────────────────
  specialties: {
    /** GET lista: nombre_especialidad, descripcion, id_especialidad */
    list: '/api/specialties',
    /** alias singular usado en ConsultationForm */
    remission: '/api/specialties/remission',
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
    /** POST crear paciente */
    create: "/api/patients",
    /** GET perfil del paciente */
    getProfile: "/api/patients/me",
    /** PUT actualizar perfil del paciente */
    updateProfile: "/api/patients/me/profile",
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
    /** PUT body: { razon: string } */
    cancel: (id) => `/api/appointments/${id}/cancel`,
    /** GET disponibilidad de citas id_especialidad, fecha_inicio, fecha_fin, id_paciente */
    availability: "/api/appointments/availability",
    /** POST crear cita fecha, hora_inicio, id_doctor, id_especialidad */
    create: "/api/appointments",
    /** GET cita específica por ID */
    getById: (id) => `/api/appointments/${id}`,
    /** GET contexto de consulta para una cita (nombre paciente, especialidad) */
    consultationContext: (id) => `/api/appoinment/${id}/consultation-context`,
  },

  // ── Emergency Service ─────────────────────────────
  emergency: {
    /** GET lista de triages id_paciente, nivel, estado, fecha_inicio, fecha_fin, riesgo_vital */
    triages: "/api/triages",
    /** POST crear triage */
    createTriage: "/api/triages",
    firstUrgentTriage: "/api/triages/urgencia/first",
    attendTriage: (idTriage) => `/api/triages/atender/${idTriage}`,
    urgencies: "/api/atencion_urgencias",
    hospitalization: "/api/hospitalizacion/",
    hospitalizationAdmission: "/api/hospitalizacion/admision",
  },

  // ── Pharmacy Service ──────────────────────────────
  pharmacy: {
    /** GET lista paginada de medicamentos: ?page=1&limit=10 */
    listMedications: "/api/pharmacy/medications",
    /** POST crear medicamento */
    createMedication: "/api/pharmacy/medications",
    /** PUT actualizar medicamento por código */
    updateMedication: (codigo) => `/api/pharmacy/medications/${codigo}`,
    /** GET lista paginada de inventario de un medicamento: ?page=1&limit=10 */
    getInventory: (codigo) => `/api/pharmacy/medications/inventory/${codigo}`,
    /** POST agregar lote al inventario de un medicamento */
    createInventory: (codigo) => `/api/pharmacy/medications/inventory/${codigo}`,
    /** PUT actualizar (dispensar) un ítem de inventario por id_inventario */
    updateInventory: (id) => `/api/pharmacy/medications/inventory/${id}`,
  },

  // ── Medical Records Service ───────────────────────
  medicalRecords: {
    /** GET historial médico del paciente (nota: endpoint tiene typo "pattient") */
    getPatientHistory: (patientId) => `/api/pattient/${patientId}/medical-history`,
    /** GET prescripciones del doctor autenticado: ?pag=1&cantidad=10 */
    getDoctorPrescriptions: "/api/prescriptions/doctors/me",
    /** GET prescripciones del paciente autenticado: ?pag=1&cantidad=10 */
    getPatientPrescriptions: "/api/prescriptions/patients/me",
    /** POST crear prescripción para una atención */
    createPrescription: "/api/prescriptions/",
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

  // ── Consultations Service ──────────────────────────
  consultations: {
    /** POST crear consulta para una cita */
    create: (appointmentId) => `/api/appoinment/${appointmentId}/consultation`,
  },

  // ── Referrals Service ──────────────────────────────
  referrals: {
    /** GET remisiones con filtros opcionales: ?id_paciente=&id_especialidad=&vigente= */
    list: "/api/referrals/",
    /** POST crear remisión para una cita */
    create: (appointmentId) => `/api/appoinment/${appointmentId}/remision`,
  },
};