import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DataTable, Badge, Button, Modal, Input, Alert } from '../../components/ui';
import { http } from '../../services/api/http';
import { endpoints } from '../../services/api/endpoints';

// ─── Endpoints simulados ──────────────────────────────────────────────────────
// Agregar en endpoints.js:
// specialties: {
//   list:   "/api/hr/specialties",
//   create: "/api/hr/specialties",
//   updateById: (id) => `/api/hr/specialties/${id}`,
//   deleteById:  (id) => `/api/hr/specialties/${id}`,
//   remissions: {
//     list:   "/api/hr/specialties/remissions",
//     create: "/api/hr/specialties/remissions",
//     deleteById: (id) => `/api/hr/specialties/remissions/${id}`,
//   },
// }

// ─── Datos simulados (reemplazar con llamadas reales) ─────────────────────────
const MOCK_SPECIALTIES = [
  { id_especialidad: 1, nombre_especialidad: 'Cardiología',    requiere_remision: true  },
  { id_especialidad: 2, nombre_especialidad: 'Medicina General', requiere_remision: false },
  { id_especialidad: 3, nombre_especialidad: 'Neurología',     requiere_remision: true  },
  { id_especialidad: 4, nombre_especialidad: 'Pediatría',      requiere_remision: false },
  { id_especialidad: 5, nombre_especialidad: 'Ortopedia',      requiere_remision: true  },
];

const MOCK_REMISSIONS = [
  { id_remision: 1, id_especialidad_que_remite: 2, nombre_que_remite: 'Medicina General', id_especialidad_remitida: 1, nombre_remitida: 'Cardiología' },
  { id_remision: 2, id_especialidad_que_remite: 2, nombre_que_remite: 'Medicina General', id_especialidad_remitida: 3, nombre_remitida: 'Neurología' },
  { id_remision: 3, id_especialidad_que_remite: 4, nombre_que_remite: 'Pediatría',         id_especialidad_remitida: 5, nombre_remitida: 'Ortopedia'  },
];

// ─── Columnas tabla especialidades ───────────────────────────────────────────
const COLUMNAS_ESPECIALIDADES = [
  { key: 'id_especialidad',    label: 'ID',           filterable: false },
  { key: 'nombre_especialidad', label: 'Nombre',       filterable: true  },
  {
    key: 'requiere_remision',
    label: 'Requiere remisión',
    filterable: true,
    filterType: 'select',
    filterOptions: [
      { value: 'true',  label: 'Sí' },
      { value: 'false', label: 'No' },
    ],
    render: (val) => (
      <Badge variant={val ? 'warning' : 'neutral'} size="sm">
        {val ? 'Sí' : 'No'}
      </Badge>
    ),
  },
];

// ─── Config CRUD especialidades ───────────────────────────────────────────────
const FORM_CONFIG_ESPECIALIDADES = {
  createTitle:       'Crear especialidad',
  editTitle:         'Editar especialidad',
  createButtonLabel: 'Nueva especialidad',
  createSubmitLabel: 'Crear',
  editSubmitLabel:   'Guardar',
  confirmDeactivateTitle:   'Eliminar especialidad',
  confirmDeactivateMessage: (row) => (
    <>¿Está seguro que desea eliminar la especialidad <strong>{row?.nombre_especialidad}</strong>? Esta acción no se puede deshacer.</>
  ),
  fields: [
    {
      key:         'nombre_especialidad',
      label:       'Nombre de la especialidad',
      type:        'text',
      placeholder: 'Ej: Cardiología',
      validation:  ['required'],
    },
    {
      key:          'requiere_remision',
      label:        '¿Requiere remisión?',
      type:         'select',
      defaultValue: false,
      options: [
        { value: false, label: 'No' },
        { value: true,  label: 'Sí' },
      ],
      validation: [],
    },
  ],
};

// ─── Columnas tabla remisiones ────────────────────────────────────────────────
const COLUMNAS_REMISIONES = [
  { key: 'id_remision',        label: 'ID',           filterable: false },
  { key: 'nombre_que_remite',  label: 'Remite',        filterable: true  },
  { key: 'nombre_remitida',    label: 'Remitido a',    filterable: true  },
];

// ─── Componente modal para relaciones de remisión ────────────────────────────
function RemisionModal({ open, onClose, especialidades, onConfirm, submitting }) {
  const [fromId, setFromId] = useState('');
  const [toId,   setToId]   = useState('');
  const [error,  setError]  = useState('');

  const handleSubmit = () => {
    if (!fromId || !toId) { setError('Seleccione ambas especialidades.'); return; }
    if (fromId === toId)  { setError('La especialidad no puede remitirse a sí misma.'); return; }
    setError('');
    onConfirm({ id_especialidad_que_remite: Number(fromId), id_especialidad_remitida: Number(toId) });
  };

  const handleClose = () => {
    setFromId(''); setToId(''); setError('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={() => !submitting && handleClose()}
      title="Agregar relación de remisión"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={submitting}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Guardando...' : 'Agregar'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-neutral-700">Especialidad que remite</label>
          <select
            value={fromId}
            onChange={(e) => setFromId(e.target.value)}
            className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">Seleccionar…</option>
            {especialidades.map((e) => (
              <option key={e.id_especialidad} value={e.id_especialidad}>{e.nombre_especialidad}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-neutral-700">Especialidad remitida</label>
          <select
            value={toId}
            onChange={(e) => setToId(e.target.value)}
            className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">Seleccionar…</option>
            {especialidades.map((e) => (
              <option key={e.id_especialidad} value={e.id_especialidad}>{e.nombre_especialidad}</option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function EspecialidadManager() {
  // ── Estado especialidades ──
  const [especialidades, setEspecialidades] = useState([]);
  const [loadingEsp,     setLoadingEsp]     = useState(true);
  const [filtersEsp,     setFiltersEsp]     = useState({});
  const [pageEsp,        setPageEsp]        = useState(1);
  const [pageSizeEsp,    setPageSizeEsp]    = useState(10);
  const [totalEsp,       setTotalEsp]       = useState(0);

  // ── Estado remisiones ──
  const [remisiones,     setRemisiones]     = useState([]);
  const [loadingRem,     setLoadingRem]     = useState(true);
  const [filtersRem,     setFiltersRem]     = useState({});
  const [pageRem,        setPageRem]        = useState(1);
  const [pageSizeRem,    setPageSizeRem]    = useState(10);
  const [totalRem,       setTotalRem]       = useState(0);
  const [modalRemision,  setModalRemision]  = useState(false);
  const [submittingRem,  setSubmittingRem]  = useState(false);

  // ── Fetch especialidades ──
  const fetchEspecialidades = useCallback(async () => {
    setLoadingEsp(true);
    try {
      // TODO: reemplazar con http.get(endpoints.specialties.list, { params: { pag: pageEsp, cantidad: pageSizeEsp } })
      await new Promise((r) => setTimeout(r, 400));
      setEspecialidades(MOCK_SPECIALTIES);
      setTotalEsp(MOCK_SPECIALTIES.length);
    } catch (err) {
      console.error('Error al cargar especialidades:', err);
      setEspecialidades([]);
      setTotalEsp(0);
    } finally {
      setLoadingEsp(false);
    }
  }, [pageEsp, pageSizeEsp]);

  // ── Fetch remisiones ──
  const fetchRemisiones = useCallback(async () => {
    setLoadingRem(true);
    try {
      // TODO: reemplazar con http.get(endpoints.specialties.remissions.list)
      await new Promise((r) => setTimeout(r, 400));
      setRemisiones(MOCK_REMISSIONS);
      setTotalRem(MOCK_REMISSIONS.length);
    } catch (err) {
      console.error('Error al cargar remisiones:', err);
      setRemisiones([]);
      setTotalRem(0);
    } finally {
      setLoadingRem(false);
    }
  }, []);

  useEffect(() => { fetchEspecialidades(); }, [fetchEspecialidades]);
  useEffect(() => { fetchRemisiones();     }, [fetchRemisiones]);

  // ── Filtrado cliente especialidades ──
  const filtradoEsp = especialidades.filter((row) =>
    Object.entries(filtersEsp).every(([key, val]) => {
      if (val == null || String(val).trim() === '') return true;
      if (key === 'requiere_remision') return String(row[key]) === String(val);
      return String(row[key] ?? '').toLowerCase().includes(String(val).toLowerCase());
    })
  );
  const dataEspTable = filtradoEsp.slice((pageEsp - 1) * pageSizeEsp, pageEsp * pageSizeEsp);

  // ── Filtrado cliente remisiones ──
  const filtradoRem = remisiones.filter((row) =>
    Object.entries(filtersRem).every(([key, val]) => {
      if (val == null || String(val).trim() === '') return true;
      return String(row[key] ?? '').toLowerCase().includes(String(val).toLowerCase());
    })
  );
  const dataRemTable = filtradoRem.slice((pageRem - 1) * pageSizeRem, pageRem * pageSizeRem);

  // ── CRUD especialidades ──
  const handleCreate = async (newRow) => {
    // TODO: await http.post(endpoints.specialties.create, { nombre_especialidad: newRow.nombre_especialidad, requiere_remision: newRow.requiere_remision === true || newRow.requiere_remision === 'true' })
    await new Promise((r) => setTimeout(r, 500));
    const nuevo = {
      id_especialidad:   Date.now(),
      nombre_especialidad: newRow.nombre_especialidad,
      requiere_remision: newRow.requiere_remision === true || newRow.requiere_remision === 'true',
    };
    setEspecialidades((prev) => [...prev, nuevo]);
    setTotalEsp((t) => t + 1);
  };

  const handleEdit = async (id, updatedRow) => {
    // TODO: await http.put(endpoints.specialties.updateById(id), { nombre_especialidad: updatedRow.nombre_especialidad, requiere_remision: updatedRow.requiere_remision === true || updatedRow.requiere_remision === 'true' })
    await new Promise((r) => setTimeout(r, 500));
    setEspecialidades((prev) =>
      prev.map((e) =>
        e.id_especialidad === id
          ? { ...e, nombre_especialidad: updatedRow.nombre_especialidad, requiere_remision: updatedRow.requiere_remision === true || updatedRow.requiere_remision === 'true' }
          : e
      )
    );
  };

  const handleDeactivate = async (id) => {
    // TODO: await http.delete(endpoints.specialties.deleteById(id))
    await new Promise((r) => setTimeout(r, 500));
    setEspecialidades((prev) => prev.filter((e) => e.id_especialidad !== id));
    setTotalEsp((t) => t - 1);
  };

  // ── CRUD remisiones ──
  const handleCreateRemision = async ({ id_especialidad_que_remite, id_especialidad_remitida }) => {
    setSubmittingRem(true);
    try {
      // TODO: await http.post(endpoints.specialties.remissions.create, { id_especialidad_que_remite, id_especialidad_remitida })
      await new Promise((r) => setTimeout(r, 500));
      const desde = especialidades.find((e) => e.id_especialidad === id_especialidad_que_remite);
      const hasta = especialidades.find((e) => e.id_especialidad === id_especialidad_remitida);
      const nueva = {
        id_remision:               Date.now(),
        id_especialidad_que_remite,
        nombre_que_remite:         desde?.nombre_especialidad ?? '',
        id_especialidad_remitida,
        nombre_remitida:           hasta?.nombre_especialidad ?? '',
      };
      setRemisiones((prev) => [...prev, nueva]);
      setTotalRem((t) => t + 1);
      setModalRemision(false);
    } catch (err) {
      console.error('Error al crear remisión:', err);
    } finally {
      setSubmittingRem(false);
    }
  };

  const handleDeleteRemision = async (id) => {
    // TODO: await http.delete(endpoints.specialties.remissions.deleteById(id))
    await new Promise((r) => setTimeout(r, 500));
    setRemisiones((prev) => prev.filter((r) => r.id_remision !== id));
    setTotalRem((t) => t - 1);
  };

  // Config CRUD remisiones (solo delete, sin create/edit en DataTable — se maneja por modal propio)
  const FORM_CONFIG_REMISIONES = {
    confirmDeactivateTitle:   'Eliminar relación de remisión',
    confirmDeactivateMessage: (row) => (
      <>¿Desea eliminar la relación <strong>{row?.nombre_que_remite}</strong> → <strong>{row?.nombre_remitida}</strong>?</>
    ),
    deactivateSuccessMessage: 'Relación de remisión eliminada.',
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        {/* Encabezado */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">Gestión de especialidades</h1>
            <p className="mt-1 text-sm text-neutral-500">Catálogo de especialidades médicas y configuración de remisiones</p>
          </div>
          <Link to="/hr">
            <Button variant="outline" size="sm">← Volver</Button>
          </Link>
        </div>

        {/* ── Sección 1: Especialidades ── */}
        <section>
          <h2 className="text-lg font-semibold text-neutral-700 mb-4">Especialidades</h2>
          <DataTable
            columns={COLUMNAS_ESPECIALIDADES}
            data={dataEspTable}
            filters={filtersEsp}
            onFiltersChange={(f) => { setFiltersEsp(f); setPageEsp(1); }}
            loading={loadingEsp}
            pagination={{
              page:          pageEsp,
              pageSize:      pageSizeEsp,
              total:         filtradoEsp.length,
              pageSizeOptions: [5, 10, 25],
              onPageChange:    setPageEsp,
              onPageSizeChange: (size) => { setPageSizeEsp(size); setPageEsp(1); },
            }}
            formConfig={FORM_CONFIG_ESPECIALIDADES}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onDeactivate={handleDeactivate}
            keyExtractor={(row) => row.id_especialidad}
            emptyMessage="No hay especialidades registradas"
          />
        </section>

        {/* ── Sección 2: Relaciones de remisión ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-700">Relaciones de remisión</h2>
            <Button variant="primary" size="sm" onClick={() => setModalRemision(true)}>
              + Agregar relación
            </Button>
          </div>
          <DataTable
            columns={COLUMNAS_REMISIONES}
            data={dataRemTable}
            filters={filtersRem}
            onFiltersChange={(f) => { setFiltersRem(f); setPageRem(1); }}
            loading={loadingRem}
            pagination={{
              page:          pageRem,
              pageSize:      pageSizeRem,
              total:         filtradoRem.length,
              pageSizeOptions: [5, 10, 25],
              onPageChange:    setPageRem,
              onPageSizeChange: (size) => { setPageSizeRem(size); setPageRem(1); },
            }}
            formConfig={FORM_CONFIG_REMISIONES}
            onDeactivate={handleDeleteRemision}
            keyExtractor={(row) => row.id_remision}
            emptyMessage="No hay relaciones de remisión configuradas"
          />
        </section>

      </div>

      {/* Modal agregar relación de remisión */}
      <RemisionModal
        open={modalRemision}
        onClose={() => setModalRemision(false)}
        especialidades={especialidades}
        onConfirm={handleCreateRemision}
        submitting={submittingRem}
      />
    </div>
  );
}
