import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../services/auth/AuthContext';
import { Button } from '../../ui';
import { cn } from '../../../utils/cn';
import { ROUTES } from '../../../constants';
import { http } from '../../../services/api/http';
import { endpoints } from '../../../services/api/endpoints';

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
  const [userInfo, setUserInfo] = useState(null);

  const role = auth?.role || 'Paciente';
  const roleLabel = ROLE_LABELS[role] || role;
  const userId = auth?.payload?.num_documento;

  // Obtener información del usuario autenticado
  useEffect(() => {
    if (!userId) return;

    const fetchUserInfo = async () => {
      try {
        const response = await http.get(endpoints.persons.getByDocument(userId));
        const data = response.data?.data || response.data;
        setUserInfo(data);
      } catch {
        // Error fetching user info, display fallback info
      }
    };

    fetchUserInfo();
  }, [userId]);

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
              className="hidden md:flex items-center gap-3"
            >
              {userInfo ? (
                <div className="flex items-center gap-2">
                  {/* Hola! [Nombre] - Grande, negrita, subrayado verde */}
                  <span className="text-primary-600 font-bold text-base">
                    Hola!
                  </span>
                  <span className="text-neutral-900 font-bold text-base">
                    {(userInfo.nombre || userInfo.nombres || '')} {(userInfo.apellido || userInfo.apellidos || '')}
                  </span>
                  
                  {/* Rol - Pequeño, subrayado secundario */}
                  <span className="text-xs ml-2">
                    <span className="text-secondary-600 font-semibold">
                      Rol
                    </span>
                    <span className="text-neutral-700 ml-1">{roleLabel}</span>
                  </span>
                  
                  {/* ID - Pequeño, subrayado secundario */}
                  <span className="text-xs">
                    <span className="text-secondary-600 font-semibold">
                      ID
                    </span>
                    <span className="text-neutral-700 ml-1">{userId}</span>
                  </span>
                </div>
              ) : (
                <div className="text-sm font-medium text-neutral-700">
                  {userId} • {roleLabel}
                </div>
              )}
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
