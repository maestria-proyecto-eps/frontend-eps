import React, { useState, useEffect, useMemo } from 'react';
import { MainLayout, PageContainer } from '../../components/layout';
import { DataTable, Badge, Spinner } from '../../components/ui';
import { endpoints } from '../../services/api/endpoints';

export default function Pharmacy() {
  const [allMedicines, setAllMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const [lowStockIds, setLowStockIds] = useState([]);
  const [expiringIds, setExpiringIds] = useState([]);

  const [showMedModal, setShowMedModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false); 
  const [selectedMed, setSelectedMed] = useState(null);

  const [batches, setBatches] = useState([]); 
  const [loadingBatches, setLoadingBatches] = useState(false);

  const itemsPerPage = 8;

  const [newMed, setNewMed] = useState({
    codigo: '', nombre_medicamento: '', reg_invima: '', principio_activo: '', presentacion: ''
  });

  const [newBatch, setNewBatch] = useState({
    lote_id: '', fecha_vencimiento: '', cantidad: ''
  });

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const resMeds = await fetch(`${endpoints.pharmacy.list}?limit=1000`);
      const dataMeds = await resMeds.json();
      
      const medsWithStock = (dataMeds.data || []).map(m => ({
        ...m,
        stock: m.stock || 0 
      }));
      setAllMedicines(medsWithStock);

      try {
        const resLow = await fetch(endpoints.pharmacy.lowStock);
        const dataLow = await resLow.json();
        setLowStockIds((dataLow.data || []).map(m => m.codigo));

        const resExp = await fetch(endpoints.pharmacy.expiringSoon);
        const dataExp = await resExp.json();
        setExpiringIds((dataExp.data || []).map(m => m.codigo));
      } catch (e) {
        console.warn("Cálculo de alertas local activado.");
      }
    } catch (err) {
      console.error("Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async (codigo) => {
    if (!codigo) return;
    try {
      setLoadingBatches(true);
      const url = `http://localhost:8000/api/pharmacy/medications/inventory/${codigo}?page=1&limit=10`;
      const res = await fetch(url);
      const result = await res.json();
      setBatches(Array.isArray(result.data) ? result.data : []);
      setShowDetailsModal(true);
    } catch (err) {
      setBatches([{ lote: "LOTE-DEMO-01", cantidad: 100, fecha_vencimiento: "2026-12-31" }]);
      setShowDetailsModal(true);
    } finally {
      setLoadingBatches(false);
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  const handleSaveMed = async () => {
    if (!newMed.codigo || !newMed.nombre_medicamento || !newMed.reg_invima) {
      alert("Campos obligatorios faltantes");
      return;
    }
    try {
      const response = await fetch(endpoints.pharmacy.create, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMed,
          codigo: parseInt(newMed.codigo),
          reg_invima: parseInt(newMed.reg_invima)
        })
      });
      if (response.ok) {
        setShowMedModal(false);
        setNewMed({ codigo: '', nombre_medicamento: '', reg_invima: '', principio_activo: '', presentacion: '' });
        fetchAllData();
      }
    } catch (err) { alert("Error de servidor"); }
  };

  const handleSaveBatch = async () => {
    if (!newBatch.lote_id || !newBatch.fecha_vencimiento || !newBatch.cantidad) {
      alert("Completa todos los campos");
      return;
    }

    const payload = {
      lote: String(newBatch.lote_id).trim(),
      cantidad: parseInt(newBatch.cantidad),
      fecha_vencimiento: newBatch.fecha_vencimiento,
      precio: 0 
    };

    try {
      const response = await fetch(endpoints.pharmacy.createBatch(selectedMed.codigo), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(`¡Lote ${payload.lote} registrado!`);
        setAllMedicines(prevMeds => prevMeds.map(med => {
          if (med.codigo === selectedMed.codigo) {
            return {
              ...med,
              stock: (med.stock || 0) + payload.cantidad,
              fecha_vencimiento_proxima: payload.fecha_vencimiento
            };
          }
          return med;
        }));
        setShowBatchModal(false);
        setNewBatch({ lote_id: '', fecha_vencimiento: '', cantidad: '' });
      }
    } catch (err) { alert("Error de conexión"); }
  };

  const filteredResults = useMemo(() => {
    return allMedicines.filter(m => 
      (m.nombre_medicamento || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.codigo || "").toString().includes(searchTerm)
    );
  }, [allMedicines, searchTerm]);

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const currentItems = filteredResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <MainLayout>
      <PageContainer>
        {/* HEADER Y BUSCADOR */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Inventario de Farmacia</h1>
            <p className="text-slate-500 font-medium">Cuidarte EPS - Sprint 2</p>
          </div>
          <div className="flex items-center gap-3">
            <input 
              type="text" placeholder="Buscar medicamento..." 
              value={searchTerm}
              className="p-2.5 border rounded-xl w-64 outline-blue-500"
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
            <button onClick={() => setShowMedModal(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold">
              + Nuevo
            </button>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL: LOADING -> EMPTY STATE -> TABLE */}
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <>
            {filteredResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed">
                <span className="text-4xl mb-4">🔍</span>
                <p className="text-slate-500 font-medium">No encontramos medicamentos con "{searchTerm}"</p>
                <button 
                  onClick={() => setSearchTerm("")} 
                  className="mt-4 text-blue-600 font-bold hover:underline"
                >
                  Ver todo el inventario
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <DataTable 
                  columns={[
                    { key: 'codigo', label: 'Código' },
                    { 
                      key: 'nombre_medicamento', 
                      label: 'Medicamento',
                      render: (valor, row) => (
                        <button 
                          onClick={() => { setSelectedMed(row); fetchBatches(row.codigo); }}
                          className="text-left hover:text-blue-600 transition-colors group"
                        >
                          <span className="font-bold block group-hover:underline">{valor}</span>
                          <span className="text-xs text-slate-400">{row.presentacion}</span>
                        </button>
                      )
                    },
                    { key: 'principio_activo', label: 'Principio Activo' },
                    { 
                      key: 'stock', 
                      label: 'Existencias', 
                      render: (valor) => (
                        <span className={`font-bold ${valor > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {valor || 0} unidades
                        </span>
                      )
                    },
                    { 
                      key: 'alerta', 
                      label: 'Alertas',
                      render: (_, row) => {
                        const hoy = new Date();
                        const fechaVence = row.fecha_vencimiento_proxima ? new Date(row.fecha_vencimiento_proxima) : null;
                        const diasParaVencer = fechaVence ? (fechaVence - hoy) / (1000 * 60 * 60 * 24) : 999;

                        if (expiringIds.includes(row.codigo) || (diasParaVencer >= 0 && diasParaVencer <= 30)) {
                          return <Badge variant="error">Vence pronto</Badge>;
                        }
                        if (lowStockIds.includes(row.codigo) || (row.stock > 0 && row.stock < 10)) {
                          return <Badge variant="warning">Stock Bajo</Badge>;
                        }
                        return row.stock === 0 ? <Badge variant="error">Agotado</Badge> : <Badge variant="success">Óptimo</Badge>;
                      }
                    },
                    {
                      key: 'acciones',
                      label: 'Acciones',
                      render: (_, row) => (
                        <button onClick={() => { setSelectedMed(row); setShowBatchModal(true); }} className="text-blue-600 font-bold text-sm hover:underline">
                          + Registrar Lote
                        </button>
                      )
                    }
                  ]} 
                  data={currentItems} 
                />
              </div>
            )}

            {/* PAGINACIÓN - Solo se muestra si hay resultados */}
            {filteredResults.length > 0 && (
              <div className="flex justify-center gap-4 mt-6 pb-10">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-20 hover:bg-slate-50">Anterior</button>
                <span className="font-bold text-slate-700">Página {currentPage} de {totalPages || 1}</span>
                <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-20 hover:bg-slate-50">Siguiente</button>
              </div>
            )}
          </>
        )}

        {/* MODAL NUEVO MEDICAMENTO */}
        {showMedModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl">
              <h2 className="text-xl font-bold mb-6 text-center">Registrar Medicamento</h2>
              <div className="space-y-4">
                <input type="number" placeholder="Código" className="w-full p-3 border rounded-xl" value={newMed.codigo} onChange={e => setNewMed({...newMed, codigo: e.target.value})} />
                <input type="text" placeholder="Nombre" className="w-full p-3 border rounded-xl" value={newMed.nombre_medicamento} onChange={e => setNewMed({...newMed, nombre_medicamento: e.target.value})} />
                <input type="number" placeholder="Reg. INVIMA" className="w-full p-3 border rounded-xl" value={newMed.reg_invima} onChange={e => setNewMed({...newMed, reg_invima: e.target.value})} />
                <input type="text" placeholder="Principio Activo" className="w-full p-3 border rounded-xl" value={newMed.principio_activo} onChange={e => setNewMed({...newMed, principio_activo: e.target.value})} />
                <input type="text" placeholder="Presentación" className="w-full p-3 border rounded-xl" value={newMed.presentacion} onChange={e => setNewMed({...newMed, presentacion: e.target.value})} />
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setShowMedModal(false)} className="flex-1 py-3 font-bold text-slate-500">Cancelar</button>
                  <button onClick={handleSaveMed} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">Guardar</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL GESTIONAR LOTE */}
        {showBatchModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl">
              <h2 className="text-xl font-bold mb-2">Gestionar Lote</h2>
              <p className="text-sm text-slate-400 mb-6">{selectedMed?.nombre_medicamento}</p>
              <div className="space-y-4">
                <input type="text" placeholder="Número de Lote" className="w-full p-3 border rounded-xl" value={newBatch.lote_id} onChange={e => setNewBatch({...newBatch, lote_id: e.target.value})} />
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Vencimiento</label>
                  <input type="date" className="w-full p-3 border rounded-xl" value={newBatch.fecha_vencimiento} onChange={e => setNewBatch({...newBatch, fecha_vencimiento: e.target.value})} />
                </div>
                <input type="number" placeholder="Cantidad" className="w-full p-3 border rounded-xl" value={newBatch.cantidad} onChange={e => setNewBatch({...newBatch, cantidad: e.target.value})} />
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setShowBatchModal(false)} className="flex-1 py-3 font-bold text-slate-500">Cancelar</button>
                  <button onClick={handleSaveBatch} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold">Registrar</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DETALLES */}
        {showDetailsModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-3xl w-full max-w-2xl shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Lotes en Inventario</h2>
                  <p className="text-slate-500">{selectedMed?.nombre_medicamento}</p>
                </div>
                <button onClick={() => setShowDetailsModal(false)} className="text-slate-400 text-3xl">&times;</button>
              </div>

              {loadingBatches ? <Spinner /> : (
                <div className="overflow-hidden border rounded-2xl">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="p-4 font-bold text-slate-600 text-sm uppercase">Lote</th>
                        <th className="p-4 font-bold text-slate-600 text-sm uppercase text-center">Cantidad</th>
                        <th className="p-4 font-bold text-slate-600 text-sm uppercase">Vencimiento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batches.map((b, i) => (
                        <tr key={i} className="border-b last:border-0 hover:bg-slate-50">
                          <td className="p-4 font-medium text-slate-700">{b.lote}</td>
                          <td className="p-4 text-center">
                            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold text-sm">{b.cantidad} uds</span>
                          </td>
                          <td className="p-4 text-slate-600">{new Date(b.fecha_vencimiento).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-8 flex justify-end">
                <button onClick={() => setShowDetailsModal(false)} className="px-8 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold">Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </MainLayout>
  );
}