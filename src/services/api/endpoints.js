/**
 * Rutas del API organizadas por microservicio.
 *
 * El prefijo /api/{servicio}/ permite que Vercel Rewrites (vercel.json)
 * enrute cada petición al microservicio correcto en Render.
 *
 * Mapeo:
 *   /api/auth/*             → backend-eps-auth-service
 *   /api/users/*            → backend-eps-users-service
 *   /api/appointments/*     → backend-eps-appointments-service
 *   /api/emergency/*        → backend-eps-emergency-service
 *   /api/pharmacy/*         → backend-eps-pharmacy-service
 *   /api/medical-records/*  → backend-eps-medical-records-service
 */
export const endpoints = {
  // ── Auth Service ──────────────────────────────────
  auth: {
    login: "/api/auth/login",
  },

  // ── Users Service ─────────────────────────────────
  users: {
    doctorExample: "/api/users/doctor/example",
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
