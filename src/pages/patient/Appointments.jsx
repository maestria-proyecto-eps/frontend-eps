import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { PageContainer } from '../../components/layout';
import { DataTable, Badge } from '../../components/ui';
import { http } from '../../services/api/http';
import { endpoints } from '../../services/api/endpoints';
import { AuthContext } from '../../services/auth/AuthContext';

/** Compara fecha+hora de la cita con el momento actual (para futuras vs pasadas). */
function citaComoDate(cita) {
  const hi = cita?.hora_inicio;
  const fecha = cita?.fecha;

  if (hi != null && hi !== '') {
    const s = String(hi);
    // ISO completo (ej. 2026-05-01T10:00:00.000Z): no usar slice(0,8) — rompe el parseo.
    if (/^\d{4}-\d{2}-\d{2}T/.test(s) || (s.includes('T') && /\d{2}:\d{2}/.test(s))) {
      const d = new Date(s);
      if (!Number.isNaN(d.getTime())) return d;
    }
  }

  const hora = (hi ?? '00:00:00').toString();
  const hhmmss = hora.length >= 8 ? hora.slice(0, 8) : `${hora.padEnd(8, '0')}`;
  const day = fecha != null ? String(fecha).slice(0, 10) : '';
  const d = new Date(`${day}T${hhmmss}`);
  return Number.isNaN(d.getTime()) ? new Date(0) : d;
}

function formatoHora(valor) {
  if (valor == null || valor === '') return '—';
  const s = String(valor);
  if (/^\d{4}-\d{2}-\d{2}T/.test(s) || (s.includes('T') && s.length > 12)) {
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
      const h = d.getHours();
      const m = d.getMinutes();
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
  }
  return s.length >= 5 ? s.slice(0, 5) : s;
}

/** Encabezado exigido por el servicio de citas para el paciente autenticado. */
function headersPaciente(numDocumento) {
  const doc = numDocumento != null ? String(numDocumento).trim() : '';
  if (doc === '') return {};
  return { 'X-Patient-Id': doc };
}

/** Solo ocultar cancelar si la cita ya consta cancelada (no usar `estado_agenda` del hueco: puede ser 0 y la cita igual ser válida). */
function citaYaCanceladaSegunApi(row) {
  const v = row?.estado_cita ?? row?.estado;
  if (v === false || v === 0 || v === '0' || v === 'false') return true;
  if (typeof v === 'string' && /cancel/i.test(v)) return true;
  return false;
}

export default function Appointments() {
  const auth = useContext(AuthContext);
  const idPaciente = auth?.payload?.num_documento;

  const [tab, setTab] = useState('futuras');
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [citas, setCitas] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await http.get(endpoints.specialties.list);
        const list = Array.isArray(data) ? data : [];
        if (!cancelled) setEspecialidades(list);
      } catch (e) {
        console.error('Error cargando especialidades:', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const columnasCitas = useMemo(() => {
    const opts = [...especialidades]
      .sort((a, b) =>
        String(a.nombre_especialidad).localeCompare(String(b.nombre_especialidad), 'es')
      )
      .map((e) => ({
        value: String(e.id_especialidad),
        label: e.nombre_especialidad,
      }));
    const nombrePorId = Object.fromEntries(
      especialidades.map((e) => [e.id_especialidad, e.nombre_especialidad])
    );
    const nombreEspecialidad = (id) => {
      if (id == null || id === '') return null;
      return nombrePorId[id] ?? nombrePorId[Number(id)] ?? null;
    };

    return [
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
      {
        key: 'id_especialidad',
        label: 'Especialidad',
        filterable: true,
        filterType: 'select',
        filterOptions: opts,
        render: (valor, row) => {
          const id = row?.id_especialidad ?? valor;
          const nombre = nombreEspecialidad(id);
          return nombre ?? (id != null && id !== '' ? String(id) : '—');
        },
      },
    ];
  }, [especialidades]);

  const fetchCitas = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (idPaciente != null && String(idPaciente).trim() !== '') {
        params.id_paciente = Number(idPaciente);
      }

      const { data } = await http.get(endpoints.appointments.list, {
        params,
        headers: headersPaciente(idPaciente),
      });
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
        if (key === 'id_especialidad') {
          return String(cell ?? '') === String(val).trim();
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
  const dataPage = useMemo(() => {
    const slice = citasFiltradas.slice((page - 1) * pageSize, page * pageSize);
    if (tab !== 'futuras') return slice;
    return slice.map((row) => ({
      ...row,
      _cancelable: !citaYaCanceladaSegunApi(row) ? 1 : 0,
    }));
  }, [citasFiltradas, page, pageSize, tab]);

  const handleFiltersChange = (nextFilters) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const handleCancelarCita = useCallback(
    async (idCita) => {
      await http.put(
        endpoints.appointments.cancel(idCita),
        { razon: 'Cancelación solicitada por el paciente' },
        { headers: headersPaciente(idPaciente) }
      );
      await fetchCitas();
    },
    [fetchCitas, idPaciente]
  );

  const formConfigCitas = useMemo(
    () => ({
      createButtonLabel: 'Nueva cita',
      deactivateButtonLabel: 'Cancelar',
      confirmDeactivateSubmitLabel: 'Cancelar',
      confirmDeactivateTitle: '¿Cancelar cita?',
      confirmDeactivateMessage: (row) => (
        <>
          ¿Está segura de que desea cancelar la cita del{' '}
          <strong>{row?.fecha ? String(row.fecha).slice(0, 10) : '—'}</strong>
          {row?.hora_inicio ? (
            <>
              {' '}
              a las <strong>{formatoHora(row.hora_inicio)}</strong>
            </>
          ) : null}
          ?
        </>
      ),
      deactivateSuccessMessage: 'Cita cancelada correctamente.',
      statusKey: '_cancelable',
      activeValue: 1,
      deactivatedValue: 0,
    }),
    []
  );

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
        columns={columnasCitas}
        data={dataPage}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        formConfig={formConfigCitas}
        createHref="/patient/appointments/new"
        onReload={fetchCitas}
        onDeactivate={tab === 'futuras' ? handleCancelarCita : undefined}
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
        keyExtractor={(row) => row.id_cita ?? row.id}
        emptyMessage={
          loading ? 'Cargando...' : 'No tienes citas en esta pestaña o con estos filtros.'
        }
      />
    </PageContainer>
  );
}
