import React from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../../components/layout';
import { DataTable, Badge, Button } from '../../components/ui';

// Datos quemados de citas para diseño de UI
const CITAS_MOCK = [
  {
    id_cita: 1,
    fecha: '2026-03-25',
    hora_inicio: '09:00',
    doctor_nombre: 'Dra. Laura Méndez',
    especialidad: 'Medicina General',
    estado: 'Activa',
  },
  {
    id_cita: 2,
    fecha: '2026-03-28',
    hora_inicio: '11:30',
    doctor_nombre: 'Dr. Carlos Ruiz',
    especialidad: 'Cardiología',
    estado: 'Activa',
  },
  {
    id_cita: 3,
    fecha: '2026-02-10',
    hora_inicio: '15:00',
    doctor_nombre: 'Dra. Ana López',
    especialidad: 'Dermatología',
    estado: 'Atendida',
  },
  {
    id_cita: 4,
    fecha: '2026-02-15',
    hora_inicio: '10:15',
    doctor_nombre: 'Dr. Juan Pérez',
    especialidad: 'Odontología',
    estado: 'Cancelada',
  },
  {
    id_cita: 5,
    fecha: '2026-03-20',
    hora_inicio: '08:30',
    doctor_nombre: 'Dra. Marcela Gómez',
    especialidad: 'Pediatría',
    estado: 'Activa',
  },
];

const ESTADOS_CITA = [
  { value: 'Activa', label: 'Activa' },
  { value: 'Cancelada', label: 'Cancelada' },
  { value: 'Atendida', label: 'Atendida' },
];

const COLUMNAS_CITAS = [
  { key: 'fecha', label: 'Fecha', filterable: true },
  { key: 'hora_inicio', label: 'Hora', filterable: false },
  { key: 'doctor_nombre', label: 'Doctor', filterable: true },
  { key: 'especialidad', label: 'Especialidad', filterable: true },
  {
    key: 'estado',
    label: 'Estado',
    filterable: true,
    filterType: 'select',
    filterOptions: ESTADOS_CITA.map((e) => ({ value: e.value, label: e.label })),
    render: (valor) => {
      const variant =
        valor === 'Activa'
          ? 'success'
          : valor === 'Cancelada'
          ? 'danger'
          : 'neutral';
      return (
        <Badge variant={variant} size="sm">
          {valor}
        </Badge>
      );
    },
  },
];

export default function Appointments() {
  const [tab, setTab] = React.useState('futuras'); // 'futuras' | 'pasadas'
  const [filters, setFilters] = React.useState({});
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const hoy = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const citasFiltradasPorTab = React.useMemo(() => {
    return CITAS_MOCK.filter((cita) => {
      const fechaCita = new Date(cita.fecha);
      fechaCita.setHours(0, 0, 0, 0);
      if (tab === 'futuras') {
        return fechaCita >= hoy;
      }
      return fechaCita < hoy;
    });
  }, [tab, hoy]);

  const citasFiltradas = React.useMemo(() => {
    return citasFiltradasPorTab.filter((row) => {
      return Object.entries(filters).every(([key, val]) => {
        if (val == null || String(val).trim() === '') return true;
        const value = String(val).trim().toLowerCase();
        const cell = row[key];
        if (key === 'estado') {
          return String(cell) === String(val);
        }
        return String(cell ?? '').toLowerCase().includes(value);
      });
    });
  }, [citasFiltradasPorTab, filters]);

  const total = citasFiltradas.length;
  const dataPage = React.useMemo(
    () => citasFiltradas.slice((page - 1) * pageSize, page * pageSize),
    [citasFiltradas, page, pageSize]
  );

  const handleFiltersChange = (nextFilters) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const renderRowActions = (row) => {
    const fechaCita = new Date(row.fecha);
    fechaCita.setHours(0, 0, 0, 0);
    const esFutura = fechaCita >= hoy;
    const puedeCancelar = tab === 'futuras' && esFutura && row.estado === 'Activa';
    if (!puedeCancelar) return null;
    return (
      <Button variant="deactivate" size="sm">
        Cancelar
      </Button>
    );
  };

  return (
    <PageContainer>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Mis citas</h1>
          <p className="text-neutral-600 text-sm mt-1">
            Como paciente puedes ver y gestionar tus citas médicas.
          </p>
        </div>
        <Link to="/patient/appointments/new">
          <Button variant="primary" size="sm">
            Nueva cita
          </Button>
        </Link>
      </div>

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
        loading={false}
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
        renderRowActions={renderRowActions}
        keyExtractor={(row) => row.id_cita}
        emptyMessage="No tienes citas en esta pestaña o con estos filtros."
      />
    </PageContainer>
  );
}

