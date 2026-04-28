import React, { useState, useContext } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '../../components/ui';
import { AuthContext } from '../../services/auth/AuthContext';
import PrescriptionList from './PrescriptionList';
import './ConsultationItem.css';

export default function ConsultationItem({ consultation, isLast = false }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const auth = useContext(AuthContext);

  // Formatear fecha
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Formatear hora
  const formatTime = (timeStr) => {
    if (!timeStr) return '—';
    const s = String(timeStr);
    if (/^\d{4}-\d{2}-\d{2}T/.test(s) || (s.includes('T') && /\d{2}:\d{2}/.test(s))) {
      const d = new Date(s);
      if (!Number.isNaN(d.getTime())) {
        const h = d.getHours();
        const m = d.getMinutes();
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      }
    }
    return s.length >= 5 ? s.slice(0, 5) : s;
  };

  const fecha = formatDate(consultation.fecha_consulta || consultation.fecha);
  const hora = formatTime(consultation.hora_inicio);
  const doctor = consultation.nombre_doctor || '—';
  const motivo = consultation.motivo_consulta || consultation.diagnostico || '—';
  const notas = consultation.notas || consultation.indicaciones || '';
  const observaciones = consultation.observaciones || '';
  const tratamiento = consultation.tratamiento || '';

  return (
    <div className={`consultation-item ${isExpanded ? 'expanded' : ''}`}>
      {/* Timeline dot and line */}
      <div className="timeline-marker">
        <div className="dot"></div>
        {!isLast && <div className="line"></div>}
      </div>

      {/* Card content */}
      <div className="consultation-card">
        {/* Header - always visible */}
        <button
          className="consultation-header"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          <div className="header-content">
            <div className="header-top">
              <span className="date">{fecha}</span>
              {hora !== '—' && <span className="time">{hora}</span>}
            </div>
            <div className="header-bottom">
              <div className="doctor-info">
                <span className="label">Médico:</span>
                <span className="doctor-name">{doctor}</span>
              </div>
              <Badge variant="primary" size="sm">
                {motivo.length > 40 ? `${motivo.substring(0, 40)}...` : motivo}
              </Badge>
            </div>
          </div>

          {/* Toggle icon */}
          <div className="toggle-icon">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </button>

        {/* Expanded content */}
        {isExpanded && (
          <div className="consultation-detail">
            {/* Full consultation info */}
            <div className="detail-section">
              <h4 className="detail-title">Información de la Consulta</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Fecha:</span>
                  <span className="detail-value">{fecha}</span>
                </div>
                {hora !== '—' && (
                  <div className="detail-item">
                    <span className="detail-label">Hora:</span>
                    <span className="detail-value">{hora}</span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="detail-label">Médico:</span>
                  <span className="detail-value">{doctor}</span>
                </div>
                <div className="detail-item full-width">
                  <span className="detail-label">Motivo/Diagnóstico:</span>
                  <span className="detail-value">{motivo}</span>
                </div>
              </div>
            </div>

            {/* Notes/Observaciones */}
            {(notas || observaciones || tratamiento) && (
              <div className="detail-section">
                <h4 className="detail-title">Observaciones y Tratamiento</h4>
                {observaciones && (
                  <div className="detail-subsection">
                    <span className="detail-label">Observaciones:</span>
                    <p className="detail-text">{observaciones}</p>
                  </div>
                )}
                {tratamiento && (
                  <div className="detail-subsection">
                    <span className="detail-label">Tratamiento:</span>
                    <p className="detail-text">{tratamiento}</p>
                  </div>
                )}
                {notas && !observaciones && !tratamiento && (
                  <p className="detail-text">{notas}</p>
                )}
              </div>
            )}

            {/* Prescriptions */}
            <div className="detail-section">
              <h4 className="detail-title">Prescripciones</h4>
              <PrescriptionList
                prescriptions={consultation.prescripciones || consultation.prescriptions || []}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
