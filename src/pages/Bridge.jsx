import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../services/auth/AuthContext';
import { PageContainer } from '../components/layout';
import { Card, Button } from '../components/ui';
import { http } from '../services/api/http';
import { endpoints } from '../services/api/endpoints';

// Cache simple por documento para evitar requests repetidos al montar/re-renderizar.
const ROLES_CACHE_BY_DOCUMENT = new Map();
const IN_FLIGHT_ROLES_REQUESTS = new Map();

// Módulos y accesos (deben estar alineados con rutas existentes en src/App.jsx)
// Nota: por ahora incluimos las rutas que existen hoy; se puede extender después.
const MODULE_ITEMS = [
  // Talento Humano
  { module: 'Inicio', roles: ['Talento Humano'], item: { label: 'Dashboard', path: '/hr' } },
  { module: 'Administración', roles: ['Talento Humano'], item: { label: 'Usuarios', path: '/hr/usuarios' } },

  // Doctor
  { module: 'Médico', roles: ['Médico'], item: { label: 'Dashboard', path: '/doctor' } },

  // Recepcionista
  { module: 'Recepción', roles: ['Recepcionista'], item: { label: 'Dashboard', path: '/receptionist' } },

  // Paciente (dashboard genérico)
  { module: 'Paciente', roles: ['Paciente'], item: { label: 'Dashboard', path: '/patient' } },
];

function buildModulesFromRoles(roleList = []) {
  const moduleMap = new Map();
  MODULE_ITEMS.forEach((def) => {
    const hasAccess = def.roles.some((r) => roleList.includes(r));
    if (!hasAccess) return;
    if (!moduleMap.has(def.module)) moduleMap.set(def.module, []);
    moduleMap.get(def.module).push(def.item);
  });

  return Array.from(moduleMap.entries()).map(([module, items]) => ({
    module,
    items,
  }));
}

export default function Bridge() {
  const auth = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enabledModules, setEnabledModules] = useState([]);

  const documentNumber = auth?.payload?.num_documento;
  const setEnabledRoles = auth?.setEnabledRoles;

  useEffect(() => {
    const loadRoles = async () => {
      setLoading(true);
      setError('');

      try {
        if (!documentNumber) {
          setEnabledModules([]);
          setLoading(false);
          return;
        }

        // Si ya consultamos este documento, reutilizamos y no llamamos de nuevo al backend.
        if (ROLES_CACHE_BY_DOCUMENT.has(documentNumber)) {
          const cachedRoles = ROLES_CACHE_BY_DOCUMENT.get(documentNumber) || [];
          setEnabledRoles?.(cachedRoles);
          setEnabledModules(buildModulesFromRoles(cachedRoles));
          setLoading(false);
          return;
        }

        let reqPromise = IN_FLIGHT_ROLES_REQUESTS.get(documentNumber);
        if (!reqPromise) {
          // Endpoint solicitado para identificar roles por usuario
          // https://backend-eps-users-service.onrender.com/api/users/?num_document=1015442890&pag=1&cantidad=30
          // (En el frontend usamos /api/users vía proxy)
          reqPromise = http.get(endpoints.users.list, {
            params: {
              num_document: documentNumber,
              pag: 1,
              cantidad: 1,
            },
          });
          IN_FLIGHT_ROLES_REQUESTS.set(documentNumber, reqPromise);
        }

        const { data: res } = await reqPromise;

        if (res?.hasError || !res?.data?.data) {
          setEnabledModules([]);
          setLoading(false);
          return;
        }

        const roleRows = Array.isArray(res.data.data) ? res.data.data : [];

        // estado=true => rol habilitado
        const enabledRoleDes = roleRows
          .filter((r) => r?.estado === true || r?.estado === 1 || r?.estado === 'true')
          .map((r) => r?.rol_des)
          .filter(Boolean);

        const uniqueRoleDes = Array.from(new Set(enabledRoleDes));
        ROLES_CACHE_BY_DOCUMENT.set(documentNumber, uniqueRoleDes);

        // Alimentamos el sidebar con los roles habilitados por backend
        setEnabledRoles?.(uniqueRoleDes);

        setEnabledModules(buildModulesFromRoles(uniqueRoleDes));
        setLoading(false);
      } catch (e) {
        console.error('Error consultando roles en Bridge:', e);
        setError('Error consultando tus roles.');
        setEnabledModules([]);
        setLoading(false);
      } finally {
        IN_FLIGHT_ROLES_REQUESTS.delete(documentNumber);
      }
    };

    loadRoles();
  }, [documentNumber, setEnabledRoles]);

  return (
    <PageContainer>
      {/* Hero (estilo Home) */}
      <section className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xl">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900">
              Bienvenido a{' '}
              <span className="text-secondary-500">Cuidarte EPS</span>
            </h1>
            <p className="mt-4 text-base md:text-lg text-neutral-700">
              Nos alegra tenerte aquí. Elige el módulo con el que deseas trabajar y empecemos.
            </p>
          </div>

          <div className="w-full md:max-w-md md:justify-self-end">
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-white">
                <img
                  src="/images/general.svg.png"
                  alt="Ilustración de bienvenida"
                  className="h-full w-full object-contain"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <Card>
          <Card.Body>
            <p className="text-neutral-700">Cargando permisos...</p>
          </Card.Body>
        </Card>
      ) : error ? (
        <Card>
          <Card.Body>
            <p className="text-emergency-600">{error}</p>
          </Card.Body>
        </Card>
      ) : enabledModules.length === 0 ? (
        <Card>
          <Card.Body>
            <p className="text-neutral-700">No tienes permisos para acceder a ningún módulo.</p>
          </Card.Body>
        </Card>
      ) : null}
    </PageContainer>
  );
}

