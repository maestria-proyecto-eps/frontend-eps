import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { PageContainer } from '../../components/layout';
import { DataTable, Badge } from '../../components/ui';
import { http } from '../../services/api/http';
import { endpoints } from '../../services/api/endpoints';
import { AuthContext } from '../../services/auth/AuthContext';

/** Compara fecha+hora de la cita con el momento actual (para futuras vs pasadas). */
function citaComoDate(cita) {
  const fecha = cita.fecha;
  const hora = (cita.hora_inicio || '00:00:00').toString();
  const hhmmss = hora.length >= 8 ? hora.slice(0, 8) : `${hora.padEnd(8, '0')}`;
  return new Date(`${fecha}T${hhmmss}`);
}

function mapEstadoAgenda(estadoAgenda) {
  if (estadoAgenda === 1) return 'Activo';
  if (estadoAgenda === 0) return 'Inactivo';
  return String(estadoAgenda ?? '—');
}

const ESTADOS_FILTRO = [
  { value: '1', label: 'Activo' },
  { value: '0', label: 'Inactivo' },
];

function formatoHora(valor) {
  if (valor == null || valor === '') return '—';
  const s = String(valor);
  return s.length >= 5 ? s.slice(0, 5) : s;
}

const COLUMNAS_CITAS = [
  { key: 'fecha', label: 'Fecha', filterable: true, filterType: 'date' },
  {
    key: 'hora_inicio',
    label: 'Hora inicio',
    filterable: false,
    render: (valor) => formatoHora(valor),
  },
  {
    key: 'hora_fin',
    label: 'Hora fin',
    filterable: false,
    render: (valor) => formatoHora(valor),
  },
  {
    key: 'asistio',
    label: 'Asistió',
    filterable: false,
    render: (valor) => {
      if (valor === true || valor === 1 || valor === '1') {
        return (
          <Badge variant="success" size="sm">
            Sí
          </Badge>
        );
      }
      if (valor === false || valor === 0 || valor === '0') {
        return (
          <Badge variant="neutral" size="sm">
            No
          </Badge>
        );
      }
      return '—';
    },
  },
  { key: 'id_doctor', label: 'ID Doctor', filterable: true },
  { key: 'id_especialidad', label: 'ID Especialidad', filterable: true },
  {
    key: 'estado_agenda',
    label: 'Estado',
    filterable: true,
    filterType: 'select',
    filterOptions: ESTADOS_FILTRO.map((e) => ({ value: e.value, label: e.label })),
    render: (valor) => {
      const v = Number(valor);
      const variant = v === 1 ? 'success' : v === 0 ? 'neutral' : 'neutral';
      const text = mapEstadoAgenda(v);
      return (
        <Badge variant={variant} size="sm">
          {text}
        </Badge>
      );
    },
  },
];

export default function Appointments() {
  const auth = useContext(AuthContext);
  const idPaciente = auth?.payload?.num_documento;

  const [tab, setTab] = useState('futuras');
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCitas = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (idPaciente != null && String(idPaciente).trim() !== '') {
        params.id_paciente = Number(idPaciente);
      }

      const { data } = await http.get(endpoints.appointments.list, { params });
      const raw = Array.isArray(data) ? data : [];
      const mine =
        idPaciente != null && String(idPaciente).trim() !== ''
          ? raw.filter((c) => String(c.id_paciente) === String(idPaciente))
          : raw;
      setCitas(mine);
    } catch (e) {
      console.error('Error cargando citas:', e);
      setError('No se pudieron cargar las citas. Intenta de nuevo más tarde.');
      setCitas([]);
    } finally {
      setLoading(false);
    }
  }, [idPaciente]);

  useEffect(() => {
    fetchCitas();
  }, [fetchCitas]);

  const citasPorTab = useMemo(() => {
    const ahora = new Date();
    return citas.filter((cita) => {
      const t = citaComoDate(cita);
      if (tab === 'futuras') return t >= ahora;
      return t < ahora;
    });
  }, [citas, tab]);

  const citasFiltradas = useMemo(() => {
    return citasPorTab.filter((row) => {
      return Object.entries(filters).every(([key, val]) => {
        if (val == null || String(val).trim() === '') return true;
        const value = String(val).trim().toLowerCase();
        const cell = row[key];
        if (key === 'estado_agenda') {
          return String(cell) === String(val);
        }
        if (key === 'fecha') {
          const cellDay = String(cell ?? '').slice(0, 10);
          const filterDay = String(val).trim().slice(0, 10);
          return cellDay === filterDay;
        }
        return String(cell ?? '').toLowerCase().includes(value);
      });
    });
  }, [citasPorTab, filters]);

  const total = citasFiltradas.length;
  const dataPage = useMemo(
    () => citasFiltradas.slice((page - 1) * pageSize, page * pageSize),
    [citasFiltradas, page, pageSize]
  );

  const handleFiltersChange = (nextFilters) => {
    setFilters(nextFilters);
    setPage(1);
  };

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-800">Mis citas</h1>
        <p className="text-neutral-600 text-sm mt-1">
          Como paciente puedes ver y gestionar tus citas médicas.
        </p>
      </div>

      {error && (
        <p className="mb-4 text-sm text-emergency-600" role="alert">
          {error}
        </p>
      )}

      <div className="mb-4 flex gap-2 border-b border-neutral-200">
        <button
          type="button"
          onClick={() => {
            setTab('futuras');
            setPage(1);
          }}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            tab === 'futuras'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300'
          }`}
        >
          Futuras
        </button>
        <button
          type="button"
          onClick={() => {
            setTab('pasadas');
            setPage(1);
          }}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            tab === 'pasadas'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300'
          }`}
        >
          Pasadas
        </button>
      </div>

      <DataTable
        columns={COLUMNAS_CITAS}
        data={dataPage}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        formConfig={{ createButtonLabel: 'Nueva cita' }}
        createHref="/patient/appointments/new"
        onReload={fetchCitas}
        loading={loading}
        pagination={{
          page,
          pageSize,
          total,
          pageSizeOptions: [5, 10, 30],
          onPageChange: setPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setPage(1);
          },
        }}
        keyExtractor={(row) => row.id_cita}
        emptyMessage={
          loading ? 'Cargando...' : 'No tienes citas en esta pestaña o con estos filtros.'
        }
      />
    </PageContainer>
  );
}
