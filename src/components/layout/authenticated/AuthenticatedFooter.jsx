import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../services/auth/AuthProvider';
import { cn } from '../utils/cn';

const APP_VERSION = '1.0.0';

/* Mismos menús que el sidebar para los enlaces del footer */
const FOOTER_MENUS = {
  doctor:       [
    { label: 'Dashboard',  path: '/doctor'            },
    { label: 'Mis Citas',  path: '/doctor/citas'      },
    { label: 'Remisiones', path: '/doctor/remisiones' },
    { label: 'Historial',  path: '/doctor/historial'  },
  ],
  nurse:        [
    { label: 'Dashboard',         path: '/nurse'                   },
    { label: 'Urgencias',         path: '/nurse/urgencias'         },
    { label: 'Triage',            path: '/nurse/triage'            },
    { label: 'Hospitalizaciones', path: '/nurse/hospitalizaciones' },
  ],
  patient:      [
    { label: 'Dashboard',      path: '/patient'                },
    { label: 'Mis Citas',      path: '/patient/citas'          },
    { label: 'Mi Historia',    path: '/patient/historia'       },
    { label: 'Prescripciones', path: '/patient/prescripciones' },
    { label: 'Perfil',         path: '/patient/perfil'         },
  ],
  hr:           [
    { label: 'Dashboard',     path: '/hr'              },
    { label: 'Usuarios',      path: '/hr/usuarios'     },
    { label: 'Doctores',      path: '/hr/doctores'     },
    { label: 'Enfermeras',    path: '/hr/enfermeras'   },
    { label: 'Farmacéuticos', path: '/hr/farmaceuticos'},
    { label: 'Secretarios',   path: '/hr/secretarios'  },
  ],
  pharmacist:   [
    { label: 'Dashboard',    path: '/pharmacist'               },
    { label: 'Inventario',   path: '/pharmacist/inventario'    },
    { label: 'Dispensación', path: '/pharmacist/dispensacion'  },
    { label: 'Alertas',      path: '/pharmacist/alertas'       },
  ],
  receptionist: [
    { label: 'Dashboard',  path: '/receptionist'              },
    { label: 'Afiliación', path: '/receptionist/afiliacion'   },
  ],
};

export default function AuthenticatedFooter({ className = '' }) {
  const auth        = useContext(AuthContext);
  const role        = auth?.role || 'patient';
  const currentYear = new Date().getFullYear();
  const menuItems   = FOOTER_MENUS[role] || [];

  return (
    <footer className={cn('bg-neutral-800 text-neutral-300 mt-auto', className)}>
      <div className="px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Info EPS */}
          <div>
            <h3 className="text-white font-semibold mb-3">EPS</h3>
            <p className="text-sm">
              Entidad promotora de salud.
              <br />
              Cuidamos de ti y de tu familia.
            </p>
          </div>

          {/* Enlaces dinámicos por rol */}
          <div>
            <h3 className="text-white font-semibold mb-3">Navegación</h3>
            <ul className="space-y-2 text-sm">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className="hover:text-white transition-colors"
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-white font-semibold mb-3">Contacto</h3>
            <p className="text-sm">Línea de atención: 01 8000 123 456</p>
            <p className="text-sm">Atención 24 horas</p>
          </div>

        </div>

        {/* Copyright + versión */}
        <div className="border-t border-neutral-700 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-neutral-500">
          <span>© {currentYear} EPS. Todos los derechos reservados.</span>
          <span>v{APP_VERSION}</span>
        </div>
      </div>
    </footer>
  );
}
