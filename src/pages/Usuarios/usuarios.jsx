import React, { useCallback, useEffect } from 'react';
import { PageContainer } from '../../components/layout';
import { DataTable, Badge } from '../../components/ui';
import { http } from '../../services/api/http';
import { endpoints } from '../../services/api/endpoints';

// Roles quemados según los que aparecen en la respuesta del API
const ROLES_OPCIONES = [
  { value: 1, label: 'Administrador' },
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
  { key: 'num_documento', label: 'Documento', filterable: true },
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
  const [allDocLoaded, setAllDocLoaded] = React.useState(false);

  const fetchUsers = useCallback(async ({ forceReload = false } = {}) => {
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

    // Si solo hay filtro por documento, queremos traer todas las páginas (cantidad 30)
    const onlyDocFilter = hasDocFilter && !hasNombresFilter && !hasApellidosFilter && !hasEstadoFilter && !hasRolFilter;

    // Si ya cargamos todo el universo para búsqueda por documento, no volvemos a llamar al backend
    if (onlyDocFilter && allDocLoaded && !forceReload) {
      return;
    }

    setLoading(true);
    try {
      if (onlyDocFilter) {
        const pageSizeForDoc = 30;
        let allData = [];

        // Primera página: obtenemos datos y número total de páginas
        const { data: firstRes } = await http.get(endpoints.users.list, {
          params: { pag: 1, cantidad: pageSizeForDoc },
        });
        if (firstRes.hasError || !firstRes.data) {
          setUsuarios([]);
          setTotal(0);
          return;
        }
        const { data: firstList = [], pages = 0 } = firstRes.data;
        allData = Array.isArray(firstList) ? firstList : [];

        const totalPages = Number(pages) || 0;

        // Traemos el resto de páginas
        for (let p = 2; p <= totalPages; p += 1) {
          const { data: resPage } = await http.get(endpoints.users.list, {
            params: { pag: p, cantidad: pageSizeForDoc },
          });
          if (!resPage.hasError && resPage.data?.data) {
            const pageList = Array.isArray(resPage.data.data) ? resPage.data.data : [];
            allData = allData.concat(pageList);
          }
        }

        const mappedAllData = allData.map((u) => ({
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
        setUsuarios(mappedAllData);
        setTotal(allData.length);
        setPage(1);
        setPageSize(pageSizeForDoc);
        setAllDocLoaded(true);
        return;
      }

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
        params.estado = Number(estadoFilter);
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
  }, [page, pageSize, filters, allDocLoaded]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filtro adicional en el cliente (para soportar búsquedas por documento sobre el lote recibido)
  const filtrado = usuarios.filter((row) => {
    return Object.entries(filters).every(([key, val]) => {
      if (val == null || String(val).trim() === '') return true;
      const value = String(val).trim().toLowerCase();
      const cell = row[key];
      if (key === 'estado') {
        // El select del UI manda valores '1'/'0', pero el backend puede devolver boolean.
        // Convertimos ambos a 0/1 para comparar de forma consistente.
        const cellNum =
          cell === true || cell === 1 || cell === '1' || cell === 'true'
            ? 1
            : cell === false || cell === 0 || cell === '0' || cell === 'false'
              ? 0
              : Number(cell);
        const valNum = val === 'true' ? 1 : val === 'false' ? 0 : Number(val);
        return cellNum === valNum;
      }
      if (key === 'rol_des') {
        const selectedRole = ROLES_OPCIONES.find((r) => String(r.value) === String(val));
        return selectedRole ? String(cell ?? '').toLowerCase() === String(selectedRole.label).toLowerCase() : true;
      }
      // Para documento usamos "empieza por" en lugar de "contiene"
      if (key === 'num_documento') {
        const doc = String(cell ?? '').toLowerCase();
        return doc.startsWith(value);
      }
      return String(cell ?? '').toLowerCase().includes(value);
    });
  });

  // Cuando solo hay filtro por documento, la paginación se hace completamente en el cliente
  const hasDocFilterView = filters.num_documento != null && String(filters.num_documento).trim() !== '';
  const hasEstadoFilterView = filters.estado != null && String(filters.estado).trim() !== '';
  const hasRolFilterView = filters.rol_des != null && String(filters.rol_des).trim() !== '';
  const onlyDocFilterView = hasDocFilterView && !hasEstadoFilterView && !hasRolFilterView;

  const dataForTable = onlyDocFilterView
    ? filtrado.slice((page - 1) * pageSize, page * pageSize)
    : filtrado;

  const paginationTotal = onlyDocFilterView ? filtrado.length : total;

  const handleFiltersChange = (nextFilters) => {
    // Al cambiar filtros, siempre arrancamos desde la primera página
    setFilters(nextFilters);
    setPage(1);

    // Si salimos del modo "solo documento", la próxima vez que entremos recargamos todo el universo
    const nextDoc = nextFilters.num_documento;
    const nextNombres = nextFilters.nombres;
    const nextApellidos = nextFilters.apellidos;
    const nextEstado = nextFilters.estado;
    const nextRol = nextFilters.rol_des;
    const hasNextDoc = nextDoc != null && String(nextDoc).trim() !== '';
    const hasNextNombres = nextNombres != null && String(nextNombres).trim() !== '';
    const hasNextApellidos = nextApellidos != null && String(nextApellidos).trim() !== '';
    const hasNextEstado = nextEstado != null && String(nextEstado).trim() !== '';
    const hasNextRol = nextRol != null && String(nextRol).trim() !== '';

    const nextOnlyDoc = hasNextDoc && !hasNextNombres && !hasNextApellidos && !hasNextEstado && !hasNextRol;
    if (!nextOnlyDoc) {
      setAllDocLoaded(false);
    }
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
    await fetchUsers({ forceReload: true });
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

    await fetchUsers({ forceReload: true });
  };

  const handleDeactivate = async (id) => {
    await http.put(endpoints.users.changeStatus(id), { estado: 0 });
    await fetchUsers({ forceReload: true });
  };

  const handleActivate = async (id) => {
    await http.put(endpoints.users.changeStatus(id), { estado: 1 });
    await fetchUsers({ forceReload: true });
  };

  return (
      <PageContainer>
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-800">Gestión de usuarios</h1>
          <div />
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
