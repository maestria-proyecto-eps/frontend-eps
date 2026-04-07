import React, { useEffect, useMemo, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../../services/api/http";
import { endpoints } from "../../services/api/endpoints";
import { AuthContext } from "../../services/auth/AuthContext";
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
 * Agenda de citas del doctor.
 * - GET /api/appointments?fecha=YYYY-MM-DD&id_doctor=... - Obtiene citas del doctor
 */

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

function normalizeAppointment(raw) {
  return {
    id_cita: raw?.id_cita || null,
    id_paciente: raw?.id_paciente || null,
    id_doctor: raw?.id_doctor || null,
    id_especialidad: raw?.id_especialidad || null,
    fecha: raw?.fecha || getTodayISO(),
    hora_inicio: raw?.hora_inicio || "00:00",
    hora_fin: raw?.hora_fin || "00:00",
    asistio: raw?.asistio ?? null,
    nombre_paciente: "Paciente sin información",
    num_documento: String(raw?.id_paciente || ""),
    id_remision: raw?.id_remision || null,
  };
}

async function fetchPersonByDocument(numDocumento) {
  try {
    const { data: response } = await http.get(`/api/persons/${numDocumento}`);

    if (!response?.hasError && response?.data) {
      return {
        num_documento: response.data?.num_documento,
        nombres: response.data?.nombres,
        apellidos: response.data?.apellidos,
      };
    }

    return null;
  } catch {
    return null;
  }
}

async function enrichAppointmentWithPatientData(appointment) {
  if (!appointment.id_paciente) return appointment;

  try {
    const personData = await fetchPersonByDocument(appointment.id_paciente);

    if (personData?.nombres && personData?.apellidos) {
      appointment.nombre_paciente = `${personData.nombres} ${personData.apellidos}`.trim();
      appointment.num_documento = personData.num_documento;
    }
  } catch {
    // Silenciar errores - se muestra "Paciente sin información"
  }

  return appointment;
}

async function fetchAppointmentsByDate(dateValue, doctorId) {
  try {
    const params = { fecha: dateValue };
    if (doctorId) params.id_doctor = doctorId;

    const { data } = await http.get(endpoints.appointments.list, { params });
    let results = Array.isArray(data) ? data.map(normalizeAppointment) : [];

    results = await Promise.all(results.map(enrichAppointmentWithPatientData));

    if (doctorId) {
      const doctorIdNum = parseInt(String(doctorId).trim());
      results = results.filter(
        (apt) => parseInt(String(apt.id_doctor || "0").trim()) === doctorIdNum
      );
    }

    return results;
  } catch {
    return [];
  }
}

/* -------------------------------------------------------------------------- */
/*                                 COMPONENT                                  */
/* -------------------------------------------------------------------------- */

export default function Appointments() {
  const navigate = useNavigate();
  const { payload } = useContext(AuthContext);

  const doctorId = payload?.num_documento || null;

  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingContextId, setLoadingContextId] = useState(null);

  const [error, setError] = useState("");

  const loadAppointments = async (dateValue = selectedDate) => {
    setLoading(true);
    setError("");

    try {
      const result = await fetchAppointmentsByDate(dateValue, doctorId);
      setAppointments(result.sort(sortByHour));
    } catch {
      setAppointments([]);
      setError("No fue posible cargar la agenda de citas del doctor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments(selectedDate);
  }, [selectedDate, doctorId]);

  const sortedAppointments = useMemo(
    () => [...appointments].sort(sortByHour),
    [appointments]
  );

  const totalAppointments = sortedAppointments.length;
  const pendingAppointments = sortedAppointments.filter(
    (item) => item.asistio !== true
  ).length;

  const handleStartConsultation = (appointment) => {
    setLoadingContextId(appointment.id_cita);
    navigate(`/doctor/consultation/new?appointment_id=${appointment.id_cita}`);
    setLoadingContextId(null);
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
          title="Citas pendientes"
          value={String(pendingAppointments)}
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

function AppointmentRow({ appointment, isLoadingContext, onStartConsultation }) {
  const canStartConsultation = appointment.asistio !== true;

  return (
    <div className="px-6 py-5 hover:bg-neutral-50 transition">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
          <InfoBlock
            label="Horario"
            value={`${appointment.hora_inicio} - ${appointment.hora_fin}`}
          />
          <InfoBlock label="Paciente" value={appointment.nombre_paciente} />
          <InfoBlock label="Documento" value={appointment.num_documento} />

          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Asistió
            </p>
            <span
              className={`mt-1 inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                appointment.asistio === true
                  ? "bg-secondary-50 text-secondary-700 border border-secondary-100"
                  : "bg-primary-50 text-primary-700 border border-primary-100"
              }`}
            >
              {appointment.asistio === true ? "Sí" : "Pendiente"}
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-2 justify-start md:justify-end">
          {canStartConsultation ? (
            <Button
              variant="primary"
              onClick={() => onStartConsultation(appointment)}
              disabled={isLoadingContext}
              className="text-sm"
            >
              {isLoadingContext ? "Iniciando..." : "Iniciar consulta"}
            </Button>
          ) : (
            <Button variant="ghost" disabled className="text-sm">
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
