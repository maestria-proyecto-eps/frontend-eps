import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants';
import { cn } from '../../../utils/cn';

/**
 * Header principal de la aplicación EPS.
 */
export default function Header({ className = '', showAuth = true }) {
  return (
    <header
      className={cn(
        'bg-white border-b border-neutral-200 shadow-sm sticky top-0 z-50',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={ROUTES.HOME} className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary-600">EPS</span>
            <span className="text-neutral-600 text-sm hidden sm:inline">Salud y bienestar</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              to={ROUTES.HOME}
              className="text-neutral-600 hover:text-primary-600 font-medium transition-colors"
            >
              Inicio
            </Link>
            {showAuth && (
              <>
                <Link
                  to={ROUTES.LOGIN}
                  className="text-neutral-600 hover:text-primary-600 font-medium transition-colors"
                >
                  Iniciar sesión
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
