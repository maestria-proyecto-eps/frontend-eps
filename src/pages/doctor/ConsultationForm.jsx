import React, { useEffect, useMemo, useState } from "react";
import { MainLayout, PageContainer } from "../../components/layout";
import { Alert, Badge, Button, Card, Input, Modal } from "../../components/ui";

const CONSULTATION_CONTEXT_MOCK = {
  cita: { id: 25 },
  paciente: {
    id: 102,
    nombre: "María",
    apellido: "Gómez",
    documento: "1020304050",
    edad: 34,
    sexo: "Femenino",
  },
  especialidad: { id: 8, nombre: "Medicina General" },
  historiaClinica: {
    antecedentes: ["Hipertensión arterial"],
    alergias: ["Penicilina"],
  },
};

const DIAGNOSTICOS_MOCK = [
  { id_diagnostico: 1, nombre_enfermedad: "Gastritis" },
  { id_diagnostico: 2, nombre_enfermedad: "Migraña" },
  { id_diagnostico: 3, nombre_enfermedad: "Hipertensión arterial" },
];

const MEDICAMENTOS_MOCK = [
  { id: 1, nombre: "Acetaminofén 500 mg" },
  { id: 2, nombre: "Ibuprofeno 400 mg" },
  { id: 3, nombre: "Amoxicilina 500 mg" },
  { id: 4, nombre: "Loratadina 10 mg" },
  { id: 5, nombre: "Omeprazol 20 mg" },
];

function createPrescriptionItem() {
  return {
    localId: crypto.randomUUID(),
    id_medicamento: "",
    cantidad: "",
    dosis: "",
    duracion: "",
  };
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
  const inputId = name || `textarea-${Math.random().toString(36).slice(2)}`;

  return (
    <div className="space-y-1">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-neutral-700"
      >
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

function unwrapBackendResponse(responseJson) {
  if (!responseJson || typeof responseJson !== "object") {
    throw new Error("La respuesta del backend no es válida.");
  }

  if (responseJson.hasError) {
    throw new Error(responseJson.message || "El backend reportó un error.");
  }

  return {
    message: responseJson.message || "",
    data: responseJson.data ?? null,
  };
}

function mapHistoriaClinicaResponse(historiaList) {
  if (!Array.isArray(historiaList) || historiaList.length === 0) {
    return {
      antecedentes: [],
      alergias: [],
      registros: [],
      ultimoRegistro: null,
    };
  }

  const primeraHistoria = historiaList[0];
  const registros = Array.isArray(primeraHistoria.registros_historia)
    ? primeraHistoria.registros_historia
    : [];

  const ultimoRegistro =
    registros.length > 0 ? registros[registros.length - 1] : null;

  return {
    antecedentes: registros.map((r) => r.nombre_enfermedad).filter(Boolean),
    alergias: [],
    registros,
    ultimoRegistro,
  };
}

function mapAppointmentToUi(appointmentData, historiaClinicaMap) {
  const paciente = appointmentData?.paciente || appointmentData?.patient || {};
  const especialidad =
    appointmentData?.especialidad || appointmentData?.specialty || {};
  const cita =
    appointmentData?.cita ||
    appointmentData?.appointment ||
    appointmentData ||
    {};

  return {
    cita: {
      id: cita.id_cita ?? cita.id ?? "",
    },
    paciente: {
      id: paciente.id_paciente ?? paciente.id ?? "",
      nombre: paciente.nombre ?? paciente.first_name ?? "",
      apellido: paciente.apellido ?? paciente.last_name ?? "",
      documento: paciente.documento ?? paciente.documento_identidad ?? "",
      edad: paciente.edad ?? paciente.age ?? "",
      sexo: paciente.sexo ?? paciente.gender ?? "",
    },
    especialidad: {
      id: especialidad.id_especialidad ?? especialidad.id ?? "",
      nombre:
        especialidad.nombre_especialidad ??
        especialidad.nombre ??
        especialidad.name ??
        "",
    },
    historiaClinica: historiaClinicaMap,
  };
}

function mapMedicamentosToUi(medicamentosData) {
  if (!Array.isArray(medicamentosData)) return [];

  return medicamentosData.map((m) => ({
    id: m.codigo,
    nombre: m.nombre_medicamento,
    reg_invima: m.reg_invima,
    principio_activo: m.principio_activo,
    presentacion: m.presentacion,
  }));
}

function mapDiagnosticosToUi(diagnosticosData) {
  if (!Array.isArray(diagnosticosData)) return [];

  return diagnosticosData.map((d) => ({
    id: d.id_diagnostico,
    nombre: d.nombre_enfermedad,
  }));
}

export default function ConsultationForm() {
  const [context, setContext] = useState(CONSULTATION_CONTEXT_MOCK);
  const [medicamentos, setMedicamentos] = useState(MEDICAMENTOS_MOCK);
  const [diagnosticos, setDiagnosticos] = useState(
    DIAGNOSTICOS_MOCK.map((d) => ({
      id: d.id_diagnostico,
      nombre: d.nombre_enfermedad,
    }))
  );
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    observaciones: "",
    tratamiento: "",
    diagnostico: "",
  });

  const [prescriptionItems, setPrescriptionItems] = useState([
    createPrescriptionItem(),
  ]);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referral, setReferral] = useState({
    especialidadDestino: "",
    motivo: "",
    observaciones: "",
  });
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    async function loadInitialData() {
      const appointmentId = new URLSearchParams(window.location.search).get(
        "appointment_id"
      );

      if (!appointmentId) {
        return;
      }

      try {
        setLoading(true);

        const [appointmentRes, historiaRes, medicamentosRes, diagnosticosRes] =
          await Promise.all([
            fetch(`/appointments/${appointmentId}`),
            fetch(
              `/medical-records/patient/${CONSULTATION_CONTEXT_MOCK.paciente.id}`
            ),
            fetch(`/medications`),
            fetch(`/diagnostics`),
          ]);

        const appointmentJson = await appointmentRes.json();
        const historiaJson = await historiaRes.json();
        const medicamentosJson = await medicamentosRes.json();
        const diagnosticosJson = await diagnosticosRes.json();

        const appointmentWrapped = unwrapBackendResponse(appointmentJson);
        const historiaWrapped = unwrapBackendResponse(historiaJson);
        const medicamentosWrapped = unwrapBackendResponse(medicamentosJson);
        const diagnosticosWrapped = unwrapBackendResponse(diagnosticosJson);

        const historiaClinicaMap = mapHistoriaClinicaResponse(
          historiaWrapped.data
        );
        const appointmentUi = mapAppointmentToUi(
          appointmentWrapped.data,
          historiaClinicaMap
        );
        const medicamentosUi = mapMedicamentosToUi(medicamentosWrapped.data);
        const diagnosticosUi = mapDiagnosticosToUi(diagnosticosWrapped.data);

        setContext(appointmentUi);

        if (medicamentosUi.length > 0) {
          setMedicamentos(medicamentosUi);
        }

        if (diagnosticosUi.length > 0) {
          setDiagnosticos(diagnosticosUi);
        }

        if (appointmentWrapped.message) {
          setFeedback({
            type: "info",
            text: appointmentWrapped.message,
          });
        }
      } catch (error) {
        setFeedback({
          type: "warning",
          text:
            error.message ||
            "No fue posible cargar datos reales del backend. Se usarán datos de prueba.",
        });
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  const patientName = useMemo(
    () => `${context.paciente.nombre} ${context.paciente.apellido}`,
    [context]
  );

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function updatePrescriptionItem(localId, key, value) {
    setPrescriptionItems((prev) =>
      prev.map((item) =>
        item.localId === localId ? { ...item, [key]: value } : item
      )
    );
    setErrors((prev) => ({ ...prev, [`${localId}_${key}`]: "" }));
  }

  function addPrescriptionItem() {
    setPrescriptionItems((prev) => [...prev, createPrescriptionItem()]);
  }

  function removePrescriptionItem(localId) {
    setPrescriptionItems((prev) =>
      prev.length === 1
        ? prev
        : prev.filter((item) => item.localId !== localId)
    );
  }

  function validate() {
    const newErrors = {};

    if (!form.observaciones.trim()) {
      newErrors.observaciones = "Las observaciones son obligatorias.";
    }
    if (!form.tratamiento.trim()) {
      newErrors.tratamiento = "El tratamiento es obligatorio.";
    }
    if (!form.diagnostico.trim()) {
      newErrors.diagnostico = "El diagnóstico es obligatorio.";
    }

    prescriptionItems.forEach((item) => {
      const hasAnyValue =
        item.id_medicamento || item.cantidad || item.dosis || item.duracion;

      if (!hasAnyValue) return;

      if (!item.id_medicamento) {
        newErrors[`${item.localId}_id_medicamento`] =
          "Seleccione un medicamento.";
      }
      if (!item.cantidad || Number(item.cantidad) <= 0) {
        newErrors[`${item.localId}_cantidad`] =
          "La cantidad debe ser mayor a cero.";
      }
      if (!item.dosis.trim()) {
        newErrors[`${item.localId}_dosis`] = "La dosis es obligatoria.";
      }
      if (!item.duracion.trim()) {
        newErrors[`${item.localId}_duracion`] = "La duración es obligatoria.";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleFinalize() {
    if (!validate()) {
      setFeedback({
        type: "warning",
        text: "Debes completar los campos obligatorios del formulario.",
      });
      return;
    }

    const payload = {
      consulta: {
        id_cita: context.cita.id,
        observaciones: form.observaciones,
        tratamiento: form.tratamiento,
        diagnostico: form.diagnostico,
      },
      prescripciones: {
        id_atencion: context.cita.id,
        tipo: 1,
        items: prescriptionItems
          .filter(
            (item) =>
              item.id_medicamento &&
              item.cantidad &&
              item.dosis.trim() &&
              item.duracion.trim()
          )
          .map((item) => ({
            id_medicamento: Number(item.id_medicamento),
            cantidad: Number(item.cantidad),
            dosis: item.dosis,
            duracion: item.duracion,
          })),
      },
      asistencia: true,
    };

    console.log("Payload final:", payload);
    setFeedback({
      type: "success",
      text: "Frontend listo para conectar con backend.",
    });
  }

  async function handleSaveReferral() {
    try {
      if (!referral.especialidadDestino.trim() || !referral.motivo.trim()) {
        setFeedback({
          type: "warning",
          text: "La remisión requiere especialidad destino y motivo.",
        });
        return;
      }

      const payload = {
        id_paciente: context.paciente.id,
        id_especialidad: Number(referral.especialidadDestino),
        motivo: referral.motivo,
        observaciones: referral.observaciones,
      };

      const response = await fetch(`/referrals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json();
      const wrapped = unwrapBackendResponse(json);

      setShowReferralModal(false);
      setReferral({
        especialidadDestino: "",
        motivo: "",
        observaciones: "",
      });

      setFeedback({
        type: "success",
        text:
          wrapped.message ||
          `Remisión creada correctamente. ID: ${
            wrapped.data?.id_remision ?? "-"
          }`,
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: error.message || "No fue posible crear la remisión.",
      });
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fafafa",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ color: "#404040" }}>
          Cargando información de la consulta...
        </div>
      </div>
    );
  }

  return (
    <MainLayout showHeader={false} showFooter={false}>
      <PageContainer maxWidth="full" className="py-6 md:py-8">
        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 px-6 py-5 text-white">
            <h1 className="text-3xl font-bold">Formulario de Consulta</h1>
            <p className="mt-2 text-sm opacity-95">Registro de atención médica</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" size="sm">
              Cita #{context.cita.id}
            </Badge>
            <Badge variant="success" size="sm">
              Paciente #{context.paciente.id}
            </Badge>
            <Badge variant="warning" size="sm">
              Esp. #{context.especialidad.id}
            </Badge>
          </div>

          {feedback && <Alert variant={feedback.type}>{feedback.text}</Alert>}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_380px]">
            <div className="space-y-6">
              <Card padding={true}>
                <Card.Header>
                  <h2 className="text-lg font-semibold text-neutral-800">
                    Datos de la cita
                  </h2>
                </Card.Header>
                <Card.Body>
                  <div className="grid grid-cols-1 gap-4 text-sm text-neutral-700 md:grid-cols-2">
                    <div>
                      <span className="font-semibold">ID cita:</span>{" "}
                      {context.cita.id}
                    </div>
                    <div>
                      <span className="font-semibold">ID paciente:</span>{" "}
                      {context.paciente.id}
                    </div>
                    <div>
                      <span className="font-semibold">Paciente:</span>{" "}
                      {patientName}
                    </div>
                    <div>
                      <span className="font-semibold">Documento:</span>{" "}
                      {context.paciente.documento}
                    </div>
                    <div>
                      <span className="font-semibold">ID especialidad:</span>{" "}
                      {context.especialidad.id}
                    </div>
                    <div>
                      <span className="font-semibold">Especialidad:</span>{" "}
                      {context.especialidad.nombre}
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <Card padding={true}>
                <Card.Header>
                  <h2 className="text-lg font-semibold text-neutral-800">
                    Consulta
                  </h2>
                </Card.Header>
                <Card.Body>
                  <div className="space-y-4">
                    <TextAreaField
                      label="Observaciones"
                      value={form.observaciones}
                      onChange={(e) =>
                        updateField("observaciones", e.target.value)
                      }
                      error={errors.observaciones}
                      rows={5}
                    />

                    <TextAreaField
                      label="Tratamiento"
                      value={form.tratamiento}
                      onChange={(e) =>
                        updateField("tratamiento", e.target.value)
                      }
                      error={errors.tratamiento}
                      rows={5}
                    />

                    <TextAreaField
                      label="Diagnóstico"
                      value={form.diagnostico}
                      onChange={(e) => updateField("diagnostico", e.target.value)}
                      error={errors.diagnostico}
                      rows={4}
                    />

                    <div className="mt-2">
                      <label className="block text-sm font-medium text-neutral-700">
                        Diagnósticos sugeridos
                      </label>
                      <select
                        className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 bg-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        onChange={(e) => {
                          const selected = diagnosticos.find(
                            (d) => String(d.id) === e.target.value
                          );
                          if (selected) {
                            updateField("diagnostico", selected.nombre);
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="">Seleccione diagnóstico sugerido</option>
                        {diagnosticos.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <Card padding={true}>
                <Card.Header className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-neutral-800">
                    Prescripciones
                  </h2>
                  <Button variant="outline" size="sm" onClick={addPrescriptionItem}>
                    Agregar item
                  </Button>
                </Card.Header>

                <Card.Body>
                  <div className="space-y-4">
                    {prescriptionItems.map((item, index) => (
                      <div
                        key={item.localId}
                        className="rounded-xl border border-neutral-200 p-4"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-neutral-700">
                            Item #{index + 1}
                          </h3>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => removePrescriptionItem(item.localId)}
                          >
                            Quitar
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="md:col-span-2 space-y-1">
                            <label className="block text-sm font-medium text-neutral-700">
                              Medicamento
                            </label>
                            <select
                              value={item.id_medicamento}
                              onChange={(e) =>
                                updatePrescriptionItem(
                                  item.localId,
                                  "id_medicamento",
                                  e.target.value
                                )
                              }
                              className={[
                                "block w-full rounded-lg border px-3 py-2 text-neutral-900 bg-white",
                                "focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
                                errors[`${item.localId}_id_medicamento`]
                                  ? "border-emergency-500 focus:border-emergency-500 focus:ring-emergency-500"
                                  : "border-neutral-300",
                              ].join(" ")}
                            >
                              <option value="">Seleccione medicamento</option>
                              {medicamentos.map((med) => (
                                <option key={med.id} value={med.id}>
                                  {med.nombre}
                                </option>
                              ))}
                            </select>
                            {errors[`${item.localId}_id_medicamento`] && (
                              <p className="text-sm text-emergency-600">
                                {errors[`${item.localId}_id_medicamento`]}
                              </p>
                            )}
                          </div>

                          <Input
                            label="Cantidad"
                            type="number"
                            min="1"
                            value={item.cantidad}
                            onChange={(e) =>
                              updatePrescriptionItem(
                                item.localId,
                                "cantidad",
                                e.target.value
                              )
                            }
                            error={errors[`${item.localId}_cantidad`]}
                          />

                          <Input
                            label="Dosis"
                            value={item.dosis}
                            onChange={(e) =>
                              updatePrescriptionItem(
                                item.localId,
                                "dosis",
                                e.target.value
                              )
                            }
                            error={errors[`${item.localId}_dosis`]}
                          />

                          <div className="md:col-span-2">
                            <Input
                              label="Duración"
                              value={item.duracion}
                              onChange={(e) =>
                                updatePrescriptionItem(
                                  item.localId,
                                  "duracion",
                                  e.target.value
                                )
                              }
                              error={errors[`${item.localId}_duracion`]}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <h3 className="mb-2 text-sm font-semibold text-neutral-700">
                      Lista de items agregados
                    </h3>
                    <div className="space-y-2">
                      {prescriptionItems.filter((item) => item.id_medicamento)
                        .length === 0 && (
                        <p className="text-sm text-neutral-500">
                          No hay items agregados todavía.
                        </p>
                      )}

                      {prescriptionItems
                        .filter((item) => item.id_medicamento)
                        .map((item) => {
                          const med = medicamentos.find(
                            (m) => String(m.id) === String(item.id_medicamento)
                          );

                          return (
                            <div
                              key={`summary-${item.localId}`}
                              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700"
                            >
                              <span className="font-medium">
                                {med?.nombre ?? "Medicamento"}
                              </span>
                              {" · "}Cantidad: {item.cantidad || "-"}
                              {" · "}Dosis: {item.dosis || "-"}
                              {" · "}Duración: {item.duracion || "-"}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <div className="flex flex-wrap justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowReferralModal(true)}
                >
                  Crear Remisión
                </Button>
                <Button onClick={handleFinalize}>Finalizar Consulta</Button>
              </div>
            </div>

            <div>
              <Card padding={true}>
                <Card.Header>
                  <h2 className="text-lg font-semibold text-neutral-800">
                    Historia clínica del paciente
                  </h2>
                </Card.Header>
                <Card.Body>
                  <div className="space-y-3 text-sm text-neutral-700">
                    <div>
                      <span className="font-semibold">Nombre:</span> {patientName}
                    </div>
                    <div>
                      <span className="font-semibold">Documento:</span>{" "}
                      {context.paciente.documento}
                    </div>
                    <div>
                      <span className="font-semibold">Edad:</span>{" "}
                      {context.paciente.edad}
                    </div>
                    <div>
                      <span className="font-semibold">Sexo:</span>{" "}
                      {context.paciente.sexo}
                    </div>
                    <div>
                      <p className="mb-1 font-semibold">Antecedentes</p>
                      <ul className="list-disc space-y-1 pl-5 text-neutral-600">
                        {context.historiaClinica.antecedentes.map(
                          (item, index) => (
                            <li key={`${item}-${index}`}>{item}</li>
                          )
                        )}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-1 font-semibold">Alergias</p>
                      <div className="flex flex-wrap gap-2">
                        {context.historiaClinica.alergias.map((item, index) => (
                          <Badge
                            key={`${item}-${index}`}
                            variant="error"
                            size="sm"
                          >
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>

        <Modal
          open={showReferralModal}
          onClose={() => setShowReferralModal(false)}
          title="Crear Remisión"
          size="lg"
          footer={
            <>
              <Button
                variant="ghost"
                onClick={() => setShowReferralModal(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveReferral}>Guardar remisión</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Especialidad destino"
              value={referral.especialidadDestino}
              onChange={(e) =>
                setReferral((prev) => ({
                  ...prev,
                  especialidadDestino: e.target.value,
                }))
              }
            />
            <TextAreaField
              label="Motivo"
              value={referral.motivo}
              onChange={(e) =>
                setReferral((prev) => ({
                  ...prev,
                  motivo: e.target.value,
                }))
              }
              rows={4}
              name="motivo-remision"
            />
            <TextAreaField
              label="Observaciones"
              value={referral.observaciones}
              onChange={(e) =>
                setReferral((prev) => ({
                  ...prev,
                  observaciones: e.target.value,
                }))
              }
              rows={4}
              name="observaciones-remision"
            />
          </div>
        </Modal>
      </PageContainer>
    </MainLayout>
  );
}
