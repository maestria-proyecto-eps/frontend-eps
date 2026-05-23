import React from 'react';
import { Link } from 'react-router-dom';

const PharmacistDashboard = ({ user }) => {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <header className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bienvenido, {user?.name || user?.nombre || 'Regente de Farmacia'}</h1>
          <p className="text-sm text-gray-500">Sistema de Control de Inventario y Dispensación de Medicamentos</p>
        </div>
        <span className="bg-cyan-100 text-cyan-800 text-sm font-semibold px-3 py-1 rounded-full">
          Rol: Farmaceuta
        </span>
      </header>

      {/* Tarjetas informativas de control */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-400 font-medium">Alertas de Stock</span>
            <span className="block text-2xl font-bold text-amber-500">Bajo en Almacén</span>
          </div>
          <span className="text-2xl bg-amber-50 p-2 rounded-lg">⚠️</span>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-400 font-medium">Estado del Catálogo</span>
            <span className="block text-2xl font-bold text-cyan-600">Actualizado</span>
          </div>
          <span className="text-2xl bg-cyan-50 p-2 rounded-lg">📋</span>
        </div>
      </section>

      {/* Criterio de Aceptación: Navegación Rápida Unificada */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Navegación Rápida</h3>
        <div className="max-w-xl">
          
          {/* BOTÓN ÚNICO Y SEGURO */}
          <Link to="/pharmacist" className="p-5 bg-white rounded-lg shadow border hover:border-cyan-400 transition flex items-center space-x-4 block">
            <span className="text-3xl">📦</span>
            <div>
              <span className="block font-bold text-gray-800">Gestionar Inventario y Medicamentos</span>
              <span className="text-xs text-gray-400">Acceder al panel general para consultar stock, añadir nuevos fármacos y registrar lotes</span>
            </div>
          </Link>

        </div>
      </section>
    </div>
  );
};

export default PharmacistDashboard;