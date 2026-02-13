import React, { useEffect, useState } from "react";
import { http } from "../../services/api/http";
import { endpoints } from "../../services/api/endpoints";

export default function DoctorExample() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ----------- LOAD DATA -----------
  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await http.get(
        endpoints.doctor_example.doctorExampleEndpoint
      );

      // Se asume que el endpoint devuelve un array
      setItems(data || []);
    } catch (err) {
      setError("Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

  // ----------- ON MOUNT -----------
  useEffect(() => {
    loadData();
  }, []);

  // ----------- RENDER -----------
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="bg-white shadow rounded-xl p-6 space-y-4">
        <h2 className="text-2xl font-bold">Doctor Example</h2>

        {loading && <p className="text-gray-500">Cargando...</p>}

        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <ul className="space-y-2">
            {items.length === 0 && (
              <li className="text-gray-500">No hay datos disponibles</li>
            )}

            {items.map((item, index) => (
              <li
                key={item.id || index}
                className="border rounded-lg p-3 hover:bg-gray-50 transition"
              >
                {/* Ajusta los campos según tu backend */}
                <div className="font-semibold">
                  {item.name || `Item ${index + 1}`}
                </div>

                {item.description && (
                  <div className="text-sm text-gray-600">
                    {item.description}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={loadData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Recargar
        </button>
      </div>
    </div>
  );
}
