import React from 'react';
import { Link } from 'react-router-dom';
import { MainLayout, PageContainer } from '../components/layout';
import {
  Button,
  Input,
  Card,
  Badge,
  Spinner,
  Alert,
  DatePicker,
  DataTable,
  Modal,
  ColorPaletteTable,
  TypographyShowcase,
} from '../components/ui';
import { ROUTES, BRAND_NAME } from '../constants';

const PALETA_PRIMARIA = { nombre: 'Primario (Verde)', hex: '#009E7A', uso: 'Botones principales, iconos médicos, estados activos' };
const PALETA_SECUNDARIA = { nombre: 'Secundario (Azul)', hex: '#1E5AA8', uso: 'Encabezados, tarjetas institucionales' };
const PALETA_ACENTOS = [
  { nombre: 'Acento (Amarillo)', hex: '#F4B400' },
  { nombre: 'Emergencias (Rojo)', hex: '#D32F2F' },
  { nombre: 'Base (Blanco)', hex: '#FFFFFF' },
];

// Nueva paleta de colores actualizada - Sistema de Diseño Cuidarte EPS
const brandColors = [
  {
    name: 'Primario',
    hex: '#20A86D',
    label: 'Verde',
    description: 'Confianza, salud, crecimiento',
    id: 'color-primary'
  },
  {
    name: 'Secundario',
    hex: '#1F67A6',
    label: 'Azul',
    description: 'Bienestar, prevención, atención médica',
    id: 'color-secondary'
  },
  {
    name: 'Secundario Alternativo',
    hex: '#F4A820',
    label: 'Amarillo',
    description: 'Atención, advertencia, destacar',
    id: 'color-secondary-alt'
  },
  {
    name: 'Acento',
    hex: '#DB2C28',
    label: 'Rojo',
    description: 'Emergencias, estados críticos',
    id: 'color-accent-danger'
  },
  {
    name: 'Neutral',
    hex: '#0F0F0F',
    label: 'Negro',
    description: 'Texto principal, bordes',
    id: 'color-black'
  },
  {
    name: 'Neutral Claro',
    hex: '#F2F2F2',
    label: 'Blanco',
    description: 'Fondo, superficies',
    id: 'color-white'
  },
];

// Datos de ejemplo para demo de DataTable y probar paginación (columnas: nombre, documento, email, rol, estado)
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
  {
    key: 'estado', label: 'Estado', filterable: true, filterType: 'select', filterOptions: ESTADOS_OPCIONES, render: (valor) => (
      <Badge variant={valor === 'Activo' ? 'success' : 'neutral'} size="sm">{valor}</Badge>
    )
  },
];

/*
 * Configuración del formulario CRUD. La página define qué datos se pueden crear/editar (fields),
 * validaciones de alto nivel (validation: ver DataTable VALIDATORS) y la lógica (onCreate/onEdit/onDeactivate).
 * Con API: data y loading vendrían del fetch; los handlers llamarían al API y actualizarían estado.
 */
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

function DataTableDemo() {
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
  );
}

/**
 * ModalShowcase - Demostración de 3 tipos de modales con estilos modernos
 */
function ModalShowcase() {
  const [openConfirmation, setOpenConfirmation] = React.useState(false);
  const [openInfo, setOpenInfo] = React.useState(false);
  const [openForm, setOpenForm] = React.useState(false);

  return (
    <div className="space-y-8">
      {/* Ejemplo 1: Modal de Confirmación (Warning) */}
      <div>
        <p className="text-sm font-semibold text-neutral-700 mb-4">Modal de Confirmación:</p>
        <Button
          onClick={() => setOpenConfirmation(true)}
          variant="warning"
          id="modal-btn-confirmation"
          data-testid="modal-btn-confirmation"
        >
          Abrir Confirmación
        </Button>
        <Modal
          open={openConfirmation}
          onClose={() => setOpenConfirmation(false)}
          title="Confirmar acción"
          size="md"
          id="modal-confirmation"
          data-testid="modal-confirmation"
          footer={
            <>
              <Button
                variant="neutral"
                onClick={() => setOpenConfirmation(false)}
                id="modal-cancel-btn"
                data-testid="modal-cancel-btn"
              >
                Cancelar
              </Button>
              <Button
                variant="warning"
                onClick={() => setOpenConfirmation(false)}
                id="modal-confirm-btn"
                data-testid="modal-confirm-btn"
              >
                Continuar
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <span className="material-icons text-warning text-2xl">warning</span>
              </div>
              <div>
                <p className="text-neutral-700">
                  ¿Está seguro de que desea cancelar la consulta? Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
          </div>
        </Modal>
      </div>

      {/* Ejemplo 2: Modal de Información */}
      <div>
        <p className="text-sm font-semibold text-neutral-700 mb-4">Modal de Información:</p>
        <Button
          onClick={() => setOpenInfo(true)}
          variant="primary"
          id="modal-btn-info"
          data-testid="modal-btn-info"
        >
          Información de Usuario
        </Button>
        <Modal
          open={openInfo}
          onClose={() => setOpenInfo(false)}
          title="Detalles del paciente"
          size="md"
          id="modal-info"
          data-testid="modal-info"
          footer={
            <Button
              onClick={() => setOpenInfo(false)}
              id="modal-info-close-btn"
              data-testid="modal-info-close-btn"
            >
              Cerrar
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="gap-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-600 font-semibold mb-1">Nombre</p>
                  <p className="text-sm text-neutral-800">Juan Carlos Martínez</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-600 font-semibold mb-1">Documento</p>
                  <p className="text-sm text-neutral-800">1.234.567.890</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-600 font-semibold mb-1">Teléfono</p>
                  <p className="text-sm text-neutral-800">+57 (315) 123-4567</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-600 font-semibold mb-1">Email</p>
                  <p className="text-sm text-neutral-800">juan@example.com</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-neutral-600 font-semibold mb-1">Dirección</p>
                <p className="text-sm text-neutral-800">Calle 45 #12-34, Apto 502, Medellín</p>
              </div>
              <div className="pt-2 border-t border-neutral-200">
                <Badge variant="success" size="sm" rightIcon="verified_user" id="modal-info-badge" data-testid="modal-info-badge">
                  Verificado
                </Badge>
              </div>
            </div>
          </div>
        </Modal>
      </div>

      {/* Ejemplo 3: Modal de Formulario / Acción */}
      <div>
        <p className="text-sm font-semibold text-neutral-700 mb-4">Modal de Formulario:</p>
        <Button
          onClick={() => setOpenForm(true)}
          variant="secondary"
          id="modal-btn-form"
          data-testid="modal-btn-form"
        >
          Agendar Cita
        </Button>
        <Modal
          open={openForm}
          onClose={() => setOpenForm(false)}
          title="Agendar nueva cita"
          size="lg"
          id="modal-form"
          data-testid="modal-form"
          footer={
            <>
              <Button
                variant="neutral"
                onClick={() => setOpenForm(false)}
                id="modal-form-cancel-btn"
                data-testid="modal-form-cancel-btn"
              >
                Cancelar
              </Button>
              <Button
                variant="secondary"
                onClick={() => setOpenForm(false)}
                id="modal-form-submit-btn"
                data-testid="modal-form-submit-btn"
              >
                Agendar
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Especialidad
                </label>
                <Input
                  placeholder="Selecciona especialidad"
                  id="modal-form-specialty"
                  data-testid="modal-form-specialty"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Médico
                </label>
                <Input
                  placeholder="Selecciona médico"
                  id="modal-form-doctor"
                  data-testid="modal-form-doctor"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Fecha y Hora
              </label>
              <div className="grid grid-cols-2 gap-4">
                <DatePicker
                  placeholder="Fecha"
                  id="modal-form-date"
                  data-testid="modal-form-date"
                />
                <Input
                  type="time"
                  placeholder="Hora"
                  id="modal-form-time"
                  data-testid="modal-form-time"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Notas adicionales
              </label>
              <textarea
                placeholder="Describe tu motivo de consulta..."
                className="w-full px-4 py-3 rounded-full border border-neutral-300 text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent resize-none"
                rows="3"
                id="modal-form-notes"
                data-testid="modal-form-notes"
              />
            </div>
            <div className="flex items-center gap-2 p-3 bg-primary-50 rounded-lg border border-primary-200">
              <span className="material-icons text-primary-600 text-xl">info</span>
              <p className="text-sm text-primary-800">Tu cita será confirmada por correo electrónico</p>
            </div>
          </div>
        </Modal>
      </div>

      {/* Documentación */}
      <div className="mt-6 pt-4 border-t border-neutral-200">
        <p className="text-xs text-neutral-600"><strong>Props:</strong></p>
        <pre className="bg-neutral-50 p-2 rounded text-xs overflow-x-auto mt-2">{
          `<Modal
    open={boolean}
    onClose={function}
    title="Título del modal"
    size="sm|md|lg"
    footer={ReactNode}
    closeOnOverlayClick={boolean}
  >
    Contenido del modal
  </Modal>`
        }</pre>
        <p className="text-xs text-neutral-600 mt-3">
          <strong>Características:</strong> Cierre con ESC, overlay clickeable (opcional), animación suave, accesible (ARIA).
        </p>
      </div>
    </div>
  );
}

export default function Components() {
  return (
    <MainLayout>
      {/* SECCIÓN HERO / INTRO */}
      <section
        id="components-hero"
        data-testid="components-hero-section"
        className="bg-primary-600 py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1
            id="page-title"
            data-testid="page-main-title"
            className="text-5xl md:text-8xl font-black text-white mb-4"
          >
            Componentes y<br />Sistema de Diseño
          </h1>
          <p
            id="page-subtitle"
            data-testid="page-subtitle"
            className="text-xl text-primary-50"
          >
            Identidad de marca
          </p>
        </div>
      </section>
      {/* CONTENIDO PRINCIPAL */}
      <PageContainer className="py-12">
        {/* SECCIÓN VERDE CON LOGO SHOWCASE */}
        <section
          id="brand-showcase"
          data-testid="brand-showcase-section"
          className="bg-neutral py-16"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Columna izquierda - Texto */}
              <div id="brand-info" data-testid="brand-info-section" className="text-white">
                <p className="text-5xl text-primary-600 mb-2">Nombre</p>
                <h2 className="text-7xl font-bold mb-2 font-black text-neutral-900">Cuidarte EPS</h2>
                <p className="text-primary-400 text-xl">Definido en <code className="bg-primary-50 px-2 py-1 rounded text-xl text-primary-900">constants/theme.js</code></p>
              </div>

              {/* Columna derecha - Logo Card */}
              <div
                id="logo-card"
                data-testid="logo-card-container"
                className="flex justify-center"
              >
                <div className="bg-white rounded-3xl p-12 shadow-xl max-w-sm w-full flex flex-col items-center">
                  <img
                    src="/brand/Logo_Color_V.svg"
                    alt="Cuidarte EPS Logo"
                    className="h-44 w-auto object-contain mb-4"
                    data-testid="showcase-logo"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Sección: Identidad de marca / Sistema de diseño */}
        <section className="mb-16">

          {/* Sección: Disposición y usos cromáticos */}
          <div className="mb-12">
            <h3 className="text-5xl font-bold text-neutral-800 mb-2 text-center">
              Disposición y usos cromáticos
            </h3>
            <p className="text-neutral-1000 mb-6 text-center">
              Archivos en <code className="bg-neutral-100 px-1 rounded text-sm ">/public/brand</code>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Isotipo */}
              <div
                id="isotipo-card"
                data-testid="isotipo-card"
                className="border-2 border-neutral-300 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[200px] bg-neutral-50 hover:shadow-lg transition-shadow"
              >
                <img src="/brand/Simbolo_Color.svg" alt="Isotipo - Símbolo Cuidarte EPS" className="h-32 w-auto object-contain mb-4" />
                <Badge variant="success" size="sm">Isotipo</Badge>
              </div>

              {/* Imagotipo */}
              <div
                id="imagotipo-card"
                data-testid="imagotipo-card"
                className="border-2 border-neutral-300 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[200px] bg-neutral-50 hover:shadow-lg transition-shadow"
              >
                <img src="/brand/Logo_Color_V.svg" alt="Imagotipo - Logo Horizontal Color" className="h-25 w-auto object-contain mb-4" />
                <Badge variant="success" size="sm">Imagotipo</Badge>
              </div>

              {/* Logo Horizontal - Color */}
              <div
                id="logo-horizontal-color-card"
                data-testid="logo-horizontal-color-card"
                className="border-2 border-neutral-300 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[200px] bg-neutral-50 hover:shadow-lg transition-shadow col-span-1 md:col-span-2"
              >
                <img src="/brand/Logo_Color_H.svg" alt="Logo Horizontal Color" className="h-20 w-full object-contain mb-4" />
                <Badge variant="success" size="sm">Horizontal - Color</Badge>
              </div>

              {/* Logo Horizontal - Negro */}
              <div
                id="logo-horizontal-black-card"
                data-testid="logo-horizontal-black-card"
                className="border-2 border-neutral-300 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[200px] bg-neutral-50 hover:shadow-lg transition-shadow col-span-1 md:col-span-2"
              >
                <img src="/brand/Logo_Black_H.svg" alt="Logo Horizontal Negro" className="h-20 w-full object-contain mb-4" />
                <Badge variant="neutral" size="sm">Horizontal - Negro</Badge>
              </div>

              {/* Logo Horizontal - Blanco */}
              <div
                id="logo-horizontal-white-card"
                data-testid="logo-horizontal-white-card"
                className="border-2 border-neutral-300 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[200px] bg-neutral-900 hover:shadow-lg transition-shadow col-span-1 md:col-span-2"
              >
                <img src="/brand/Logo_White_H.svg" alt="Logo Horizontal Blanco" className="h-20 w-full object-contain mb-4" />
                <Badge variant="neutral" size="sm" className="bg-white text-neutral-800">Horizontal - Blanco</Badge>
              </div>

              {/* Logo Vertical - Negro */}
              <div
                id="logo-vertical-black-card"
                data-testid="logo-vertical-black-card"
                className="border-2 border-neutral-300 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[250px] bg-neutral-50 hover:shadow-lg transition-shadow"
              >
                <img src="/brand/Logo_Black_V.svg" alt="Logo Vertical Negro" className="h-40 w-auto object-contain mb-4" />
                <Badge variant="neutral" size="sm">Vertical - Negro</Badge>
              </div>

              {/* Isotipo Negro */}
              <div
                id="logo-isotipo-black-card"
                data-testid="logo-isotipo-black-card"
                className="border-2 border-neutral-300 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[250px] bg-neutral-50 hover:shadow-lg transition-shadow"
              >
                <img src="/brand/Simbolo_Black.svg" alt="Isotipo Negro" className="h-40 w-auto object-contain mb-4" />
                <Badge variant="neutral" size="sm">Isotipo - Negro</Badge>
              </div>

              {/* Logo Vertical - Blanco */}
              <div
                id="logo-vertical-white-card"
                data-testid="logo-vertical-white-card"
                className="border-2 border-neutral-300 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[250px] bg-neutral-900 hover:shadow-lg transition-shadow"
              >
                <img src="/brand/Logo_White_V.svg" alt="Logo Vertical Blanco" className="h-40 w-auto object-contain mb-4" />
                <Badge variant="neutral" size="sm" className="bg-white text-neutral-800">Vertical - Blanco</Badge>
              </div>

              {/* isotipo Blanco */}
              <div
                id="logo-isotipo-white-card"
                data-testid="logo-isotipo-white-card"
                className="border-2 border-neutral-300 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[250px] bg-neutral-900 hover:shadow-lg transition-shadow"
              >
                <img src="/brand/Simbolo_White.svg" alt="Isotipo Blanco" className="h-40 w-auto object-contain mb-4" />
                <Badge variant="neutral" size="sm" className="bg-white text-neutral-800">Isotipo - Blanco</Badge>
              </div>


            </div>
          </div>
        </section>

        {/* PALETA DE COLORES */}
        <section className="mb-16">
          <Card padding={true} id="ui-color-palette-card" data-testid="ui-color-palette-card">
            <Card.Header>
              <h3 className="text-4xl font-bold text-neutral-800 mb-2 text-center">Paleta de colores</h3>
              <p className="text-sm text-neutral-500 text-center">Sistema de colores para Cuidarte EPS con propósitos y variantes</p>
            </Card.Header>
            <Card.Body>
              <div className="space-y-8">
                {/* Visualización */}
                <div>
                  <p className="text-sm font-semibold text-neutral-700 mb-4">Tabla de colores de marca:</p>
                  <ColorPaletteTable
                    colors={brandColors}
                    className="mb-0 w-full"
                    id="brand-color-palette-table"
                    data-testid="brand-color-palette-table"
                  />
                </div>

                {/* Documentación */}
                <div className="mt-6 pt-4 border-t border-neutral-200">
                  <p className="text-xs text-neutral-600"><strong>Clases de Tailwind - Estructura:</strong></p>
                  <pre className="bg-neutral-50 p-2 rounded text-xs overflow-x-auto mt-2">{`// PATRÓN: bg-[color]-[intensidad][/opacidad]
bg-{primary|secondary|red|amber|neutral}-{50...900}[/50-95]

COLORES PRINCIPALES
├─ primary-{50...900}      Verde      (origen: 500=#20A86D)
├─ secondary-{50...900}    Azul       (origen: 500=#1F67A6)
├─ red-{400,500,600,700}   Rojo       (errores: 50-900)
├─ amber-{400,500}         Amarillo   (alertas)
└─ neutral-{50,900}        Gris/Negro (bg-white, bg-neutral-900)

CON OPACIDAD: bg-primary-500/50 (50%), /75 (75%)

EJEMPLOS
bg-primary-500           → botones primarios
bg-secondary-600/75      → overlays, fondos
bg-red-50 border-red-300 → alertas error
bg-neutral-900           → texto oscuro`}</pre>
                  <p className="text-xs text-neutral-600 mt-3">
                    <strong>Variantes de color:</strong>
                  </p>
                  <ul className="text-xs text-neutral-600 mt-2 ml-3 space-y-1">
                    <li>• <strong>Primario (Verde #20A86D):</strong> Color principal de marca, botones primarios, elementos destacados</li>
                    <li>• <strong>Secundario (Azul #1F67A6):</strong> Color secundario, botones secundarios, links, acciones alternativas</li>
                    <li>• <strong>Secundario Alternativo (Amarillo #F4A820):</strong> Alertas, advertencias, elementos que requieren atención</li>
                    <li>• <strong>Acento (Rojo #DB2C28):</strong> Errores, acciones críticas, peligro, eliminación</li>
                    <li>• <strong>Neutro Negro (#0F0F0F):</strong> Texto principal, bordes oscuros, elementos de alto contraste</li>
                    <li>• <strong>Neutro Blanco (#F2F2F2):</strong> Fondos claros, superficies, elementos de bajo contraste</li>
                  </ul>
                </div>
              </div>
            </Card.Body>
          </Card>
        </section>

        {/* Tipografias */}
        <section className="mb-16">
          <Card padding={true} id="ui-typography-card" data-testid="ui-typography-card">
            <Card.Header>
              <h3 className="text-4xl font-bold text-neutral-800 mb-2 text-center">Tipografías (Typography)</h3>
              <p className="text-sm text-neutral-500 text-center">Sistema de tipografías con Roboto y Archivo para la marca</p>
            </Card.Header>
            <Card.Body>
              <div className="space-y-8">
                {/* Showcase */}
                <div>
                  <p className="text-sm font-semibold text-neutral-700 mb-4">Estilos de tipografía:</p>
                  <TypographyShowcase
                    className="mb-8"
                    id="typography-showcase-section"
                    data-testid="typography-showcase-section"
                  />
                </div>

                {/* Documentación */}
                <div className="mt-6 pt-4 border-t border-neutral-200">
                  <p className="text-xs text-neutral-600"><strong>Clases de Tailwind - Estructura:</strong></p>
                  <pre className="bg-neutral-50 p-2 rounded text-xs overflow-x-auto mt-2">{`// FUENTES
font-roboto    → body (interfaces, párrafos)
font-archivo   → headings (títulos, jerarquía)

TAMAÑOS: text-{xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl}
┌─ xs:12px  sm:14px  base:16px  lg:18px  xl:20px
├─ 2xl:24px  3xl:30px  4xl:36px  5xl:48px
└─ 6xl:60px  7xl:64px  8xl:72px

PESOS
font-normal    → 400 Regular
font-semibold  → 600 Semibold
font-bold      → 700 Bold

ALTURA (leading)
tight / snug / normal / relaxed / loose

COMBOS COMUNES
font-archivo text-8xl font-bold         // Hero
font-archivo text-4xl font-bold         // Título
font-archivo text-2xl font-semibold     // Subtítulo
font-roboto text-base leading-relaxed   // Párrafo
font-roboto text-sm                     // Pequeño`}</pre>
                </div>
              </div>
            </Card.Body>
          </Card>
        </section>
        <Card padding={true} className="mb-16">
          <Card.Header>
            <h3 className="text-4xl font-bold text-neutral-800 mb-2 text-center">Recursos del sistema de diseño</h3>
          </Card.Header>
          <Card.Body>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li><strong>Guía de aplicación en interfaces:</strong> <code className="bg-neutral-100 px-1 rounded">docs/brand/GUIA-APLICACION.md</code></li>
              <li><strong>Assets de marca:</strong> <code className="bg-neutral-100 px-1 rounded">public/brand/</code></li>
              <li><strong>Variables CSS generadas:</strong> <code className="bg-neutral-100 px-1 rounded">src/index.css</code> (<code className="bg-neutral-100 px-1 rounded">:root</code>)</li>
            </ul>
          </Card.Body>
        </Card>

        {/* Sección: Componentes de layout */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-neutral-800 mb-2 text-center">
            Componentes de layout
          </h2>
          <p className="text-neutral-600 mb-8 text-center">
            Estructura fundamental de la aplicación: <code className="bg-neutral-100 px-1 rounded text-sm">MainLayout</code> envuelve Header, contenido y Footer. <code className="bg-neutral-100 px-1 rounded text-sm">PageContainer</code> centra el contenido interior.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card padding={true} id="layout-header-card" data-testid="layout-header-card">
              <Card.Header>
                <h3 className="text-lg font-semibold text-neutral-800">Header</h3>
                <p className="text-sm text-neutral-500">Barra superior con logo, navegación y autenticación</p>
              </Card.Header>
              <Card.Body>
                <p className="text-sm text-neutral-600 mb-3"><code className="bg-neutral-100 px-1 rounded">src/components/layout/Header</code></p>
                <div className="space-y-2 text-xs text-neutral-600">
                  <p><strong>Características:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Logo Cuidarte EPS (Logo_Color_H.svg) izquierda</li>
                    <li>Enlace a inicio (Home)</li>
                    <li>Botón "Iniciar sesión" (outline) derecha</li>
                    <li>Posición sticky, z-index alto</li>
                  </ul>
                  <p className="pt-2"><strong>Props:</strong></p>
                  <p><code className="bg-neutral-100 px-1 rounded text-xs">showAuth</code> (boolean, default: true), <code className="bg-neutral-100 px-1 rounded text-xs">className</code></p>
                </div>
              </Card.Body>
            </Card>

            <Card padding={true} id="layout-footer-card" data-testid="layout-footer-card">
              <Card.Header>
                <h3 className="text-3xl font-bold text-neutral-800 mb-1 text-center">Footer</h3>
                <p className="text-sm text-neutral-500 text-center">Pie de página con layout 4 columnas</p>
              </Card.Header>
              <Card.Body>
                <p className="text-sm text-neutral-600 mb-3"><code className="bg-neutral-100 px-1 rounded">src/components/layout/Footer</code></p>
                <div className="space-y-2 text-xs text-neutral-600">
                  <p><strong>Características:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Logo Cuidarte EPS (Logo_White_V.svg) vertical</li>
                    <li>4 columnas centradas (responsive)</li>
                    <li>Fondo oscuro (neutral-900)</li>
                    <li>Información contacto y año actual</li>
                    <li>Enlaces a páginas principales</li>
                  </ul>
                  <p className="pt-2"><strong>Props:</strong></p>
                  <p><code className="bg-neutral-100 px-1 rounded text-xs">className</code></p>
                </div>
              </Card.Body>
            </Card>

            <Card padding={true} id="layout-mainlayout-card" data-testid="layout-mainlayout-card">
              <Card.Header>
                <h3 className="text-3xl font-bold text-neutral-800 mb-1 text-center">MainLayout</h3>
                <p className="text-sm text-neutral-500 text-center">Contenedor principal: Header + contenido + Footer</p>
              </Card.Header>
              <Card.Body>
                <p className="text-sm text-neutral-600 mb-3"><code className="bg-neutral-100 px-1 rounded">src/components/layout/MainLayout</code></p>
                <div className="space-y-2 text-xs text-neutral-600">
                  <p><strong>Uso:</strong></p>
                  <pre className="bg-neutral-50 p-2 rounded text-xs overflow-x-auto mb-2">{`<MainLayout>
  {/* Tu contenido aquí */}
</MainLayout>`}</pre>
                  <p><strong>Características:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Flexbox con min-height screen</li>
                    <li>Footer siempre al fondo (flex-1)</li>
                    <li>Control de visibilidad Header/Footer</li>
                  </ul>
                  <p className="pt-2"><strong>Props:</strong></p>
                  <p><code className="bg-neutral-100 px-1 rounded text-xs">showHeader</code> (default: true), <code className="bg-neutral-100 px-1 rounded text-xs">showFooter</code> (default: true), <code className="bg-neutral-100 px-1 rounded text-xs">className</code></p>
                </div>
              </Card.Body>
            </Card>

            <Card padding={true} id="layout-pagecontainer-card" data-testid="layout-pagecontainer-card">
              <Card.Header>
                <h3 className="text-3xl font-bold text-neutral-800 mb-1 text-center">PageContainer</h3>
                <p className="text-sm text-neutral-500 text-center">Contenedor con ancho máximo y padding</p>
              </Card.Header>
              <Card.Body>
                <p className="text-sm text-neutral-600 mb-3"><code className="bg-neutral-100 px-1 rounded">src/components/layout/PageContainer</code></p>
                <div className="space-y-2 text-xs text-neutral-600">
                  <p><strong>Uso:</strong></p>
                  <pre className="bg-neutral-50 p-2 rounded text-xs overflow-x-auto mb-2">{`<PageContainer maxWidth="lg">
  {/* Contenido centrado */}
</PageContainer>`}</pre>
                  <p><strong>Características:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Ancho máximo configurable</li>
                    <li>Padding vertical automático (py-8 md:py-12)</li>
                    <li>Centra contenido horizontalmente</li>
                    <li>Responsive en todos breakpoints</li>
                  </ul>
                  <p className="pt-2"><strong>Props:</strong></p>
                  <p><code className="bg-neutral-100 px-1 rounded text-xs">maxWidth</code> (sm|md|lg|xl, default: lg), <code className="bg-neutral-100 px-1 rounded text-xs">className</code></p>
                </div>
              </Card.Body>
            </Card>
          </div>
        </section>

        {/* Sección: Componentes UI base */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-neutral-800 mb-2 text-center">
            Componentes base de la aplicación
          </h2>
          <p className="text-neutral-600 mb-8 text-center">
            Estos componentes se utilizarán en todo el desarrollo del proyecto EPS.
          </p>

          <div className="space-y-12">
            {/* Buttons */}
            <Card padding={true} id="ui-buttons-card" data-testid="ui-buttons-card">
              <Card.Header>
                <h3 className="text-3xl font-bold text-neutral-800 mb-1 text-center">Botones (Button)</h3>
                <p className="text-sm text-neutral-500 text-center">Variantes, tamaños e iconos de Material Icons</p>
              </Card.Header>
              <Card.Body>
                <div className="space-y-6">
                  {/* Variantes */}
                  <div>
                    <p className="text-sm font-semibold text-neutral-700 mb-3">Variantes de color:</p>
                    <div className="flex flex-wrap gap-4">
                      <Button variant="primary" id="btn-primary" data-testid="btn-primary">Principal</Button>
                      <Button variant="secondary" id="btn-secondary" data-testid="btn-secondary">Secundario</Button>
                      <Button variant="outline" id="btn-outline-primary" data-testid="btn-outline-primary">P. Outline</Button>
                      <Button
                        variant="outline"
                        className="border-secondary-600 text-secondary-700 hover:border-secondary-700"
                        id="btn-outline-secondary"
                        data-testid="btn-outline-secondary"
                      >
                        S. Outline
                      </Button>
                      <Button variant="ghost" id="btn-ghost" data-testid="btn-ghost">Ghost</Button>
                      <Button variant="danger" id="btn-danger" data-testid="btn-danger">Advertencia</Button>
                      <Button variant="highlight" id="btn-highlight" data-testid="btn-highlight">Destacado</Button>
                      <Button disabled id="btn-disabled" data-testid="btn-disabled">Deshabilitado</Button>
                    </div>
                  </div>

                  {/* Tamaños */}
                  <div>
                    <p className="text-sm font-semibold text-neutral-700 mb-3">Tamaños:</p>
                    <div className="flex flex-wrap gap-4 items-center">
                      <Button size="sm" id="btn-sm" data-testid="btn-sm">Pequeño</Button>
                      <Button size="md" id="btn-md" data-testid="btn-md">Mediano</Button>
                      <Button size="lg" id="btn-lg" data-testid="btn-lg">Grande</Button>
                      <Button size="xl" id="btn-xl" data-testid="btn-xl">Enorme</Button>
                    </div>
                  </div>

                  {/* Con iconos */}
                  <div>
                    <p className="text-sm font-semibold text-neutral-700 mb-3">Con iconos (Material Icons):</p>
                    <div className="flex flex-wrap gap-4">
                      <Button
                        rightIcon={<span className="material-icons text-lg">add</span>}
                        id="btn-icon-add"
                        data-testid="btn-icon-add"
                      >
                        Agregar
                      </Button>
                      <Button
                        variant="secondary"
                        rightIcon={<span className="material-icons text-lg">edit</span>}
                        id="btn-icon-edit"
                        data-testid="btn-icon-edit"
                      >
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                        rightIcon={<span className="material-icons text-lg">delete</span>}
                        id="btn-icon-delete"
                        data-testid="btn-icon-delete"
                      >
                        Eliminar
                      </Button>
                      <Button
                        variant="outline"
                        rightIcon={<span className="material-icons text-lg">search</span>}
                        id="btn-icon-search"
                        data-testid="btn-icon-search"
                      >
                        Buscar
                      </Button>
                      <Button
                        variant="ghost"
                        rightIcon={<span className="material-icons text-lg">download</span>}
                        id="btn-icon-download"
                        data-testid="btn-icon-download"
                      >
                        Descargar
                      </Button>
                    </div>
                  </div>

                  {/* Documentación */}
                  <div className="mt-6 pt-4 border-t border-neutral-200">
                    <p className="text-xs text-neutral-600"><strong>Props:</strong></p>
                    <pre className="bg-neutral-50 p-2 rounded text-xs overflow-x-auto mt-2">{`<Button
    variant="primary|secondary|outline|ghost|danger|highlight"
    size="sm|md|lg|xl"
    disabled={false}
    fullWidth={false}
    rightIcon={<span className="material-icons">icon_name</span>}
    leftIcon={...}
>
  Etiqueta
</Button>`}</pre>
                    <p className="text-xs text-neutral-600 mt-2">
                      <strong>Nota:</strong> Incluye <code className="bg-neutral-100 px-1 rounded">material-icons</code> en el HTML para usar iconos.
                      Ver: <a href="https://fonts.google.com/icons" className="text-secondary-600 hover:underline" target="_blank" rel="noopener noreferrer">Material Icons</a>
                    </p>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Inputs */}
            <Card padding={true} id="ui-input-card" data-testid="ui-input-card">
              <Card.Header>
                <h3 className="text-3xl font-bold text-neutral-800 mb-1 text-center">Campos de texto (Input)</h3>
                <p className="text-sm text-neutral-500 text-center">Con label, hint, error, iconos y bordes redondeados</p>
              </Card.Header>
              <Card.Body>
                <div className="space-y-8">
                  {/* Campos básicos */}
                  <div>
                    <p className="text-sm font-semibold text-neutral-700 mb-4">Campos básicos:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Usuario"
                        placeholder="Ej: Juan Pérez"
                        name="user"
                        id="input-user"
                        data-testid="input-user"
                      />
                      <Input
                        label="Contraseña"
                        type="password"
                        placeholder="••••••••"
                        name="password"
                        id="input-password"
                        data-testid="input-password"
                      />
                      <Input
                        label="Con mensaje de ayuda"
                        hint="Ingresa tu número de documento"
                        placeholder="Cédula"
                        name="document"
                        className="md:col-span-2"
                        id="input-document"
                        data-testid="input-document"
                      />
                      <Input
                        label="Con error"
                        error="Este campo es obligatorio"
                        placeholder="Email"
                        name="email-error"
                        className="md:col-span-2"
                        id="input-email-error"
                        data-testid="input-email-error"
                      />
                    </div>
                  </div>

                  {/* Campos con iconos */}
                  <div>
                    <p className="text-sm font-semibold text-neutral-700 mb-4">Con iconos (Material Icons):</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Buscar"
                        placeholder="¿Qué buscas?"
                        name="search"
                        rightIcon={<span className="material-icons text-base">search</span>}
                        id="input-search"
                        data-testid="input-search"
                      />
                      <Input
                        label="Email"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        name="email"
                        rightIcon={<span className="material-icons text-base">mail</span>}
                        id="input-email"
                        data-testid="input-email"
                      />
                      <Input
                        label="Teléfono"
                        type="tel"
                        placeholder="+57 312 XXX XXXX"
                        name="phone"
                        rightIcon={<span className="material-icons text-base">phone</span>}
                        id="input-phone"
                        data-testid="input-phone"
                      />
                      <Input
                        label="Ubicación"
                        placeholder="Tu dirección"
                        name="location"
                        rightIcon={<span className="material-icons text-base">location_on</span>}
                        id="input-location"
                        data-testid="input-location"
                      />
                    </div>
                  </div>

                  {/* Campos especiales */}
                  <div>
                    <p className="text-sm font-semibold text-neutral-700 mb-4">Estados especiales:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <DatePicker
                        label="Fecha de cita"
                        hint="Selecciona una fecha"
                        name="appointment"
                        id="input-date"
                        data-testid="input-date"
                      />
                      <Input
                        label="Campo deshabilitado"
                        placeholder="No puede editar"
                        disabled
                        name="disabled-field"
                        rightIcon={<span className="material-icons text-base">lock</span>}
                        id="input-disabled"
                        data-testid="input-disabled"
                      />
                    </div>
                  </div>

                  {/* Documentación */}
                  <div className="mt-6 pt-4 border-t border-neutral-200">
                    <p className="text-xs text-neutral-600"><strong>Props:</strong></p>
                    <pre className="bg-neutral-50 p-2 rounded text-xs overflow-x-auto mt-2">{`<Input
  label="Etiqueta"
  placeholder="Texto de ayuda"
  type="text|email|password|tel|..."
  name="field-name"
  hint="Mensaje de ayuda"
  error="Mensaje de error"
  disabled={false}
  rightIcon={<span className="material-icons">icon_name</span>}
  leftIcon={<span className="material-icons">icon_name</span>}
/>`}</pre>
                    <p className="text-xs text-neutral-600 mt-2">
                      <strong>Características:</strong> Bordes completamente redondeados, validación integrada,
                      soporte de iconos Material Icons en ambos lados
                    </p>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Cards */}
            <Card padding={true} id="ui-card-card" data-testid="ui-card-card">
              <Card.Header>
                <h3 className="text-3xl font-bold text-neutral-800 mb-1 text-center">Tarjetas (Card)</h3>
                <p className="text-sm text-neutral-500 text-center">Estructura compound con Header, Body y Footer</p>
              </Card.Header>
              <Card.Body>
                <div className="space-y-8">
                  {/* Cards básicas */}
                  <div>
                    <p className="text-sm font-semibold text-neutral-700 mb-4">Variantes de tarjetas:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card padding={true} className="border-2 border-primary-200" id="card-example-primary" data-testid="card-example-primary">
                        <Card.Header>
                          <h4 className="font-semibold text-primary-700">Tarjeta Primaria</h4>
                          <p className="text-xs text-primary-600">Con borde de color</p>
                        </Card.Header>
                        <Card.Body>
                          <p className="text-sm text-neutral-600">
                            Ejemplo de tarjeta con Header, Body y Footer. Ideal para resúmenes.
                          </p>
                        </Card.Body>
                        <Card.Footer>
                          <Button variant="primary" size="sm" id="card-btn-primary" data-testid="card-btn-primary">Acción</Button>
                        </Card.Footer>
                      </Card>

                      <Card padding={true} className="border-2 border-secondary-200" id="card-example-secondary" data-testid="card-example-secondary">
                        <Card.Header>
                          <h4 className="font-semibold text-secondary-700">Tarjeta Secundaria</h4>
                          <p className="text-xs text-secondary-600">Variante verde</p>
                        </Card.Header>
                        <Card.Body>
                          <p className="text-sm text-neutral-600">
                            Las tarjetas son componentes versátiles para organizar información.
                          </p>
                        </Card.Body>
                        <Card.Footer>
                          <Button variant="secondary" size="sm" id="card-btn-secondary" data-testid="card-btn-secondary">Aceptar</Button>
                        </Card.Footer>
                      </Card>

                      <Card padding={true} className="border-2 border-red-200" id="card-example-danger" data-testid="card-example-danger">
                        <Card.Header>
                          <h4 className="font-semibold text-red-700">Tarjeta de Alerta</h4>
                          <p className="text-xs text-red-600">Contenido importante</p>
                        </Card.Header>
                        <Card.Body>
                          <p className="text-sm text-neutral-600">
                            Se pueden personalizar con diferentes colores de borde.
                          </p>
                        </Card.Body>
                      </Card>

                      <Card padding={true} className="border-2 border-amber-200" id="card-example-highlight" data-testid="card-example-highlight">
                        <Card.Header>
                          <h4 className="font-semibold text-amber-700">Tarjeta Destacada</h4>
                          <p className="text-xs text-amber-600">Atención especial</p>
                        </Card.Header>
                        <Card.Body>
                          <p className="text-sm text-neutral-600">
                            Útil para promociones o información prioritaria.
                          </p>
                        </Card.Body>
                      </Card>
                    </div>
                  </div>

                  {/* Sin Body */}
                  <div>
                    <p className="text-sm font-semibold text-neutral-700 mb-4">Tarjeta sin separación:</p>
                    <Card padding={true} className="border border-neutral-300 max-w-sm" id="card-simple" data-testid="card-simple">
                      <div className="p-4">
                        <h4 className="font-semibold text-neutral-800 mb-2">Contenido simple</h4>
                        <p className="text-sm text-neutral-600">
                          Card puede usarse sin estructura compuesta para layouts flexibles.
                        </p>
                      </div>
                    </Card>
                  </div>

                  {/* Documentación */}
                  <div className="mt-6 pt-4 border-t border-neutral-200">
                    <p className="text-xs text-neutral-600"><strong>Props y estructura:</strong></p>
                    <pre className="bg-neutral-50 p-2 rounded text-xs overflow-x-auto mt-2">{`<Card padding={true} className="border-2 border-primary-200">
  <Card.Header>
    <h4>Título</h4>
    <p>Subtítulo</p>
  </Card.Header>
  <Card.Body>
    Contenido principal
  </Card.Body>
  <Card.Footer>
    <Button>Acción</Button>
  </Card.Footer>
</Card>`}</pre>
                    <p className="text-xs text-neutral-600 mt-2">
                      <strong>Características:</strong> Componente compound, soporte de padding, personalizable con className y bordes de color
                    </p>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Badges */}
            <Card padding={true} id="ui-badge-card" data-testid="ui-badge-card">
              <Card.Header>
                <h3 className="text-3xl font-bold text-neutral-800 mb-1 text-center">Etiquetas (Badge)</h3>
                <p className="text-sm text-neutral-500 text-center">Indicadores de estado, categoría o cantidad con soporte para iconos</p>
              </Card.Header>
              <Card.Body>
                <div className="space-y-8">
                  {/* Variantes - Fondo claro */}
                  <div>
                    <p className="text-sm font-semibold text-neutral-700 mb-4">Variantes de color - Fondo claro (WCAG AAA):</p>
                    <div className="flex flex-wrap gap-3">
                      <Badge variant="primary" id="badge-primary-light" data-testid="badge-primary-light">Primario</Badge>
                      <Badge variant="secondary" id="badge-secondary-light" data-testid="badge-secondary-light">Secundario</Badge>
                      <Badge variant="success" id="badge-success-light" data-testid="badge-success-light">Completado</Badge>
                      <Badge variant="warning" id="badge-warning-light" data-testid="badge-warning-light">Pendiente</Badge>
                      <Badge variant="error" id="badge-error-light" data-testid="badge-error-light">Rechazado</Badge>
                      <Badge variant="neutral" id="badge-neutral-light" data-testid="badge-neutral-light">Información</Badge>
                    </div>
                  </div>

                  {/* Variantes - Fondo oscuro */}
                  <div className="p-6 bg-neutral-900 rounded-lg">
                    <p className="text-sm font-semibold text-neutral-100 mb-4">Variantes de color - Fondo oscuro (WCAG AAA):</p>
                    <div className="flex flex-wrap gap-3">
                      <Badge variant="primary" dark id="badge-primary-dark" data-testid="badge-primary-dark">Primario</Badge>
                      <Badge variant="secondary" dark id="badge-secondary-dark" data-testid="badge-secondary-dark">Secundario</Badge>
                      <Badge variant="success" dark id="badge-success-dark" data-testid="badge-success-dark">Completado</Badge>
                      <Badge variant="warning" dark id="badge-warning-dark" data-testid="badge-warning-dark">Pendiente</Badge>
                      <Badge variant="error" dark id="badge-error-dark" data-testid="badge-error-dark">Rechazado</Badge>
                      <Badge variant="neutral" dark id="badge-neutral-dark" data-testid="badge-neutral-dark">Información</Badge>
                    </div>
                  </div>

                  {/* Tamaños - Fondo claro */}
                  <div>
                    <p className="text-sm font-semibold text-neutral-700 mb-4">Tamaños - Fondo claro:</p>
                    <div className="flex flex-wrap gap-3 items-center">
                      <Badge size="sm" id="badge-sm-light" data-testid="badge-sm-light">Pequeño</Badge>
                      <Badge size="md" id="badge-md-light" data-testid="badge-md-light">Mediano</Badge>
                      <Badge size="lg" id="badge-lg-light" data-testid="badge-lg-light">Grande</Badge>
                    </div>
                  </div>

                  {/* Tamaños - Fondo oscuro */}
                  <div className="p-6 bg-neutral-900 rounded-lg">
                    <p className="text-sm font-semibold text-neutral-100 mb-4">Tamaños - Fondo oscuro:</p>
                    <div className="flex flex-wrap gap-3 items-center">
                      <Badge size="sm" dark id="badge-sm-dark" data-testid="badge-sm-dark">Pequeño</Badge>
                      <Badge size="md" dark id="badge-md-dark" data-testid="badge-md-dark">Mediano</Badge>
                      <Badge size="lg" dark id="badge-lg-dark" data-testid="badge-lg-dark">Grande</Badge>
                    </div>
                  </div>

                  {/* Con iconos - Fondo claro */}
                  <div>
                    <p className="text-sm font-semibold text-neutral-700 mb-4">Con iconos - Fondo claro:</p>
                    <div className="flex flex-wrap gap-3">
                      <Badge variant="success" rightIcon="check_circle" id="badge-icon-success-light" data-testid="badge-icon-success-light">Activo</Badge>
                      <Badge variant="warning" rightIcon="schedule" id="badge-icon-warning-light" data-testid="badge-icon-warning-light">Pendiente</Badge>
                      <Badge variant="error" rightIcon="error" id="badge-icon-error-light" data-testid="badge-icon-error-light">Error</Badge>
                      <Badge variant="primary" rightIcon="info" id="badge-icon-info-light" data-testid="badge-icon-info-light">Información</Badge>
                      <Badge variant="secondary" rightIcon="verified_user" id="badge-icon-verified-light" data-testid="badge-icon-verified-light">Verificado</Badge>
                    </div>
                  </div>

                  {/* Con iconos - Fondo oscuro */}
                  <div className="p-6 bg-neutral-900 rounded-lg">
                    <p className="text-sm font-semibold text-neutral-100 mb-4">Con iconos - Fondo oscuro:</p>
                    <div className="flex flex-wrap gap-3">
                      <Badge variant="success" dark rightIcon="check_circle" id="badge-icon-success-dark" data-testid="badge-icon-success-dark">Activo</Badge>
                      <Badge variant="warning" dark rightIcon="schedule" id="badge-icon-warning-dark" data-testid="badge-icon-warning-dark">Pendiente</Badge>
                      <Badge variant="error" dark rightIcon="error" id="badge-icon-error-dark" data-testid="badge-icon-error-dark">Error</Badge>
                      <Badge variant="primary" dark rightIcon="info" id="badge-icon-info-dark" data-testid="badge-icon-info-dark">Información</Badge>
                      <Badge variant="secondary" dark rightIcon="verified_user" id="badge-icon-verified-dark" data-testid="badge-icon-verified-dark">Verificado</Badge>
                    </div>
                  </div>

                  {/* Ejemplos prácticos - Contexto claro */}
                  <div>
                    <p className="text-sm font-semibold text-neutral-700 mb-4">Ejemplos en contexto - Fondo claro:</p>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-neutral-600">Estado de usuario:</span>
                        <Badge variant="success" size="sm" rightIcon="check_circle" id="badge-online-light" data-testid="badge-online-light">En línea</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-neutral-600">Prioridad de tarea:</span>
                        <Badge variant="warning" size="sm" rightIcon="flag" id="badge-priority-light" data-testid="badge-priority-light">Alta</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-neutral-600">Validación de dato:</span>
                        <Badge variant="error" size="sm" rightIcon="close" id="badge-invalid-light" data-testid="badge-invalid-light">Inválido</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-neutral-600">Certificación:</span>
                        <Badge variant="secondary" size="sm" rightIcon="verified_user" id="badge-certified-light" data-testid="badge-certified-light">Certificado</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Ejemplos prácticos - Contexto oscuro */}
                  <div className="p-6 bg-neutral-900 rounded-lg">
                    <p className="text-sm font-semibold text-neutral-100 mb-4">Ejemplos en contexto - Fondo oscuro:</p>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-neutral-300">Estado de usuario:</span>
                        <Badge variant="success" size="sm" dark rightIcon="check_circle" id="badge-online-dark" data-testid="badge-online-dark">En línea</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-neutral-300">Prioridad de tarea:</span>
                        <Badge variant="warning" size="sm" dark rightIcon="flag" id="badge-priority-dark" data-testid="badge-priority-dark">Alta</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-neutral-300">Validación de dato:</span>
                        <Badge variant="error" size="sm" dark rightIcon="close" id="badge-invalid-dark" data-testid="badge-invalid-dark">Inválido</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-neutral-300">Certificación:</span>
                        <Badge variant="secondary" size="sm" dark rightIcon="verified_user" id="badge-certified-dark" data-testid="badge-certified-dark">Certificado</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Documentación */}
                  <div className="mt-6 pt-4 border-t border-neutral-200">
                    <p className="text-xs text-neutral-600"><strong>Props:</strong></p>
                    <pre className="bg-neutral-50 p-2 rounded text-xs overflow-x-auto mt-2">{`<Badge 
  variant="primary|secondary|success|warning|error|neutral"
  size="sm|md|lg"
  dark={false}
  rightIcon="material_icon_name"
  Etiqueta
</Badge>`}</pre>
                    <p className="text-xs text-neutral-600 mt-3">
                      <strong>Accesibilidad (WCAG AAA):</strong>
                    </p>
                    <ul className="text-xs text-neutral-600 mt-2 ml-3 space-y-1">
                      <li>• <strong>Fondo claro:</strong> Colores -100/-50 con texto negro (relación de contraste ≥7:1)</li>
                      <li>• <strong>Fondo oscuro:</strong> Colores -700/-800 con texto blanco (relación de contraste ≥7:1)</li>
                      <li>• <strong>Variantes:</strong> primary (azul), secondary (verde), success (verde), warning (amarillo), error (rojo), neutral (gris)</li>
                      <li>• <strong>Prop dark:</strong> Cambia entre fondos claros (false) u oscuros (true)</li>
                      <li>• <strong>Iconos:</strong> Material Icons (check_circle, close, star, flag, verified_user, schedule, info, error, etc.)</li>
                    </ul>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* DataTable */}
            <Card padding={true} id="ui-datatable-card" data-testid="ui-datatable-card">
              <Card.Header>
                <h3 className="text-3xl font-bold text-neutral-800 mb-1 text-center">Tabla de datos (DataTable)</h3>
                <p className="text-sm text-neutral-500 text-center">
                  Tabla reutilizable con columnas configurables, filtros por columna y paginación. Ideal para gestión de usuarios u otras listas.
                </p>
              </Card.Header>
              <Card.Body>
                <div className="space-y-8">
                  {/* Demo */}
                  <div>
                    <p className="text-sm font-semibold text-neutral-700 mb-4">Demo interactivo con CRUD:</p>
                    <DataTableDemo />
                  </div>

                  {/* Documentación */}
                  <div className="mt-6 pt-4 border-t border-neutral-200">
                    <p className="text-xs text-neutral-600"><strong>Props principales:</strong></p>
                    <pre className="bg-neutral-50 p-2 rounded text-xs overflow-x-auto mt-2">{`<DataTable
  columns={[
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'email', label: 'Email', sortable: false },
    { key: 'status', label: 'Estado', render: (val) => <Badge>{val}</Badge> }
  ]}
  data={[
    { id: 1, name: 'Juan', email: 'juan@example.com', status: 'Activo' },
    { id: 2, name: 'María', email: 'maria@example.com', status: 'Activo' }
  ]}
  filters={{
    name: { type: 'text', placeholder: 'Buscar nombre' },
    status: { type: 'select', options: ['Activo', 'Inactivo'] }
  }}
  pagination={{ pageSize: 5, pageSizeOptions: [5, 10, 20] }}
  formConfig={{
    title: 'Gestionar usuario',
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', validation: 'required' },
      { name: 'email', label: 'Email', type: 'email', validation: 'required|email' }
    ]
  }}
  onCreate={(data) => console.log('Crear:', data)}
  onEdit={(data) => console.log('Editar:', data)}
  onDeactivate={(id) => console.log('Desactivar:', id)}
/>`}</pre>
                    <p className="text-xs text-neutral-600 mt-3">
                      <strong>Características:</strong> Columnas configurables (sortable, custom render), filtros por columna, paginación configurable, formulario CRUD integrado, validación de datos, acciones personalizables.
                    </p>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Modales */}
            <Card padding={true} id="ui-modal-card" data-testid="ui-modal-card">
              <Card.Header>
                <h3 className="text-3xl font-bold text-neutral-800 mb-1 text-center">Diálogos (Modal)</h3>
                <p className="text-sm text-neutral-500 text-center">Diálogos modales para confirmación, información y acciones. Presiona ESC para cerrar.</p>
              </Card.Header>
              <Card.Body>
                <ModalShowcase />
              </Card.Body>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card padding={true} id="ui-spinner-card" data-testid="ui-spinner-card">
                <Card.Header>
                  <h3 className="text-3xl font-bold text-neutral-800 mb-1 text-center">Spinners</h3>
                  <p className="text-sm text-neutral-500 text-center">Indicadores de carga con múltiples estilos</p>
                </Card.Header>
                <Card.Body>
                  <div className="space-y-6">
                    {/* Variantes por tipo */}
                    <div>
                      <p className="text-sm font-semibold text-neutral-700 mb-4">Variantes de diseño:</p>
                      <div className="grid grid-cols-3 gap-6">
                        <div className="flex flex-col items-center gap-2">
                          <Spinner variant="arc" size="md" id="spinner-arc" data-testid="spinner-arc" />
                          <span className="text-xs text-neutral-600">Arc</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Spinner variant="circle" size="md" id="spinner-circle" data-testid="spinner-circle" />
                          <span className="text-xs text-neutral-600">Circle</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Spinner variant="dots" size="md" id="spinner-dots" data-testid="spinner-dots" />
                          <span className="text-xs text-neutral-600">Dots</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Spinner variant="bars" size="md" id="spinner-bars" data-testid="spinner-bars" />
                          <span className="text-xs text-neutral-600">Bars</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Spinner variant="pulse" size="md" id="spinner-pulse" data-testid="spinner-pulse" />
                          <span className="text-xs text-neutral-600">Pulse</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Spinner variant="gradient" size="md" id="spinner-gradient" data-testid="spinner-gradient" />
                          <span className="text-xs text-neutral-600">Gradient</span>
                        </div>
                      </div>
                    </div>

                    {/* Tamaños */}
                    <div>
                      <p className="text-sm font-semibold text-neutral-700 mb-4">Tamaños:</p>
                      <div className="flex gap-8 items-center">
                        <div className="flex flex-col items-center gap-2">
                          <Spinner size="sm" id="spinner-sm" data-testid="spinner-sm" />
                          <span className="text-xs text-neutral-600">Pequeño</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Spinner size="md" id="spinner-md" data-testid="spinner-md" />
                          <span className="text-xs text-neutral-600">Mediano</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Spinner size="lg" id="spinner-lg" data-testid="spinner-lg" />
                          <span className="text-xs text-neutral-600">Grande</span>
                        </div>
                      </div>
                    </div>

                    {/* Colores */}
                    <div>
                      <p className="text-sm font-semibold text-neutral-700 mb-4">Colores:</p>
                      <div className="flex gap-6 items-center flex-wrap">
                        <div className="flex flex-col items-center gap-2">
                          <Spinner color="primary" id="spinner-primary" data-testid="spinner-primary" />
                          <span className="text-xs text-neutral-600">Primary</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Spinner color="secondary" id="spinner-secondary" data-testid="spinner-secondary" />
                          <span className="text-xs text-neutral-600">Secondary</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Spinner color="success" id="spinner-success" data-testid="spinner-success" />
                          <span className="text-xs text-neutral-600">Success</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Spinner color="warning" id="spinner-warning" data-testid="spinner-warning" />
                          <span className="text-xs text-neutral-600">Warning</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Spinner color="error" id="spinner-error" data-testid="spinner-error" />
                          <span className="text-xs text-neutral-600">Error</span>
                        </div>
                      </div>
                    </div>

                    {/* Uso común */}
                    <div className="mt-6 pt-4 border-t border-neutral-200">
                      <p className="text-xs text-neutral-600"><strong>Props:</strong></p>
                      <pre className="bg-neutral-50 p-2 rounded text-xs overflow-x-auto mt-2">{`<Spinner 
    size="sm|md|lg"
    variant="arc|circle|dots|bars|pulse|gradient"
    color="primary|secondary|success|warning|error|neutral"
  />`}</pre>
                    </div>
                  </div>
                </Card.Body>
              </Card>
              
              {/*Alertas*/}
              <Card padding={true} id="ui-alert-card" data-testid="ui-alert-card">
                <Card.Header>
                  <h3 className="text-3xl font-bold text-neutral-800 mb-1 text-center">Alertas (Alert)</h3>
                  <p className="text-sm text-neutral-500 text-center">Mensajes de feedback con icono y acción</p>
                </Card.Header>
                <Card.Body>
                  <div className="space-y-4">
                    {/* Success */}
                    <Alert
                      variant="success"
                      title="Éxito"
                      dismissible
                      id="alert-success"
                      data-testid="alert-success"
                      action={
                        <Button size="sm" variant="success">
                          Aceptar
                        </Button>
                      }
                    >
                      Operación completada correctamente.
                    </Alert>

                    {/* Warning */}
                    <Alert
                      variant="warning"
                      title="Advertencia"
                      dismissible
                      id="alert-warning"
                      data-testid="alert-warning"
                      action={
                        <Button size="sm" variant="warning">
                          Reintentar
                        </Button>
                      }
                    >
                      Tu período de prueba expira en 3 días.
                    </Alert>

                    {/* Error */}
                    <Alert
                      variant="error"
                      title="Error"
                      dismissible
                      id="alert-error"
                      data-testid="alert-error"
                      action={
                        <Button size="sm" variant="error">
                          Reintentar
                        </Button>
                      }
                    >
                      La conexión se interrumpió. Por favor intenta de nuevo.
                    </Alert>

                    {/* Info */}
                    <Alert
                      variant="info"
                      title="Información"
                      dismissible
                      id="alert-info"
                      data-testid="alert-info"
                      action={
                        <Button size="sm" variant="primary">
                          Más info
                        </Button>
                      }
                    >
                      Los cambios se guardarán automáticamente.
                    </Alert>

                    {/* Documentación */}
                    <div className="mt-6 pt-4 border-t border-neutral-200">
                      <p className="text-xs text-neutral-600"><strong>Props:</strong></p>
                      <pre className="bg-neutral-50 p-2 rounded text-xs overflow-x-auto mt-2">{`<Alert 
    variant="success|warning|error|info"
    title="Título"
    action={<Button>Acción</Button>}
    dismissible={true}
    onDismiss={() => {}}
  >
    Contenido del mensaje
  </Alert>`}</pre>
                      <p className="text-xs text-neutral-600 mt-2">
                        <strong>Características:</strong> Icono automático, layout horizontal, botón de cierre opcional, soporte para acción personalizada.
                      </p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>
        </section>

        {/* Resumen de estructura */}
        <section className="border-neutral-200 pt-12" id="structure-section" data-testid="structure-section">
          <h2 className="text-3xl font-bold text-center pb-6">
            Estructura del proyecto
          </h2>
          <Card padding={true} id="structure-summary" data-testid="structure-summary">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-neutral-800 mb-3">Componentes UI</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                    <p className="font-mono text-sm text-neutral-700"><strong>Button</strong></p>
                    <p className="text-xs text-neutral-500">Múltiples variantes, tamaños, iconos, estados hover con sombra</p>
                  </div>
                  <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                    <p className="font-mono text-sm text-neutral-700"><strong>Input</strong></p>
                    <p className="text-xs text-neutral-500">Bordes completamente redondeados, iconos laterales, validación</p>
                  </div>
                  <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                    <p className="font-mono text-sm text-neutral-700"><strong>Card</strong></p>
                    <p className="text-xs text-neutral-500">Contenedor flexible con header, body, footer y variantes</p>
                  </div>
                  <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                    <p className="font-mono text-sm text-neutral-700"><strong>Badge</strong></p>
                    <p className="text-xs text-neutral-500">Fondos claro/oscuro (WCAG AAA), iconos derecha, 6 variantes</p>
                  </div>
                  <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                    <p className="font-mono text-sm text-neutral-700"><strong>Spinner</strong></p>
                    <p className="text-xs text-neutral-500">6 variantes de diseño, 3 tamaños, 6 colores temáticos</p>
                  </div>
                  <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                    <p className="font-mono text-sm text-neutral-700"><strong>Alert</strong></p>
                    <p className="text-xs text-neutral-500">Icono izquierda, contenido centrado, acción derecha, dismissible</p>
                  </div>
                  <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                    <p className="font-mono text-sm text-neutral-700"><strong>Modal</strong></p>
                    <p className="text-xs text-neutral-500">Diálogos configurables: confirmación, info, formularios</p>
                  </div>
                  <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                    <p className="font-mono text-sm text-neutral-700"><strong>DataTable</strong></p>
                    <p className="text-xs text-neutral-500">Tabla reutilizable, filtros, paginación, CRUD integrado</p>
                  </div>
                  <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                    <p className="font-mono text-sm text-neutral-700"><strong>Container</strong></p>
                    <p className="text-xs text-neutral-500">Contenedor base para layouts y espaciado consistente</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-neutral-800 mb-3">Componentes de Layout</h3>
                <ul className="space-y-2 text-neutral-600 text-sm">
                  <li><code className="bg-neutral-100 px-2 py-1 rounded">src/components/layout</code> — Header, Footer, MainLayout, PageContainer, AuthenticatedLayout</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-neutral-800 mb-3">Utilidades y Configuración</h3>
                <ul className="space-y-2 text-neutral-600 text-sm">
                  <li><code className="bg-neutral-100 px-2 py-1 rounded">src/constants</code> — BRAND_NAME, ROUTES, theme constants</li>
                  <li><code className="bg-neutral-100 px-2 py-1 rounded">src/utils</code> — cn() (clases condicionales Tailwind)</li>
                  <li><code className="bg-neutral-100 px-2 py-1 rounded">src/index.css</code> — Variables CSS globales (paleta, tipografías, espaciado)</li>
                  <li><code className="bg-neutral-100 px-2 py-1 rounded">tailwind.config.js</code> — Configuración de colores (PRIMARY azul, SECONDARY verde)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-neutral-800 mb-3">Servicios</h3>
                <ul className="space-y-2 text-neutral-600 text-sm">
                  <li><code className="bg-neutral-100 px-2 py-1 rounded">src/services/auth</code> — AuthContext, AuthProvider, ProtectedRoute</li>
                  <li><code className="bg-neutral-100 px-2 py-1 rounded">src/services/api</code> — endpoints, http client</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-neutral-800 mb-3">Páginas</h3>
                <ul className="space-y-2 text-neutral-600 text-sm">
                  <li><code className="bg-neutral-100 px-2 py-1 rounded">src/pages</code> — Home, Components, Bridge, Usuarios, auth (Login), doctor, receptionist</li>
                </ul>
              </div>
            </div>
          </Card>
        </section>
      </PageContainer>
    </MainLayout>
  );
}
