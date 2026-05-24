import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Card, Input, Modal } from "../../components/ui";
import { PageContainer } from "../../components/layout";
import { http } from "../../services/api/http";
import { endpoints } from "../../services/api/endpoints";
import { AuthContext } from "../../services/auth/AuthContext";

const PENDING_TRIAGE_KEY = "doctor_urgency_pending_triage";

function unwrapRows(responseData) {
  if (!responseData || typeof responseData !== "object") return { rows: [], page: 1, pages: 1 };
  if (responseData.hasError) {
    return {
      rows: [],
      page: 1,
      pages: 1,
      hasError: true,
      message: responseData.message || responseData.Message || "El backend reporto un error.",
    };
  }

  const payload = responseData.data;
  if (Array.isArray(payload?.data)) {
    return {
      rows: payload.data,
      page: Number(payload.page) || 1,
      pages: Number(payload.pages) || 1,
      hasError: false,
      message: responseData.message || "",
    };
  }
  if (Array.isArray(payload)) {
    return { rows: payload, page: 1, pages: 1, hasError: false, message: responseData.message || "" };
  }
  if (payload && typeof payload === "object") {
    return { rows: [payload], page: 1, pages: 1, hasError: false, message: responseData.message || "" };
  }
  return { rows: [], page: 1, pages: 1, hasError: false, message: responseData.message || "" };
}

function unwrapObject(responseData) {
  if (!responseData || typeof responseData !== "object") return null;
  if (responseData.hasError) return null;
  const payload = responseData.data;
  if (payload && typeof payload === "object" && !Array.isArray(payload)) return payload;
  if (Array.isArray(payload) && payload.length > 0) return payload[0];
  if (payload?.data && typeof payload.data === "object" && !Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload?.data) && payload.data.length > 0) return payload.data[0];
  return null;
}

function getBackendMessage(error, fallback) {
  const responseData = error?.response?.data;
  if (responseData && typeof responseData === "object") {
    return (
      responseData.message ||
      responseData.Message ||
      responseData?.detail?.message ||
      responseData?.detail?.Message ||
      fallback
    );
  }
  return fallback;
}

function isTriageEmptyMessage(text) {
  const normalized = String(text || "").toLowerCase();
  return (
    normalized.includes("no hay triages pendientes") ||
    normalized.includes("no hay triage urgente disponible")
  );
}

function formatDateTime(value) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleString("es-CO");
}

function fullName(first, last) {
  const v = [first, last].filter(Boolean).join(" ").trim();
  return v || "—";
}

function BooleanSwitch({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2">
      <span className="text-sm text-neutral-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={[
          "relative inline-flex h-7 w-16 items-center rounded-full border-2 transition-colors",
          value ? "border-primary-500 bg-primary-50" : "border-neutral-300 bg-white",
        ].join(" ")}
      >
        <span
          className={[
            "inline-block h-5 w-5 transform rounded-full shadow transition-transform",
            value ? "translate-x-9 bg-primary-500" : "translate-x-1 bg-neutral-300",
          ].join(" ")}
        />
        <span
          className={[
            "absolute right-2 text-[10px] font-semibold uppercase tracking-wide",
            value ? "text-primary-700" : "text-neutral-400",
          ].join(" ")}
        >
          {value ? "ON" : "OFF"}
        </span>
      </button>
    </div>
  );
}

function normalizeTriage(raw = {}) {
  return {
    ...raw,
    id_triage: raw.id_triage ?? null,
    id_paciente: raw.id_paciente ?? null,
    motivo: raw.motivo ?? "",
    nivel: raw.nivel ?? null,
    id_enfermero: raw.id_enfermero ?? null,
    antecedentes: raw.antecedentes ?? "",
    fechat: raw.fechat ?? raw.fechaT ?? null,
    estado: raw.estado ?? null,
    alergias: raw.alergias ?? "",
    hallazgos: raw.hallazgos ?? "",
    medicamentos: raw.medicamentos ?? "",
    pulso: raw.pulso ?? "",
    presion_arterial: raw.presion_arterial ?? "",
    frecuencia_cardiaca: raw.frecuencia_cardiaca ?? "",
    frecuencia_respiratoria: raw.frecuencia_respiratoria ?? "",
    temperatura: raw.temperatura ?? "",
    saturacion_oxigeno: raw.saturacion_oxigeno ?? "",
    escala_dolor: raw.escala_dolor ?? null,
    riesgo_vital: raw.riesgo_vital ?? false,
    nombre_paciente:
      raw.nombre_paciente ?? raw.paciente_nombre ?? raw.nombre ?? raw.nombres_paciente ?? "",
    apellido_paciente:
      raw.apellido_paciente ?? raw.paciente_apellido ?? raw.apellido ?? raw.apellidos_paciente ?? "",
  };
}

function createPrescriptionItem() {
  return {
    localId: crypto.randomUUID(),
    codigo: "",
    dosis: "",
    duracion: "",
    cantidad: "",
  };
}

export default function Urgency() {
  const auth = React.useContext(AuthContext);
  const doctorId =
    auth?.payload?.num_documento ??
    auth?.payload?.id_doctor ??
    auth?.payload?.id_usuario ??
    null;

  const [feedback, setFeedback] = useState(null);

  const [firstTriageRows, setFirstTriageRows] = useState([]);
  const [firstTriageLoading, setFirstTriageLoading] = useState(false);
  const [triageInfoMessage, setTriageInfoMessage] = useState("");

  const [diagnosticos, setDiagnosticos] = useState([]);
  const [medications, setMedications] = useState([]);

  const [selectedTriage, setSelectedTriage] = useState(null);
  const [triageToConfirm, setTriageToConfirm] = useState(null);
  const [patientInfo, setPatientInfo] = useState(null);
  const [patientLoading, setPatientLoading] = useState(false);
  const [patientError, setPatientError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [attentionForm, setAttentionForm] = useState({
    observaciones: "",
    tratamiento: "",
    id_diagnostico: "",
  });
  const [attentionOptions, setAttentionOptions] = useState({
    requiresPrescription: false,
    requiresHospitalization: false,
  });
  const [formErrors, setFormErrors] = useState({});

  const [creatingUrgency, setCreatingUrgency] = useState(false);
  const [createdUrgencyId, setCreatedUrgencyId] = useState(null);
  const [prescriptionItems, setPrescriptionItems] = useState([createPrescriptionItem()]);
  const [creatingPrescription, setCreatingPrescription] = useState(false);
  const [hospitalizing, setHospitalizing] = useState(false);

  const currentTriage = firstTriageRows[0] ?? null;
  const isPrescriptionStep = attentionOptions.requiresPrescription && !!createdUrgencyId;
  const validPrescriptionItems = useMemo(
    () =>
      prescriptionItems.filter(
        (item) => item.codigo && item.dosis.trim() && Number(item.duracion) > 0 && Number(item.cantidad) > 0
      ),
    [prescriptionItems]
  );

  const triageDetailRows = useMemo(
    () => [
      ["ID triage", currentTriage?.id_triage],
      ["ID paciente", currentTriage?.id_paciente],
      ["Motivo", currentTriage?.motivo],
      ["Nivel", currentTriage?.nivel],
      ["ID enfermero", currentTriage?.id_enfermero],
      ["Antecedentes", currentTriage?.antecedentes],
      ["Estado", currentTriage?.estado],
      ["Alergias", currentTriage?.alergias],
      ["Hallazgos", currentTriage?.hallazgos],
      ["Medicamentos", currentTriage?.medicamentos],
      ["Pulso", currentTriage?.pulso],
      ["Presion arterial", currentTriage?.presion_arterial],
      ["Frecuencia cardiaca", currentTriage?.frecuencia_cardiaca],
      ["Frecuencia respiratoria", currentTriage?.frecuencia_respiratoria],
      ["Temperatura", currentTriage?.temperatura],
      ["Saturacion O2", currentTriage?.saturacion_oxigeno],
      ["Escala dolor", currentTriage?.escala_dolor],
      ["Riesgo vital", currentTriage?.riesgo_vital ? "Si" : "No"],
      ["Fecha triage", formatDateTime(currentTriage?.fechat)],
    ],
    [currentTriage]
  );

  const loadPatientInfo = useCallback(async (idPaciente) => {
    if (!idPaciente) {
      setPatientInfo(null);
      setPatientError("");
      return;
    }
    setPatientLoading(true);
    setPatientError("");
    try {
      const { data } = await http.get(endpoints.persons.getByDocument(idPaciente));
      const patient = unwrapObject(data);
      setPatientInfo(patient);
      if (!patient) {
        setPatientError("No fue posible cargar los datos personales del paciente.");
      }
    } catch {
      setPatientInfo(null);
      setPatientError("No fue posible cargar los datos personales del paciente.");
    } finally {
      setPatientLoading(false);
    }
  }, []);

  const loadDiagnosticos = useCallback(async () => {
    try {
      const { data } = await http.get(endpoints.diagnosticos.search);
      const wrapped = unwrapRows(data);
      setDiagnosticos(Array.isArray(wrapped.rows) ? wrapped.rows : []);
    } catch {
      setDiagnosticos([]);
    }
  }, []);

  const loadFormCatalogs = useCallback(async () => {
    setFormLoading(true);
    try {
      const medsPromise = http.get(endpoints.medicamentos.search).catch(() => null);
      const [diagnosticosResponse, medsResponse] = await Promise.all([
        http.get(endpoints.diagnosticos.search).catch(() => null),
        medsPromise,
      ]);

      if (diagnosticosResponse?.data) {
        const wrapped = unwrapRows(diagnosticosResponse.data);
        setDiagnosticos(Array.isArray(wrapped.rows) ? wrapped.rows : []);
      }
      if (medsResponse?.data) {
        const wrapped = unwrapRows(medsResponse.data);
        setMedications(Array.isArray(wrapped.rows) ? wrapped.rows : []);
      }
    } finally {
      setFormLoading(false);
    }
  }, []);

  const clearPendingTriage = useCallback(() => {
    window.sessionStorage.removeItem(PENDING_TRIAGE_KEY);
  }, []);

  const persistPendingTriage = useCallback((snapshot) => {
    window.sessionStorage.setItem(PENDING_TRIAGE_KEY, JSON.stringify(snapshot));
  }, []);

  const loadFirstUrgentTriage = useCallback(async () => {
    setFirstTriageLoading(true);
    try {
      const { data } = await http.get(endpoints.emergency.firstUrgentTriage);
      const wrapped = unwrapRows(data);
      if (wrapped.hasError) {
        setFirstTriageRows([]);
        setPatientInfo(null);
        setPatientError("");
        setTriageInfoMessage(wrapped.message || "No hay triage urgente disponible.");
      } else {
        const rows = wrapped.rows.map(normalizeTriage);
        setFirstTriageRows(rows);
        setTriageInfoMessage("");
        setFeedback((prev) => (isTriageEmptyMessage(prev?.text) ? null : prev));
        const firstRow = rows[0];
        if (firstRow?.id_paciente) {
          await loadPatientInfo(firstRow.id_paciente);
        } else {
          setPatientInfo(null);
          setPatientError("");
        }
      }
    } catch (error) {
      console.error("Error cargando triage urgente:", error);
      setFirstTriageRows([]);
      setPatientInfo(null);
      setPatientError("");
      setTriageInfoMessage("");
      const backendMessage = getBackendMessage(error, "No fue posible cargar el triage mas urgente.");
      setFeedback({
        type: error?.response?.data?.hasError ? "warning" : "error",
        text: backendMessage,
      });
    } finally {
      setFirstTriageLoading(false);
    }
  }, [loadPatientInfo]);

  useEffect(() => {
    loadFirstUrgentTriage();
    loadDiagnosticos();
  }, [loadDiagnosticos, loadFirstUrgentTriage]);

  useEffect(() => {
    const raw = window.sessionStorage.getItem(PENDING_TRIAGE_KEY);
    if (!raw) return;

    try {
      const pending = JSON.parse(raw);
      if (!pending?.selectedTriage?.id_triage) return;

      setSelectedTriage(pending.selectedTriage);
      setAttentionForm(
        pending.attentionForm ?? { observaciones: "", tratamiento: "", id_diagnostico: "" }
      );
      setAttentionOptions(
        pending.attentionOptions ?? { requiresPrescription: false, requiresHospitalization: false }
      );
      setCreatedUrgencyId(pending.createdUrgencyId ?? null);
      setPrescriptionItems(
        Array.isArray(pending.prescriptionItems) && pending.prescriptionItems.length > 0
          ? pending.prescriptionItems
          : [createPrescriptionItem()]
      );
      setFeedback({
        type: "warning",
        text: "Tienes un triage pendiente por gestionar. Debes finalizar la atencion en curso.",
      });
      loadFormCatalogs();
    } catch {
      window.sessionStorage.removeItem(PENDING_TRIAGE_KEY);
    }
  }, [loadFormCatalogs]);

  useEffect(() => {
    if (!selectedTriage?.id_triage) {
      clearPendingTriage();
      return;
    }

    persistPendingTriage({
      selectedTriage,
      attentionForm,
      attentionOptions,
      createdUrgencyId,
      prescriptionItems,
    });
  }, [
    selectedTriage,
    attentionForm,
    attentionOptions,
    createdUrgencyId,
    prescriptionItems,
    persistPendingTriage,
    clearPendingTriage,
  ]);

  async function handleStartAttention(row) {
    if (!row?.id_triage) return;
    setFeedback(null);
    try {
      const response = await http.put(endpoints.emergency.attendTriage(row.id_triage));
      if (response.status === 200) {
        setSelectedTriage(row);
        setAttentionForm({ observaciones: "", tratamiento: "", id_diagnostico: "" });
        setAttentionOptions({ requiresPrescription: false, requiresHospitalization: false });
        setFormErrors({});
        setCreatedUrgencyId(null);
        setPrescriptionItems([createPrescriptionItem()]);
        await loadFormCatalogs();
      }
    } catch (error) {
      if (error?.response?.status === 409) {
        setFeedback({
          type: "warning",
          text: "Este triage ya fue atendido por otro doctor. Se recargara el triage mas urgente.",
        });
        loadFirstUrgentTriage();
        return;
      }
      console.error("Error al tomar triage:", error);
      setFeedback({ type: "error", text: "No fue posible iniciar la atencion del triage." });
    } finally {
      setFormLoading(false);
    }
  }

  function validateAttentionForm() {
    const nextErrors = {};
    if (!attentionForm.observaciones.trim()) nextErrors.observaciones = "Las observaciones son obligatorias.";
    if (!attentionForm.tratamiento.trim()) nextErrors.tratamiento = "El tratamiento es obligatorio.";
    if (!attentionForm.id_diagnostico) nextErrors.id_diagnostico = "Debe seleccionar un diagnostico.";
    if (!doctorId) nextErrors.id_doctor = "No se encontro id_doctor en la sesion autenticada.";
    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleCreateUrgency() {
    if (!selectedTriage?.id_triage || !validateAttentionForm()) return;
    setCreatingUrgency(true);
    setFeedback(null);
    try {
      const payload = {
        observaciones: attentionForm.observaciones.trim(),
        tratamiento: attentionForm.tratamiento.trim(),
        id_diagnostico: Number(attentionForm.id_diagnostico),
        id_doctor: Number(doctorId),
        id_triage: Number(selectedTriage.id_triage),
      };
      const { data } = await http.post(endpoints.emergency.urgencies, payload);
      const idUrgencia =
        data?.data?.id_urgencia ??
        data?.data?.id_atencion_urgencia ??
        data?.data?.id_atencion ??
        data?.data ??
        null;

      if (!idUrgencia) {
        throw new Error("El backend no devolvio id_urgencia.");
      }

      setCreatedUrgencyId(idUrgencia);
      let hospitalizationFailed = false;
      if (attentionOptions.requiresHospitalization) {
        setHospitalizing(true);
        try {
          await http.post(endpoints.emergency.hospitalization, {
            id_urgencia: Number(idUrgencia),
          });
          setFeedback({
            type: "success",
            text: `Atencion creada (ID ${idUrgencia}) y hospitalizacion registrada correctamente.`,
          });
        } catch (hospitalizationError) {
          hospitalizationFailed = true;
          console.error("Error creando hospitalizacion:", hospitalizationError);
          setFeedback({
            type: "warning",
            text: `Atencion creada (ID ${idUrgencia}), pero no fue posible hospitalizar: ${
              getBackendMessage(hospitalizationError, "Error en hospitalizacion.")
            }`,
          });
        } finally {
          setHospitalizing(false);
        }
      } else {
        setFeedback({
          type: "success",
          text: `Atencion de urgencia creada correctamente. ID urgencia: ${idUrgencia}.`,
        });
      }

      if (!attentionOptions.requiresPrescription && !hospitalizationFailed) {
        setSelectedTriage(null);
        setCreatedUrgencyId(null);
        clearPendingTriage();
      }
      loadFirstUrgentTriage();
    } catch (error) {
      console.error("Error creando atencion de urgencia:", error);
      setFeedback({
        type: "error",
        text: error?.response?.data?.message || "No fue posible crear la atencion de urgencia.",
      });
    } finally {
      setCreatingUrgency(false);
    }
  }

  function updatePrescriptionItem(localId, key, value) {
    setPrescriptionItems((prev) =>
      prev.map((item) => (item.localId === localId ? { ...item, [key]: value } : item))
    );
  }

  function addPrescriptionItem() {
    setPrescriptionItems((prev) => [...prev, createPrescriptionItem()]);
  }

  function removePrescriptionItem(localId) {
    if (prescriptionItems.length <= 1) return;
    setPrescriptionItems((prev) => prev.filter((item) => item.localId !== localId));
  }

  async function handleCreatePrescription() {
    if (!createdUrgencyId) {
      setFeedback({ type: "warning", text: "Primero debes crear la atencion de urgencia." });
      return;
    }

    if (validPrescriptionItems.length === 0) {
      setFeedback({
        type: "warning",
        text: "Debes seleccionar al menos un medicamento y completar dosis, duracion y cantidad.",
      });
      return;
    }

    setCreatingPrescription(true);
    setFeedback(null);
    try {
      const payload = {
        id_atencion: Number(createdUrgencyId),
        tipo: 1,
        prescripciones_items: validPrescriptionItems.map((item) => ({
          id_medicamento: Number(item.codigo),
          dosis: item.dosis.trim(),
          duracion: String(item.duracion).trim(),
          cantidad: String(item.cantidad).trim(),
        })),
      };
      await http.post(endpoints.medicalRecords.createPrescription, payload);
      setFeedback({ type: "success", text: "Prescripcion de urgencia creada correctamente." });
      setPrescriptionItems([createPrescriptionItem()]);
      setSelectedTriage(null);
      setCreatedUrgencyId(null);
      clearPendingTriage();
      loadFirstUrgentTriage();
    } catch (error) {
      console.error("Error creando prescripcion:", error);
      const detail = error?.response?.data?.detail;
      if (Array.isArray(detail) && detail.length > 0) {
        const formatted = detail.map((d) => `${d?.loc?.join(".")}: ${d?.msg}`).join(" | ");
        setFeedback({ type: "error", text: `No fue posible crear la prescripcion: ${formatted}` });
      } else {
        setFeedback({
          type: "error",
          text: getBackendMessage(error, "No fue posible crear la prescripcion de urgencia."),
        });
      }
    } finally {
      setCreatingPrescription(false);
    }
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">Urgencias</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Atiende el triage mas urgente.
        </p>
      </div>

      {feedback && (
        <div className="mb-4">
          <Alert variant={feedback.type}>{feedback.text}</Alert>
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-neutral-800">Triage mas urgente</h2>
        <Card padding={false}>
          <Card.Header className="mb-0 flex items-center justify-between px-6 py-4">
            <div>
              <h3 className="text-base font-semibold text-neutral-800">Paciente y prioridad actual</h3>
              <p className="text-sm text-neutral-600">Informacion completa del triage mas urgente.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadFirstUrgentTriage} disabled={firstTriageLoading}>
                Recargar
              </Button>
              <Button
                size="sm"
                onClick={() => currentTriage && setTriageToConfirm(currentTriage)}
                disabled={!currentTriage || firstTriageLoading}
              >
                Realizar atencion
              </Button>
            </div>
          </Card.Header>

          <Card.Body className="space-y-5 px-6 py-5">
            {firstTriageLoading ? (
              <p className="text-sm text-neutral-600">Cargando triage mas urgente...</p>
            ) : !currentTriage ? (
              <p className="text-sm text-neutral-600">{triageInfoMessage || "No hay triage urgente disponible."}</p>
            ) : (
              <>
                <section className="space-y-3 rounded-xl border border-neutral-200 p-4">
                  <h4 className="text-sm font-semibold text-neutral-800">Informacion personal del paciente</h4>
                  {patientLoading ? (
                    <p className="text-sm text-neutral-600">Cargando datos personales...</p>
                  ) : patientError ? (
                    <Alert variant="warning">{patientError}</Alert>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase text-neutral-500">Documento</p>
                        <p className="text-sm font-semibold text-neutral-800">
                          {patientInfo?.num_documento ?? currentTriage.id_paciente ?? "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-neutral-500">Nombre completo</p>
                        <p className="text-sm font-semibold text-neutral-800">
                          {fullName(
                            patientInfo?.nombres ?? currentTriage.nombre_paciente,
                            patientInfo?.apellidos ?? currentTriage.apellido_paciente
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-neutral-500">Telefono</p>
                        <p className="text-sm font-semibold text-neutral-800">{patientInfo?.telefono ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-neutral-500">Correo</p>
                        <p className="text-sm font-semibold text-neutral-800">{patientInfo?.email ?? "—"}</p>
                      </div>
                    </div>
                  )}
                </section>

                <section className="space-y-3 rounded-xl border border-neutral-200 p-4">
                  <h4 className="text-sm font-semibold text-neutral-800">Detalle completo de triage</h4>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {triageDetailRows.map(([label, value]) => (
                      <div key={label}>
                        <p className="text-xs uppercase text-neutral-500">{label}</p>
                        {label === "Riesgo vital" ? (
                          <div className="pt-1">
                            <Badge variant={currentTriage.riesgo_vital ? "danger" : "neutral"}>
                              {value ?? "—"}
                            </Badge>
                          </div>
                        ) : label === "Nivel" ? (
                          <div className="pt-1">
                            <Badge variant="warning">{value ?? "—"}</Badge>
                          </div>
                        ) : (
                          <p className="text-sm font-semibold text-neutral-800">{value ?? "—"}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </Card.Body>
        </Card>
      </section>

      <Modal
        open={!!selectedTriage}
        onClose={() => {}}
        title={`Atencion de urgencia - Triage #${selectedTriage?.id_triage ?? ""}`}
        size="lg"
        scrollable={true}
        closeOnOverlayClick={false}
        showCloseButton={false}
        className="max-w-5xl max-h-[90vh] flex flex-col"
      >
        {!selectedTriage ? null : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-3 rounded-lg border border-neutral-200 p-3 md:grid-cols-3">
              <div>
                <p className="text-xs uppercase text-neutral-500">ID triage</p>
                <p className="text-sm font-semibold text-neutral-800">{selectedTriage.id_triage ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-neutral-500">Paciente</p>
                <p className="text-sm font-semibold text-neutral-800">
                  {fullName(
                    patientInfo?.nombres ?? selectedTriage.nombre_paciente,
                    patientInfo?.apellidos ?? selectedTriage.apellido_paciente
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-neutral-500">ID doctor autenticado</p>
                <p className="text-sm font-semibold text-neutral-800">{doctorId ?? "—"}</p>
              </div>
            </div>

            {!isPrescriptionStep && (
              <>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700">Observaciones</label>
                    <textarea
                      rows={3}
                      value={attentionForm.observaciones}
                      onChange={(e) => {
                        setAttentionForm((prev) => ({ ...prev, observaciones: e.target.value }));
                        setFormErrors((prev) => ({ ...prev, observaciones: "" }));
                      }}
                      className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    {formErrors.observaciones && (
                      <p className="text-sm text-emergency-600">{formErrors.observaciones}</p>
                    )}
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700">Tratamiento</label>
                    <textarea
                      rows={3}
                      value={attentionForm.tratamiento}
                      onChange={(e) => {
                        setAttentionForm((prev) => ({ ...prev, tratamiento: e.target.value }));
                        setFormErrors((prev) => ({ ...prev, tratamiento: "" }));
                      }}
                      className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    {formErrors.tratamiento && (
                      <p className="text-sm text-emergency-600">{formErrors.tratamiento}</p>
                    )}
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700">Diagnostico</label>
                    <select
                      value={attentionForm.id_diagnostico}
                      onChange={(e) => {
                        setAttentionForm((prev) => ({ ...prev, id_diagnostico: e.target.value }));
                        setFormErrors((prev) => ({ ...prev, id_diagnostico: "" }));
                      }}
                      disabled={formLoading}
                      className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="">Seleccione diagnostico</option>
                      {diagnosticos.map((diag) => (
                        <option key={diag.id_diagnostico} value={diag.id_diagnostico}>
                          {diag.nombre_enfermedad}
                        </option>
                      ))}
                    </select>
                    {formErrors.id_diagnostico && (
                      <p className="text-sm text-emergency-600">{formErrors.id_diagnostico}</p>
                    )}
                  </div>
              </div>

                {formErrors.id_doctor && <Alert variant="warning">{formErrors.id_doctor}</Alert>}

                <div className="space-y-2 rounded-xl border border-neutral-200 p-3">
                  <h3 className="text-base font-semibold text-neutral-800">Opciones posteriores</h3>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <BooleanSwitch
                      label="Requiere prescripcion"
                      value={attentionOptions.requiresPrescription}
                      onChange={(nextValue) =>
                        setAttentionOptions((prev) => ({ ...prev, requiresPrescription: nextValue }))
                      }
                    />
                    <BooleanSwitch
                      label="Requiere hospitalizacion"
                      value={attentionOptions.requiresHospitalization}
                      onChange={(nextValue) =>
                        setAttentionOptions((prev) => ({ ...prev, requiresHospitalization: nextValue }))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleCreateUrgency}
                    disabled={creatingUrgency || !!createdUrgencyId || hospitalizing}
                  >
                    {creatingUrgency
                      ? "Guardando..."
                      : hospitalizing
                        ? "Hospitalizando..."
                      : createdUrgencyId
                        ? `Atencion creada (#${createdUrgencyId})`
                        : "Crear atencion urgencia"}
                  </Button>
                </div>
              </>
            )}

            {isPrescriptionStep && (
              <div className="space-y-4 rounded-xl border border-neutral-200 p-4">
                <Alert variant="success">
                  Atencion creada correctamente. Continúa con el registro de la prescripcion para finalizar.
                </Alert>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-neutral-800">Prescripcion</h3>
                  <Button variant="outline" size="sm" onClick={addPrescriptionItem} disabled={!createdUrgencyId}>
                    Agregar item
                  </Button>
                </div>

                <div className="space-y-3">
                  {prescriptionItems.map((item, idx) => (
                    <div
                      key={item.localId}
                      className="grid grid-cols-1 gap-3 rounded-lg border border-neutral-200 p-3 md:grid-cols-5"
                    >
                      <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-medium text-neutral-700">
                          Medicamento #{idx + 1}
                        </label>
                        <select
                          value={item.codigo}
                          onChange={(e) => updatePrescriptionItem(item.localId, "codigo", e.target.value)}
                          disabled={!createdUrgencyId}
                          className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                          <option value="">Seleccione medicamento</option>
                          {medications.map((med) => (
                            <option key={med.codigo} value={med.codigo}>
                              {med.nombre_medicamento}
                            </option>
                          ))}
                        </select>
                      </div>

                      <Input
                        label="Dosis"
                        value={item.dosis}
                        onChange={(e) => updatePrescriptionItem(item.localId, "dosis", e.target.value)}
                        disabled={!createdUrgencyId}
                      />
                      <Input
                        label="Duracion"
                        type="number"
                        min="1"
                        value={item.duracion}
                        onChange={(e) => updatePrescriptionItem(item.localId, "duracion", e.target.value)}
                        disabled={!createdUrgencyId}
                      />
                      <Input
                        label="Cantidad"
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) => updatePrescriptionItem(item.localId, "cantidad", e.target.value)}
                        disabled={!createdUrgencyId}
                      />

                      <div className="md:col-span-5 flex justify-end">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removePrescriptionItem(item.localId)}
                          disabled={!createdUrgencyId || prescriptionItems.length <= 1}
                        >
                          Quitar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {validPrescriptionItems.length === 0 && (
                  <p className="text-xs text-neutral-500">
                    Selecciona un medicamento y completa dosis, duracion y cantidad para habilitar el envio.
                  </p>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={handleCreatePrescription}
                    disabled={!createdUrgencyId || creatingPrescription || validPrescriptionItems.length === 0}
                  >
                    {creatingPrescription ? "Guardando..." : "Crear prescripcion"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={!!triageToConfirm}
        onClose={() => setTriageToConfirm(null)}
        title="Confirmar inicio de atencion"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setTriageToConfirm(null)}>
              No
            </Button>
            <Button
              onClick={async () => {
                const triage = triageToConfirm;
                setTriageToConfirm(null);
                if (triage) {
                  await handleStartAttention(triage);
                }
              }}
            >
              Si, continuar
            </Button>
          </>
        }
      >
        <p className="text-sm text-neutral-700">
          Una vez inicies la atencion del paciente, debes finalizar toda la gestion de este triage.
          ¿Deseas continuar?
        </p>
      </Modal>

    </PageContainer>
  );
}
