import React, { useState } from 'react';
import { Container } from '../ui';

/**
 * AdminRolesSection - Roles disponibles en el sistema con permisos
 */
const ADMIN_ROLES = [
  {
    id: 'doctor',
    name: 'Médico',
    icon: '👨‍⚕️',
    color: 'bg-blue-50',
    borderColor: 'border-blue-200',
    permissions: [
      'Gestión de citas',
      'Prescripciones médicas',
      'Historial del paciente',
      'Remisiones',
    ],
  },
  {
    id: 'nurse',
    name: 'Enfermero',
    icon: '👩‍⚕️',
    color: 'bg-pink-50',
    borderColor: 'border-pink-200',
    permissions: [
      'Triage y evaluación',
      'Urgencias',
      'Hospitalizaciones',
      'Seguimiento de pacientes',
    ],
  },
  {
    id: 'pharmacist',
    name: 'Farmaceuta',
    icon: '💊',
    color: 'bg-amber-50',
    borderColor: 'border-amber-200',
    permissions: [
      'Gestión de inventario',
      'Dispensación de medicamentos',
      'Alertas farmacéuticas',
      'Control de stock',
    ],
  },
  {
    id: 'receptionist',
    name: 'Recepcionista',
    icon: '📋',
    color: 'bg-teal-50',
    borderColor: 'border-teal-200',
    permissions: [
      'Afiliación de pacientes',
      'Registro de citas',
      'Información general',
      'Atención al usuario',
    ],
  },
  {
    id: 'hr',
    name: 'Talento Humano',
    icon: '👥',
    color: 'bg-purple-50',
    borderColor: 'border-purple-200',
    permissions: [
      'Gestión de usuarios',
      'Asignación de roles',
      'Control de acceso',
      'Reportes del sistema',
    ],
  },
  {
    id: 'patient',
    name: 'Paciente',
    icon: '🏥',
    color: 'bg-green-50',
    borderColor: 'border-green-200',
    permissions: [
      'Mis citas',
      'Historia clínica',
      'Prescripciones',
      'Perfil y datos',
    ],
  },
];

export default function AdminRolesSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const itemsPerView = 3;
  const totalSlides = Math.ceil(ADMIN_ROLES.length / itemsPerView);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  return (
    <section className="bg-white border-t border-neutral-200 py-16 md:py-24">
      <Container>
        {/* Encabezado */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Roles del Sistema
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Cada rol tiene permisos específicos para acceder a las funcionalidades requeridas
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Carousel */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentSlide * 100}%)`,
              }}
            >
              {ADMIN_ROLES.map((role) => (
                <div key={role.id} className="w-1/3 flex-shrink-0 px-4">
                  <RoleCard {...role} />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 md:-translate-x-20 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-3 transition-all duration-300 shadow-lg z-10"
            aria-label="Slide anterior"
          >
            <span className="material-icons">chevron_left</span>
          </button>

          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 md:translate-x-20 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-3 transition-all duration-300 shadow-lg z-10"
            aria-label="Siguiente slide"
          >
            <span className="material-icons">chevron_right</span>
          </button>
        </div>

        {/* Indicadores de slide */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? 'bg-primary-600 w-8'
                  : 'bg-neutral-300 w-2'
              }`}
              aria-label={`Ir a slide ${idx + 1}`}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

function RoleCard({ name, icon, color, borderColor, permissions }) {
  return (
    <div className={`rounded-2xl border-2 ${borderColor} ${color} p-8 hover:shadow-lg transition-all duration-300`}>
      {/* Icono */}
      <div className="text-5xl mb-4">
        {icon}
      </div>

      {/* Nombre */}
      <h3 className="text-2xl font-bold text-neutral-900 mb-2">
        {name}
      </h3>

      {/* Separador */}
      <div className="h-1 w-12 bg-primary-500 rounded-full mb-4"></div>

      {/* Permisos */}
      <p className="text-sm font-semibold text-neutral-700 mb-3">
        Permisos:
      </p>
      <ul className="space-y-2">
        {permissions.map((permission, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span className="text-primary-500 font-bold mt-0.5">•</span>
            <span className="text-neutral-700">{permission}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
