import { PageContainer } from "../../components/layout";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui";
import { Modal } from "../../components/ui/Modal";
import { Spinner } from '../../components/ui';
import { Alert } from '../../components/ui/Alert';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from '@fullcalendar/core/locales/es';
import { http } from "../../services/api/http";
import { endpoints } from "../../services/api/endpoints";
import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../../services/auth/AuthContext';
import { dateFormat } from "../../utils/dateFormat";

const getCalendarLimits = () => {
  const today = new Date();
  const inOneYear = new Date(today);
  inOneYear.setFullYear(inOneYear.getFullYear() + 1);
  return {
    minDate: dateFormat(today, "yyyy-mm-dd"),
    maxDate: dateFormat(inOneYear, "yyyy-mm-dd"),
  };
};

export default function Calendar() {
  const auth = useContext(AuthContext);
  const numDocPatient = auth?.payload?.num_documento;
  const [form, setForm] = useState({
    specialty: 1,
    doctor_id: "",
    name: "",
    date: "",
    startTime: "",
    endTime: "",
  });
  const [events, setEvents] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [IsLoading, setIsLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [visibleAlert, setVisibleAlert] = useState(false);
  const [msg, setMsg] = useState({
    type: "",
    title: "",
    text: "",
  });
  const [visibleForm, setVisibleForm] = useState(false);
  const formRef = useRef();
  const navigate = useNavigate();
  const { minDate, maxDate } = getCalendarLimits();

  const loadEvents = useCallback(async (specialtyId) => {
    try {
      setIsLoading(true);
      const body = {
        headers: {
          'X-Patient-Id': numDocPatient,
        },
        params: {
          specialty_id: specialtyId,
          startDate: minDate,
          endDate: maxDate,
        }
      }
      const { data } = await http.get(endpoints.appointments.availability, body);
      const dataIsArray = Array.isArray(data) ? data : [];
      const now = new Date();
      const events = dataIsArray.flatMap(({ nombre_medico, id_medico, slots }) =>
        slots.map(({ fecha, hora_inicio, hora_fin }) => ({
          title: nombre_medico,
          start: `${fecha}T${hora_inicio}`,
          end: `${fecha}T${hora_fin}`,
          extendedProps: {
            doctor_id: id_medico,
            startTime: hora_inicio,
            endTime: hora_fin,
          }
        }))
          .filter(event => {
            const eventDate = new Date(event.start);
            return eventDate >= now;
          })
      );
      setEvents(events);
      setIsLoading(false);
    }
    catch (e) {
      setMsg({
        type: "error",
        title: `Error ${e.response?.status || ""}`,
        text: `No se pudieron cargar las citas. ${e.response?.data?.detail || "Intente más tarde."}`,
      });
      setVisibleAlert(true);
      setIsLoading(false);
      setEvents([]);
    }
  }, [numDocPatient, minDate, maxDate]);
  
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await http.get(endpoints.specialties.list);
        const dataIsArray = Array.isArray(data) ? data : [];
        const options = dataIsArray.map(spe => ({ value: String(spe.id_especialidad), label: spe.nombre_especialidad }));
        const defaultSpecialty = options[0]?.value || "";
        if (!cancelled) {
          setSpecialties(options);
          setForm(prev => ({ ...prev, specialty: defaultSpecialty }));
          loadEvents(defaultSpecialty);
          setIsLoading(false);
        }
      }
      catch (e) {
        setMsg({
          type: "error",
          title: `Error ${e.response?.status || ""}`,
          text: `No se pudieron cargar las especialidades. ${e.response?.data?.detail || "Intente más tarde."}`
        });
        setVisibleAlert(true);
        setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    }
  }, [loadEvents]);

  useEffect(() => {
    if (visibleAlert) {
      formRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [visibleAlert]);

  const handleEventClick = (eventInfo) => {
    setVisibleForm(true);
    const { startTime, endTime, doctor_id } = eventInfo.event.extendedProps;
    const title = eventInfo.event.title;
    const date = eventInfo.event.startStr.split('T')[0];
    setForm(prev => ({
      ...prev,
      name: title,
      doctor_id: doctor_id,
      date: date,
      startTime: startTime,
      endTime: endTime,
    }));

    formRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  };

  const update = (key) => (e) => {
    const newValue = e.target.value;
    setForm(prev => ({ ...prev, [key]: newValue }));
    if (key === "specialty") {
      setVisibleForm(false);
      setVisibleAlert(false);
      setForm(prev => ({ ...prev, doctor_id: "", date: "", startTime: "", endTime: "" }));
      loadEvents(newValue);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const body = {
      "fecha": form.date,
      "hora_inicio": form.startTime,
      "id_doctor": Number(form.doctor_id),
      "id_especialidad": Number(form.specialty),
    };
    const config = {
      headers: {
        'X-Patient-Id': Number(numDocPatient)
      }
    };
    try {
      const res = await http.post(endpoints.appointments.create, body, config);
      const appointment = res?.data?.Data ?? res?.data;
      setMsg({
        type: "success",
        title: "Cita agendada",
        text: `La cita para el día ${appointment.fecha} ha sido agendada exitosamente.`,
      });
      setVisibleAlert(true);
      setConfirmOpen(false);
      setTimeout(() => {
        setIsLoading(false);
        navigate("/patient/citas");
      }, 3000);
    } catch (e) {
      setMsg({
        type: "error",
        title: `Error ${e.response?.status || ""}`,
        text: `No se pudo agendar la cita. ${e.response?.data?.detail || "Intente más tarde."}`,
      });
      setVisibleAlert(true);
      setConfirmOpen(false);
      setIsLoading(false);
    };
  }

  return (
    <PageContainer>
      {visibleAlert && (
        <div className="mb-4">
          <Alert
            variant={msg.type}
            title={msg.title}
            dismissible={true}
            onDismiss={() => setVisibleAlert(false)}
          >
            {msg.text}
          </Alert>
        </div>
      )}

      <div className="mb-8 flex items-center justify-between gap-3">
        <div ref={formRef}>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">Agendamiento de citas</h1>
          <p className="mt-1 text-neutral-600">
            Seleccione una fecha para agendar una cita con el doctor de su preferencia.
          </p>
        </div>
        <Link to={"/patient/citas"}>
          <Button variant="outline" size="sm">← Volver</Button>
        </Link>
      </div>

      <form id="appointment-form" onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {visibleForm && (
            <div className="flex flex-col bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <span className="text-sm font-medium text-neutral-500">Seleccionado:</span>
              <span className="text-lg font-bold text-neutral-900">{form.name}</span>
              <span className="text-sm text-neutral-600">{form.date} | {form.startTime}</span>
            </div>
          )}

          <div className="flex flex-col items-end gap-3">
            <select
              onChange={update("specialty")}
              value={form.specialty}
              disabled={IsLoading}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2"
            >
              {specialties.map((esp) => (
                <option key={esp.value} value={esp.value}>{esp.label}</option>
              ))}
            </select>
            {visibleForm && (
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="w-full h-[42px] rounded-xl bg-primary-500 text-white font-bold hover:bg-primary-600 transition"
              >
                Agendar Cita
              </button>
            )}
          </div>
        </div>
      </form>

      <hr className="my-8" />

      <div className="relative">
        {IsLoading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-20 backdrop-blur-[1px]">
            <Spinner size="lg" />
          </div>
        )}
        <div className="[&_.fc-button-primary]:bg-primary-500 [&_.fc-button-primary]:border-none">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            validRange={{ start: minDate, end: maxDate }}
            eventClick={handleEventClick}
            locale={esLocale}
            events={events}
          />
        </div>
      </div>

      <Modal
        open={confirmOpen}
        title="Confirmar Cita"
        onClose={() => setConfirmOpen(false)}
        footer={
          <button
            type="submit"
            form="appointment-form"
            className="px-6 py-2 rounded-xl bg-primary-500 text-white font-bold hover:bg-primary-600"
          >
            Confirmar y Agendar
          </button>
        }
      >
        <div className="space-y-4">
          <p>¿Deseas confirmar la cita con el <strong>{form.name}</strong> para el día <strong>{form.date}</strong>?</p>
        </div>
      </Modal>
    </PageContainer>
  );
}