import React from 'react';
import { Container } from '../ui';

/**
 * PatientFeaturesSection - Funcionalidades disponibles para pacientes/clientes
 */
const PATIENT_FEATURES = [
  {
    id: 'appointments',
    title: '📅 Agendar Citas',
    description: 'Agenda y gestiona tus citas médicas en línea de forma fácil',
  },
  {
    id: 'health-records',
    title: '📋 Acceder al Historial',
    description: 'Consulta tu historial médico completo y consultas pasadas',
  },
  {
    id: 'prescriptions',
    title: '💊 Prescripciones Digitales',
    description: 'Obtén tus prescripciones digitalmente y rastrea tu historial de medicamentos',
  },
  {
    id: 'telehealth',
    title: '💻 Consultas en Línea',
    description: 'Conecta con doctores de forma remota para consultas rápidas',
  },
  {
    id: 'insurance',
    title: '🛡️ Gestión de Seguros',
    description: 'Verifica tu cobertura de seguros y estado de reclamaciones',
  },
  {
    id: 'billing',
    title: '💳 Pagos y Facturación',
    description: 'Revisa facturas y realiza pagos seguros en línea',
  },
  {
    id: 'notifications',
    title: '🔔 Recordatorios de Salud',
    description: 'Recibe recordatorios sobre tus citas y medicamentos próximos',
  },
  {
    id: 'support',
    title: '📞 Soporte 24/7',
    description: 'Chatea con nuestro equipo de soporte cuando lo necesites',
  },
];

export default function PatientFeaturesSection() {
  return (
    <section className="bg-neutral-50 border-t border-neutral-200 py-16 md:py-24">
      <Container>
        {/* Encabezado */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            ¿Qué puedes hacer como paciente?
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Accede a todas las herramientas que necesitas para gestionar tu salud de manera inteligente
          </p>
        </div>

        {/* Grid de características */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PATIENT_FEATURES.map((feature) => (
            <FeatureCard key={feature.id} {...feature} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function FeatureCard({ title, description }) {
  return (
    <div className="group bg-white rounded-2xl border-2 border-neutral-200 p-6 hover:border-primary-300 hover:shadow-lg transition-all duration-300">
      {/* Título con icono */}
      <h3 className="text-lg font-bold text-neutral-900 mb-3 group-hover:text-primary-600 transition-colors">
        {title}
      </h3>

      {/* Descripción */}
      <p className="text-neutral-600 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
