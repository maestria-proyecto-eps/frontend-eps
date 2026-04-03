import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, Button, Input } from '../../components/ui';
import { http } from '../../services/api/http';
import { endpoints } from '../../services/api/endpoints';

// ─── Página principal ─────────────────────────────────────────────────────────
export default function DoctorManager() {
  const navigate = useNavigate();

  // ── Especialidades (compartido entre secciones) ──
  const [especialidades, setEspecialidades] = useState([]);

  // ── Estado: médicos ──
  const [doctores,   setDoctores]   = useState([]);
  const [loadingDoc, setLoadingDoc] = useState(true);
  const [pageDoc,    setPageDoc]    = useState(1);
  const [pageSizeDoc, setPageSizeDoc] = useState(10);
  // Inputs de filtro (controlados)
  const [inputEspId,    setInputEspId]    = useState('');
  const [inputLicencia, setInputLicencia] = useState('');
  // Filtros aplicados (disparan fetch)
  const [appliedFilters, setAppliedFilters] = useState({ id_especialidad: '', num_licencia: '' });

  // ── Estado: especialidades (sección lectura) ──
  const [loadingEsp,   setLoadingEsp]   = useState(true);
  const [pageEsp,      setPageEsp]      = useState(1);
  const [pageSizeEsp,  setPageSizeEsp]  = useState(10);
  const [filtersEsp,   setFiltersEsp]   = useState({});

  // ── Estado: remisiones ──
  const [remisiones,   setRemisiones]   = useState([]);
  const [loadingRem,   setLoadingRem]   = useState(true);
  const [pageRem,      setPageRem]      = useState(1);
  const [pageSizeRem,  setPageSizeRem]  = useState(10);
  const [filtersRem,   setFiltersRem]   = useState({});

  // ── Fetch especialidades ──
  const fetchEspecialidades = useCallback(async () => {
    setLoadingEsp(true);
    try {
      const { data } = await http.get(endpoints.specialties.list);
      setEspecialidades(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar especialidades:', err);
      setEspecialidades([]);
    } finally {
      setLoadingEsp(false);
    }
  }, []);

  // ── Fetch médicos ──
  const fetchDoctores = useCallback(async () => {
    setLoadingDoc(true);
    try {
      const params = {};
      if (appliedFilters.id_especialidad) params.id_especialidad = Number(appliedFilters.id_especialidad);
      if (appliedFilters.num_licencia)    params.num_licencia    = Number(appliedFilters.num_licencia);
      const { data } = await http.get(endpoints.doctors.list, { params });
      setDoctores(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar médicos:', err);
      setDoctores([]);
    } finally {
      setLoadingDoc(false);
    }
  }, [appliedFilters]);

  // ── Fetch remisiones ──
  const fetchRemisiones = useCallback(async () => {
    setLoadingRem(true);
    try {
      const { data } = await http.get(endpoints.specialties.remissions);
      setRemisiones(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar remisiones:', err);
      setRemisiones([]);
    } finally {
      setLoadingRem(false);
    }
  }, []);

  useEffect(() => { fetchEspecialidades(); }, [fetchEspecialidades]);
  useEffect(() => { fetchDoctores();       }, [fetchDoctores]);
  useEffect(() => { fetchRemisiones();     }, [fetchRemisiones]);

  // ── Columnas médicos (dependen de especialidades para mostrar nombre) ──
  const columnasDoctores = [
    {
      key:    'nombre_completo',
      label:  'Nombre completo',
      render: (_, row) => `${row.nombres ?? ''} ${row.apellidos ?? ''}`.trim() || '—',
    },
    { key: 'id_medico',    label: 'N° Documento' },
    { key: 'num_licencia', label: 'N° Licencia'  },
    {
      key:    'id_especialidad',
      label:  'Especialidad',
      render: (val) =>
        especialidades.find((e) => e.id_especialidad === val)?.nombre_especialidad ?? String(val),
    },
    {
      key:    'agenda',
      label:  'Agenda',
      render: (_, row) => {
        const espNombre = especialidades.find((e) => e.id_especialidad === row.id_especialidad)?.nombre_especialidad ?? '';
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/hr/doctors/${row.id_medico}/schedule`, {
              state: {
                id_doctor:          row.id_medico,
                id_especialidad:    row.id_especialidad,
                nombres:            row.nombres,
                apellidos:          row.apellidos,
                num_licencia:       row.num_licencia,
                nombre_especialidad: espNombre,
              },
            })}
          >
            Ver agenda
          </Button>
        );
      },
    },
  ];

  // ── Columnas especialidades ──
  const columnasEspecialidades = [
    { key: 'id_especialidad',     label: 'ID'     },
    { key: 'nombre_especialidad', label: 'Nombre', filterable: true },
  ];

  // ── Columnas remisiones ──
  const columnasRemisiones = [
    { key: 'nombre_que_remite', label: 'Especialidad que remite', filterable: true },
    { key: 'nombre_remitida',   label: 'Remitido a',              filterable: true },
  ];

  // ── Paginación client-side: médicos ──
  const dataDocTable = doctores.slice((pageDoc - 1) * pageSizeDoc, pageDoc * pageSizeDoc);

  // ── Filtrado + paginación client-side: especialidades ──
  const filtradoEsp = especialidades.filter((row) =>
    Object.entries(filtersEsp).every(([key, val]) => {
      if (val == null || String(val).trim() === '') return true;
      return String(row[key] ?? '').toLowerCase().includes(String(val).toLowerCase());
    })
  );
  const dataEspTable = filtradoEsp.slice((pageEsp - 1) * pageSizeEsp, pageEsp * pageSizeEsp);

  // ── Filtrado + paginación client-side: remisiones ──
  const filtradoRem = remisiones.filter((row) =>
    Object.entries(filtersRem).every(([key, val]) => {
      if (val == null || String(val).trim() === '') return true;
      return String(row[key] ?? '').toLowerCase().includes(String(val).toLowerCase());
    })
  );
  const dataRemTable = filtradoRem.slice((pageRem - 1) * pageSizeRem, pageRem * pageSizeRem);

  // ── formConfig médicos ──
  const formConfigDoctores = {
    createTitle:       'Registrar médico',
    editTitle:         'Editar médico',
    createButtonLabel: 'Nuevo médico',
    createSubmitLabel: 'Registrar',
    editSubmitLabel:   'Guardar',
    fields: [
      {
        key:         'id_medico',
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
        placeholder: 'Ej: 12345',
        validation:  ['required'],
        createOnly:  true,
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

  // ── Handlers médicos ──
  const handleCreate = async (newRow) => {
    try {
      await http.post(endpoints.doctors.create, {
        id_medico:       Number(newRow.id_medico),
        num_licencia:    Number(newRow.num_licencia),
        id_especialidad: Number(newRow.id_especialidad),
      });
    } catch (err) {
      const detail = err?.response?.data?.detail;
      throw new Error(detail ?? 'No se pudo registrar el médico. Intente de nuevo.');
    }
    await fetchDoctores();
  };

  const handleEdit = async (id, updatedRow) => {
    await http.put(endpoints.doctors.updateSpecialty(id), {
      id_especialidad: Number(updatedRow.id_especialidad),
    });
    await fetchDoctores();
  };

  // ── Aplicar / limpiar filtros ──
  const applyFilters = () => {
    setAppliedFilters({ id_especialidad: inputEspId, num_licencia: inputLicencia });
    setPageDoc(1);
  };

  const clearFilters = () => {
    setInputEspId('');
    setInputLicencia('');
    setAppliedFilters({ id_especialidad: '', num_licencia: '' });
    setPageDoc(1);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        {/* Encabezado */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">Gestión de médicos</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Registro y administración del personal médico, especialidades y remisiones
            </p>
          </div>
        </div>

        {/* ── Sección 1: Médicos ── */}
        <section>
          <h2 className="text-lg font-semibold text-neutral-700 mb-4">Médicos</h2>

          {/* Filtros */}
          <div className="mb-4 flex items-end gap-3 flex-wrap rounded-lg border border-neutral-200 bg-neutral-50/80 p-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-neutral-700">Especialidad</label>
              <select
                value={inputEspId}
                onChange={(e) => setInputEspId(e.target.value)}
                className="block w-[220px] rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
              >
                <option value="">Todas las especialidades</option>
                {especialidades.map((e) => (
                  <option key={e.id_especialidad} value={e.id_especialidad}>
                    {e.nombre_especialidad}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="N° Licencia"
              value={inputLicencia}
              onChange={(e) => setInputLicencia(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              placeholder="Ej: 12345"
              className="w-[180px]"
            />
            <Button variant="primary" size="sm" onClick={applyFilters} className="h-[44px]">
              Buscar
            </Button>
            <Button variant="outline" size="sm" onClick={clearFilters} className="h-[44px]">
              Limpiar
            </Button>
          </div>

          <DataTable
            columns={columnasDoctores}
            data={dataDocTable}
            loading={loadingDoc}
            pagination={{
              page:            pageDoc,
              pageSize:        pageSizeDoc,
              total:           doctores.length,
              pageSizeOptions: [5, 10, 25, 30],
              onPageChange:    setPageDoc,
              onPageSizeChange: (size) => { setPageSizeDoc(size); setPageDoc(1); },
            }}
            formConfig={formConfigDoctores}
            onCreate={handleCreate}
            onEdit={handleEdit}
            keyExtractor={(row) => row.id_medico}
            emptyMessage={loadingDoc ? 'Cargando...' : 'No hay médicos registrados o no coinciden con los filtros'}
          />
        </section>

        {/* ── Sección 2: Especialidades (solo lectura) ── */}
        <section>
          <h2 className="text-lg font-semibold text-neutral-700 mb-4">Especialidades</h2>
          <DataTable
            columns={columnasEspecialidades}
            data={dataEspTable}
            filters={filtersEsp}
            onFiltersChange={(f) => { setFiltersEsp(f); setPageEsp(1); }}
            loading={loadingEsp}
            pagination={{
              page:            pageEsp,
              pageSize:        pageSizeEsp,
              total:           filtradoEsp.length,
              pageSizeOptions: [5, 10, 25],
              onPageChange:    setPageEsp,
              onPageSizeChange: (size) => { setPageSizeEsp(size); setPageEsp(1); },
            }}
            keyExtractor={(row) => row.id_especialidad}
            emptyMessage="No hay especialidades registradas"
          />
        </section>

        {/* ── Sección 3: Remisiones entre especialidades (solo lectura) ── */}
        <section>
          <h2 className="text-lg font-semibold text-neutral-700 mb-4">Remisiones entre especialidades</h2>
          <DataTable
            columns={columnasRemisiones}
            data={dataRemTable}
            filters={filtersRem}
            onFiltersChange={(f) => { setFiltersRem(f); setPageRem(1); }}
            loading={loadingRem}
            pagination={{
              page:            pageRem,
              pageSize:        pageSizeRem,
              total:           filtradoRem.length,
              pageSizeOptions: [5, 10, 25],
              onPageChange:    setPageRem,
              onPageSizeChange: (size) => { setPageSizeRem(size); setPageRem(1); },
            }}
            keyExtractor={(row) => `${row.id_especialidad_que_remite}_${row.id_especialidad_remitida}`}
            emptyMessage="No hay remisiones registradas"
          />
        </section>

      </div>
    </div>
  );
}
