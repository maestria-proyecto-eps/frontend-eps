import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DataTable, Badge, Button } from '../../components/ui';

// ─── Datos simulados ──────────────────────────────────────────────────────────
const MOCK_ESPECIALIDADES = [
  { id_especialidad: 1, nombre_especialidad: 'Cardiología'       },
  { id_especialidad: 2, nombre_especialidad: 'Medicina General'  },
  { id_especialidad: 3, nombre_especialidad: 'Neurología'        },
  { id_especialidad: 4, nombre_especialidad: 'Pediatría'         },
  { id_especialidad: 5, nombre_especialidad: 'Ortopedia'         },
];

const MOCK_DOCTORS = [
  { id_medico: 1, nombres: 'Carlos',   apellidos: 'Ramírez',  num_documento: '10234567', num_licencia: 'LIC-001', id_especialidad: 1, nombre_especialidad: 'Cardiología',      estado: 1 },
  { id_medico: 2, nombres: 'Laura',    apellidos: 'Gómez',    num_documento: '20345678', num_licencia: 'LIC-002', id_especialidad: 2, nombre_especialidad: 'Medicina General', estado: 1 },
  { id_medico: 3, nombres: 'Andrés',   apellidos: 'Torres',   num_documento: '30456789', num_licencia: 'LIC-003', id_especialidad: 3, nombre_especialidad: 'Neurología',       estado: 0 },
  { id_medico: 4, nombres: 'Patricia', apellidos: 'Herrera',  num_documento: '40567890', num_licencia: 'LIC-004', id_especialidad: 4, nombre_especialidad: 'Pediatría',        estado: 1 },
  { id_medico: 5, nombres: 'Jorge',    apellidos: 'Castillo', num_documento: '50678901', num_licencia: 'LIC-005', id_especialidad: 5, nombre_especialidad: 'Ortopedia',        estado: 1 },
];

// ─── Columnas ────────────────────────────────────────────────────────────────
const COLUMNAS_DOCTORES = [
  {
    key: 'nombre_completo',
    label: 'Nombre completo',
    filterable: true,
    render: (_, row) => `${row.nombres ?? ''} ${row.apellidos ?? ''}`.trim() || '—',
  },
  { key: 'num_documento',       label: 'Documento',    filterable: true },
  { key: 'num_licencia',        label: 'N° Licencia',  filterable: true },
  { key: 'nombre_especialidad', label: 'Especialidad', filterable: true },
  {
    key: 'estado',
    label: 'Estado',
    filterable: true,
    filterType: 'select',
    filterOptions: [
      { value: '1', label: 'Activo'   },
      { value: '0', label: 'Inactivo' },
    ],
    render: (val) => (
      <Badge variant={val === 1 ? 'success' : 'neutral'} size="sm">
        {val === 1 ? 'Activo' : 'Inactivo'}
      </Badge>
    ),
  },
];

// ─── Página principal ─────────────────────────────────────────────────────────
export default function DoctorManager() {
  const [doctores,       setDoctores]       = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [filters,        setFilters]        = useState({});
  const [page,           setPage]           = useState(1);
  const [pageSize,       setPageSize]       = useState(10);

  // ── Fetch especialidades (mock) ──
  const fetchEspecialidades = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 200));
    setEspecialidades(MOCK_ESPECIALIDADES);
  }, []);

  // ── Fetch doctores (mock) ──
  const fetchDoctores = useCallback(async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setDoctores(MOCK_DOCTORS);
    setLoading(false);
  }, []);

  useEffect(() => { fetchEspecialidades(); }, [fetchEspecialidades]);
  useEffect(() => { fetchDoctores();       }, [fetchDoctores]);

  // ── Filtrado cliente ──
  const filtrado = doctores.filter((row) =>
    Object.entries(filters).every(([key, val]) => {
      if (val == null || String(val).trim() === '') return true;
      if (key === 'estado') return String(row.estado) === String(val);
      if (key === 'nombre_completo') {
        const full = `${row.nombres ?? ''} ${row.apellidos ?? ''}`.toLowerCase();
        return full.includes(String(val).toLowerCase());
      }
      return String(row[key] ?? '').toLowerCase().includes(String(val).toLowerCase());
    })
  );
  const dataTable = filtrado.slice((page - 1) * pageSize, page * pageSize);

  // ── formConfig ──
  const FORM_CONFIG_DOCTORES = {
    createTitle:       'Registrar médico',
    editTitle:         'Editar médico',
    createButtonLabel: 'Nuevo médico',
    createSubmitLabel: 'Registrar',
    editSubmitLabel:   'Guardar',
    confirmDeactivateTitle:   'Desactivar médico',
    confirmDeactivateMessage: (row) => (
      <>¿Está seguro que desea desactivar al médico <strong>{row?.nombres} {row?.apellidos}</strong>?</>
    ),
    statusKey:        'estado',
    activeValue:      1,
    deactivatedValue: 0,
    fields: [
      {
        key:         'num_documento',
        label:       'Número de documento',
        type:        'text',
        placeholder: 'Ej: 10234567',
        validation:  ['required'],
        createOnly:  true,
      },
      {
        key:         'num_licencia',
        label:       'Número de licencia médica',
        type:        'text',
        placeholder: 'Ej: LIC-001',
        validation:  ['required'],
      },
      {
        key:          'id_especialidad',
        label:        'Especialidad',
        type:         'select',
        defaultValue: especialidades[0]?.id_especialidad ?? '',
        options:      especialidades.map((e) => ({
          value: e.id_especialidad,
          label: e.nombre_especialidad,
        })),
        validation: ['required'],
      },
    ],
  };

  // ── CRUD handlers (mock) ──
  const handleCreate = async (newRow) => {
    await new Promise((r) => setTimeout(r, 500));
    const esp = especialidades.find((e) => e.id_especialidad === Number(newRow.id_especialidad));
    setDoctores((prev) => [...prev, {
      id_medico:           Date.now(),
      nombres:             '—',
      apellidos:           '—',
      num_documento:       newRow.num_documento,
      num_licencia:        newRow.num_licencia,
      id_especialidad:     Number(newRow.id_especialidad),
      nombre_especialidad: esp?.nombre_especialidad ?? '',
      estado:              1,
    }]);
  };

  const handleEdit = async (id, updatedRow) => {
    await new Promise((r) => setTimeout(r, 500));
    const esp = especialidades.find((e) => e.id_especialidad === Number(updatedRow.id_especialidad));
    setDoctores((prev) =>
      prev.map((d) =>
        d.id_medico === id
          ? { ...d, num_licencia: updatedRow.num_licencia, id_especialidad: Number(updatedRow.id_especialidad), nombre_especialidad: esp?.nombre_especialidad ?? d.nombre_especialidad }
          : d
      )
    );
  };

  const handleDeactivate = async (id) => {
    await new Promise((r) => setTimeout(r, 500));
    setDoctores((prev) => prev.map((d) => d.id_medico === id ? { ...d, estado: 0 } : d));
  };

  const handleActivate = async (id) => {
    await new Promise((r) => setTimeout(r, 500));
    setDoctores((prev) => prev.map((d) => d.id_medico === id ? { ...d, estado: 1 } : d));
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">Gestión de médicos</h1>
            <p className="mt-1 text-sm text-neutral-500">Registro y administración del personal médico</p>
          </div>
          <Link to="/hr">
            <Button variant="outline" size="sm">← Volver</Button>
          </Link>
        </div>

        <DataTable
          columns={COLUMNAS_DOCTORES}
          data={dataTable}
          filters={filters}
          onFiltersChange={(f) => { setFilters(f); setPage(1); }}
          loading={loading}
          pagination={{
            page,
            pageSize,
            total:            filtrado.length,
            pageSizeOptions:  [5, 10, 25, 30],
            onPageChange:     setPage,
            onPageSizeChange: (size) => { setPageSize(size); setPage(1); },
          }}
          formConfig={FORM_CONFIG_DOCTORES}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDeactivate={handleDeactivate}
          onActivate={handleActivate}
          keyExtractor={(row) => row.id_medico}
          emptyMessage={loading ? 'Cargando...' : 'No hay médicos registrados o no coinciden con los filtros'}
        />

      </div>
    </div>
  );
} 