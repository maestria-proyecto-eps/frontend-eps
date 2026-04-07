import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../../services/auth/AuthContext';
import { Container } from '../../ui';
import { cn } from '../../../utils/cn';

const APP_VERSION = '1.0.0';

const FOOTER_MENUS = {
  "Médico": [
    { label: 'Dashboard',  path: '/doctor'            },
    { label: 'Mis Citas',  path: '/doctor/citas'      },
    { label: 'Remisiones', path: '/doctor/remisiones' },
    { label: 'Historial',  path: '/doctor/historial'  },
  ],
  "Enfermero": [
    { label: 'Dashboard',         path: '/nurse'                   },
    { label: 'Urgencias',         path: '/nurse/urgencias'         },
    { label: 'Triage',            path: '/nurse/triage'            },
    { label: 'Hospitalizaciones', path: '/nurse/hospitalizaciones' },
  ],
  "Paciente": [
    { label: 'Dashboard',      path: '/patient'                },
    { label: 'Mis Citas',      path: '/patient/citas'          },
    { label: 'Mi Historia',    path: '/patient/historia'       },
    { label: 'Prescripciones', path: '/patient/prescripciones' },
    { label: 'Perfil',         path: '/patient/perfil'         },
  ],
  "Talento Humano": [
    { label: 'Dashboard',     path: '/hr'               },
    { label: 'Usuarios',      path: '/hr/usuarios'      },
    { label: 'Doctores y especialidades',  path: '/hr/doctors'},
  ],
  "Farmaceuta": [
    { label: 'Dashboard',    path: '/pharmacist'              },
    { label: 'Inventario',   path: '/pharmacist/inventario'   },
    { label: 'Dispensación', path: '/pharmacist/dispensacion' },
    { label: 'Alertas',      path: '/pharmacist/alertas'      },
  ],
  "Recepcionista": [
    { label: 'Dashboard',  path: '/receptionist'            },
    { label: 'Afiliación', path: '/receptionist/afiliacion' },
  ],
};

export default function AuthenticatedFooter({ className = '' }) {
  const auth        = useContext(AuthContext);
  const role        = auth?.role || 'Paciente';
  const currentYear = new Date().getFullYear();
  const menuItems   = FOOTER_MENUS[role] || [];
  const supportPhone = '01 8000 123 456';

  return (
    <footer
      id="authenticated-footer"
      data-testid="authenticated-footer"
      className={cn(
        'bg-neutral-900 text-neutral-300 mt-auto border-t border-neutral-700',
        className
      )}
    >
      <Container className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-8">
          {/* Columna: Logo y descripción - CENTRADO */}
          <div id="auth-footer-brand" data-testid="auth-footer-brand-section" className="flex flex-col items-center justify-center text-center w-48 min-h-[200px]">
            <img 
              src="/brand/Logo_White_V.svg" 
              alt="Cuidarte EPS" 
              className="h-30 w-auto object-contain mb-4"
              data-testid="auth-footer-logo"
            />
            <p className="text-sm text-neutral-400">
              Entidad promotora de salud. Cuidamos de ti y de tu familia.
            </p>
          </div>

          {/* Columna: Enlaces de navegación */}
          <div id="auth-footer-navigation" data-testid="auth-footer-nav-section" className="w-48 flex flex-col justify-center min-h-[200px]">
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Navegación
            </h3>
            <ul className="space-y-2 text-sm">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className="text-neutral-400 hover:text-primary-400 transition-colors duration-200"
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna: Contacto */}
          <div id="auth-footer-contact" data-testid="auth-footer-contact-section" className="w-48 flex flex-col justify-center min-h-[200px]">
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Contacto
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-neutral-400">
                <span className="font-medium text-neutral-300">Línea de atención:</span>
                <br />
                <a 
                  href={`tel:${supportPhone.replace(/\s/g, '')}`}
                  id="auth-footer-phone"
                  data-testid="auth-footer-phone-link"
                  className="text-primary-400 hover:text-primary-300 transition-colors"
                >
                  {supportPhone}
                </a>
              </p>
              <p className="text-neutral-400">
                <span className="text-xs text-neutral-500">Atención 24 horas</span>
              </p>
            </div>
          </div>

          {/* Columna: Información */}
          <div id="auth-footer-info" data-testid="auth-footer-info-section" className="w-48 flex flex-col justify-center min-h-[200px]">
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Información
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#privacy"
                  id="auth-footer-link-privacy"
                  data-testid="auth-footer-link-privacy"
                  className="text-neutral-400 hover:text-primary-400 transition-colors duration-200"
                >
                  Privacidad
                </a>
              </li>
              <li>
                <a 
                  href="#terms"
                  id="auth-footer-link-terms"
                  data-testid="auth-footer-link-terms"
                  className="text-neutral-400 hover:text-primary-400 transition-colors duration-200"
                >
                  Términos de uso
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Línea divisora y copyright */}
        <div 
          id="auth-footer-bottom"
          data-testid="auth-footer-copyright-section"
          className="border-t border-neutral-700 pt-8 text-center text-sm text-neutral-500"
        >
          © {currentYear} Cuidarte EPS. Todos los derechos reservados. v{APP_VERSION}
        </div>
      </Container>
    </footer>
  );
}
