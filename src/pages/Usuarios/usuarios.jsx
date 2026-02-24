import React from 'react';
import { Link } from 'react-router-dom';
import { MainLayout, PageContainer } from '../../components/layout';
import { DataTable, Badge, Button } from '../../components/ui';
import { ROUTES } from '../../constants';



// Datos de ejemplo (luego vendrán del API)
const USUARIOS_INICIALES = [
  { id: 1, nombre: 'María García', documento: '12345678', email: 'maria.garcia@ejemplo.com', rol: 'Admin', estado: 'Activo' },
  { id: 2, nombre: 'Juan Pérez', documento: '87654321', email: 'juan.perez@ejemplo.com', rol: 'Usuario', estado: 'Activo' },
  { id: 3, nombre: 'Ana López', documento: '11223344', email: 'ana.lopez@ejemplo.com', rol: 'HR', estado: 'Inactivo' },
  { id: 4, nombre: 'Carlos Ruiz', documento: '44332211', email: 'carlos.ruiz@ejemplo.com', rol: 'Usuario', estado: 'Activo' },
  { id: 5, nombre: 'Laura Martínez', documento: '55667788', email: 'laura.martinez@ejemplo.com', rol: 'Admin', estado: 'Activo' },
  { id: 6, nombre: 'Pedro Sánchez', documento: '99887766', email: 'pedro.sanchez@ejemplo.com', rol: 'Usuario', estado: 'Activo' },
  { id: 7, nombre: 'Sofía Ramírez', documento: '55443322', email: 'sofia.ramirez@ejemplo.com', rol: 'HR', estado: 'Activo' },
  { id: 8, nombre: 'Diego Fernández', documento: '11224455', email: 'diego.fernandez@ejemplo.com', rol: 'Usuario', estado: 'Inactivo' },
  { id: 9, nombre: 'Elena Torres', documento: '66778899', email: 'elena.torres@ejemplo.com', rol: 'Admin', estado: 'Activo' },
  { id: 10, nombre: 'Miguel Díaz', documento: '33445566', email: 'miguel.diaz@ejemplo.com', rol: 'Usuario', estado: 'Activo' },
  { id: 11, nombre: 'Isabel Moreno', documento: '77889900', email: 'isabel.moreno@ejemplo.com', rol: 'HR', estado: 'Inactivo' },
  { id: 12, nombre: 'Roberto Castro', documento: '22334455', email: 'roberto.castro@ejemplo.com', rol: 'Usuario', estado: 'Activo' },
  { id: 13, nombre: 'Carmen Ortiz', documento: '88990011', email: 'carmen.ortiz@ejemplo.com', rol: 'Admin', estado: 'Activo' },
  { id: 14, nombre: 'Andrés Vargas', documento: '44556677', email: 'andres.vargas@ejemplo.com', rol: 'Usuario', estado: 'Activo' },
  { id: 15, nombre: 'Patricia Reyes', documento: '99001122', email: 'patricia.reyes@ejemplo.com', rol: 'HR', estado: 'Inactivo' },
  { id: 16, nombre: 'Fernando Mora', documento: '55667788', email: 'fernando.mora@ejemplo.com', rol: 'Usuario', estado: 'Activo' },
  { id: 17, nombre: 'Lucía Herrera', documento: '12341234', email: 'lucia.herrera@ejemplo.com', rol: 'Admin', estado: 'Activo' },
  { id: 18, nombre: 'Jorge Jiménez', documento: '56785678', email: 'jorge.jimenez@ejemplo.com', rol: 'Usuario', estado: 'Inactivo' },
  { id: 19, nombre: 'Rosa Navarro', documento: '90129012', email: 'rosa.navarro@ejemplo.com', rol: 'HR', estado: 'Activo' },
  { id: 20, nombre: 'Antonio Romero', documento: '34563456', email: 'antonio.romero@ejemplo.com', rol: 'Usuario', estado: 'Activo' },
];

const ROLES_OPCIONES = [
  { value: 'Admin', label: 'Admin' },
  { value: 'Usuario', label: 'Usuario' },
  { value: 'HR', label: 'HR' },
];

const ESTADOS_OPCIONES = [
  { value: 'Activo', label: 'Activo' },
  { value: 'Inactivo', label: 'Inactivo' },
];

const COLUMNAS_USUARIOS = [
  { key: 'nombre', label: 'Nombre', filterable: true },
  { key: 'documento', label: 'Documento', filterable: true },
  { key: 'email', label: 'Email', filterable: true },
  { key: 'rol', label: 'Rol', filterable: true, filterType: 'select', filterOptions: ROLES_OPCIONES },
  { key: 'estado', label: 'Estado', filterable: true, filterType: 'select', filterOptions: ESTADOS_OPCIONES, render: (valor) => (
    <Badge variant={valor === 'Activo' ? 'success' : 'neutral'} size="sm">{valor}</Badge>
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
    <>¿Está seguro que desea desactivar a <strong>{row?.nombre}</strong>? El usuario no podrá acceder al sistema.</>
  ),
  statusKey: 'estado',
  activeValue: 'Activo',
  deactivatedValue: 'Inactivo',
  fields: [
    { key: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Nombre completo', validation: ['required'] },
    { key: 'documento', label: 'Documento', type: 'text', placeholder: 'Número de documento', validation: ['required', 'document'] },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'correo@ejemplo.com', validation: ['required', 'email'] },
    { key: 'rol', label: 'Rol', type: 'select', options: ROLES_OPCIONES },
    { key: 'estado', label: 'Estado', type: 'select', options: ESTADOS_OPCIONES, defaultValue: 'Activo' },
  ],
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = React.useState(() => [...USUARIOS_INICIALES]);
  const [filters, setFilters] = React.useState({});
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);

  const filtrado = usuarios.filter((row) => {
    return Object.entries(filters).every(([key, val]) => {
      if (val == null || String(val).trim() === '') return true;
      return String(row[key] ?? '').toLowerCase().includes(String(val).toLowerCase());
    });
  });
  const total = filtrado.length;
  const paginados = filtrado.slice((page - 1) * pageSize, page * pageSize);

  const handleCreate = (newRow) => {
    const nuevoId = Math.max(0, ...usuarios.map((u) => u.id)) + 1;
    setUsuarios((prev) => [...prev, { id: nuevoId, ...newRow }]);
  };

  const handleEdit = (id, updatedRow) => {
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, ...updatedRow } : u)));
  };

  const handleDeactivate = (id) => {
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, estado: 'Inactivo' } : u)));
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
          data={paginados}
          filters={filters}
          onFiltersChange={setFilters}
          pagination={{
            page,
            pageSize,
            total,
            pageSizeOptions: [5, 10, 25],
            onPageChange: setPage,
            onPageSizeChange: (size) => { setPageSize(size); setPage(1); },
          }}
          formConfig={FORM_CONFIG_USUARIOS}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDeactivate={handleDeactivate}
          keyExtractor={(row) => row.id}
          emptyMessage="No hay usuarios que coincidan con los filtros"
        />
      </PageContainer>
    </MainLayout>
  );
}
