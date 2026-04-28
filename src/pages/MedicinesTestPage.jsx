import { useState } from 'react';
import { http } from '../../services/api/http';
import { endpoints } from '../../services/api/endpoints';
import { Spinner } from '../../components/ui';

/**
 * Componente de prueba para ver la respuesta del backend al llamar medicamentos
 */
export default function MedicinesTestComponent() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rawResponse, setRawResponse] = useState(null);
  const [page, setPage] = useState(1);

  const fetchMedicines = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await http.get(endpoints.pharmacy.listMedications, {
        params: { page, limit: 10 },
      });

      console.log('📡 Respuesta del backend:', response.data);
      setMedications(response.data?.data || []);
      setRawResponse(response.data);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      console.error('❌ Error:', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">🧪 Test: Medicamentos desde Backend</h2>

      <button
        onClick={fetchMedicines}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Cargando...' : 'Obtener Medicamentos'}
      </button>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-800 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && <Spinner />}

      {medications.length > 0 && (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-sm font-semibold text-green-800">
              ✅ Medicamentos obtenidos: {medications.length}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-300">
              <thead className="bg-slate-100">
                <tr>
                  <th className="border border-slate-300 p-2 text-left">Código</th>
                  <th className="border border-slate-300 p-2 text-left">Nombre</th>
                  <th className="border border-slate-300 p-2 text-left">Reg. INVIMA</th>
                  <th className="border border-slate-300 p-2 text-left">Principio Activo</th>
                  <th className="border border-slate-300 p-2 text-left">Presentación</th>
                </tr>
              </thead>
              <tbody>
                {medications.map((med) => (
                  <tr key={med.codigo} className="hover:bg-slate-50">
                    <td className="border border-slate-300 p-2 font-mono text-xs">{med.codigo}</td>
                    <td className="border border-slate-300 p-2">{med.nombre_medicamento}</td>
                    <td className="border border-slate-300 p-2">{med.reg_invima}</td>
                    <td className="border border-slate-300 p-2">{med.principio_activo}</td>
                    <td className="border border-slate-300 p-2">{med.presentacion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <details className="p-4 bg-slate-50 border border-slate-200 rounded">
            <summary className="font-semibold cursor-pointer">
              📋 Ver respuesta JSON completa
            </summary>
            <pre className="mt-2 p-3 bg-slate-900 text-green-400 rounded overflow-auto text-xs max-h-96">
              {JSON.stringify(rawResponse, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {!loading && medications.length === 0 && !error && (
        <p className="text-slate-500">Haz clic en "Obtener Medicamentos" para ver los resultados</p>
      )}
    </div>
  );
}
