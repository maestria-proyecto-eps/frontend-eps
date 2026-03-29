import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../services/auth/AuthContext';
import { Button, Badge } from '../../ui';
import { cn } from '../../../utils/cn';
import { ROUTES } from '../../../constants';

const ROLE_LABELS = {
  'Médico': 'Médico',
  'Enfermero': 'Enfermero',
  'Paciente': 'Paciente',
  'Talento Humano': 'Talento Humano',
  'Farmaceuta': 'Farmaceuta',
  'Recepcionista': 'Recepcionista',
};

export default function AuthenticatedHeader({ className = '' }) {
  const auth = useContext(AuthContext);
  const nav = useNavigate();

  const role = auth?.role || 'Paciente';
  const roleLabel = ROLE_LABELS[role] || role;

  const handleLogout = () => {
    auth?.logout?.();
    nav(ROUTES.LOGIN);
  };

  return (
    <header
      id="authenticated-header"
      data-testid="authenticated-header"
      className={cn(
        'w-full bg-white border-b border-neutral-200 shadow-sm sticky top-0 z-50',
        className
      )}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Izquierda */}
          <Link 
            to={ROUTES.HOME} 
            id="auth-header-logo"
            data-testid="auth-header-logo-link"
            className="flex items-center gap-2 flex-shrink-0"
            title="Ir a inicio"
          >
            <img 
              src="/brand/Logo_Color_H.svg" 
              alt="Cuidarte EPS Logo" 
              className="h-12 w-auto object-contain"
              data-testid="auth-header-logo-image"
            />
          </Link>

          {/* Navegación + Rol + Logout - Derecha */}
          <div 
            id="auth-header-actions"
            data-testid="auth-header-actions-section"
            className="flex items-center gap-4 ml-auto"
          >
            {/* Identificación del usuario (rol + ID) */}
            <div 
              id="user-identification"
              data-testid="user-identification"
              className="hidden md:flex"
            >
              <Badge 
                variant="primary"
                size="md"
              >
                {auth?.payload?.num_documento ? `${auth.payload.num_documento} • ${roleLabel}` : roleLabel}
              </Badge>
            </div>

            {/* Botón Cerrar Sesión */}
            <Button
              onClick={handleLogout}
              id="btn-logout"
              data-testid="auth-header-logout-button"
              variant="outline-danger"
              size="sm"
              rightIcon={<span className="material-icons text-base">logout</span>}
              className="whitespace-nowrap hidden sm:inline-flex"
            >
              Cerrar sesión
            </Button>

            {/* Botón Cerrar Sesión - Solo icono en móvil */}
            <Button
              onClick={handleLogout}
              id="btn-logout-mobile"
              data-testid="auth-header-logout-button-mobile"
              variant="outline-danger"
              size="sm"
              rightIcon={<span className="material-icons text-base">logout</span>}
              className="sm:hidden"
            >
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
