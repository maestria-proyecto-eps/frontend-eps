import React from 'react';
import { Container } from '../ui';

/**
 * ServicesSection - Grid de tarjetas con servicios principales
 */
const SERVICES = [
  {
    id: 'hospitalizaciones',
    title: 'Hospitalizaciones',
    description: 'Gestión y seguimiento de procesos de hospitalización y autorizaciones.',
    icon: '🏥',
    color: 'bg-secondary-50',
  },
  {
    id: 'urgencias',
    title: 'Urgencias',
    description: 'Acceso rápido a rutas de atención y soporte para casos urgentes.',
    icon: '🚑',
    color: 'bg-red-50',
  },
  {
    id: 'especializada',
    title: 'Atención Médica Especializada',
    description: 'Consulta y coordinación de especialidades médicas y remisiones.',
    icon: '👨‍⚕️',
    color: 'bg-primary-50',
  },
  {
    id: 'medicamentos',
    title: 'Medicamentos',
    description: 'Información de fórmulas, dispensación y seguimiento de tratamientos.',
    icon: '💊',
    color: 'bg-amber-50',
  },
];

export default function ServicesSection() {
  return (
    <section className="bg-neutral-50 border-t border-neutral-200 py-16 md:py-24">
      <Container>
        {/* Encabezado */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Nuestros Servicios
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Soluciones médicas integrales adaptadas a tus necesidades de salud
          </p>
        </div>

        {/* Grid de servicios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service) => (
            <ServiceCard key={service.id} {...service} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function ServiceCard({ title, description, icon, color }) {
  return (
    <div className="group rounded-2xl border-2 border-neutral-200 bg-white p-6 shadow-sm hover:shadow-lg hover:border-primary-300 transition-all duration-300">
      {/* Icono */}
      <div className={`${color} h-16 w-16 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>

      {/* Contenido */}
      <h3 className="text-xl font-bold text-neutral-900 mb-2">
        {title}
      </h3>
      <p className="text-neutral-600 text-sm leading-relaxed">
        {description}
      </p>

      {/* Link */}
      <div className="mt-4 inline-flex items-center text-primary-600 font-semibold text-sm group-hover:gap-2 gap-1 transition-all">
        Learn more
        <span>→</span>
      </div>
    </div>
  );
}
