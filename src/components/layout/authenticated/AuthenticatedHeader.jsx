import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../services/auth/AuthContext';
import { cn } from '../../../utils/cn';

const ROLE_LABELS = {
  doctor: 'Doctor',
  nurse: 'Enfermera',
  patient: 'Paciente',
  hr: 'Recursos Humanos',
  pharmacist: 'Farmacéutico',
  receptionist: 'Recepcionista',
};

const ROLE_COLORS = {
  doctor: 'bg-blue-100 text-blue-700',
  nurse: 'bg-pink-100 text-pink-700',
  patient: 'bg-green-100 text-green-700',
  hr: 'bg-purple-100 text-purple-700',
  pharmacist: 'bg-orange-100 text-orange-700',
  receptionist: 'bg-teal-100 text-teal-700',
};

export default function AuthenticatedHeader({ className = '' }) {
  const auth = useContext(AuthContext);
  const nav = useNavigate();

  const role = auth?.role || 'patient';
  const payload = auth?.payload || {};
  const documento = payload.num_documento || '—';

  const roleLabel = ROLE_LABELS[role] || role;
  const roleColor = ROLE_COLORS[role] || 'bg-neutral-100 text-neutral-700';

  const handleLogout = () => {
    auth.logout();
    nav('/login');
  };

  return (
    <header
      className={cn(
        'bg-white border-b border-neutral-200 shadow-sm sticky top-0 z-50',
        className
      )}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo + nombre EPS */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => nav('/')}>
            <img
              src="/logo-horizontal.svg"
              alt="Logo EPS"
              className="h-15 w-auto object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="flex flex-col leading-tight">
              <span className="text-xs text-neutral-400 hidden sm:inline">Salud y Bienestar</span>
            </div>
          </div>

          {/* Usuario, rol, logout */}
          <div className="flex items-center gap-3">
            {/* Info usuario */}
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm font-semibold text-neutral-700">
                Doc. {documento}
              </span>
              <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full mt-0.5', roleColor)}>
                {roleLabel}
              </span>
            </div>


            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium text-sm px-3 py-1.5 rounded-lg transition-colors border border-red-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
              </svg>
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
