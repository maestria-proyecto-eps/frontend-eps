import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { PageContainer } from '../../components/layout';
import { DataTable, Badge } from '../../components/ui';
import { http } from '../../services/api/http';
import { endpoints } from '../../services/api/endpoints';
import { AuthContext } from '../../services/auth/AuthContext';

/* 
Lista de triages: mostrar lista con campos: paciente (nombre, apellido, id), nivel, fechaT, estado.
Detalle: mostrar todos los campos del triage.
*/

export default function Triages() {
  const { user } = useContext(AuthContext);
  const [triages, setTriages] = useState([]);

  return (
    <PageContainer title="Lista de Triages">
      <p>Aquí se mostraría la lista de triages registrados.</p>
    </PageContainer>
  );
}