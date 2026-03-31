import { PageContainer } from "../../components/layout";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui";
import { ROUTES } from "../../constants";
import { Modal } from "../../components/ui/Modal";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from '@fullcalendar/core/locales/es';
import { http } from "../../services/api/http";
import { endpoints } from "../../services/api/endpoints";
import { useState, useEffect, useRef } from "react";

const SCHEDULES = [
  { value: "8:00 AM a 9:00 AM", label: "8:00 AM a 9:00 AM" },
  { value: "9:00 AM a 10:00 AM", label: "9:00 AM a 10:00 AM" },
  { value: "10:00 AM a 11:00 AM", label: "10:00 AM a 11:00 AM" },
];

const EVENTS = [
  { title: 'Alberto García', date: '2026-03-01', extendedProps: { specialty: 'Cardiología', schedule: '8:00 AM a 9:00 AM' } },
  { title: 'María López', date: '2026-03-02', extendedProps: { specialty: 'Medicina General', schedule: '9:00 AM a 10:00 AM' } },
  { title: 'Juan Pérez', date: '2026-03-03', extendedProps: { specialty: 'Otro', schedule: '10:00 AM a 11:00 AM' } }
];

export default function Calendar() {
  const [form, setForm] = useState({
    especialidad: "",
    nombre: "",
    fecha: "",
  });
  const [events, setEvents] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [animStatus, setAnimStatus] = useState('idle');
  const formRef = useRef();

  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        const { data } = await http.get(endpoints.specialties.list);
        const options = data.map(s => ({ value: s.id_especialidad, label: s.nombre_especialidad }));
        setSpecialties(options);
        setForm(prev => ({ ...prev, especialidad: options[0]?.value || "" }));
        setLoading(false);
      }
      catch (e) {
        console.error("Error al cargar especialidades:", e);
        return;
      }
    };
    loadSpecialties();
  }, []);

  const loadEvents = () => {
    if (!events.length) {
      setEvents(EVENTS);
    }
    return EVENTS.filter(e => !form.especialidad || e.extendedProps.specialty === form.especialidad);
  }

  const handleGuideUser = () => {
    setAnimStatus('highlighting');
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => {
      setAnimStatus('fading');
    }, 500);

    setTimeout(() => {
      setAnimStatus('idle');
    }, 1000);
  };

  const handleEventClick = (eventInfo) => {
    setIsVisible(true);
    setForm(prev => ({ ...prev, nombre: eventInfo.event.title }));
    handleGuideUser();
  };

  /* En construcción */
  const handleSubmit = async (e) => {
    return e;
  };

  const update = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <PageContainer>
      <div className="mb-8 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">Agendamiento de citas</h1>
          <p className="mt-1 text-neutral-600">
            Seleccione una fecha para agendar una cita con el doctor de su preferencia. Puede usar el menú desplegable para filtrar por especialidad.
          </p>
        </div>

        <Link to={ROUTES.HOME}>
          <Button variant="outline" size="sm">
            ← Volver
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          <div className="flex flex-col">
            <label className="text-sm font-medium text-neutral-800 mb-1">
              Especialidad
            </label>
            <select
              onChange={update("especialidad")}
              value={form.especialidad}
              disabled={loading}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 
           disabled:bg-neutral-200 disabled:text-neutral-600 disabled:cursor-not-allowed disabled:border-neutral-200"
            >
              {loading ? (
                <option value="" disabled>Cargando...</option>
              ) : (
                <>
                  {specialties.map((esp) => (
                    <option key={esp.value} value={esp.value}>
                      {esp.label}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div className={[
            "flex flex-col",
            isVisible
              ? "opacity-100 visible"
              : "opacity-0 invisible transition-opacity",
          ].join(" ")}
          >
            <label className="text-sm font-medium text-neutral-800 mb-1">
              Horarios disponibles
            </label>
            <select
              ref={formRef}
              onChange={update("fecha")}
              value={form.fecha}
              className={[
                "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200",
                animStatus === 'highlighting' && "ring-4 ring-primary-500/50 transition-all duration-300 ease-out",
                animStatus === 'fading' && "ring-0 transition-all duration-1000 ease-in opacity-100",
                animStatus === 'idle' && "ring-0"
              ].join(" ")}
            >
              {SCHEDULES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">&nbsp;</label>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className={[
                "h-[39px] inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold transition bg-primary-500 text-white hover:bg-primary-600",
                isVisible
                  ? "opacity-100 visible"
                  : "opacity-0 invisible transition-opacity",
              ].join(" ")}
            >
              Agendar cita
            </button>
          </div>
        </div>
      </form>

      <hr className="my-8" />

      <div className="
        [&_.fc-button-primary]:bg-primary-500 
        [&_.fc-button-primary]:border-none
        [&_.fc-today-button:not(:disabled):hover]:bg-primary-600
        [&_.fc-prev-button:hover]:bg-primary-600 
        [&_.fc-next-button:hover]:bg-primary-600
      ">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          eventClick={handleEventClick}
          locale={esLocale}
          events={events.length ? loadEvents() : []}
        />
      </div>

      {/* Modal de confirmación de datos */}
      <Modal
        open={confirmOpen}
        title="Confirmar los datos de la cita"
        onClose={() => setConfirmOpen(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                console.log("Cita confirmada con:", form);
                setConfirmOpen(false);
                setForm({ nombre: "", especialidad: "", fecha: "" });
                alert("¡Cita agendada correctamente!");
              }}
              className="px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition"
            >
              Confirmar y Agendar
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-neutral-700">
            Por favor, verifica que la información sea correcta antes de programar la cita:
          </p>

          <div className="rounded-2xl border border-primary-100 bg-primary-50/50 p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <p className="text-sm text-neutral-500 font-medium">Doctor:</p>
              <p className="text-sm text-neutral-900 font-bold">{form.nombre || "No seleccionado"}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <p className="text-sm text-neutral-500 font-medium">Especialidad:</p>
              <p className="text-sm text-neutral-900 font-bold">{form.especialidad || "No seleccionada"}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <p className="text-sm text-neutral-500 font-medium">Horario:</p>
              <p className="text-sm text-neutral-900 font-bold">{form.fecha || "No seleccionado"}</p>
            </div>
          </div>

          <p className="text-xs text-neutral-500">
            * Si los datos son incorrectos, haz clic en "Cerrar" para editarlos.
          </p>
        </div>
      </Modal>

    </PageContainer>
  );

}
