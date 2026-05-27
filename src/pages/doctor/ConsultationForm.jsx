import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Badge, Button, Card, Input, Modal, Spinner } from "../../components/ui";
import PrescriptionItemsForm from "../../components/prescriptions/PrescriptionItemsForm";
import {
  createPrescriptionItem,
  validatePrescriptionItems,
} from "../../components/prescriptions/prescriptionFormUtils";
import { http } from "../../services/api/http";
import { endpoints } from "../../services/api/endpoints";

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function unwrapBackendResponse(responseData) {
  if (!responseData || typeof responseData !== "object") {
    throw new Error("La respuesta del backend no es válida.");
  }

  if (responseData.hasError) {
    throw new Error(responseData.message || "El backend reportó un error.");
  }

  return {
    message: responseData.message || "",
    data: responseData.data ?? null,
  };
}

function getApiErrorMessage(error, fallback) {
  const data = error?.response?.data;
  if (typeof data?.message === "string") return data.message;
  if (typeof data?.Message === "string") return data.Message;
  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.detail) && data.detail.length > 0) {
    return data.detail
      .map((item) => item?.msg || item?.message || JSON.stringify(item))
      .join(" | ");
  }
  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

function unwrapPrescriptionRows(responseData) {
  const payload = responseData?.data ?? responseData?.Data ?? responseData;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.Data)) return payload.Data;
  return [];
}

function TextAreaField({
  label,
  value,
  onChange,
  error,
  rows = 4,
  placeholder = "",
  name,
}) {
  const inputId = name ?? label?.toLowerCase().replace(/\s+/g, "-") ?? "textarea";

  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700">
        {label}
      </label>

      <textarea
        id={inputId}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className={[
          "block w-full rounded-lg border px-3 py-2 text-neutral-900 placeholder-neutral-400",
          "focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
          "disabled:bg-neutral-100 disabled:cursor-not-allowed resize-y",
          error
            ? "border-emergency-500 focus:border-emergency-500 focus:ring-emergency-500"
            : "border-neutral-300",
        ].join(" ")}
        aria-invalid={!!error}
      />

      {error && (
        <p className="text-sm text-emergency-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 COMPONENT                                  */
/* -------------------------------------------------------------------------- */

export default function ConsultationForm() {
  const navigate = useNavigate();

  // IDs
  const [appointmentId, setAppointmentId] = useState(null);

  // Data from API
  const [citaContext, setCitaContext] = useState(null); // { id_cita, id_paciente, id_especialidad, nombreUsuario, nombreEspecialidad }
  const [medicalHistory, setMedicalHistory] = useState([]); // array of historia objects

  // Loading states
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingReferral, setIsSavingReferral] = useState(false);

  // Form fields
  const [form, setForm] = useState({ observacion: "", tratamiento: "" });
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);

  // Diagnóstico search
  const [diagnosticoQuery, setDiagnosticoQuery] = useState("");
  const [diagnosticoOptions, setDiagnosticoOptions] = useState([]);
  const [selectedDiagnostico, setSelectedDiagnostico] = useState(null); // { id_diagnostico, nombre_enfermedad }
  const [loadingDiagnosticos, setLoadingDiagnosticos] = useState(false);
  const diagDebounceRef = useRef(null);

  // Medications
  const [medicamentoOptions, setMedicamentoOptions] = useState([]); // { codigo, nombre_medicamento, principio_activo, presentacion, ... }
  const [prescriptionItems, setPrescriptionItems] = useState([createPrescriptionItem()]);
  
  // Track selected principio activo per prescription item
  const [selectedPrincipioActivo, setSelectedPrincipioActivo] = useState({}); // { localId: principio_activo }
  
  // Dose warnings per prescription item
  const [doseWarnings, setDoseWarnings] = useState({}); // { "localId": "warning message" }

  // After consultation creation
  const [createdRegistroId, setCreatedRegistroId] = useState(null);

  // Remission modal
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [allowedSpecialties, setAllowedSpecialties] = useState([]);
  const [referral, setReferral] = useState({
    id_especialidad: "",
    fecha_expiracion: "",
  });
  const [referralDone, setReferralDone] = useState(false);
  const [referralErrors, setReferralErrors] = useState({});

  /* ---------------------------------------------------------------------- */
  /*                           INITIAL DATA LOAD                             */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    async function loadInitialData() {
      const id = new URLSearchParams(window.location.search).get("appointment_id");

      if (!id) {
        setFeedback({
          type: "error",
          text: "No se encontró el parámetro appointment_id en la URL.",
        });
        setLoading(false);
        return;
      }

      setAppointmentId(id);

      try {
        setLoading(true);

        // 1. Consultation context (nombre paciente, especialidad)
        const ctxRes = await http.get(endpoints.appointments.consultationContext(id));
        const ctx = unwrapBackendResponse(ctxRes.data).data;
        setCitaContext(ctx);

        // 2. Medical history + 3. Medications (parallel)
        const [historyRes, medsRes] = await Promise.all([
          http.get(endpoints.medicalRecords.getPatientHistory(ctx.id_paciente)).catch(() => null),
          http.get(endpoints.medicamentos.search).catch(() => null),
        ]);

        if (historyRes) {
          try {
            const history = unwrapBackendResponse(historyRes.data);
            setMedicalHistory(Array.isArray(history.data) ? history.data : []);
          } catch {
            setMedicalHistory([]);
          }
        }

        if (medsRes) {
          try {
            const meds = unwrapBackendResponse(medsRes.data);
            setMedicamentoOptions(Array.isArray(meds.data) ? meds.data : []);
          } catch {
            setMedicamentoOptions([]);
          }
        }

        // 4. Initial diagnosticos (load all, no filter)
        try {
          const diagRes = await http.get(endpoints.diagnosticos.search);
          const diags = unwrapBackendResponse(diagRes.data);
          setDiagnosticoOptions(Array.isArray(diags.data) ? diags.data : []);
        } catch {
          setDiagnosticoOptions([]);
        }
      } catch (err) {
        setFeedback({
          type: "error",
          text: err.message || "No fue posible cargar los datos de la consulta.",
        });
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, [navigate]);

  /* ---------------------------------------------------------------------- */
  /*                         DIAGNÓSTICO SEARCH                              */
  /* ---------------------------------------------------------------------- */

  function handleDiagnosticoQueryChange(value) {
    setDiagnosticoQuery(value);

    if (diagDebounceRef.current) {
      clearTimeout(diagDebounceRef.current);
    }

    diagDebounceRef.current = setTimeout(async () => {
      try {
        setLoadingDiagnosticos(true);
        const params = value.trim() ? { nombre: value.trim() } : {};
        const res = await http.get(endpoints.diagnosticos.search, { params });
        const wrapped = unwrapBackendResponse(res.data);
        setDiagnosticoOptions(Array.isArray(wrapped.data) ? wrapped.data : []);
      } catch {
        // keep previous options
      } finally {
        setLoadingDiagnosticos(false);
      }
    }, 350);
  }

  function selectDiagnostico(diag) {
    setSelectedDiagnostico(diag);
    setDiagnosticoQuery(diag.nombre_enfermedad);
    setErrors((prev) => ({ ...prev, diagnostico: "" }));
  }

  function clearDiagnostico() {
    setSelectedDiagnostico(null);
    setDiagnosticoQuery("");
  }

  function clearPrescriptionFieldError(localId, keys) {
    setErrors((prev) => {
      const updated = { ...prev };
      keys.forEach((key) => delete updated[`${localId}_${key}`]);
      return updated;
    });
  }

  /* ---------------------------------------------------------------------- */
  /*                              VALIDATION                                 */
  /* ---------------------------------------------------------------------- */

  function validate() {
    const newErrors = {};

    if (!form.observacion.trim()) {
      newErrors.observacion = "Las observaciones son obligatorias.";
    }

    if (!form.tratamiento.trim()) {
      newErrors.tratamiento = "El tratamiento es obligatorio.";
    }

    if (!selectedDiagnostico) {
      newErrors.diagnostico = "Debe seleccionar un diagnóstico.";
    }

    Object.assign(
      newErrors,
      validatePrescriptionItems(prescriptionItems, selectedPrincipioActivo)
    );

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  /* ---------------------------------------------------------------------- */
  /*                          SUBMIT CONSULTATION                            */
  /* ---------------------------------------------------------------------- */

  async function handleFinalize() {
    if (createdRegistroId) return; // already saved

    if (!validate()) {
      setFeedback({
        type: "warning",
        text: "Debes completar los campos obligatorios del formulario.",
      });
      return;
    }

    setIsSaving(true);

    try {
      const medicamentosPayload = prescriptionItems
        .filter(
          (item) =>
            item.codigo &&
            String(item.dosis || "").trim() &&
            Number(item.duracion) > 0 &&
            Number(item.cantidad) > 0
        )
        .map((item) => ({
          codigo: Number(item.codigo),
          dosis: String(item.dosis).trim(),
          duracion: Number(item.duracion),
          cantidad: Number(item.cantidad),
        }));

      if (medicamentosPayload.length === 0) {
        setFeedback({
          type: "warning",
          text: "Debes agregar al menos un medicamento válido para registrar la consulta con prescripción.",
        });
        setIsSaving(false);
        return;
      }

      // Some backend deployments still expect the typo "obervacion".
      const payload = {
        obervacion: String(form.observacion).trim(),
        observacion: String(form.observacion).trim(),
        tratamiento: String(form.tratamiento).trim(),
        id_diagnostico: Number(selectedDiagnostico.id_diagnostico),
        tipo_preinscripcion: 1,
        medicamentos: medicamentosPayload,
      };

      // Guard against backend unique constraint (id_atencion, tipo).
      const existingRxRes = await http.get(endpoints.medicalRecords.createPrescription, {
        params: {
          idAtencion: Number(appointmentId),
          tipo: 1,
          pag: 1,
          cantidad: 1,
        },
      });
      const existingRows = unwrapPrescriptionRows(existingRxRes.data);
      if (existingRows.length > 0) {
        setFeedback({
          type: "warning",
          text: "Esta cita ya tiene una prescripción de tipo medicamentos. No se puede crear otra para la misma atención.",
        });
        setIsSaving(false);
        return;
      }

      const res = await http.post(endpoints.consultations.create(appointmentId), payload);
      const wrapped = unwrapBackendResponse(res.data);

      setCreatedRegistroId(wrapped.data?.id_registro ?? null);
      setFeedback({
        type: "success",
        text: wrapped.message || "Consulta registrada correctamente.",
      });
    } catch (err) {
      setFeedback({
        type: "error",
        text: getApiErrorMessage(err, "No fue posible guardar la consulta."),
      });
    } finally {
      setIsSaving(false);
    }
  }

  /* ---------------------------------------------------------------------- */
  /*                          REFERRAL / REMISIÓN                            */
  /* ---------------------------------------------------------------------- */

  async function handleOpenReferralModal() {
    setShowReferralModal(true);

    try {
      const res = await http.get(endpoints.specialties.remission);
      const all = Array.isArray(res.data) ? res.data : [];

      // Only show specialties that can be referred from the current appointment's specialty
      const filtered = all.filter(
        (s) => s.id_especialidad_que_remite === citaContext?.id_especialidad
      );

      setAllowedSpecialties(filtered);
    } catch {
      setAllowedSpecialties([]);
    }
  }

  async function handleSaveReferral() {
    const newReferralErrors = {};

    if (!referral.id_especialidad) {
      newReferralErrors.id_especialidad = "Debe seleccionar una especialidad destino.";
    }

    if (!referral.fecha_expiracion) {
      newReferralErrors.fecha_expiracion = "Debe seleccionar una fecha de expiración.";
    }

    setReferralErrors(newReferralErrors);

    if (Object.keys(newReferralErrors).length > 0) {
      setFeedback({
        type: "warning",
        text: "Completa los campos obligatorios de la remisión.",
      });
      return;
    }

    setIsSavingReferral(true);

    try {
      const payload = {
        id_registro: createdRegistroId,
        id_especialidad: Number(referral.id_especialidad),
        fecha_expiracion: referral.fecha_expiracion,
      };

      const res = await http.post(endpoints.referrals.create(appointmentId), payload);
      const wrapped = unwrapBackendResponse(res.data);

      setShowReferralModal(false);
      setReferralDone(true);
      setReferral({ id_especialidad: "", fecha_expiracion: "" });
      setReferralErrors({});
      setFeedback({
        type: "success",
        text: wrapped.message || `Remisión creada. ID: ${wrapped.data?.id_remision ?? "-"}`,
      });
    } catch (err) {
      setFeedback({
        type: "error",
        text: err.message || "No fue posible crear la remisión.",
      });
    } finally {
      setIsSavingReferral(false);
    }
  }

  /* ---------------------------------------------------------------------- */
  /*                                RENDER                                   */
  /* ---------------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center gap-3">
        <Spinner />
        <span className="text-neutral-600">Cargando información de la consulta...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-800">Formulario de Consulta</h1>
        <p className="mt-1 text-neutral-600">
          Registro de atención médica — Cita #{citaContext?.id_cita}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" size="sm">
          Cita #{citaContext?.id_cita}
        </Badge>
        <Badge variant="success" size="sm">
          {citaContext?.nombreUsuario || `Paciente #${citaContext?.id_paciente}`}
        </Badge>
        <Badge variant="warning" size="sm">
          {citaContext?.nombreEspecialidad || `Esp. #${citaContext?.id_especialidad}`}
        </Badge>
      </div>

      {feedback && (
        <Alert variant={feedback.type} fixed>
          {feedback.text}
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_380px]">
        {/* ── LEFT COLUMN ─────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Datos de la cita */}
          <Card padding>
            <Card.Header>
              <h2 className="text-lg font-semibold text-neutral-800">Datos de la cita</h2>
            </Card.Header>

            <Card.Body>
              <div className="grid grid-cols-1 gap-4 text-sm text-neutral-700 md:grid-cols-2">
                <div>
                  <span className="font-semibold">ID cita:</span> {citaContext?.id_cita}
                </div>
                <div>
                  <span className="font-semibold">ID paciente:</span> {citaContext?.id_paciente}
                </div>
                <div>
                  <span className="font-semibold">Paciente:</span> {citaContext?.nombreUsuario}
                </div>
                <div>
                  <span className="font-semibold">Especialidad:</span>{" "}
                  {citaContext?.nombreEspecialidad}
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Consulta */}
          <Card padding>
            <Card.Header>
              <h2 className="text-lg font-semibold text-neutral-800">Consulta</h2>
            </Card.Header>

            <Card.Body>
              <div className="space-y-4">
                <TextAreaField
                  label="Observaciones"
                  name="observacion"
                  value={form.observacion}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, observacion: e.target.value }));
                    setErrors((prev) => ({ ...prev, observacion: "" }));
                  }}
                  error={errors.observacion}
                  rows={5}
                />

                <TextAreaField
                  label="Tratamiento"
                  name="tratamiento"
                  value={form.tratamiento}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, tratamiento: e.target.value }));
                    setErrors((prev) => ({ ...prev, tratamiento: "" }));
                  }}
                  error={errors.tratamiento}
                  rows={5}
                />

                {/* Diagnóstico search */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-neutral-700">
                    Diagnóstico
                  </label>

                  {selectedDiagnostico ? (
                    <div className="flex items-center gap-2 rounded-lg border border-primary-300 bg-primary-50 px-3 py-2">
                      <span className="flex-1 text-sm text-primary-800">
                        {selectedDiagnostico.nombre_enfermedad}
                      </span>
                      <button
                        type="button"
                        onClick={clearDiagnostico}
                        className="text-xs font-medium text-primary-600 hover:text-primary-900"
                      >
                        Cambiar
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={diagnosticoQuery}
                          onChange={(e) => handleDiagnosticoQueryChange(e.target.value)}
                          placeholder="Buscar por nombre de enfermedad..."
                          className={[
                            "block w-full rounded-lg border px-3 py-2 text-neutral-900 placeholder-neutral-400",
                            "focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
                            errors.diagnostico
                              ? "border-emergency-500 focus:border-emergency-500 focus:ring-emergency-500"
                              : "border-neutral-300",
                          ].join(" ")}
                        />
                        {loadingDiagnosticos && <Spinner size="sm" />}
                      </div>

                      {diagnosticoOptions.length > 0 && (
                        <ul className="mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-neutral-200 bg-neutral-50">
                          {diagnosticoOptions.map((d) => (
                            <li
                              key={d.id_diagnostico}
                              className="cursor-pointer px-3 py-2 text-sm text-neutral-800 hover:bg-primary-50 hover:text-primary-700"
                              onClick={() => selectDiagnostico(d)}
                            >
                              {d.nombre_enfermedad}
                            </li>
                          ))}
                        </ul>
                      )}

                      {!loadingDiagnosticos &&
                        diagnosticoQuery.trim() &&
                        diagnosticoOptions.length === 0 && (
                          <p className="mt-1 text-sm text-emergency-600">
                            No se encontraron diagnósticos con ese nombre.
                          </p>
                        )}
                    </div>
                  )}

                  {errors.diagnostico && (
                    <p className="text-sm text-emergency-600" role="alert">
                      {errors.diagnostico}
                    </p>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>

          <PrescriptionItemsForm
            medicamentoOptions={medicamentoOptions}
            prescriptionItems={prescriptionItems}
            onPrescriptionItemsChange={setPrescriptionItems}
            selectedPrincipioActivo={selectedPrincipioActivo}
            onSelectedPrincipioActivoChange={setSelectedPrincipioActivo}
            doseWarnings={doseWarnings}
            onDoseWarningsChange={setDoseWarnings}
            errors={errors}
            onClearError={clearPrescriptionFieldError}
            disabled={!!createdRegistroId}
            title="Medicamentos"
          />

          {/* Action buttons */}
          <div className="flex flex-wrap justify-end gap-3">
            {createdRegistroId && !referralDone && (
              <Button variant="outline" onClick={handleOpenReferralModal}>
                Crear Remisión
              </Button>
            )}

            <Button onClick={handleFinalize} disabled={isSaving || !!createdRegistroId}>
              {isSaving
                ? "Guardando..."
                : createdRegistroId
                  ? "Consulta guardada"
                  : "Finalizar Consulta"}
            </Button>
          </div>
        </div>

        {/* ── RIGHT COLUMN – Historia clínica ─────────────────── */}
        <div>
          <Card padding>
            <Card.Header>
              <h2 className="text-lg font-semibold text-neutral-800">
                Historia clínica del paciente
              </h2>
            </Card.Header>

            <Card.Body>
              <div className="space-y-4 text-sm text-neutral-700">
                <div>
                  <span className="font-semibold">Paciente:</span>{" "}
                  {citaContext?.nombreUsuario || `#${citaContext?.id_paciente}`}
                </div>

                {medicalHistory.length === 0 ? (
                  <p className="text-neutral-500">Sin historia clínica registrada.</p>
                ) : (
                  medicalHistory.map((historia) => (
                    <div
                      key={historia.id_historia}
                      className="space-y-2 rounded-lg border border-neutral-200 p-3"
                    >
                      <div className="text-xs text-neutral-500">
                        Inicio: {historia.fecha_inicio} · Actualización:{" "}
                        {historia.fecha_ult_actualizacion}
                      </div>

                      {historia.registros_historia && historia.registros_historia.length > 0 ? (
                        <div className="space-y-2">
                          {historia.registros_historia.map((registro, i) => (
                            <div
                              key={registro.id_registro ?? i}
                              className="rounded border border-primary-300 bg-primary-50 px-3 py-2 space-y-1"
                            >
                              {registro.nombre_enfermedad && (
                                <div>
                                  <span className="font-bold">Diagnóstico:</span>{" "}
                                  {registro.nombre_enfermedad}
                                </div>
                              )}

                              {registro.observaciones && (
                                <div>
                                  <span className="font-bold">Observaciones:</span>{" "}
                                  {registro.observaciones}
                                </div>
                              )}

                              {registro.tratamiento && (
                                <div>
                                  <span className="font-bold">Tratamiento:</span>{" "}
                                  {registro.tratamiento}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-400">
                          Sin registros en esta historia.
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* ── REMISIÓN MODAL ──────────────────────────────────────── */}
      <Modal
        open={showReferralModal}
        onClose={() => setShowReferralModal(false)}
        title="Crear Remisión"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowReferralModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveReferral} disabled={isSavingReferral}>
              {isSavingReferral ? "Guardando..." : "Guardar remisión"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-neutral-700">
              Especialidad destino
            </label>

            <select
              value={referral.id_especialidad}
              onChange={(e) => {
                setReferral((prev) => ({ ...prev, id_especialidad: e.target.value }));
                setReferralErrors((prev) => ({ ...prev, id_especialidad: "" }));
              }}
              className={[
                "block w-full rounded-lg border px-3 py-2 text-neutral-900 bg-white",
                "focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
                referralErrors.id_especialidad
                  ? "border-emergency-500 focus:border-emergency-500 focus:ring-emergency-500"
                  : "border-neutral-300",
              ].join(" ")}
            >
              <option value="">Seleccione especialidad</option>
              {allowedSpecialties.map((s) => (
                <option
                  key={s.id_especialidad_remitida}
                  value={s.id_especialidad_remitida}
                >
                  {s.nombre_remitida}
                </option>
              ))}
            </select>

            {referralErrors.id_especialidad && (
              <p className="text-sm text-emergency-600">
                {referralErrors.id_especialidad}
              </p>
            )}

            {allowedSpecialties.length === 0 && (
              <p className="text-xs text-neutral-500">
                No hay especialidades disponibles para remisión desde esta especialidad.
              </p>
            )}
          </div>

          <Input
            label="Fecha de expiración"
            type="date"
            value={referral.fecha_expiracion}
            onChange={(e) => {
              setReferral((prev) => ({ ...prev, fecha_expiracion: e.target.value }));
              setReferralErrors((prev) => ({ ...prev, fecha_expiracion: "" }));
            }}
            error={referralErrors.fecha_expiracion}
          />
        </div>
      </Modal>
    </div>
  );
}
