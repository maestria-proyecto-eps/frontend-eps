import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants';
import { Container } from '../../ui';
import { cn } from '../../../utils/cn';

/**
 * Footer de la aplicación Cuidarte EPS.
 * Componente reutilizable con navegación, contacto y información legal.
 * 
 * Props:
 * - className: clases CSS adicionales
 */
export default function Footer({ className = '' }) {
  const currentYear = new Date().getFullYear();
  const supportPhone = '01 8000 123 456';

  return (
    <footer
      id="main-footer"
      data-testid="footer-component"
      className={cn(
        'bg-neutral-900 text-neutral-300 mt-auto border-t border-neutral-700',
        className
      )}
    >
      <Container className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-8">
          {/* Columna: Logo y descripción - CENTRADO */}
          <div id="footer-brand" data-testid="footer-brand-section" className="flex flex-col items-center justify-center text-center w-48 min-h-[200px]">
            <img 
              src="/brand/Logo_White_V.svg" 
              alt="Cuidarte EPS" 
              className="h-30 w-auto object-contain mb-4"
              data-testid="footer-logo"
            />
            <p className="text-sm text-neutral-400">
              Entidad promotora de salud. Cuidamos de ti y de tu familia.
            </p>
          </div>

          {/* Columna: Enlaces de navegación */}
          <div id="footer-navigation" data-testid="footer-nav-section" className="w-48 flex flex-col justify-center min-h-[200px]">
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Navegación
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to={ROUTES.HOME}
                  id="footer-link-home"
                  data-testid="footer-link-home"
                  className="text-neutral-400 hover:text-primary-400 transition-colors duration-200"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <a
                  href="#contact"
                  id="footer-link-contact"
                  data-testid="footer-link-contact"
                  className="text-neutral-400 hover:text-primary-400 transition-colors duration-200"
                >
                  Contacto
                </a>
              </li>
              <li>
                <Link 
                  to={ROUTES.LOGIN}
                  id="footer-link-login"
                  data-testid="footer-link-login"
                  className="text-neutral-400 hover:text-primary-400 transition-colors duration-200"
                >
                  Iniciar sesión
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna: Contacto */}
          <div id="footer-contact" data-testid="footer-contact-section" className="w-48 flex flex-col justify-center min-h-[200px]">
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Contacto
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-neutral-400">
                <span className="font-medium text-neutral-300">Línea de atención:</span>
                <br />
                <a 
                  href={`tel:${supportPhone.replace(/\s/g, '')}`}
                  id="footer-phone"
                  data-testid="footer-phone-link"
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
          <div id="footer-info" data-testid="footer-info-section" className="w-48 flex flex-col justify-center min-h-[200px]">
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Información
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to={ROUTES.COMPONENTS}
                  id="footer-link-brand"
                  data-testid="footer-link-brand"
                  className="text-neutral-400 hover:text-primary-400 transition-colors duration-200"
                >
                  Marca
                </Link>
              </li>
              <li>
                <a 
                  href="#privacy"
                  id="footer-link-privacy"
                  data-testid="footer-link-privacy"
                  className="text-neutral-400 hover:text-primary-400 transition-colors duration-200"
                >
                  Privacidad
                </a>
              </li>
              <li>
                <a 
                  href="#terms"
                  id="footer-link-terms"
                  data-testid="footer-link-terms"
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
          id="footer-bottom"
          data-testid="footer-copyright-section"
          className="border-t border-neutral-700 pt-8 text-center text-sm text-neutral-500"
        >
          <p>
            © {currentYear} <span className="text-neutral-400">Cuidarte EPS</span>. 
            <span className="block sm:inline sm:ml-1">Todos los derechos reservados.</span>
          </p>
        </div>
      </Container>
    </footer>
  );
}
