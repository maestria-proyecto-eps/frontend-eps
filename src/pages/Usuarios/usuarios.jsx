import React, { useCallback, useEffect } from 'react';
import { PageContainer } from '../../components/layout';
import { DataTable, Badge, Input, Button } from '../../components/ui';
import { http } from '../../services/api/http';
import { endpoints } from '../../services/api/endpoints';

// Roles quemados según los que aparecen en la respuesta del API
const ROLES_OPCIONES = [
  { value: 2, label: 'Médico' },
  { value: 3, label: 'Paciente' },
  { value: 4, label: 'Enfermero' },
  { value: 5, label: 'Farmaceuta' },
  { value: 6, label: 'Recepcionista' },
  { value: 7, label: 'Talento Humano' },
];

const ESTADOS_OPCIONES = [
  { value: 1, label: 'Activo' },
  { value: 0, label: 'Inactivo' },
];

const COLUMNAS_USUARIOS = [
  { key: 'id_usuario', label: 'ID', filterable: false },
  { key: 'num_documento', label: 'Documento', filterable: false },
  { key: 'nombres', label: 'Nombres', filterable: true },
  { key: 'apellidos', label: 'Apellidos', filterable: true },
  { key: 'rol_des', label: 'Rol', filterable: true, filterType: 'select', filterOptions: ROLES_OPCIONES.map((r) => ({ value: String(r.value), label: r.label })) },
  { key: 'estado', label: 'Estado', filterable: true, filterType: 'select', filterOptions: ESTADOS_OPCIONES.map((e) => ({ value: String(e.value), label: e.label })), render: (valor) => (
    <Badge variant={valor === true || valor === 1 ? 'success' : 'neutral'} size="sm">{valor === true || valor === 1 ? 'Activo' : 'Inactivo'}</Badge>
  )},
];

const FORM_CONFIG_USUARIOS = {
  createTitle: 'Crear usuario',
  editTitle: 'Editar usuario',
  createButtonLabel: 'Crear usuario',
  createSubmitLabel: 'Crear',
  editSubmitLabel: 'Guardar',
  confirmDeactivateTitle: 'Confirmar desactivación',
  confirmDeactivateMessage: (row) => (
    <>¿Está seguro que desea desactivar al usuario con documento <strong>{row?.num_documento}</strong>?</>
  ),
  statusKey: 'estado',
  activeValue: true,
  deactivatedValue: false,
  fields: [
    { key: 'num_documento', label: 'Número de documento', type: 'text', placeholder: 'Documento', validation: ['required', 'document'], createOnly: true },
    { key: 'nombres', label: 'Nombres', type: 'text', placeholder: 'Nombres', validation: ['required'] },
    { key: 'apellidos', label: 'Apellidos', type: 'text', placeholder: 'Apellidos', validation: ['required'] },
    { key: 'password', label: 'Contraseña', type: 'password', placeholder: 'Contraseña', validation: ['required'], createOnly: true },
    { key: 'password_confirm', label: 'Confirmar contraseña', type: 'password', placeholder: 'Repetir contraseña', validation: ['required', 'passwordMatch'], createOnly: true },
    { key: 'id_rol', label: 'Rol', type: 'select', options: ROLES_OPCIONES },
  ],
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filters, setFilters] = React.useState({});
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [total, setTotal] = React.useState(0);
  const [docInput, setDocInput] = React.useState('');

  // Mantiene el input "Documento" sincronizado solo cuando el valor se aplica a filtros
  useEffect(() => {
    setDocInput(filters.num_documento ?? '');
  }, [filters.num_documento]);

  const fetchUsers = useCallback(async () => {
    const docFilter = filters.num_documento;
    const nombresFilter = filters.nombres;
    const apellidosFilter = filters.apellidos;
    const estadoFilter = filters.estado;
    const rolFilter = filters.rol_des;

    const hasDocFilter = docFilter != null && String(docFilter).trim() !== '';
    const hasNombresFilter = nombresFilter != null && String(nombresFilter).trim() !== '';
    const hasApellidosFilter = apellidosFilter != null && String(apellidosFilter).trim() !== '';
    const hasEstadoFilter = estadoFilter != null && String(estadoFilter).trim() !== '';
    const hasRolFilter = rolFilter != null && String(rolFilter).trim() !== '';

    setLoading(true);
    try {
      // Modo normal: paginación y filtros en el backend
      const params = {
        pag: page,
        cantidad: pageSize,
      };

      if (hasDocFilter) {
        params.num_document = String(docFilter).trim();
      }
      if (hasNombresFilter) {
        params.nombres = String(nombresFilter).trim();
      }
      if (hasApellidosFilter) {
        params.apellidos = String(apellidosFilter).trim();
      }
      if (hasEstadoFilter) {
        // El backend espera estado como booleano en querystring: estado=true|false
        params.estado = String(estadoFilter) === '1';
      }
      if (hasRolFilter) {
        params.rol = Number(rolFilter);
      }

      const { data: res } = await http.get(endpoints.users.list, {
        params,
      });
      if (res.hasError || !res.data) {
        setUsuarios([]);
        setTotal(0);
        return;
      }
      const { data: list = [], pages = 0 } = res.data;
      const mappedUsers = (Array.isArray(list) ? list : []).map((u) => ({
        ...u,
        nombres: u?.persona?.nombres ?? '',
        apellidos: u?.persona?.apellidos ?? '',
        // Normalizamos estado a boolean para que DataTable pueda comparar con
        // formConfig.activeValue/deactivatedValue (true/false).
        estado:
          u?.estado === true ||
          u?.estado === 1 ||
          u?.estado === '1' ||
          u?.estado === 'true',
      }));
      setUsuarios(mappedUsers);
      setTotal(pages * pageSize);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setUsuarios([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filtro adicional en el cliente (para soportar búsquedas por documento sobre el lote recibido)
  // La API hace filtrado y paginación; aquí solo renderizamos el resultado.
  const dataForTable = usuarios;
  const paginationTotal = total;

  const handleFiltersChange = (nextFilters) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const handleCreate = async (newRow) => {
    const numDocumento = Number(newRow.num_documento) || newRow.num_documento;

    // 1) Crear persona
    await http.post(endpoints.persons.create, {
      num_documento: numDocumento,
      nombres: String(newRow.nombres ?? '').trim(),
      apellidos: String(newRow.apellidos ?? '').trim(),
    });

    // 2) Crear usuario
    await http.post(endpoints.users.create, {
      num_documento: numDocumento,
      password: newRow.password,
      id_rol: Number(newRow.id_rol),
    });
    await fetchUsers();
  };

  const handleEdit = async (id, updatedRow) => {
    const numDocumento = Number(updatedRow.num_documento) || updatedRow.num_documento;

    // 1) Actualizar nombres en /api/persons/{num_documento}
    await http.put(endpoints.persons.updateById(numDocumento), {
      nombres: String(updatedRow.nombres ?? '').trim(),
      // Si el backend requiere ambos campos, mandamos apellidos (sin permitir edición en UI).
      apellidos: String(updatedRow.apellidos ?? '').trim(),
    });

    // 2) Actualizar rol en /api/users/{id}
    await http.put(endpoints.users.updateById(id), {
      id_rol: Number(updatedRow.id_rol),
    });

    await fetchUsers();
  };

  const handleDeactivate = async (id) => {
    await http.put(endpoints.users.changeStatus(id), { estado: 0 });
    await fetchUsers();
  };

  const handleActivate = async (id) => {
    await http.put(endpoints.users.changeStatus(id), { estado: 1 });
    await fetchUsers();
  };

  return (
      <PageContainer>
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-800">Gestión de usuarios</h1>
          <div />
        </div>
        <div className="mb-4 flex items-end gap-2 rounded-lg border border-neutral-200 bg-neutral-50/80 p-4">
          <Input
            label="Documento"
            value={docInput}
            onChange={(e) => setDocInput(e.target.value)}
            placeholder="Documento exacto"
            className="w-[260px]"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              const value = docInput.trim();
              setFilters((prev) => ({ ...prev, num_documento: value }));
              setPage(1);
            }}
            disabled={!docInput.trim()}
            className="h-[44px] w-[44px] p-0"
            title="Buscar por documento"
            aria-label="Buscar por documento"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 17.5a7.5 7.5 0 006.15-2.85z" />
            </svg>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDocInput('');
              setFilters((prev) => ({ ...prev, num_documento: '' }));
              setPage(1);
            }}
            className="h-[44px] w-[44px] p-0"
            title="Recargar"
            aria-label="Recargar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 0115.55-6.36" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.55 5.64V2.5m0 3.14h-3.14" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-15.55 6.36" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.45 18.36v3.14m0-3.14h3.14" />
            </svg>
          </Button>
        </div>
        <DataTable
          columns={COLUMNAS_USUARIOS}
          data={dataForTable}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          loading={loading}
          pagination={{
            page,
            pageSize,
            total: paginationTotal,
            pageSizeOptions: [5, 10, 25, 30],
            onPageChange: setPage,
            onPageSizeChange: (size) => { setPageSize(size); setPage(1); },
          }}
          formConfig={FORM_CONFIG_USUARIOS}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDeactivate={handleDeactivate}
          onActivate={handleActivate}
          keyExtractor={(row) => row.id_usuario}
          emptyMessage={loading ? 'Cargando...' : 'No hay usuarios o no coinciden con los filtros'}
        />
      </PageContainer>
  );
}
