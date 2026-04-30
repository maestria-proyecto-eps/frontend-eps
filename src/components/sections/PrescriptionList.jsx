import React from 'react';
import { Alert } from '../../components/ui';
import './PrescriptionList.css';

export default function PrescriptionList(props) {
  const { prescriptions = [] } = props;
  if (!prescriptions || prescriptions.length === 0) {
    return (
      <div className="prescription-empty">
        <Alert variant="neutral" title="Sin prescripciones">
          Sin prescripciones en esta consulta.
        </Alert>
      </div>
    );
  }

  return (
    <div className="prescription-list">
      {prescriptions.map((prescription, index) => {
        const nombreCompuesto =
          prescription.nombre_compuesto ||
          prescription.nombre_medicamento ||
          prescription.nombre ||
          prescription.medicamento?.nombre_medicamento ||
          '—';
        const nombreGenerico =
          prescription.nombre_generico ||
          prescription.principio_activo ||
          prescription.medicamento?.principio_activo ||
          '';
        const presentacion =
          prescription.presentacion ||
          prescription.medicamento?.presentacion ||
          '—';
        const dosis = prescription.dosis || prescription.dosis_indicada || '—';

        return (
          <div key={prescription.id_prescripcion || index} className="prescription-item">
            <div className="prescription-header">
              <div className="prescription-names">
                <span className="nombre-compuesto">{nombreCompuesto}</span>
                {nombreGenerico && (
                  <span className="nombre-generico">({nombreGenerico})</span>
                )}
              </div>
            </div>
            <div className="prescription-details">
              <div className="prescription-detail-item">
                <span className="detail-label">Presentación:</span>
                <span className="detail-value">{presentacion}</span>
              </div>
              <div className="prescription-detail-item">
                <span className="detail-label">Dosis:</span>
                <span className="detail-value">{dosis}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
