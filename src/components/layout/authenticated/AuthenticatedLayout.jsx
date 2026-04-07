import React from 'react';
import { Outlet } from 'react-router-dom';
import AuthenticatedHeader  from './AuthenticatedHeader';
import AuthenticatedSideBar from './AuthenticatedSideBar';
import AuthenticatedFooter  from './AuthenticatedFooter';

/**
 * Layout principal para usuarios autenticados.
 * Estructura: Header (sticky top) → [Sidebar | Body] → Footer
 *
 * Uso en App.jsx:
 *   <Route element={<AuthenticatedLayout />}>
 *     <Route path="/doctor" element={<DoctorDashboard />} />
 *     ...
 *   </Route>
 */
export default function AuthenticatedLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">

      {/* ── Header ─────────────────────────────────── */}
      <AuthenticatedHeader />

      {/* ── Sidebar + Body ─────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        <AuthenticatedSideBar />

        {/* Body — aquí se renderizan las rutas hijas */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>

      </div>

      {/* ── Footer ─────────────────────────────────── */}
      <AuthenticatedFooter />

    </div>
  );
}
