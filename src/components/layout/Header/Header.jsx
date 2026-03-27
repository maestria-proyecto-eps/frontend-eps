import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants';
import { cn } from '../../../utils/cn';
import { Button } from '../../ui';

/**
 * Header principal de la aplicación Cuidarte EPS.
 * Componente reutilizable con logo, navegación y botón de autenticación.
 * 
 * Props:
 * - className: clases CSS adicionales
 * - showAuth: mostrar/ocultar botón "Iniciar sesión" (default: true)
 */
export default function Header({ className = '', showAuth = true }) {
  return (
    <header
      id="main-header"
      data-testid="header-component"
      className={cn(
        'bg-white border-b border-neutral-200 shadow-sm sticky top-0 z-50',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Izquierda */}
          <Link 
            to={ROUTES.HOME} 
            id="header-logo"
            data-testid="header-logo-link"
            className="flex items-center gap-2 flex-shrink-0"
            title="Ir a inicio"
          >
            <img 
              src="/brand/Logo_Color_H.svg" 
              alt="Cuidarte EPS Logo" 
              className="h-12 w-auto object-contain"
              data-testid="header-logo-image"
            />
          </Link>

          {/* Navegación + Botón - Derecha */}
          <div 
            id="header-actions"
            data-testid="header-actions-section"
            className="flex items-center gap-6 ml-auto"
          >
            {/* Enlaces de navegación */}
            <nav 
              id="main-nav"
              data-testid="header-navigation"
              className="hidden md:flex items-center gap-6"
            >
              <Link
                to={ROUTES.HOME}
                id="nav-home"
                data-testid="nav-link-home"
                className="text-neutral-700 hover:text-primary-600 font-medium text-sm transition-colors duration-200"
              >
                Inicio
              </Link>
              <div className="text-neutral-300">|</div>
              <a
                href="#contact"
                id="nav-contact"
                data-testid="nav-link-contact"
                className="text-neutral-700 hover:text-primary-600 font-medium text-sm transition-colors duration-200"
              >
                Contacto
              </a>
            </nav>

            {/* Botón Iniciar Sesión */}
            {showAuth && (
              <Link to={ROUTES.LOGIN}>
                <Button 
                  id="btn-login"
                  data-testid="header-login-button"
                  variant="outline"
                  size="md"
                  className="hidden sm:inline-flex whitespace-nowrap"
                >
                  Iniciar sesión →
                </Button>
              </Link>
            )}
          </div>

          {/* Menú móvil - Placeholder para futuro */}
          <div 
            id="mobile-menu-toggle"
            data-testid="mobile-menu-button"
            className="md:hidden flex items-center ml-4"
          >
            <button 
              className="text-neutral-700 hover:text-primary-600 transition-colors"
              aria-label="Abrir menú"
            >
              ≡
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
