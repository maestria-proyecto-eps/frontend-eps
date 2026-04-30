import React from 'react';
import ConsultationItem from './ConsultationItem';
import { Alert } from '../../components/ui';
import './ConsultationTimeline.css';

export default function ConsultationTimeline({ consultations = [] }) {
  if (!consultations || consultations.length === 0) {
    return (
      <div className="consultation-timeline-empty">
        <Alert
          variant="neutral"
          title="Sin historia clínica"
        >
          No tienes consultas registradas. Las atenciones médicas aparecerán aquí.
        </Alert>
      </div>
    );
  }

  return (
    <div className="consultation-timeline">
      <div className="timeline-container">
        {consultations.map((consultation, index) => (
          <ConsultationItem
            key={consultation.id_consulta || index}
            consultation={consultation}
            isLast={index === consultations.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
