import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../../services/api/http";
import { endpoints } from "../../services/api/endpoints";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Spinner,
} from "../../components/ui";

/**
 * Appointments.jsx
 *
 * Enfoque:
 * - Cumple la HU como planner/agenda de citas del doctor.
 * - Usa componentes UI actualizados del proyecto.
 * - Queda preparado para backend real.
 * - Consume consultation-context al iniciar consulta.
 *
 * Importante:
 * - No hay endpoint verificado para LISTAR citas del doctor.
 * - Por eso la lista usa fallback MOCK, pero la estructura queda lista
 *   para cambiar a backend real apenas exista el endpoint.
 */

/* -------------------------------------------------------------------------- */
/*                                 API CONFIG                                 */
/* -------------------------------------------------------------------------- */

const APPOINTMENT_API = {
  list:
    endpoints?.doctor_appointments?.list ||
    endpoints?.appointments?.list ||
    null,

  consultationContext:
    endpoints?.appointment?.consultationContext ||
    ((id) => `/api/appointment/${id}/consultation-context`),
};

/* -------------------------------------------------------------------------- */
/*                                   MOCK                                     */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function getTodayISO() {
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tzOffset).toISOString().slice(0, 10);
}

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

function getStatusVariant(status) {
  const normalized = String(status).toLowerCase();

  if (["activa", "activo", "programada", "confirmada", "scheduled", "confirmed"].includes(normalized)) {
    return "success";
  }

  if (["cancelada", "cancelado", "cancelled"].includes(normalized)) {
    return "error";
  }

  if (["finalizada", "finalizado", "completed"].includes(normalized)) {
    return "info";
  }

  return "neutral";
}

function getStatusClasses(status) {
  const variant = getStatusVariant(status);

  if (variant === "success") {
    return "bg-primary-50 text-primary-700 border border-primary-100";
  }

  if (variant === "error") {
    return "bg-emergency-50 text-emergency-700 border border-emergency-200";
  }

  if (variant === "info") {
    return "bg-secondary-50 text-secondary-700 border border-secondary-100";
  }

  return "bg-neutral-100 text-neutral-700 border border-neutral-200";
}

function normalizeAppointment(raw, index) {
  const paciente = raw?.paciente || raw?.patient || raw?.persona || {};

  const nombres =
    paciente?.nombres ||
    paciente?.nombre ||
    raw?.nombres_paciente ||
    raw?.patient_name ||
    "";

  const apellidos =
    paciente?.apellidos ||
    paciente?.apellido ||
    raw?.apellidos_paciente ||
    raw?.patient_lastname ||
    "";

  const nombreCompleto =
    `${nombres} ${apellidos}`.trim() ||
    raw?.nombre_paciente ||
    raw?.patient_full_name ||
    "Paciente sin nombre";

  const numDocumento =
    paciente?.num_documento ||
    paciente?.documento ||
    raw?.num_documento ||
    raw?.patient_document ||
    "Sin documento";

  return {
    id_cita: raw?.id_cita || raw?.id || raw?.appointment_id || index,
    fecha: raw?.fecha || raw?.date || getTodayISO(),
    hora_inicio: raw?.hora_inicio || raw?.start_time || "00:00",
    hora_fin: raw?.hora_fin || raw?.end_time || "00:00",
    estado: raw?.estado || raw?.status || "pendiente",
    nombre_paciente: nombreCompleto,
    num_documento: String(numDocumento),
  };
}

async function fetchAppointmentsByDate(dateValue) {
  // Cuando exista endpoint real, este bloque será la fuente principal.
  if (APPOINTMENT_API.list) {
    const { data } = await http.get(APPOINTMENT_API.list, {
      params: { fecha: dateValue },
    });

    return Array.isArray(data)
      ? data.map((item, index) => normalizeAppointment(item, index))
      : [];
  }

  // Fallback temporal controlado
  return MOCK_APPOINTMENTS
    .filter((item) => item.fecha === dateValue)
    .map((item, index) => normalizeAppointment(item, index));
}

async function fetchConsultationContext(appointmentId) {
  const endpoint =
    typeof APPOINTMENT_API.consultationContext === "function"
      ? APPOINTMENT_API.consultationContext(appointmentId)
      : `/api/appointment/${appointmentId}/consultation-context`;

  const { data } = await http.get(endpoint);
  return data;
}

/* -------------------------------------------------------------------------- */
/*                                 COMPONENT                                  */
/* -------------------------------------------------------------------------- */

export default function Appointments() {
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingContextId, setLoadingContextId] = useState(null);

  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const loadAppointments = async (dateValue = selectedDate) => {
    setLoading(true);
    setError("");
    setInfoMessage("");

    try {
      const result = await fetchAppointmentsByDate(dateValue);
      setAppointments(result.sort(sortByHour));

      if (!APPOINTMENT_API.list) {
        setInfoMessage(
          "La agenda se muestra con datos temporales porque aún no se ha configurado el endpoint de listado de citas."
        );
      }
    } catch (err) {
      setAppointments([]);
      setError("No fue posible cargar la agenda de citas del doctor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments(selectedDate);
  }, [selectedDate]);

  const sortedAppointments = useMemo(
    () => [...appointments].sort(sortByHour),
    [appointments]
  );

  const totalAppointments = sortedAppointments.length;
  const activeAppointments = sortedAppointments.filter((item) =>
    isActiveStatus(item.estado)
  ).length;

  const handleStartConsultation = async (appointment) => {
    setLoadingContextId(appointment.id_cita);
    setError("");

    try {
      const response = await fetchConsultationContext(appointment.id_cita);

      const hasError = response?.hasError;
      const context = response?.data;

      if (hasError || !context?.id_cita) {
        throw new Error("No fue posible obtener el contexto de la consulta.");
      }

      navigate(`/doctor/consultation/new?appointment_id=${context.id_cita}`);
    } catch (err) {
      setError(
        "No fue posible iniciar la consulta para la cita seleccionada."
      );
    } finally {
      setLoadingContextId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <Card>
        <Card.Body className="p-0">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">
                Planner de citas
              </p>
              <h1 className="mt-1 text-2xl md:text-3xl font-bold text-neutral-900">
                Agenda del doctor
              </h1>
              <p className="mt-2 text-neutral-600">
                Consulta las citas del día, filtra por fecha y accede rápidamente
                al inicio de consulta.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
              <DatePicker
                label="Filtrar por fecha"
                value={selectedDate}
                onChange={(value) => setSelectedDate(value)}
                className="sm:w-56"
              />

              <Button
                variant="primary"
                onClick={() => loadAppointments(selectedDate)}
              >
                Recargar
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* ALERTAS */}
      {infoMessage && (
        <Alert variant="info" title="Modo temporal">
          {infoMessage}
        </Alert>
      )}

      {error && (
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      )}

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

      {/* LISTADO */}
      <Card padding={false}>
        <Card.Header className="px-6 py-4 mb-0">
          <h2 className="text-lg font-semibold text-neutral-900">
            Agenda del día
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Las citas se muestran ordenadas por hora de inicio.
          </p>
        </Card.Header>

        <Card.Body className="p-0">
          {loading ? (
            <div className="px-6 py-10 flex items-center justify-center">
              <Spinner />
            </div>
          ) : sortedAppointments.length === 0 ? (
            <div className="px-6 py-10 text-center text-neutral-500">
              No hay citas registradas para la fecha seleccionada.
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {sortedAppointments.map((appointment) => (
                <AppointmentRow
                  key={appointment.id_cita}
                  appointment={appointment}
                  isLoadingContext={loadingContextId === appointment.id_cita}
                  onStartConsultation={handleStartConsultation}
                />
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            SUBCOMPONENTES UI                               */
/* -------------------------------------------------------------------------- */

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

function AppointmentRow({
  appointment,
  isLoadingContext,
  onStartConsultation,
}) {
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
            <Button
              variant="primary"
              onClick={() => onStartConsultation(appointment)}
              disabled={isLoadingContext}
            >
              {isLoadingContext ? "Iniciando..." : "Iniciar consulta"}
            </Button>
          ) : (
            <Button variant="ghost" disabled>
              No disponible
            </Button>
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
