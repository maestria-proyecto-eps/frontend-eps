import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants';
import { Container } from '../../ui';
import { cn } from '../../../utils/cn';

/**
 * Footer de la aplicación EPS.
 */
export default function Footer({ className = '' }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'bg-neutral-800 text-neutral-300 mt-auto',
        className
      )}
    >
      <Container className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-3">EPS</h3>
            <p className="text-sm">
              Entidad promotora de salud. Cuidamos de ti y de tu familia.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Enlaces</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={ROUTES.HOME} className="hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to={ROUTES.LOGIN} className="hover:text-white transition-colors">
                  Iniciar sesión
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Contacto</h3>
            <p className="text-sm">Línea de atención: 01 8000 123 456</p>
            <p className="text-sm">Atención 24 horas</p>
          </div>
        </div>
        <div className="border-t border-neutral-700 mt-8 pt-8 text-center text-sm">
          © {currentYear} EPS. Todos los derechos reservados.
        </div>
      </Container>
    </footer>
  );
}
