import React from "react";
import { Link } from "react-router-dom";
import { PageContainer } from "../../components/layout";
import { Button } from "../../components/ui";
import { ROUTES, BRAND_NAME } from "../../constants";
import { http } from "../../services/api/http";
import { endpoints } from "../../services/api/endpoints";

/* 
Campos:
    num doc del paciente: bigint
    motivo
    nivel (1-5)
    antecedentes
    alergias
    hallazgos
    medicamentos
    pulso
    presion_arterial
    frecuencia_cardiaca
    frecuencia_respiratoria
    temperatura
    saturacion_oxigeno
    escala_dolor
    riesgo_vital
Campos a llenar por proceso interno:
    id_enfermero autenticado

*/

export default function TriageForm() {
  return (
    <PageContainer title="Formulario de Triage">
      <p>Formulario para registrar un nuevo triage.</p>
      {/* Aquí iría el formulario con los campos mencionados */}
    </PageContainer>
  );
}