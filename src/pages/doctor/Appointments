import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "../../services/api/http";
import { endpoints } from "../../services/api/endpoints";

function getTodayISO() {
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tzOffset).toISOString().slice(0, 10);
}

const MOCK_APPOINTMENTS = [
  {
    id_cita: 101,
    fecha: getTodayISO(),
    hora_inicio: "08:00",
    hora_fin: "08:30",
    estado: "activa",
    paciente: {
      nombres: "Laura",
      apellidos: "Rojas",
      num_documento: "1012345678",
    },
  },
  {
    id_cita: 102,
    fecha: getTodayISO(),
    hora_inicio: "09:00",
    hora_fin: "09:20",
    estado: "activa",
    paciente: {
      nombres: "Camila",
      apellidos: "Díaz",
      num_documento: "1098765432",
    },
  },
  {
    id_cita: 103,
    fecha: getTodayISO(),
    hora_inicio: "10:30",
    hora_fin: "11:00",
    estado: "cancelada",
    paciente: {
      nombres: "Andrés",
      apellidos: "Vargas",
      num_documento: "99887766",
    },
  },
  {
    id_cita: 104,
    fecha: getTodayISO(),
    hora_inicio: "14:00",
    hora_fin: "14:30",
    estado: "finalizada",
    paciente: {
      nombres: "Sofía",
      apellidos: "Ramírez",
      num_documento: "55443322",
    },
  },
];

function sortByHour(a, b) {
  return String(a.hora_inicio).localeCompare(String(b.hora_inicio));
}

function isActiveStatus(status) {
  const normalized = String(status).toLowerCase();
  return [
    "activa",
    "activo",
    "programada",
    "confirmada",
    "scheduled",
    "confirmed",
  ].includes(normalized);
}

function getStatusClasses(status) {
  const normalized = String(status).toLowerCase();

  if (
    [
      "activa",
      "activo",
      "programada",
      "confirmada",
      "scheduled",
      "confirmed",
    ].includes(normalized)
  ) {
    return "bg-primary-50 text-primary-700 border border-primary-100";
  }

  if (["cancelada", "cancelado", "cancelled"].includes(normalized)) {
    return "bg-emergency-50 text-emergency-500 border border-emergency-500/20";
  }

  if (["finalizada", "finalizado", "completed"].includes(normalized)) {
    return "bg-secondary-50 text-secondary-700 border border-secondary-100";
  }

  return "bg-neutral-100 text-neutral-700 border border-neutral-200";
}

function normalizeAppointment(raw, index) {
  const paciente = raw.paciente || raw.patient || raw.persona || {};

  const nombres =
    paciente.nombres ||
    paciente.nombre ||
    raw.nombres_paciente ||
    raw.patient_name ||
    "";

  const apellidos =
    paciente.apellidos ||
    paciente.apellido ||
    raw.apellidos_paciente ||
    raw.patient_lastname ||
    "";

  const nombreCompleto =
    `${nombres} ${apellidos}`.trim() ||
    raw.nombre_paciente ||
    raw.patient_full_name ||
    "Paciente sin nombre";

  const numDocumento =
    paciente.num_documento ||
    paciente.documento ||
    raw.num_documento ||
    raw.patient_document ||
    "Sin documento";

  return {
    id_cita: raw.id_cita || raw.id || raw.appointment_id || index,
    fecha: raw.fecha || raw.date || getTodayISO(),
    hora_inicio: raw.hora_inicio || raw.start_time || "00:00",
    hora_fin: raw.hora_fin || raw.end_time || "00:00",
    estado: raw.estado || raw.status || "pendiente",
    nombre_paciente: nombreCompleto,
    num_documento: String(numDocumento),
  };
}

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadAppointments = async (dateValue = selectedDate) => {
    setLoading(true);
    setError("");

    try {
      const hasEndpoint =
        endpoints?.doctor_appointments &&
        typeof endpoints.doctor_appointments.list === "string";

      if (hasEndpoint) {
        const { data } = await http.get(endpoints.doctor_appointments.list, {
          params: { fecha: dateValue },
        });

        const normalized = Array.isArray(data)
          ? data.map((item, index) => normalizeAppointment(item, index))
          : [];

        setAppointments(normalized.sort(sortByHour));
      } else {
        const filteredMock = MOCK_APPOINTMENTS.filter(
          (item) => item.fecha === dateValue
        ).map((item, index) => normalizeAppointment(item, index));

        setAppointments(filteredMock.sort(sortByHour));
      }
    } catch (err) {
      setError("Error cargando citas del doctor");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments(selectedDate);
  }, [selectedDate]);

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort(sortByHour);
  }, [appointments]);

  const totalAppointments = sortedAppointments.length;

  const activeAppointments = sortedAppointments.filter((item) =>
    isActiveStatus(item.estado)
  ).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-secondary-600">
              Dashboard de citas
            </p>
            <h1 className="mt-1 text-2xl md:text-3xl font-bold text-neutral-900">
              Citas del doctor
            </h1>
            <p className="mt-2 text-neutral-600">
              Consulta la agenda del día, filtra por fecha y accede rápidamente
              al inicio de consulta.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div>
              <label
                htmlFor="appointment-date"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Filtrar por fecha
              </label>
              <input
                id="appointment-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-52 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>

            <button
              onClick={() => loadAppointments(selectedDate)}
              className="rounded-xl bg-primary-500 px-4 py-2 text-white font-medium hover:bg-primary-600 transition"
            >
              Recargar
            </button>
          </div>
        </div>
      </section>

      {/* RESUMEN */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Fecha seleccionada"
          value={selectedDate}
          tone="secondary"
        />
        <SummaryCard
          title="Total de citas"
          value={String(totalAppointments)}
          tone="primary"
        />
        <SummaryCard
          title="Citas activas"
          value={String(activeAppointments)}
          tone="neutral"
        />
      </section>

      {/* ESTADOS */}
      {loading && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm text-neutral-600">
          Cargando citas...
        </section>
      )}

      {error && (
        <section className="rounded-2xl border border-emergency-500/20 bg-emergency-50 p-6 shadow-sm text-emergency-500">
          {error}
        </section>
      )}

      {!loading && !error && (
        <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-neutral-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-neutral-900">
              Agenda del día
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              Las citas se muestran ordenadas por hora de inicio.
            </p>
          </div>

          {sortedAppointments.length === 0 ? (
            <div className="px-6 py-10 text-center text-neutral-500">
              No hay citas registradas para la fecha seleccionada.
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {sortedAppointments.map((appointment) => (
                <AppointmentRow
                  key={appointment.id_cita}
                  appointment={appointment}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function SummaryCard({ title, value, tone = "primary" }) {
  const styles = {
    primary: "bg-primary-50 border-primary-100 text-primary-700",
    secondary: "bg-secondary-50 border-secondary-100 text-secondary-700",
    neutral: "bg-neutral-50 border-neutral-200 text-neutral-700",
  };

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${styles[tone]}`}>
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function AppointmentRow({ appointment }) {
  const canStartConsultation = isActiveStatus(appointment.estado);

  return (
    <div className="px-6 py-5 hover:bg-neutral-50 transition">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 flex-1">
          <InfoBlock
            label="Horario"
            value={`${appointment.hora_inicio} - ${appointment.hora_fin}`}
          />
          <InfoBlock label="Paciente" value={appointment.nombre_paciente} />
          <InfoBlock label="Documento" value={appointment.num_documento} />

          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Estado
            </p>
            <span
              className={`mt-1 inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusClasses(
                appointment.estado
              )}`}
            >
              {appointment.estado}
            </span>
          </div>
        </div>

        <div className="flex justify-start xl:justify-end">
          {canStartConsultation ? (
            <Link
              to={`/doctor/consultation/new?appointment_id=${appointment.id_cita}`}
              className="inline-flex items-center justify-center rounded-xl bg-primary-500 px-4 py-2 text-white font-medium hover:bg-primary-600 transition"
            >
              Iniciar consulta
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex items-center justify-center rounded-xl bg-neutral-200 px-4 py-2 text-neutral-500 font-medium cursor-not-allowed"
            >
              No disponible
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-neutral-900">{value}</p>
    </div>
  );
}
