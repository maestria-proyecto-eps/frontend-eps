import React from 'react';
import { Link } from 'react-router-dom';

const NurseDashboard = ({ user }) => {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <header className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bienvenido, {user?.name || user?.nombre || 'Personal de Enfermería'}</h1>
          <p className="text-sm text-gray-500">Gestión de Triage y Valoración de Pacientes</p>
        </div>
        <span className="bg-orange-100 text-orange-800 text-sm font-semibold px-3 py-1 rounded-full">
          Rol: Enfermero
        </span>
      </header>

      {/* Tarjeta informativa de control de flujo */}
      <section className="max-w-md">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-400 font-medium">Estado del Módulo</span>
            <span className="block text-xl font-bold text-orange-600">Espera de Implementación</span>
          </div>
          <span className="text-2xl bg-orange-50 p-2 rounded-lg">🩺</span>
        </div>
      </section>

      {/* Criterio de Aceptación: Navegación Rápida a una Subruta Real */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Navegación Rápida</h3>
        <div className="max-w-xl">
          
          {/* APUNTA A /triage PARA QUE REACT ENCUENTRE EL COMPONENTE <Maintenance /> */}
          <Link to="/nurse/triage" className="p-5 bg-white rounded-lg shadow border hover:border-orange-400 transition flex items-center space-x-4 block">
            <span className="text-3xl">📋</span>
            <div>
              <span className="block font-bold text-gray-800">Ir al Sistema de Triage</span>
              <span className="text-xs text-gray-400">Ingresar al panel de valoración de signos vitales y priorización de urgencias</span>
            </div>
          </Link>

        </div>
      </section>
    </div>
  );
};

export default NurseDashboard;