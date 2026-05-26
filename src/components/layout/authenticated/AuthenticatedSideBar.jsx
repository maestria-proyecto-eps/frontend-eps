import React, { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../../services/auth/AuthContext';
import { cn } from '../../../utils/cn';

/* ── Iconos SVG inline ─────────────────────────────────────────── */
const Icon = {
  dashboard:        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
  calendar:         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
  clipboard:        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
  history:          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
  alert:            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />,
  triage:           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
  hospital:         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 00-1-1h-2a1 1 0 00-1 1v5m4 0H9" />,
  users:            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
  inventory:        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
  pill:             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
  affiliation:      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />,
  profile:          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
  doctor:           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4a4 4 0 110 8 4 4 0 010-8zm0 10c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5zm6-6h2m-1-1v2" />,
};

const SvgIcon = ({ d, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={cn('w-5 h-5', className)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    {d}
  </svg>
);

const MENUS = {
  "Médico": [
    { label: 'Dashboard',  path: '/doctor',             icon: Icon.dashboard  , end: true },
    { label: 'Mis Citas',  path: '/doctor/citas',       icon: Icon.calendar   },
    { label: 'Urgencias', path: '/doctor/urgencia', icon: Icon.alert },
    { label: 'Prescripciones', path: '/doctor/prescriptions', icon: Icon.pill },
    { label: 'Hospitalizaciones', path: '/doctor/hospitalizaciones', icon: Icon.hospital },
  ],
  "Enfermero": [
    { label: 'Dashboard',         path: '/nurse',                   icon: Icon.dashboard , end: true },
    { label: 'Urgencias',         path: '/nurse/urgencias',         icon: Icon.alert     },
    { label: 'Triage',            path: '/nurse/triage',            icon: Icon.triage    },
    { label: 'Hospitalizaciones', path: '/nurse/hospitalizaciones', icon: Icon.hospital  },
  ],
  "Paciente": [
    { label: 'Dashboard',      path: '/patient',                icon: Icon.dashboard , end: true },
    { label: 'Mis Citas',      path: '/patient/citas',          icon: Icon.calendar  },
    { label: 'Mi Historia',    path: '/patient/historia',       icon: Icon.clipboard },
    { label: 'Prescripciones', path: '/patient/prescripciones', icon: Icon.pill      },
    { label: 'Remisiones',     path: '/patient/referrals',      icon: Icon.alert     },
    { label: 'Perfil',         path: '/patient/perfil',         icon: Icon.profile   },
  ],
  "Talento Humano": [
    { label: 'Dashboard', path: '/hr', icon: Icon.dashboard, end: true },
    { label: 'Usuarios',  path: '/hr/usuarios', icon: Icon.users },
    { label: 'Doctores y especialidades',  path: '/hr/doctors', icon: Icon.doctor },
  ],
  "Farmaceuta": [
    { label: 'Dashboard', path: '/pharmacist/dashboard', icon: Icon.dashboard, end: true },
    { label: 'Farmacia',  path: '/pharmacist',           icon: Icon.inventory },
  ],
  "Recepcionista": [
    { label: 'Dashboard',  path: '/receptionist',            icon: Icon.dashboard   , end: true },
    { label: 'Afiliación', path: '/receptionist/afiliacion', icon: Icon.affiliation },
  ],
};

/* ── Componente ────────────────────────────────────────────────── */
export default function AuthenticatedSideBar({ className = '' }) {
  const auth  = useContext(AuthContext);
  const roles = (Array.isArray(auth?.enabledRoles) && auth.enabledRoles.length)
    ? auth.enabledRoles
    : (auth?.role ? [auth.role] : ['patient']);

  const menu = [];
  const seenPaths = new Set();
  roles.forEach((r) => {
    const items = MENUS[r] || [];
    items.forEach((item) => {
      if (seenPaths.has(item.path)) return;
      seenPaths.add(item.path);
      menu.push({ ...item, _role: r });
    });
  });
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col bg-primary-50 text-neutral-700 transition-all duration-300 sticky top-0 h-fit max-h-screen rounded-2xl border-2 border-primary-500 p-1.5 m-2 shadow-sm hover:shadow-lg',
        collapsed ? 'w-16' : 'w-56',
        className
      )}
    >
      {/* Toggle collapse */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-end p-3 text-neutral-500 hover:text-primary-700 transition-colors border-b border-primary-200"
        title={collapsed ? 'Expandir' : 'Colapsar'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {collapsed
            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          }
        </svg>
      </button>

      {/* Botón superior fijo para volver a bienvenida */}
      <div className="px-2 py-3 border-b border-primary-200">
        <NavLink
          to="/bridge"
          end
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors',
              collapsed ? 'rounded-full justify-center' : 'rounded-lg',
              isActive
                ? 'bg-primary-600 text-white'
                : 'text-neutral-700 hover:bg-primary-100 hover:text-primary-700'
            )
          }
          title={collapsed ? 'Inicio' : undefined}
        >
          <SvgIcon d={Icon.dashboard} className="shrink-0" />
          {!collapsed && <span className="truncate">Inicio</span>}
        </NavLink>
      </div>

      {/* Nav items (agrupados por módulos) */}
      <nav className="flex-1 py-4 overflow-hidden">
        {(() => {
          const moduleOrder = [];
          const moduleMap = new Map();

          const getModuleName = (item) => {
            if (item._role === 'Talento Humano') {
              return 'Talento Humano';
            }
            return item._role ?? 'Módulos';
          };

          menu.forEach((item) => {
            const moduleName = getModuleName(item);
            if (!moduleMap.has(moduleName)) {
              moduleOrder.push(moduleName);
              moduleMap.set(moduleName, []);
            }
            moduleMap.get(moduleName).push(item);
          });

          return moduleOrder.map((moduleName) => {
            const items = moduleMap.get(moduleName) ?? [];
            return (
              <div key={moduleName} className="mb-4">
                {!collapsed && (
                  <div className="px-3 mb-2 text-xs font-semibold text-primary-700">
                    {moduleName}
                  </div>
                )}
                <ul className="space-y-1 px-2">
                  {items.map((item) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        end={!!item.end}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors',
                            collapsed ? 'rounded-full justify-center' : 'rounded-lg',
                            isActive
                              ? 'bg-primary-600 text-white'
                              : 'text-neutral-700 hover:bg-primary-100 hover:text-primary-700'
                          )
                        }
                        title={collapsed ? item.label : undefined}
                      >
                        <SvgIcon d={item.icon} className="shrink-0" />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            );
          });
        })()}
      </nav>
    </aside>
  );
}