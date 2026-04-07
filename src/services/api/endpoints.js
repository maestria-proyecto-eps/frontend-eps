/**
 * Rutas del API organizadas por microservicio.
 * Basado en la configuración estable de Cuidarte EPS.
 */

// 1. Definición de Bases (Microservicios en Render o Local)
const USERS_API_BASE = 'https://backend-eps-users-service-dev.onrender.com';
const PHARMACY_API_BASE = 'https://backend-eps-pharmacy-service.onrender.com';

export const endpoints = {
  // ── Auth Service ──────────────────────────────────
  auth: {
    login: "/api/auth/login",
  },
  
  // Mantenemos la estructura simple por si otros componentes la usan
  login: "/login",

  // ── Users Service ─────────────────────────────────
  users: {
    doctorExample: "/api/users/doctor/example",
    list: `${USERS_API_BASE}/api/users`,
    create: `${USERS_API_BASE}/api/users`,
    updateById: (id) => `${USERS_API_BASE}/api/users/${id}`,
    changeStatus: (id) => `${USERS_API_BASE}/api/users/${id}/change-status`,
    deleteById: (id) => `${USERS_API_BASE}/api/users/${id}`,
  },
  
  // ── Doctor Service ────────────────────────────────
  doctor_example: {
    doctorExampleEndpoint: "/doctor/example",
  },
  
  // ── Patients ──────────────────────────────────────
  patients: {
    create: "/api/patients",
  },

  // ── Pharmacy Service (TU MÓDULO) ──────────────────
  pharmacy: {
    // GET: Listar todos los medicamentos
    list: `${PHARMACY_API_BASE}/api/pharmacy/medications`,
    
    // POST: Crear nuevo registro base de medicamento
    create: `${PHARMACY_API_BASE}/api/pharmacy/medications`,
    
    // POST: Registrar un nuevo lote
    createBatch: (codigo) => `${PHARMACY_API_BASE}/api/pharmacy/medications/inventory/${codigo}`,
    
    // GET: Ver medicamentos con existencias bajas
    lowStock: `${PHARMACY_API_BASE}/api/pharmacy/medications/low-stock`,

    // GET: Ver medicamentos próximos a vencer
    expiringSoon: `${PHARMACY_API_BASE}/api/pharmacy/medications/expiring-soon`,
    
    // PUT: Actualizar datos de un medicamento
    updateByCode: (codigo) => `${PHARMACY_API_BASE}/api/pharmacy/medications/${codigo}`,
    
    // GET: Listar lotes de un medicamento
    listBatch: (codigo) => `${PHARMACY_API_BASE}/api/pharmacy/medications/inventory/${codigo}`,

    // DELETE: Limpiar base de datos (Uso de desarrollo)
    clearAll: `${PHARMACY_API_BASE}/api/pharmacy/debug/clear-all-data`,
  },

  // ── Otros Servicios ──────────────────────────────
  appointments: {
    // list: "/api/appointments/",
  },
};