import React, { useState, useRef } from "react";
import { PageContainer } from "../../components/layout";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui";
import { ROUTES } from "../../constants";
import { Modal } from "../../components/ui/Modal";
import FullCalendar from '@fullcalendar/react';
import daygridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from '@fullcalendar/core/locales/es';

// --- CONSTANTES DE PRUEBA (MOCK DATA) ---
const SPECIALTIES = [
  { value: "Medicina General", label: "Medicina General" },
  { value: "Cardiología", label: "Cardiología" },
  { value: "Pediatría", label: "Pediatría" },
];

const SCHEDULES = [
  { value: "08:00 AM - 08:30 AM", label: "08:00 AM - 08:30 AM" },
  { value: "09:00 AM - 09:30 AM", label: "09:00 AM - 09:30 AM" },
  { value: "10:00 AM - 10:30 AM", label: "10:00 AM - 10:30 AM" },
];

const EVENTS = [
  { title: 'Dr. Alberto García', date: '2026-03-26', extendedProps: { specialty: 'Cardiología' } },
  { title: 'Dra. María López', date: '2026-03-27', extendedProps: { specialty: 'Medicina General' } },
  { title: 'Dr. Juan Pérez', date: '2026-03-28', extendedProps: { specialty: 'Pediatría' } }
];

export default function Calendar() {
  // --- ESTADOS ---
  const [form, setForm] = useState({
    especialidad: "Medicina General",
    nombre: "", // Nombre del doctor
    fecha: "08:00 AM - 08:30 AM",
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [animStatus, setAnimStatus] = useState('idle');
  const formRef = useRef();

  // --- LÓGICA ---
  const handleGuideUser = () => {
    setAnimStatus('highlighting');
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => setAnimStatus('fading'), 500);
    setTimeout(() => setAnimStatus('idle'), 1000);
  };

  const handleEventClick = (eventInfo) => {
    setIsVisible(true);
    setForm(prev => ({ ...prev, nombre: eventInfo.event.title }));
    handleGuideUser();
  };

  const update = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const loadEvents = () => {
    return EVENTS.filter(e => !form.especialidad || e.extendedProps.specialty === form.especialidad);
  };

  const handleConfirmFinal = () => {
    // Simulación de guardado en base de datos de la EPS
    console.log("Guardando cita:", form);
    setConfirmOpen(false);
    alert(`¡Cita agendada con éxito para ${form.nombre}!`);
    // Aquí podrías usar navigate(ROUTES.HOME) si tuvieras el hook
  };

  return (
    <PageContainer>
      {/* Encabezado */}
      <div className="mb-8 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">Agendamiento de citas</h1>
          <p className="mt-1 text-neutral-600">
            Seleccione un doctor en el calendario para ver sus horarios disponibles.
          </p>
        </div>
        <Link to={ROUTES.HOME}>
          <Button variant="outline" size="sm">← Volver</Button>
        </Link>
      </div>

      {/* Formulario de selección */}
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          
          <div className="flex flex-col">
            <label className="text-sm font-medium text-neutral-800 mb-1">Especialidad</label>
            <select
              onChange={update("especialidad")}
              value={form.especialidad}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 focus:ring-2 focus:ring-emerald-200"
            >
              {SPECIALTIES.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className={`flex flex-col transition-all duration-500 ${isVisible ? "opacity-100" : "opacity-0 invisible"}`}>
            <label className="text-sm font-medium text-neutral-800 mb-1">Horarios disponibles</label>
            <select
              ref={formRef}
              onChange={update("fecha")}
              value={form.fecha}
              className={`w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 ${
                animStatus === 'highlighting' ? "ring-4 ring-emerald-500/50" : ""
              }`}
            >
              {SCHEDULES.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className={`h-[42px] rounded-xl px-5 font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-all ${
                isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0 invisible"
              }`}
            >
              Confirmar Agendamiento
            </button>
          </div>
        </div>
      </div>

      <hr className="my-8" />

      {/* Calendario de FullCalendar */}
      <div className="
        [&_.fc-button-primary]:bg-emerald-600 
        [&_.fc-button-primary]:border-none
        [&_.fc-today-button:not(:disabled):hover]:bg-emerald-700
      ">
        <FullCalendar
          plugins={[daygridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          eventClick={handleEventClick}
          locale={esLocale}
          events={loadEvents()}
        />
      </div>

      {/* MODAL DE CONFIRMACIÓN */}
      <Modal
        open={confirmOpen}
        title="Resumen de su Cita"
        onClose={() => setConfirmOpen(false)}
        footer={
          <div className="flex gap-3">
            <button 
              onClick={() => setConfirmOpen(false)}
              className="px-4 py-2 text-neutral-500 hover:text-neutral-700 font-medium"
            >
              Cerrar
            </button>
            <button
              onClick={handleConfirmFinal}
              className="px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md"
            >
              Confirmar y Agendar
            </button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <p className="text-neutral-600">Verifique que los datos para el agendamiento sean correctos:</p>
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 space-y-3">
            <div className="flex justify-between">
              <span className="text-neutral-500 text-sm font-medium">Doctor asignado:</span>
              <span className="text-emerald-900 font-bold">{form.nombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500 text-sm font-medium">Especialidad:</span>
              <span className="text-emerald-900 font-bold">{form.especialidad}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500 text-sm font-medium">Franja horaria:</span>
              <span className="text-emerald-900 font-bold">{form.fecha}</span>
            </div>
          </div>
          <p className="text-[11px] text-neutral-400 italic">
            * Al confirmar, se creará un registro de cita en su historial de paciente.
          </p>
        </div>
      </Modal>
    </PageContainer>
  );
}