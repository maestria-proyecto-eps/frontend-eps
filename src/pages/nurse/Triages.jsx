import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PageContainer } from '../../components/layout';
import { Alert, Badge, Button, DataTable, Modal } from '../../components/ui';
import { http } from '../../services/api/http';
import { endpoints } from '../../services/api/endpoints';

const PAGE_SIZE_OPTIONS = [5, 10, 20];
const STATUS_OPTIONS = [
  { value: 0, label: 'Pendiente' },
  { value: 1, label: 'Atendido' },
];

const NIVEL_OPTIONS = [
  { value: 1, label: 'Nivel 1' },
  { value: 2, label: 'Nivel 2' },
  { value: 3, label: 'Nivel 3' },
  { value: 4, label: 'Nivel 4' },
  { value: 5, label: 'Nivel 5' },
];

const RIESGO_VITAL_OPTIONS = [
  { value: 'true', label: 'Sí' },
  { value: 'false', label: 'No' },
];

function getPatientDocument(row) {
  return row?.paciente?.documento ?? row?.id_paciente ?? row?.numero_documento ?? row?.documento ?? '—';
}

function normalizeTriagesResponse(payload, pageSize) {
  const wrapper = payload?.data ?? payload;
  if (!wrapper) return { rows: [], page: 1, total: 0 };

  const rows =
    Array.isArray(wrapper.data)
      ? wrapper.data
      : Array.isArray(wrapper.triages)
      ? wrapper.triages
      : Array.isArray(wrapper.rows)
      ? wrapper.rows
      : Array.isArray(wrapper)
      ? wrapper
      : [];

  const page = Number(wrapper.page ?? wrapper.pag ?? 1) || 1;
  const limit = Number(wrapper.limit ?? wrapper.cantidad ?? pageSize ?? 10) || pageSize || 10;
  const pageCount = Number(wrapper.pages ?? wrapper.totalPages ?? wrapper.pageCount ?? wrapper.paginas ?? 0) || 0;
  let total = Number(wrapper.total ?? wrapper.count ?? wrapper.totalItems ?? wrapper.meta?.total ?? 0);
  if (!total) {
    if (limit === 1 && pageCount > 0) {
      total = pageCount;
    } else if (pageCount > 0 && page === pageCount) {
      total = (pageCount - 1) * limit + rows.length;
    } else if (pageCount === 0) {
      total = rows.length + (page - 1) * limit;
    } else {
      total = 0;
    }
  }

  return { rows, page, total, pageCount };
}

function getLevelVariant(nivel) {
  const value = Number(nivel);
  if (value === 1) return 'error';
  if (value === 2) return 'warning';
  if (value === 3) return 'yellow';
  if (value === 4) return 'success';
  if (value === 5) return 'blue';
  return 'neutral';
}

function getStatusLabel(value) {
  const raw = value ?? '';
  if (raw === 0 || raw === '0') return 'Pendiente';
  if (raw === 1 || raw === '1') return 'Atendido';
  const normalized = String(raw).toLowerCase();
  if (normalized.includes('pendiente')) return 'Pendiente';
  if (normalized.includes('atendido')) return 'Atendido';
  return String(raw ?? '—');
}

function getStatusVariant(value) {
  const label = getStatusLabel(value).toLowerCase();
  if (label.includes('pendiente')) return 'warning';
  if (label.includes('atendido')) return 'success';
  return 'neutral';
}

function formatDateTime(value) {
  if (value == null) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const pad = (n) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function getDateLabel(row) {
  return formatDateTime(row?.fechat ?? row?.fecha_triage ?? row?.fecha ?? row?.created_at ?? row?.createdAt ?? row?.fecha_registro);
}

function formatBoolean(value) {
  if (value === true || value === 'true' || value === 1 || value === '1') return '✔';
  if (value === false || value === 'false' || value === 0 || value === '0') return '✗';
  return '—';
}

export default function Triages() {
  const [triages, setTriages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ estado: '', nivel: '', riesgo_vital: '', fecha: '' });
  const [selectedTriage, setSelectedTriage] = useState(null);

  const loadTriages = useCallback(
    async (targetPage = 1, targetPageSize = pageSize, currentFilters = filters) => {
      setLoading(true);
      setError('');
      try {
        const params = { pag: targetPage, cantidad: targetPageSize };
        if (currentFilters.estado) params.estado = currentFilters.estado;
        if (currentFilters.nivel) params.nivel = currentFilters.nivel;
        if (currentFilters.riesgo_vital) params.riesgo_vital = currentFilters.riesgo_vital;
        if (currentFilters.fecha) params.fecha = currentFilters.fecha;

        const { data } = await http.get(endpoints.emergency.triages, { params });
        const normalized = normalizeTriagesResponse(data, targetPageSize);
        setTriages(normalized.rows);
        setPage(normalized.page);
        setTotal((prevTotal) => (normalized.total > 0 ? normalized.total : prevTotal));
      } catch (e) {
        console.error('Error cargando triages:', e);
        setTriages([]);
        setTotal(0);
        setError('No fue posible cargar los triages. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    },
    [filters, pageSize]
  );

  const loadTriagesTotal = useCallback(
    async (currentFilters = filters) => {
      try {
        const params = { pag: 1, cantidad: 1 };
        if (currentFilters.estado) params.estado = currentFilters.estado;
        if (currentFilters.nivel) params.nivel = currentFilters.nivel;
        if (currentFilters.riesgo_vital) params.riesgo_vital = currentFilters.riesgo_vital;
        if (currentFilters.fecha) params.fecha = currentFilters.fecha;

        const { data } = await http.get(endpoints.emergency.triages, { params });
        const normalized = normalizeTriagesResponse(data, 1);
        if (normalized.total > 0) {
          setTotal(normalized.total);
        }
      } catch (e) {
        console.warn('Error cargando total de triages:', e);
      }
    },
    [filters]
  );

  useEffect(() => {
    setPage(1);
    loadTriagesTotal(filters);
    loadTriages(1, pageSize, filters);
  }, [filters, loadTriages, loadTriagesTotal, pageSize]);

  const handleFiltersChange = useCallback((nextFilters) => {
    setPage(1);
    setFilters(nextFilters);
  }, []);

  const columns = useMemo(
    () => [
      { key: 'id_triage', label: 'ID', filterable: false },
      {
        key: 'id_paciente',
        label: 'Documento paciente',
        filterable: false,
        render: (value, row) => getPatientDocument(row),
      },
      {
        key: 'nivel',
        label: 'Nivel',
        filterable: true,
        filterType: 'select',
        filterOptions: NIVEL_OPTIONS,
        render: (value) => (
          <Badge variant={getLevelVariant(value)} size="sm">
            {value ?? '—'}
          </Badge>
        ),
      },
      {
        key: 'estado',
        label: 'Estado',
        filterable: true,
        filterType: 'select',
        filterOptions: STATUS_OPTIONS,
        render: (value) => (
          <Badge variant={getStatusVariant(value)} size="sm">
            {getStatusLabel(value)}
          </Badge>
        ),
      },
      {
        key: 'riesgo_vital',
        label: 'Riesgo vital',
        filterable: true,
        filterType: 'select',
        filterOptions: RIESGO_VITAL_OPTIONS,
        render: (value) => (
          <Badge variant={value === true || value === 'true' || value === 1 ? 'error' : 'neutral'} size="sm">
            {value === true || value === 'true' || value === 1 ? 'Sí' : 'No'}
          </Badge>
        ),
      },
      {
        key: 'fecha',
        label: 'Fecha',
        filterable: true,
        filterType: 'date',
        render: (value, row) => getDateLabel(row),
      },
    ],
    []
  );

  return (
    <PageContainer title="Lista de Triages">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-800">Triages</h1>
        <p className="text-neutral-600 text-sm mt-1">
          Como enfermero, puedes ver y gestionar los triages.
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <Alert variant="error" title="Error">
            {error}
          </Alert>
        </div>
      )}

      <DataTable
        columns={columns}
        data={triages}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReload={() => loadTriages(page, pageSize, filters)}
        createHref="/nurse/triage/new"
        formConfig={{ createButtonLabel: 'Nuevo triage' }}
        renderRowActions={(row) => (
          <Button variant="ghost" size="sm" onClick={() => setSelectedTriage(row)}>
            Ver detalle
          </Button>
        )}
        loading={loading}
        pagination={{
          page,
          pageSize,
          total: triages.length > 0 ? total : 0,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          onPageChange: (nextPage) => {
            setPage(nextPage);
            loadTriages(nextPage, pageSize, filters);
          },
          onPageSizeChange: (nextSize) => {
            setPageSize(nextSize);
            setPage(1);
            loadTriages(1, nextSize, filters);
          },
        }}
        keyExtractor={(row) => row.id_triage ?? row.id ?? row._id ?? JSON.stringify(row)}
        emptyMessage={loading ? 'Cargando...' : 'No hay triages para mostrar.'}
      />

      <Modal
        open={!!selectedTriage}
        onClose={() => setSelectedTriage(null)}
        title={`Detalle del triage #${selectedTriage?.id_triage ?? selectedTriage?.id ?? '—'}`}
        size="xl"
        scrollable
      >
        {selectedTriage ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-neutral-200 p-3">
                <p className="text-xs uppercase text-neutral-500">ID paciente</p>
                <p className="mt-1 text-sm font-semibold text-neutral-800">{selectedTriage.id_paciente ?? getPatientDocument(selectedTriage) ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 p-3">
                <p className="text-xs uppercase text-neutral-500">ID enfermero</p>
                <p className="mt-1 text-sm font-semibold text-neutral-800">{selectedTriage.id_enfermero ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 p-3">
                <p className="text-xs uppercase text-neutral-500">Nivel</p>
                <Badge variant={getLevelVariant(selectedTriage.nivel)} size="sm">
                  {selectedTriage.nivel ?? '—'}
                </Badge>
              </div>
              <div className="rounded-lg border border-neutral-200 p-3">
                <p className="text-xs uppercase text-neutral-500">Estado</p>
                <Badge variant={getStatusVariant(selectedTriage.estado)} size="sm">
                  {getStatusLabel(selectedTriage.estado)}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-neutral-200 p-3">
                <p className="text-xs uppercase text-neutral-500">Fecha</p>
                <p className="mt-1 text-sm font-semibold text-neutral-800">{getDateLabel(selectedTriage)}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 p-3">
                <p className="text-xs uppercase text-neutral-500">Motivo</p>
                <p className="mt-1 text-sm text-neutral-800">{selectedTriage.motivo ?? '—'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-neutral-200 p-3">
                <p className="text-xs uppercase text-neutral-500">Antecedentes</p>
                <p className="mt-1 text-sm text-neutral-800">{selectedTriage.antecedentes ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 p-3">
                <p className="text-xs uppercase text-neutral-500">Alergias</p>
                <p className="mt-1 text-sm text-neutral-800">{selectedTriage.alergias ?? '—'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-neutral-200 p-3">
                <p className="text-xs uppercase text-neutral-500">Hallazgos</p>
                <p className="mt-1 text-sm text-neutral-800">{selectedTriage.hallazgos ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 p-3">
                <p className="text-xs uppercase text-neutral-500">Medicamentos</p>
                <p className="mt-1 text-sm text-neutral-800">{selectedTriage.medicamentos ?? '—'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-neutral-200 p-3">
                <p className="text-xs uppercase text-neutral-500">Pulso</p>
                <p className="mt-1 text-sm text-neutral-800">{selectedTriage.pulso ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 p-3">
                <p className="text-xs uppercase text-neutral-500">Presión arterial</p>
                <p className="mt-1 text-sm text-neutral-800">{selectedTriage.presion_arterial ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 p-3">
                <p className="text-xs uppercase text-neutral-500">Frecuencia cardiaca</p>
                <p className="mt-1 text-sm text-neutral-800">{selectedTriage.frecuencia_cardiaca ?? '—'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-neutral-200 p-3">
                <p className="text-xs uppercase text-neutral-500">Frecuencia respiratoria</p>
                <p className="mt-1 text-sm text-neutral-800">{selectedTriage.frecuencia_respiratoria ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 p-3">
                <p className="text-xs uppercase text-neutral-500">Temperatura</p>
                <p className="mt-1 text-sm text-neutral-800">{selectedTriage.temperatura ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 p-3">
                <p className="text-xs uppercase text-neutral-500">Saturación O₂</p>
                <p className="mt-1 text-sm text-neutral-800">{selectedTriage.saturacion_oxigeno ?? '—'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-neutral-200 p-3">
                <p className="text-xs uppercase text-neutral-500">Escala de dolor</p>
                <p className="mt-1 text-sm text-neutral-800">{selectedTriage.escala_dolor ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 p-3">
                <p className="text-xs uppercase text-neutral-500">Riesgo vital</p>
                <p className="mt-1 text-sm text-neutral-800">{formatBoolean(selectedTriage.riesgo_vital)}</p>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </PageContainer>
  );
}
