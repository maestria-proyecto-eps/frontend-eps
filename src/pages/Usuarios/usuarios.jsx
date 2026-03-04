import React, { useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout, PageContainer } from '../../components/layout';
import { DataTable, Badge, Button } from '../../components/ui';
import { ROUTES } from '../../constants';
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
  { key: 'rol_des', label: 'Rol', filterable: true, filterType: 'select', filterOptions: ROLES_OPCIONES.map((r) => ({ value: r.label, label: r.label })) },
  { key: 'estado', label: 'Estado', filterable: true, filterType: 'select', filterOptions: ESTADOS_OPCIONES.map((e) => ({ value: String(e.value), label: e.label })), render: (valor) => (
    <Badge variant={valor === 1 ? 'success' : 'neutral'} size="sm">{valor === 1 ? 'Activo' : 'Inactivo'}</Badge>
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
  activeValue: 1,
  deactivatedValue: 0,
  fields: [
    { key: 'num_documento', label: 'Número de documento', type: 'text', placeholder: 'Documento', validation: ['required', 'document'] },
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

  const fetchUsers = useCallback(async () => {
    const docFilter = filters.num_documento;
    const estadoFilter = filters.estado;
    const rolFilter = filters.rol_des;

    const hasDocFilter = docFilter != null && String(docFilter).trim() !== '';
    const hasEstadoFilter = estadoFilter != null && String(estadoFilter).trim() !== '';
    const hasRolFilter = rolFilter != null && String(rolFilter).trim() !== '';

    // Si solo hay filtro por documento, queremos traer todas las páginas (cantidad 30)
    const onlyDocFilter = hasDocFilter && !hasEstadoFilter && !hasRolFilter;

    // Si ya cargamos todo el universo para búsqueda por documento, no volvemos a llamar al backend
    if (onlyDocFilter && allDocLoaded) {
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

        setUsuarios(allData);
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
        params.num_documento = String(docFilter).trim();
      }
      if (hasEstadoFilter) {
        params.estado = Number(estadoFilter);
      }
      if (hasRolFilter) {
        const rolOpcion = ROLES_OPCIONES.find((r) => r.label === String(rolFilter).trim());
        if (rolOpcion) {
          params.rol = rolOpcion.value;
        }
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
      setUsuarios(Array.isArray(list) ? list : []);
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
      if (key === 'estado') return String(cell) === String(val);
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
    const nextEstado = nextFilters.estado;
    const nextRol = nextFilters.rol_des;
    const hasNextDoc = nextDoc != null && String(nextDoc).trim() !== '';
    const hasNextEstado = nextEstado != null && String(nextEstado).trim() !== '';
    const hasNextRol = nextRol != null && String(nextRol).trim() !== '';

    const nextOnlyDoc = hasNextDoc && !hasNextEstado && !hasNextRol;
    if (!nextOnlyDoc) {
      setAllDocLoaded(false);
    }
  };

  const handleCreate = async (newRow) => {
    await http.post(endpoints.users.create, {
      num_documento: Number(newRow.num_documento) || newRow.num_documento,
      password: newRow.password,
      id_rol: Number(newRow.id_rol),
    });
    await fetchUsers();
  };

  const handleEdit = async (id, updatedRow) => {
    await http.put(endpoints.users.updateById(id), {
      num_documento: Number(updatedRow.num_documento) || updatedRow.num_documento,
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
    <MainLayout>
      <PageContainer>
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-800">Gestión de usuarios</h1>
          <Link to={ROUTES.HOME}>
            <Button variant="outline" size="sm">← Volver al inicio</Button>
          </Link>
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
    </MainLayout>
  );
}
