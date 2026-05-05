import { useState, useEffect } from 'react';
import { http } from '../../services/api/http';
import { endpoints } from '../../services/api/endpoints';
import { Spinner, Badge } from '../../components/ui';

const LIMIT = 10;

const EMPTY_MED = { codigo: '', nombre_medicamento: '', reg_invima: '', principio_activo: '', presentacion: '' };
const EMPTY_INV = { lote: '', cantidad: '', fecha_vencimiento: '', precio: '' };

function Alert({ alert, className = "" }) { // Añadimos className opcional
  if (!alert) return null;
  const colors = {
    success: 'bg-emerald-50 border-emerald-400 text-emerald-800',
    error:   'bg-red-50 border-red-400 text-red-800',
    warning: 'bg-amber-50 border-amber-400 text-amber-800',
  };
  return (
    <div className={`border-l-4 rounded-lg px-4 py-3 text-sm font-medium ${colors[alert.type]} ${className}`}>
      {alert.message}
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{label}</label>
      <input
        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        {...props}
      />
    </div>
  );
}

function Modal({ open, title, onClose, children, size = 'sm' }) {
  if (!open) return null;
  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${widths[size]} p-6`}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Pharmacy() {
  // ── View ────────────────────────────────────────
  const [view, setView] = useState('medications'); // 'medications' | 'inventory'

  // ── Medications ──────────────────────────────────
  const [medications, setMedications] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMeds, setLoadingMeds] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // ── Selected ─────────────────────────────────────
  const [selectedMed, setSelectedMed] = useState(null);

  // ── Inventory ────────────────────────────────────
  const [inventory, setInventory] = useState([]);
  const [invPage, setInvPage] = useState(1);
  const [invTotalPages, setInvTotalPages] = useState(1);
  const [loadingInv, setLoadingInv] = useState(false);

  // ── Modals ────────────────────────────────────────
  // 'createMed' | 'editMed' | 'createInv' | 'dispense'
  const [modal, setModal] = useState(null);

  // ── Forms ────────────────────────────────────────
  const [medForm, setMedForm] = useState(EMPTY_MED);
  const [invForm, setInvForm] = useState(EMPTY_INV);
  const [selectedInv, setSelectedInv] = useState(null);
  const [dispenseQty, setDispenseQty] = useState('');
  const [dispenseError, setDispenseError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // ── Alerts ───────────────────────────────────────
  const [alert, setAlert] = useState(null);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4500);
  };

  // ── Medications API ──────────────────────────────
  const loadMedications = async (p = 1) => {
    setLoadingMeds(true);
    try {
      const { data } = await http.get(endpoints.pharmacy.listMedications, {
        params: { page: p, limit: LIMIT },
      });
      setMedications(data.data || []);
      setTotalPages(data.pages || 1);
      setPage(p);
    } catch {
      showAlert('error', 'Error al cargar medicamentos');
    } finally {
      setLoadingMeds(false);
    }
  };

  useEffect(() => { loadMedications(1); }, []);

  const handleCreateMed = async () => {
    if (!medForm.codigo || !medForm.nombre_medicamento || !medForm.reg_invima || !medForm.principio_activo || !medForm.presentacion) {
      showAlert('error', 'Todos los campos son obligatorios');
      return;
    }
    setFormLoading(true);
    try {
      const { data } = await http.post(endpoints.pharmacy.createMedication, {
        codigo: parseInt(medForm.codigo),
        nombre_medicamento: medForm.nombre_medicamento,
        reg_invima: parseInt(medForm.reg_invima),
        principio_activo: medForm.principio_activo,
        presentacion: medForm.presentacion,
      });
      if (data.hasError) {
        showAlert('error', data.Message || 'Error al crear medicamento');
      } else {
        if (data.Message && data.Message !== 'Todo Ok') {
          showAlert('warning', data.Message);
        } else {
          showAlert('success', 'Medicamento creado exitosamente');
        }
        closeModal();
        loadMedications(page);
      }
    } catch (e) {
      showAlert('error', e.response?.data?.Message || 'Error al crear medicamento');
    } finally {
      setFormLoading(false);
    }
  };

  const openEditMed = (med) => {
    setSelectedMed(med);
    setMedForm({
      codigo: String(med.codigo),
      nombre_medicamento: med.nombre_medicamento,
      reg_invima: String(med.reg_invima),
      principio_activo: med.principio_activo,
      presentacion: med.presentacion,
    });
    setModal('editMed');
  };

  const handleUpdateMed = async () => {
    if (!medForm.nombre_medicamento || !medForm.reg_invima || !medForm.principio_activo || !medForm.presentacion) {
      showAlert('error', 'Todos los campos son obligatorios');
      return;
    }
    setFormLoading(true);
    try {
      const { data } = await http.put(endpoints.pharmacy.updateMedication(selectedMed.codigo), {
        nombre_medicamento: medForm.nombre_medicamento,
        reg_invima: parseInt(medForm.reg_invima),
        principio_activo: medForm.principio_activo,
        presentacion: medForm.presentacion,
      });
      if (data.hasError) {
        showAlert('error', data.Message || 'Error al actualizar medicamento');
      } else {
        showAlert('success', 'Medicamento actualizado exitosamente');
        closeModal();
        loadMedications(page);
      }
    } catch (e) {
      showAlert('error', e.response?.data?.Message || 'Error al actualizar medicamento');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Inventory API ────────────────────────────────
  const loadInventory = async (codigo, p = 1) => {
    setLoadingInv(true);
    try {
      const { data } = await http.get(endpoints.pharmacy.getInventory(codigo), {
        params: { page: p, limit: LIMIT },
      });
      setInventory(data.data || []);
      setInvTotalPages(data.pages || 1);
      setInvPage(p);
    } catch {
      showAlert('error', 'Error al cargar inventario');
    } finally {
      setLoadingInv(false);
    }
  };

  const openInventory = (med) => {
    setSelectedMed(med);
    setView('inventory');
    loadInventory(med.codigo, 1);
  };

  const backToList = () => {
    setView('medications');
    setSelectedMed(null);
    setInventory([]);
    setAlert(null);
  };

  const handleCreateInventory = async () => {
    if (!invForm.lote || !invForm.cantidad || !invForm.fecha_vencimiento || !invForm.precio) {
      showAlert('error', 'Todos los campos son obligatorios');
      return;
    }
    setFormLoading(true);
    try {
      const { data } = await http.post(endpoints.pharmacy.createInventory(selectedMed.codigo), {
        lote: invForm.lote.trim(),
        cantidad: parseInt(invForm.cantidad),
        fecha_vencimiento: invForm.fecha_vencimiento,
        precio: parseInt(invForm.precio),
      });
      if (data.hasError) {
        showAlert('error', data.Message || 'Error al registrar lote');
      } else {
        showAlert('success', 'Lote registrado exitosamente');
        closeModal();
        loadInventory(selectedMed.codigo, invPage);
      }
    } catch (e) {
      showAlert('error', e.response?.data?.Message || 'Error al registrar lote');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Dispense ─────────────────────────────────────
  const openEditInv = (inv) => {
    setSelectedInv(inv);
    setInvForm({
      lote: inv.lote,
      cantidad: String(inv.cantidad),
      fecha_vencimiento: inv.fecha_vencimiento,
      precio: String(inv.precio),
    });
    setModal('editInv');
  };

  const handleUpdateInventory = async () => {
    if (!invForm.lote || !invForm.cantidad || !invForm.fecha_vencimiento || !invForm.precio) {
      showAlert('error', 'Todos los campos son obligatorios');
      return;
    }
    setFormLoading(true);
    try {
      const { data } = await http.put(endpoints.pharmacy.updateInventory(selectedInv.id_inventario), {
        lote: invForm.lote.trim(),
        cantidad: parseInt(invForm.cantidad),
        fecha_vencimiento: invForm.fecha_vencimiento,
        precio: parseInt(invForm.precio),
      });
      if (data.hasError) {
        showAlert('error', data.Message || 'Error al actualizar lote');
      } else {
        showAlert('success', 'Lote actualizado exitosamente');
        closeModal();
        loadInventory(selectedMed.codigo, invPage);
      }
    } catch (e) {
      showAlert('error', e.response?.data?.Message || 'Error al actualizar lote');
    } finally {
      setFormLoading(false);
    }
  };

  const openDispense = (inv) => {
    setSelectedInv(inv);
    setDispenseQty('');
    setDispenseError('');
    setModal('dispense');
  };

  const handleDispense = async () => {
    const qty = parseInt(dispenseQty);
    if (!qty || qty <= 0) {
      setDispenseError('Ingrese una cantidad válida');
      return;
    }
    if (qty > selectedInv.cantidad) {
      setDispenseError(`Stock insuficiente. Disponible: ${selectedInv.cantidad} unidades`);
      return;
    }
    setFormLoading(true);
    try {
      const { data } = await http.put(endpoints.pharmacy.updateInventory(selectedInv.id_inventario), {
        lote: selectedInv.lote,
        cantidad: selectedInv.cantidad - qty,
        fecha_vencimiento: selectedInv.fecha_vencimiento,
        precio: selectedInv.precio,
      });
      if (data.hasError) {
        setDispenseError(data.Message || 'Error al dispensar');
      } else {
        showAlert('success', `Dispensadas ${qty} unidades del lote ${selectedInv.lote}`);
        closeModal();
        loadInventory(selectedMed.codigo, invPage);
      }
    } catch (e) {
      setDispenseError(e.response?.data?.Message || 'Error al dispensar');
    } finally {
      setFormLoading(false);
    }
  };

  const closeModal = () => {
    setModal(null);
    setMedForm(EMPTY_MED);
    setInvForm(EMPTY_INV);
    setSelectedInv(null);
    setDispenseQty('');
    setDispenseError('');
    setFormLoading(false);
  };

  // ── Client-side search (on loaded page) ──────────
  const filteredMeds = medications.filter((m) => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return (
      m.nombre_medicamento?.toLowerCase().includes(t) ||
      String(m.codigo).includes(t) ||
      m.principio_activo?.toLowerCase().includes(t)
    );
  });

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const isExpiringSoon = (fechaVencimiento) => {
    if (!fechaVencimiento) return false;
    const diff = (new Date(fechaVencimiento) - new Date()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 90;
  };

  const isExpired = (fechaVencimiento) => {
    if (!fechaVencimiento) return false;
    return new Date(fechaVencimiento) < new Date();
  };

  // ── Render ───────────────────────────────────────
  return (
    <div className="p-6 space-y-4">
      
      {/* 
          CAMBIO CLAVE: 
          Si 'modal' tiene algún valor (es decir, está abierto), 
          NO renderices la alerta de la página principal.
      */}
      {!modal && alert && <Alert alert={alert} />}

      {/* ── VIEW: MEDICATIONS LIST ─────────────────── */}
      {view === 'medications' && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Farmacia</h1>
              <p className="text-sm text-slate-500">Gestión de medicamentos e inventario</p>
            </div>
            <button
              onClick={() => { setMedForm(EMPTY_MED); setModal('createMed'); }}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              + Nuevo medicamento
            </button>
          </div>

          {/* Search */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar por nombre, código o principio activo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>

          {/* Table */}
          {loadingMeds ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : filteredMeds.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              {searchTerm ? `Sin resultados para "${searchTerm}"` : 'No hay medicamentos registrados'}
            </div>
          ) : (
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Código</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Medicamento</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Principio Activo</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">Presentación</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMeds.map((med) => (
                    <tr key={med.codigo} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-500">{med.codigo}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openInventory(med)}
                          className="font-semibold text-primary-600 hover:underline text-left"
                        >
                          {med.nombre_medicamento}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{med.principio_activo}</td>
                      <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">{med.presentacion}</td>
                      <td className="px-4 py-3 text-right space-x-3">
                        <button
                          onClick={() => openEditMed(med)}
                          className="text-slate-500 hover:text-primary-600 font-medium transition-colors text-xs"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => openInventory(med)}
                          className="text-slate-500 hover:text-emerald-600 font-medium transition-colors text-xs"
                        >
                          Inventario
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loadingMeds && totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 pt-2">
              <button
                onClick={() => loadMedications(page - 1)}
                disabled={page <= 1}
                className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-30 hover:bg-slate-50"
              >
                Anterior
              </button>
              <span className="text-sm text-slate-600">Página {page} de {totalPages}</span>
              <button
                onClick={() => loadMedications(page + 1)}
                disabled={page >= totalPages}
                className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-30 hover:bg-slate-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {/* ── VIEW: INVENTORY ────────────────────────── */}
      {view === 'inventory' && selectedMed && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b">
            <div className="flex items-center gap-3">
              <button
                onClick={backToList}
                className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-medium transition-colors"
              >
                ← Volver
              </button>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{selectedMed.nombre_medicamento}</h2>
                <p className="text-sm text-slate-500">Código: {selectedMed.codigo} · {selectedMed.presentacion}</p>
              </div>
            </div>
            <button
              onClick={() => { setInvForm(EMPTY_INV); setModal('createInv'); }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              + Agregar lote
            </button>
          </div>

          {/* Inventory table */}
          {loadingInv ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : inventory.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              No hay lotes en inventario para este medicamento
            </div>
          ) : (
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Lote</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Cantidad</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Vencimiento</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Precio</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Estado</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventory.map((inv) => {
                    const expired = isExpired(inv.fecha_vencimiento);
                    const expiringSoon = !expired && isExpiringSoon(inv.fecha_vencimiento);
                    return (
                      <tr key={inv.id_inventario} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-700">{inv.lote}</td>
                        <td className="px-4 py-3">
                          <span className={`font-bold ${inv.cantidad === 0 ? 'text-red-500' : inv.cantidad <= 10 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {inv.cantidad} uds
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(inv.fecha_vencimiento)}</td>
                        <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                          ${inv.precio?.toLocaleString('es-CO')}
                        </td>
                        <td className="px-4 py-3">
                          {expired ? (
                            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Vencido</span>
                          ) : expiringSoon ? (
                            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Vence pronto</span>
                          ) : inv.cantidad === 0 ? (
                            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Agotado</span>
                          ) : inv.cantidad <= 10 ? (
                            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Stock bajo</span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Óptimo</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right space-x-3">
  <button
    onClick={() => openEditInv(inv)}
    disabled={expired} // - Bloquea la edición si el lote está vencido
    className="text-slate-500 hover:text-primary-600 font-medium text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
  >
    Editar
  </button>
  <button
    onClick={() => openDispense(inv)}
    disabled={inv.cantidad === 0 || expired}
    className="text-primary-600 hover:text-primary-800 font-medium text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
  >
    Dispensar
  </button>
</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Inventory pagination */}
          {!loadingInv && invTotalPages > 1 && (
            <div className="flex justify-center items-center gap-3 pt-2">
              <button
                onClick={() => loadInventory(selectedMed.codigo, invPage - 1)}
                disabled={invPage <= 1}
                className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-30 hover:bg-slate-50"
              >
                Anterior
              </button>
              <span className="text-sm text-slate-600">Página {invPage} de {invTotalPages}</span>
              <button
                onClick={() => loadInventory(selectedMed.codigo, invPage + 1)}
                disabled={invPage >= invTotalPages}
                className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-30 hover:bg-slate-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {/* ── MODAL: CREATE MEDICATION ──────────────── */}
      <Modal open={modal === 'createMed'} title="Registrar medicamento" onClose={closeModal}>
        <div className="space-y-3">
          <Field label="Código" type="number" placeholder="Ej: 1002" value={medForm.codigo}
            onChange={(e) => setMedForm({ ...medForm, codigo: e.target.value })} />
          <Field label="Nombre" placeholder="Ej: Loratadina 10mg" value={medForm.nombre_medicamento}
            onChange={(e) => setMedForm({ ...medForm, nombre_medicamento: e.target.value })} />
          <Field label="Reg. INVIMA" type="number" placeholder="Ej: 20198832" value={medForm.reg_invima}
            onChange={(e) => setMedForm({ ...medForm, reg_invima: e.target.value })} />
          <Field label="Principio Activo" placeholder="Ej: Loratadina" value={medForm.principio_activo}
            onChange={(e) => setMedForm({ ...medForm, principio_activo: e.target.value })} />
          <Field label="Presentación" placeholder="Ej: Caja x 10 Tabletas" value={medForm.presentacion}
            onChange={(e) => setMedForm({ ...medForm, presentacion: e.target.value })} />
          <div className="flex gap-2 pt-2">
            <button onClick={closeModal} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
              Cancelar
            </button>
            <button onClick={handleCreateMed} disabled={formLoading}
              className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors">
              {formLoading ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── MODAL: EDIT MEDICATION ────────────────── */}
      <Modal open={modal === 'editMed'} title="Editar medicamento" onClose={closeModal}>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Código</label>
            <input readOnly value={medForm.codigo}
              className="w-full px-3 py-2.5 border border-slate-100 rounded-lg text-sm bg-slate-50 text-slate-400 cursor-not-allowed" />
          </div>
          <Field label="Nombre" placeholder="Ej: Loratadina 10mg" value={medForm.nombre_medicamento}
            onChange={(e) => setMedForm({ ...medForm, nombre_medicamento: e.target.value })} />
          <Field label="Reg. INVIMA" type="number" value={medForm.reg_invima}
            onChange={(e) => setMedForm({ ...medForm, reg_invima: e.target.value })} />
          <Field label="Principio Activo" value={medForm.principio_activo}
            onChange={(e) => setMedForm({ ...medForm, principio_activo: e.target.value })} />
          <Field label="Presentación" value={medForm.presentacion}
            onChange={(e) => setMedForm({ ...medForm, presentacion: e.target.value })} />
          <div className="flex gap-2 pt-2">
            <button onClick={closeModal} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
              Cancelar
            </button>
            <button onClick={handleUpdateMed} disabled={formLoading}
              className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors">
              {formLoading ? 'Guardando…' : 'Actualizar'}
            </button>
          </div>
        </div>
      </Modal>

{/* ── MODAL: ADD INVENTORY BATCH ────────────── */}
      <Modal open={modal === 'createInv'} title="Agregar lote al inventario" onClose={closeModal}>
        <p className="text-xs text-slate-500 -mt-3 mb-4">{selectedMed?.nombre_medicamento}</p>
        
        {/* Este es el cambio clave: renderizar la alerta aquí para que esté dentro del Modal */}
        {alert && <Alert alert={alert} className="mb-4" />}

        <div className="space-y-3">
          <Field label="Número de lote" placeholder="Ej: LOT-A-1234" value={invForm.lote}
            onChange={(e) => setInvForm({ ...invForm, lote: e.target.value })} />
          <Field label="Cantidad" type="number" placeholder="0" value={invForm.cantidad}
            onChange={(e) => setInvForm({ ...invForm, cantidad: e.target.value })} />
          <Field label="Fecha de vencimiento" type="date" value={invForm.fecha_vencimiento}
            onChange={(e) => setInvForm({ ...invForm, fecha_vencimiento: e.target.value })} />
          <Field label="Precio (COP)" type="number" placeholder="0" value={invForm.precio}
            onChange={(e) => setInvForm({ ...invForm, precio: e.target.value })} />
          <div className="flex gap-2 pt-2">
            <button onClick={closeModal} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button onClick={handleCreateInventory} disabled={formLoading}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors">
              {formLoading ? 'Guardando…' : 'Registrar lote'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── MODAL: EDIT INVENTORY BATCH ──────────── */}
      <Modal open={modal === 'editInv'} title="Editar lote de inventario" onClose={closeModal}>
        <p className="text-xs text-slate-500 -mt-3 mb-4">{selectedMed?.nombre_medicamento}</p>
        <div className="space-y-3">
          <Field label="Número de lote" placeholder="Ej: LOT-A-1234" value={invForm.lote}
            onChange={(e) => setInvForm({ ...invForm, lote: e.target.value })} />
          <Field label="Cantidad" type="number" placeholder="0" value={invForm.cantidad}
            onChange={(e) => setInvForm({ ...invForm, cantidad: e.target.value })} />
          <Field label="Fecha de vencimiento" type="date" value={invForm.fecha_vencimiento}
            onChange={(e) => setInvForm({ ...invForm, fecha_vencimiento: e.target.value })} />
          <Field label="Precio (COP)" type="number" placeholder="0" value={invForm.precio}
            onChange={(e) => setInvForm({ ...invForm, precio: e.target.value })} />
          <div className="flex gap-2 pt-2">
            <button onClick={closeModal} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
              Cancelar
            </button>
            <button onClick={handleUpdateInventory} disabled={formLoading}
              className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors">
              {formLoading ? 'Guardando…' : 'Actualizar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── MODAL: DISPENSE ───────────────────────── */}
      <Modal open={modal === 'dispense'} title="Dispensar medicamento" onClose={closeModal}>
        {selectedInv && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg px-4 py-3 text-sm space-y-1">
              <p className="font-semibold text-slate-700">{selectedMed?.nombre_medicamento}</p>
              <p className="text-slate-500">Lote: <span className="font-mono">{selectedInv.lote}</span></p>
              <p className="text-slate-500">
                Disponible: <span className="font-bold text-emerald-600">{selectedInv.cantidad} unidades</span>
              </p>
              <p className="text-slate-500">Vence: {formatDate(selectedInv.fecha_vencimiento)}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Cantidad a dispensar
              </label>
              <input
                type="number"
                min="1"
                max={selectedInv.cantidad}
                value={dispenseQty}
                onChange={(e) => { setDispenseQty(e.target.value); setDispenseError(''); }}
                placeholder="0"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
              {dispenseError && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{dispenseError}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={closeModal} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
                Cancelar
              </button>
              <button onClick={handleDispense} disabled={formLoading}
                className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors">
                {formLoading ? 'Procesando…' : 'Dispensar'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
