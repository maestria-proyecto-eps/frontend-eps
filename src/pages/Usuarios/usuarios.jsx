import React, { useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout, PageContainer } from '../../components/layout';
import { DataTable, Badge, Button } from '../../components/ui';
import { ROUTES } from '../../constants';
import { http } from '../../services/api/http';
import { endpoints } from '../../services/api/endpoints';

// Roles quemados según los que aparecen en la respuesta del API
const ROLES_OPCIONES = [
  { value: 2, label: 'Médico' },
  { value: 3, label: 'Paciente' },
  { value: 4, label: 'Enfermero' },
  { value: 5, label: 'Farmaceuta' },
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

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await http.get(endpoints.users.list, {
        params: { pag: page, cantidad: pageSize },
      });
      if (res.hasError || !res.data) {
        setUsuarios([]);
        setTotal(0);
        return;
      }
      const { data: list = [], page: currentPage = 1, pages = 0 } = res.data;
      setUsuarios(Array.isArray(list) ? list : []);
      setTotal(pages * pageSize);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setUsuarios([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtrado = usuarios.filter((row) => {
    return Object.entries(filters).every(([key, val]) => {
      if (val == null || String(val).trim() === '') return true;
      const cell = row[key];
      if (key === 'estado') return String(cell) === String(val);
      return String(cell ?? '').toLowerCase().includes(String(val).trim().toLowerCase());
    });
  });

  const hasActiveFilters = Object.values(filters).some((v) => v != null && String(v).trim() !== '');
  const paginationTotal = hasActiveFilters ? filtrado.length : total;

  useEffect(() => {
    if (hasActiveFilters) setPage(1);
  }, [hasActiveFilters]);

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
          data={filtrado}
          filters={filters}
          onFiltersChange={setFilters}
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
