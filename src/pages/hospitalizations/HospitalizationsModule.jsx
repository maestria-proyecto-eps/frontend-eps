import React from "react";
import { AuthContext } from "../../services/auth/AuthContext";
import { http } from "../../services/api/http";
import { PageFeedback, Spinner } from "../../components/ui";
import PrescriptionItemsForm from "../../components/prescriptions/PrescriptionItemsForm";
import {
  buildPrescriptionApiPayload,
  validatePrescriptionItems,
} from "../../components/prescriptions/prescriptionFormUtils";

const EMERGENCY_API = "";
const MEDICAL_API = "";

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];
const MEDICATION_ITEMS_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const HOSPITALIZATION_ATTENTION_CACHE_KEY =
  "eps_hospitalization_attention_ids";

const STATUS_LABEL = {
  0: "Por ingresar",
  1: "Ingresado",
  2: "Salido",
};

const STATUS_CLASS = {
  0: "bg-secondary-50 text-secondary-700 border-secondary-100",
  1: "bg-primary-50 text-primary-700 border-primary-100",
  2: "bg-neutral-100 text-neutral-700 border-neutral-200",
};

const FALLBACK_DIAGNOSES = [
  { id_diagnostico: 1, nombre_enfermedad: "Hipertensión" },
  { id_diagnostico: 2, nombre_enfermedad: "Diabetes" },
  { id_diagnostico: 3, nombre_enfermedad: "Infección respiratoria" },
];

const HOSPITALIZATION_PRESCRIPTION_TYPE = 3;

const API = {
  hospitalizations: {
    list: `${EMERGENCY_API}/api/hospitalizacion/`,
    ingreso: (id) => `${EMERGENCY_API}/api/hospitalizacion/ingreso/${id}`,
    salida: (id) => `${EMERGENCY_API}/api/hospitalizacion/salida/${id}`,
    prescriptionItems: (id) =>
      `${MEDICAL_API}/api/prescriptions/items/hospitalizacion/${id}`,
    medicationAdministration: `${MEDICAL_API}/api/administracion_medicamentos`,
    medicationAdministrationByHospitalization: (id) =>
      `${MEDICAL_API}/api/administracion_medicamentos/${id}`,
    createAttention: `${EMERGENCY_API}/api/hospitalizacion/atencion`,
    attentionsByHospitalization: (id) =>
      `${EMERGENCY_API}/api/hospitalizacion/atencion/${id}`,
    createPrescription: `${MEDICAL_API}/api/prescriptions/`,
    prescriptionsList: `${MEDICAL_API}/api/prescriptions/`,
  },
  diagnoses: {
    search: `${MEDICAL_API}/api/diagnosticos/search`,
  },
};

function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params || {}).filter(([, value]) => {
      return value !== "" && value !== null && value !== undefined;
    })
  );
}

function parseOptionalInt(value) {
  if (value === "" || value === null || value === undefined) return undefined;
  const parsed = parseInt(String(value).trim(), 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function unwrapDiagnoses(response) {
  const payload = unwrapPayload(response);
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.Data)) return payload.Data;
  return [];
}

function cleanPayload(payload) {
  if (Array.isArray(payload)) {
    return payload.map(cleanPayload);
  }
  if (payload && typeof payload === "object") {
    return Object.fromEntries(
      Object.entries(payload)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, cleanPayload(value)])
    );
  }
  return payload;
}

function unwrapPayload(response) {
  return response?.Data ?? response?.data ?? response;
}

function unwrapArray(response) {
  const payload = unwrapPayload(response);
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.Data)) return payload.Data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.records)) return payload.records;
  return [];
}

function unwrapPrescriptionRows(responseData) {
  const payload = unwrapPayload(responseData);
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.Data)) return payload.Data;
  return [];
}

function readHospitalizationAttentionCache() {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(HOSPITALIZATION_ATTENTION_CACHE_KEY) || "{}"
    );
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function rememberHospitalizationAttentionId(idHospitalizacion, idAtencion) {
  const hospitalizationId = Number(idHospitalizacion);
  const attentionId = Number(idAtencion);
  if (
    !Number.isFinite(hospitalizationId) ||
    hospitalizationId <= 0 ||
    !Number.isFinite(attentionId) ||
    attentionId <= 0 ||
    typeof window === "undefined"
  ) {
    return;
  }

  const cache = readHospitalizationAttentionCache();
  const key = String(hospitalizationId);
  const current = Array.isArray(cache[key]) ? cache[key] : [];
  const next = Array.from(new Set([...current, attentionId]));
  window.localStorage.setItem(
    HOSPITALIZATION_ATTENTION_CACHE_KEY,
    JSON.stringify({ ...cache, [key]: next })
  );
}

function rememberHospitalizationAttentionRows(idHospitalizacion, rows) {
  (rows || []).forEach((row) => {
    const attentionId = getHospitalizationAttentionId(row);
    if (attentionId) {
      rememberHospitalizationAttentionId(idHospitalizacion, attentionId);
    }
  });
}

function getHospitalizationAttentionId(responseData) {
  const payload = unwrapPayload(responseData);
  const raw =
    payload?.id_atencionh ??
    payload?.id_atencion ??
    responseData?.id_atencionh ??
    responseData?.id_atencion;
  const numeric = Number(raw);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function unwrapHospitalizationPrescriptionItems(responseData) {
  if (responseData && typeof responseData === "object") {
    assertBackendSuccess(
      responseData,
      "No fue posible cargar los ítems de prescripción."
    );
  }
  const rows = unwrapArray(responseData);
  if (rows.length > 0) {
    return { rows, total: unwrapTotal(responseData) };
  }
  const payload = unwrapPayload(responseData);
  if (Array.isArray(payload?.data)) {
    return {
      rows: payload.data,
      total:
        unwrapTotal(responseData) ??
        payload.total ??
        payload.total_items ??
        payload.data.length,
    };
  }
  return { rows: [], total: 0 };
}

function buildHospitalizationPrescriptionItemsParams(page, pageSize) {
  return {
    page: Number(page) || 1,
    page_size: Math.min(Math.max(Number(pageSize) || 10, 10), 100),
  };
}

function buildPrescriptionListParams(idAtencion) {
  return cleanParams({
    idAtencion: Number(idAtencion),
    tipo: HOSPITALIZATION_PRESCRIPTION_TYPE,
    pag: 1,
    cantidad: 50,
  });
}

async function loadPrescriptionsByAttentionId(idAtencion) {
  const attentionId = Number(idAtencion);
  if (!Number.isFinite(attentionId) || attentionId <= 0) return [];

  const { data } = await http.get(API.hospitalizations.prescriptionsList, {
    params: buildPrescriptionListParams(attentionId),
  });
  if (data && typeof data === "object") {
    assertBackendSuccess(
      data,
      "No fue posible cargar las prescripciones de la atención."
    );
  }
  return unwrapPrescriptionRows(data);
}

async function postHospitalizationPrescription({
  idAtencionHospitalizacion,
  idHospitalizacion,
  prescriptionItems,
}) {
  const payload = buildPrescriptionApiPayload(
    idAtencionHospitalizacion,
    prescriptionItems,
    HOSPITALIZATION_PRESCRIPTION_TYPE
  );

  try {
    const response = await http.post(API.hospitalizations.createPrescription, payload);
    return { response, payload };
  } catch (error) {
    console.error("Error creando prescripción de hospitalización:", {
      payload,
      response: error?.response?.data,
    });
    throw error;
  }
}

function unwrapTotal(response) {
  const payload = unwrapPayload(response);
  const candidates = [
    response?.total,
    response?.Total,
    response?.count,
    response?.Count,
    response?.totalItems,
    response?.total_items,
    response?.totalRegistros,
    response?.total_registros,
    payload?.total,
    payload?.Total,
    payload?.count,
    payload?.Count,
    payload?.totalItems,
    payload?.total_items,
    payload?.totalRegistros,
    payload?.total_registros,
  ];
  const found = candidates.find((value) => Number.isFinite(Number(value)));
  return found === undefined ? null : Number(found);
}

function sortHospitalizationsByEstado(rows) {
  const order = { 1: 0, 0: 1, 2: 2 };
  function getDateValue(value) {
    if (!value) return null;
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : null;
  }

  return [...rows].sort(
    (a, b) => {
      const statusDiff =
        (order[getStatusNumber(a.estado)] ?? 9) -
        (order[getStatusNumber(b.estado)] ?? 9);
      if (statusDiff !== 0) return statusDiff;

      const aSalida = getDateValue(a.salida ?? a.fecha_salida);
      const bSalida = getDateValue(b.salida ?? b.fecha_salida);
      const aHasSalida = aSalida !== null;
      const bHasSalida = bSalida !== null;

      if (aHasSalida !== bHasSalida) {
        return aHasSalida ? 1 : -1;
      }

      if (aHasSalida && bHasSalida && aSalida !== bSalida) {
        return bSalida - aSalida;
      }

      const aIngreso = getDateValue(a.ingreso ?? a.fecha_ingreso);
      const bIngreso = getDateValue(b.ingreso ?? b.fecha_ingreso);
      if (aIngreso !== bIngreso) {
        if (aIngreso === null) return 1;
        if (bIngreso === null) return -1;
        return bIngreso - aIngreso;
      }

      return 0;
    }
  );
}

function buildPagedParams(page, pageSize, extra = {}) {
  return cleanParams({
    pag: page,
    cantidad: pageSize,
    ...extra,
  });
}

function toIsoDateTimeStart(dateStr) {
  if (!dateStr) return undefined;
  return `${dateStr}T00:00:00`;
}

function toIsoDateTimeEnd(dateStr) {
  if (!dateStr) return undefined;
  return `${dateStr}T23:59:59`;
}

function buildMedicationAdministrationListParams(filters) {
  const params = {};
  const idEnfermera = parseOptionalInt(filters.id_enfermera);

  if (idEnfermera !== undefined) {
    params.id_enfermera = idEnfermera;
  }
  if (filters.fecha_inicio) {
    params.fecha_inicio = toIsoDateTimeStart(filters.fecha_inicio);
  }
  if (filters.fecha_fin) {
    params.fecha_fin = toIsoDateTimeEnd(filters.fecha_fin);
  }

  return params;
}

function getApiErrorMessage(error, fallback) {
  const data = error?.response?.data;
  if (typeof data?.Message === "string") return data.Message;
  if (typeof data?.message === "string") return data.message;
  if (data?.hasError && typeof data?.message === "string") return data.message;
  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((item) => item?.msg || item?.message || JSON.stringify(item))
      .join(" ");
  }
  if (data && typeof data === "object") {
    const nested = data?.data?.message || data?.Data?.message;
    if (typeof nested === "string") return nested;
    try {
      const serialized = JSON.stringify(data);
      if (serialized && serialized !== "{}") return serialized;
    } catch {
      // Continúa con el fallback si la respuesta no es serializable.
    }
  }
  return fallback;
}

function assertBackendSuccess(responseData, fallback) {
  if (!responseData || typeof responseData !== "object") return responseData;
  if (responseData.hasError) {
    throw new Error(
      responseData.message ||
        responseData.Message ||
        fallback ||
        "El backend reportó un error."
    );
  }
  return responseData;
}

function normalizeDate(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function formatDateTime(value) {
  if (value == null || value === "") return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const pad = (n) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function getHospitalizationId(hospitalization) {
  const raw =
    hospitalization?.id_hospitalizacion ??
    hospitalization?.idHospitalizacion ??
    hospitalization?.id;
  const numeric = Number(raw);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function toApiValue(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && String(value).trim() !== ""
    ? numeric
    : value;
}

function getStatusNumber(value) {
  if (value === 0 || value === 1 || value === 2) return value;
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  if (normalized === "0" || normalized.includes("por ingresar")) return 0;
  if (normalized === "1" || normalized.includes("ingresado")) return 1;
  if (normalized === "2" || normalized.includes("salido")) return 2;
  return 0;
}

function normalizeHospitalization(row, index) {
  const paciente =
    row?.paciente || row?.Paciente || row?.patient || row?.paciente_info || {};
  const ingresoRaw =
    row?.ingreso ?? row?.fecha_ingreso ?? row?.fechaIngreso ?? null;
  const salidaRaw =
    row?.salida ?? row?.fecha_salida ?? row?.fechaSalida ?? null;
  return {
    ...row,
    id_hospitalizacion:
      row?.id_hospitalizacion ??
      row?.idHospitalizacion ??
      row?.id ??
      index + 1,
    id_paciente:
      row?.id_paciente ??
      row?.idPaciente ??
      row?.num_doc_paciente ??
      paciente?.id_paciente ??
      paciente?.idPaciente ??
      paciente?.id ??
      "",
    num_doc_paciente:
      row?.num_doc_paciente ??
      paciente?.num_doc_paciente ??
      "",
    nombres:
      row?.nombres ??
      row?.nombre_paciente ??
      row?.nombrePaciente ??
      paciente?.nombres ??
      paciente?.nombre ??
      "",
    apellidos:
      row?.apellidos ??
      row?.apellido_paciente ??
      row?.apellidoPaciente ??
      paciente?.apellidos ??
      paciente?.apellido ??
      "",
    num_documento:
      row?.num_documento ??
      row?.num_doc_paciente ??
      row?.documento_paciente ??
      row?.documentoPaciente ??
      paciente?.num_documento ??
      paciente?.documento ??
      "",
    num_cama: row?.num_cama ?? row?.cama ?? "",
    id_urgencia:
      row?.id_urgencia ??
      row?.idUrgencia ??
      row?.urgencia?.id_urgencia ??
      row?.urgencia?.id ??
      "",
    estado: getStatusNumber(row?.estado),
    ingreso: ingresoRaw,
    salida: salidaRaw,
    fecha_ingreso: normalizeDate(ingresoRaw),
    fecha_salida: normalizeDate(salidaRaw),
  };
}

function getComputedTotalPages(totalRows, currentPage, pageSize, currentRowsCount) {
  if (Number.isFinite(totalRows) && totalRows !== null) {
    return Math.max(1, Math.ceil(totalRows / pageSize));
  }
  if (currentRowsCount >= pageSize) {
    return currentPage + 1;
  }
  return Math.max(1, currentPage);
}

function getAuthDoctorId(auth) {
  const raw =
    auth?.payload?.num_documento ??
    auth?.payload?.id_doctor ??
    auth?.payload?.doctor?.id_doctor ??
    auth?.payload?.medico?.id_doctor ??
    auth?.payload?.idDoctor ??
    undefined;
  const numeric = Number(raw);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined;
}

function getAuthNurseId(auth) {
  return (
    auth?.payload?.id_enfermera ??
    auth?.payload?.id_enfermero ??
    auth?.payload?.num_documento ??
    auth?.payload?.enfermera?.id_enfermera ??
    auth?.payload?.id_usuario ??
    auth?.payload?.id ??
    undefined
  );
}

function getPrescriptionItemId(item) {
  return (
    item?.id_items ??
    item?.id_prescripcion_item ??
    item?.id_prescripciones_item ??
    item?.id_prescripcionItems ??
    item?.id_prescripcion_items ??
    item?.id_item ??
    item?.prescripcion_item?.id_items ??
    item?.prescripcion_item?.id_prescripcion_item ??
    item?.prescripcion_item?.id_prescripciones_item ??
    item?.prescripcion_item?.id_prescripcion_items ??
    item?.admin_item_detalle?.id_prescripcion_item ??
    item?.id
  );
}

function parsePositiveInt(value) {
  const parsed = parseOptionalInt(value);
  return parsed !== undefined && parsed > 0 ? parsed : undefined;
}

/** Máximo de administraciones: duración (veces/días) o cantidad como respaldo. */
function getPrescribedAdministrationLimit(item) {
  const prescriptionItem = item?.prescripcion_item || item;
  const duracion = parsePositiveInt(prescriptionItem?.duracion);
  if (duracion) return duracion;
  const cantidad = parsePositiveInt(prescriptionItem?.cantidad);
  if (cantidad) return cantidad;
  return 1;
}

function buildAdministrationCountByItemId(administrations) {
  const counts = new Map();
  (administrations || []).forEach((admin) => {
    const entries = admin?.items_administrados;
    if (!Array.isArray(entries)) return;
    entries.forEach((entry) => {
      const id =
        entry?.prescripcion_item?.id_items ??
        entry?.prescripcion_item?.id_prescripcion_item ??
        entry?.admin_item_detalle?.id_prescripcion_item;
      if (id === null || id === undefined) return;
      const key = String(id);
      counts.set(key, (counts.get(key) || 0) + 1);
    });
  });
  return counts;
}

function getItemAdministrationStatus(item, adminCountByItemId) {
  const itemId = getPrescriptionItemId(item);
  const limit = getPrescribedAdministrationLimit(item);
  if (itemId === null || itemId === undefined || itemId === "") {
    return { administered: 0, limit, remaining: 0, exhausted: true };
  }
  const administered = adminCountByItemId.get(String(itemId)) || 0;
  const remaining = Math.max(0, limit - administered);
  return {
    administered,
    limit,
    remaining,
    exhausted: remaining <= 0,
  };
}

function getMedicationName(item) {
  const prescriptionItem = item?.prescripcion_item || item;
  const medication = item?.medicamento || prescriptionItem?.medicamento || {};
  return (
    medication?.nombre_medicamento ??
    medication?.nombre_generico ??
    medication?.principio_activo ??
    medication?.nombre ??
    medication?.compuesto ??
    prescriptionItem?.nombre_medicamento ??
    prescriptionItem?.nombre_generico ??
    prescriptionItem?.principio_activo ??
    prescriptionItem?.nombre ??
    prescriptionItem?.compuesto ??
    "Medicamento"
  );
}

function buildMedicationMap(medicationsRows) {
  const medicationMap = new Map();
  (medicationsRows || []).forEach((medication) => {
    const medicationIdRaw =
      medication?.codigo ?? medication?.id_medicamento ?? medication?.id;
    if (
      medicationIdRaw === null ||
      medicationIdRaw === undefined ||
      medicationIdRaw === ""
    ) {
      return;
    }
    medicationMap.set(String(medicationIdRaw), medication);
  });
  return medicationMap;
}

function getMedicationDisplayLabel(item, medicationMap) {
  const medicationId =
    item?.id_medicamento ??
    item?.codigo ??
    item?.medicamento?.codigo ??
    item?.medication?.codigo;
  const catalogItem =
    medicationId !== null &&
    medicationId !== undefined &&
    medicationMap?.size > 0
      ? medicationMap.get(String(medicationId))
      : null;
  const med = item?.medicamento || item?.medication || catalogItem || {};

  const principioActivo = [
    item?.principio_activo,
    med?.principio_activo,
    item?.nombre_generico,
    med?.nombre_generico,
  ]
    .map((value) => String(value ?? "").trim())
    .find(Boolean);

  const nombreMedicamento = [
    item?.nombre_medicamento,
    med?.nombre_medicamento,
    item?.nombre_compuesto,
    item?.medicamento?.nombre,
    med?.nombre,
    item?.nombre_generico,
    med?.nombre_generico,
  ]
    .map((value) => String(value ?? "").trim())
    .find((value) => value && value !== principioActivo);

  const labelParts = [];
  if (principioActivo) labelParts.push(principioActivo);
  if (nombreMedicamento) labelParts.push(nombreMedicamento);

  if (labelParts.length > 0) {
    return labelParts.join(" · ");
  }

  const fallback = getMedicationName(item);
  return fallback === "Medicamento" ? "—" : fallback;
}

function getMedicationCatalogEntry(item, medicationMap) {
  const medicationId =
    item?.id_medicamento ??
    item?.codigo ??
    item?.medicamento?.codigo ??
    item?.medication?.codigo;
  const catalogItem =
    medicationId !== null &&
    medicationId !== undefined &&
    medicationMap?.size > 0
      ? medicationMap.get(String(medicationId))
      : null;
  return item?.medicamento || item?.medication || catalogItem || {};
}

function getMedicationPresentation(item, medicationMap) {
  const med = getMedicationCatalogEntry(item, medicationMap);
  return String(item?.presentacion || med?.presentacion || "").trim();
}

function getQuantityUnitLabel(presentacion) {
  const lower = presentacion.toLowerCase();
  if (lower.includes("tableta")) return { one: "pastilla", many: "pastillas" };
  if (lower.includes("cápsula") || lower.includes("capsula")) {
    return { one: "cápsula", many: "cápsulas" };
  }
  if (lower.includes("gota")) return { one: "gota", many: "gotas" };
  if (
    lower.includes("jarabe") ||
    lower.includes("solución") ||
    lower.includes("solucion") ||
    /\bml\b/.test(lower)
  ) {
    return { one: "ml", many: "ml" };
  }
  if (
    lower.includes("ampolla") ||
    lower.includes("inyectable") ||
    lower.includes("inyección") ||
    lower.includes("inyeccion")
  ) {
    return { one: "ampolla", many: "ampollas" };
  }
  if (lower.includes("caja")) return { one: "caja", many: "cajas" };
  if (lower.includes("frasco")) return { one: "frasco", many: "frascos" };
  if (lower.includes("sobre")) return { one: "sobre", many: "sobres" };
  return { one: "unidad", many: "unidades" };
}

function formatQuantityWithUnit(cantidad, presentacion) {
  if (cantidad === null || cantidad === undefined || String(cantidad).trim() === "") {
    return "—";
  }
  const numeric = Number(cantidad);
  const value = Number.isFinite(numeric) ? numeric : String(cantidad).trim();
  const units = getQuantityUnitLabel(presentacion);
  const unitLabel =
    Number.isFinite(numeric) && Math.abs(numeric) === 1 ? units.one : units.many;
  return `${value} ${unitLabel}`;
}

function formatDurationWithUnit(duracion) {
  if (duracion === null || duracion === undefined || String(duracion).trim() === "") {
    return "—";
  }
  const raw = String(duracion).trim();
  if (/d[ií]as?/i.test(raw)) return raw;
  const numeric = parseInt(raw, 10);
  if (!Number.isFinite(numeric)) return `${raw} días`;
  return numeric === 1 ? "1 día" : `${numeric} días`;
}

function getDiagnosisId(item) {
  return item?.id_diagnostico ?? item?.id ?? item?.codigo;
}

function getDiagnosisName(item) {
  return (
    item?.nombre_enfermedad ??
    item?.nombre ??
    item?.descripcion ??
    item?.diagnostico ??
    "Diagnóstico"
  );
}

function buildHospitalizationParams(filters, page, pageSize) {
  const params = { pag: page, cantidad: pageSize };

  if (filters.num_cama !== "" && filters.num_cama != null) {
    params.num_cama = parseOptionalInt(filters.num_cama);
  }

  if (filters.fecha_ingreso_inicio) params.fecha_ingreso_inicio = filters.fecha_ingreso_inicio;
  if (filters.fecha_ingreso_fin) params.fecha_ingreso_fin = filters.fecha_ingreso_fin;
  if (filters.fecha_salida_inicio) params.fecha_salida_inicio = filters.fecha_salida_inicio;
  if (filters.fecha_salida_fin) params.fecha_salida_fin = filters.fecha_salida_fin;

  return params;
}

function buildAttentionParams(filters, page, pageSize) {
  return buildPagedParams(page, pageSize, {
    id_paciente: parseOptionalInt(filters.id_paciente),
    id_doctor: parseOptionalInt(filters.id_doctor),
    fecha_inicio: toIsoDateTimeStart(filters.fecha_inicio),
    fecha_fin: toIsoDateTimeEnd(filters.fecha_fin),
    id_diagnostico: parseOptionalInt(filters.id_diagnostico),
  });
}

const EMPTY_ATTENTION_FILTERS = {
  id_paciente: "",
  id_doctor: "",
  fecha_inicio: "",
  fecha_fin: "",
  id_diagnostico: "",
};

function unwrapBackendResponse(responseData) {
  if (!responseData || typeof responseData !== "object") {
    return { message: "", data: responseData };
  }
  if (responseData.hasError) {
    throw new Error(responseData.message || "El backend reportó un error.");
  }
  return {
    message: responseData.message || "",
    data: responseData.data ?? responseData,
  };
}

function filterHospitalizationsLocally(rows, filters) {
  const idPacienteActivo = parseOptionalInt(filters.id_paciente);
  const estadoActivo = parseOptionalInt(filters.estado);

  return rows.filter((row) => {
    if (idPacienteActivo !== undefined) {
      const rowIdPaciente = parseOptionalInt(row.id_paciente);
      if (rowIdPaciente !== idPacienteActivo) return false;
    }

    if (estadoActivo !== undefined) {
      if (getStatusNumber(row.estado) !== estadoActivo) return false;
    }

    return true;
  });
}

export default function HospitalizationsModule({ role }) {
  const auth = React.useContext(AuthContext);
  const isNurse = role === "nurse";
  const isDoctor = role === "doctor";

  const [hospitalizations, setHospitalizations] = React.useState([]);
  const [totalRows, setTotalRows] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");

  const [filters, setFilters] = React.useState({
    id_paciente: "",
    num_cama: "",
    estado: "",
    fecha_ingreso_inicio: "",
    fecha_ingreso_fin: "",
    fecha_salida_inicio: "",
    fecha_salida_fin: "",
  });

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const [modal, setModal] = React.useState(null);
  const [selectedHospitalization, setSelectedHospitalization] =
    React.useState(null);

  const loadHospitalizations = React.useCallback(
    async (nextPage = page, nextPageSize = pageSize, filtersOverride) => {
      const activeFilters = filtersOverride ?? filters;
      setLoading(true);
      setError("");
      setMessage("");
      try {
        const { data } = await http.get(API.hospitalizations.list, {
          params: buildHospitalizationParams(activeFilters, 1, 9999),
        });
        const allRows = sortHospitalizationsByEstado(
          unwrapArray(data).map(normalizeHospitalization)
        );

        const rowsFiltradasPorEstado = filterHospitalizationsLocally(
          allRows,
          activeFilters
        );

        const totalRegistros = rowsFiltradasPorEstado.length;
        const start = (nextPage - 1) * nextPageSize;
        const paginaActual = rowsFiltradasPorEstado.slice(
          start,
          start + nextPageSize
        );

        setHospitalizations(paginaActual);
        setTotalRows(totalRegistros);
      } catch (err) {
        setHospitalizations([]);
        setTotalRows(null);
        setError(
          getApiErrorMessage(err, "No fue posible cargar las hospitalizaciones.")
        );
      } finally {
        setLoading(false);
      }
    },
    [filters, page, pageSize]
  );

  React.useEffect(() => {
    if (!auth?.token) return;
    loadHospitalizations(page, pageSize);
  }, [auth?.token, loadHospitalizations, page, pageSize]);

  const totalRegistros = Number.isFinite(totalRows) && totalRows !== null ? totalRows : hospitalizations.length;
  const totalPages = Math.max(1, Math.ceil(totalRegistros / pageSize));

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }

  function applyFilters() {
    setPage(1);
    loadHospitalizations(1, pageSize);
  }

  function clearFilters() {
    const emptyFilters = {
      id_paciente: "",
      num_cama: "",
      estado: "",
      fecha_ingreso_inicio: "",
      fecha_ingreso_fin: "",
      fecha_salida_inicio: "",
      fecha_salida_fin: "",
    };
    setFilters(emptyFilters);
    setPage(1);
    loadHospitalizations(1, pageSize, emptyFilters);
  }

  function openModal(type, hospitalization) {
    setSelectedHospitalization(hospitalization);
    setModal(type);
    setError("");
    setMessage("");
  }

  function closeModal() {
    setModal(null);
    setSelectedHospitalization(null);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-secondary-600">
          {isNurse ? "Módulo de enfermería" : "Módulo médico"}
        </p>
        <h1 className="mt-1 text-2xl md:text-3xl font-bold text-neutral-900">
          Gestión de Hospitalizaciones
        </h1>
        <p className="mt-2 text-neutral-600">
          Visualiza hospitalizaciones, filtra registros y ejecuta acciones
          según el estado del proceso.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <StatusBadge estado={0} />
          <StatusBadge estado={1} />
          <StatusBadge estado={2} />
        </div>
      </section>

      <PageFeedback message={message} error={error} />

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Filtros</h2>
            <p className="text-sm text-neutral-600">
              Los filtros se aplican en el servidor. Usa ID de paciente, cama,
              estado y rangos de fechas de ingreso/salida.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => loadHospitalizations(page, pageSize)}
              className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              title="Refrescar hospitalizaciones"
              aria-label="Refrescar hospitalizaciones"
            >
              Refrescar
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={applyFilters}
              className="rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600"
            >
              Aplicar filtros
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Field label="ID paciente">
            <Input
              type="number"
              min="1"
              value={filters.id_paciente}
              onChange={(e) => updateFilter("id_paciente", e.target.value)}
              placeholder="ID del paciente"
            />
          </Field>
          <Field label="Número de cama">
            <Input
              value={filters.num_cama}
              onChange={(e) => updateFilter("num_cama", e.target.value)}
              placeholder="Ej: 302"
            />
          </Field>
          <Field label="Estado">
            <Select
              value={filters.estado}
              onChange={(e) => updateFilter("estado", e.target.value)}
            >
              <option value="">Todos</option>
              <option value="0">Por ingresar</option>
              <option value="1">Ingresado</option>
              <option value="2">Salido</option>
            </Select>
          </Field>
          <Field label="Ingreso desde">
            <Input
              type="date"
              value={filters.fecha_ingreso_inicio}
              onChange={(e) =>
                updateFilter("fecha_ingreso_inicio", e.target.value)
              }
            />
          </Field>
          <Field label="Ingreso hasta">
            <Input
              type="date"
              value={filters.fecha_ingreso_fin}
              onChange={(e) =>
                updateFilter("fecha_ingreso_fin", e.target.value)
              }
            />
          </Field>
          <Field label="Salida desde">
            <Input
              type="date"
              value={filters.fecha_salida_inicio}
              onChange={(e) =>
                updateFilter("fecha_salida_inicio", e.target.value)
              }
            />
          </Field>
          <Field label="Salida hasta">
            <Input
              type="date"
              value={filters.fecha_salida_fin}
              onChange={(e) =>
                updateFilter("fecha_salida_fin", e.target.value)
              }
            />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              Hospitalizaciones
            </h2>
            <p className="text-sm text-neutral-600">
              Mostrando {hospitalizations.length} registros de {totalRegistros} totales
            </p>
          </div>
          <PaginationControls
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-neutral-600">
            Cargando hospitalizaciones...
          </div>
        ) : hospitalizations.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            No hay hospitalizaciones que coincidan con los filtros.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <Th>ID</Th>
                  <Th>ID paciente</Th>
                  <Th>Paciente</Th>
                  <Th>Cama</Th>
                  <Th>Estado</Th>
                  <Th>Fecha ingreso</Th>
                  <Th>Fecha salida</Th>
                  <Th>Acciones</Th>
                  <Th>Detalle</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {hospitalizations.map((row) => (
                  <HospitalizationRow
                    key={row.id_hospitalizacion}
                    row={row}
                    isNurse={isNurse}
                    isDoctor={isDoctor}
                    openModal={openModal}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modal === "detail" && selectedHospitalization && (
        <HospitalizationDetailModal
          data={selectedHospitalization}
          onClose={closeModal}
        />
      )}

      {modal === "ingreso" && selectedHospitalization && (
        <AdmissionModal
          hospitalization={selectedHospitalization}
          onClose={closeModal}
          onDone={() => loadHospitalizations(page, pageSize)}
          setError={setError}
          setMessage={setMessage}
        />
      )}

      {modal === "salida" && selectedHospitalization && (
        <DischargeModal
          hospitalization={selectedHospitalization}
          onClose={closeModal}
          onDone={() => loadHospitalizations(page, pageSize)}
          setError={setError}
          setMessage={setMessage}
        />
      )}

      {modal === "createMedicationAdministration" &&
        selectedHospitalization && (
          <CreateMedicationAdministrationModal
            hospitalization={selectedHospitalization}
            auth={auth}
            onClose={closeModal}
            setError={setError}
            setMessage={setMessage}
          />
        )}

      {modal === "viewMedicationAdministration" && selectedHospitalization && (
        <MedicationAdministrationListModal
          hospitalization={selectedHospitalization}
          onClose={closeModal}
          setError={setError}
        />
      )}

      {modal === "createAttention" && selectedHospitalization && (
        <CreateAttentionModal
          key={selectedHospitalization.id_hospitalizacion}
          hospitalization={selectedHospitalization}
          auth={auth}
          onClose={closeModal}
          onDone={() => loadHospitalizations(page, pageSize)}
          setError={setError}
          setMessage={setMessage}
        />
      )}

      {modal === "viewAttentions" && selectedHospitalization && (
        <AttentionListModal
          hospitalization={selectedHospitalization}
          onClose={closeModal}
          setError={setError}
        />
      )}
    </div>
  );
}

function HospitalizationRow({ row, isNurse, isDoctor, openModal }) {
  const patientName =
    `${row.nombres || ""} ${row.apellidos || ""}`.trim() || "—";

  return (
    <tr className="hover:bg-neutral-50">
      <Td>{row.id_hospitalizacion}</Td>
      <Td>{row.id_paciente || row.num_doc_paciente || "—"}</Td>
      <Td>
        <span className="font-medium text-neutral-900">{patientName}</span>
        {row.num_documento ? (
          <span className="block text-xs text-neutral-500">
            Doc. {row.num_documento}
          </span>
        ) : null}
      </Td>
      <Td>{row.num_cama || "—"}</Td>
      <Td>
        <StatusBadge estado={row.estado} />
      </Td>
      <Td>{formatDateTime(row.ingreso ?? row.fecha_ingreso)}</Td>
      <Td>{formatDateTime(row.salida ?? row.fecha_salida)}</Td>
      <Td>
        <RowActionsMenu
          row={row}
          isNurse={isNurse}
          isDoctor={isDoctor}
          openModal={openModal}
        />
      </Td>
      <Td>
        <DetailLink onClick={() => openModal("detail", row)}>
          Ver detalle
        </DetailLink>
      </Td>
    </tr>
  );
}

function RowActionsMenu({ row, isNurse, isDoctor, openModal }) {
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef(null);

  const canAdmission = row.estado === 0;
  const canCreateMedicationAdministration = row.estado === 1;
  const canDischarge = row.estado === 1;
  const canViewMedicationAdministration = row.estado === 1 || row.estado === 2;
  const canCreateAttention = row.estado === 1;
  const canViewAttentions = row.estado === 1;

  const nurseActions = [
    {
      key: "ingreso",
      label: "Realizar ingreso",
      icon: "login",
      enabled: canAdmission,
      onClick: () => openModal("ingreso", row),
    },
    {
      key: "createMedication",
      label: "Crear adm. medicamento",
      icon: "medication",
      enabled: canCreateMedicationAdministration,
      onClick: () => openModal("createMedicationAdministration", row),
    },
    {
      key: "viewMedication",
      label: "Ver adm. medicamento",
      icon: "visibility",
      enabled: canViewMedicationAdministration,
      onClick: () => openModal("viewMedicationAdministration", row),
    },
    {
      key: "salida",
      label: "Salida",
      icon: "logout",
      enabled: canDischarge,
      onClick: () => openModal("salida", row),
    },
  ];

  const doctorActions = [
    {
      key: "createAttention",
      label: "Crear atención",
      icon: "add_circle",
      enabled: canCreateAttention,
      onClick: () => openModal("createAttention", row),
    },
    {
      key: "viewAttentions",
      label: "Ver atenciones",
      icon: "list_alt",
      enabled: canViewAttentions,
      onClick: () => openModal("viewAttentions", row),
    },
  ];

  const actions = [
    ...(isNurse ? nurseActions : []),
    ...(isDoctor ? doctorActions : []),
  ];
  const enabledActions = actions.filter((action) => action.enabled);

  React.useEffect(() => {
    if (!open) return undefined;
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function runAction(action) {
    if (!action.enabled) return;
    setOpen(false);
    action.onClick();
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={enabledActions.length === 0}
        className={
          enabledActions.length === 0
            ? "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium bg-neutral-100 text-neutral-400 cursor-not-allowed"
            : "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium bg-primary-500 text-white hover:bg-primary-600"
        }
      >
        Acciones
        <span className="material-icons text-sm leading-none">expand_more</span>
      </button>
      {open && enabledActions.length > 0 && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 min-w-[15rem] rounded-xl border border-neutral-200 bg-white py-1 shadow-lg"
        >
          {actions.map((action) => (
            <button
              key={action.key}
              type="button"
              role="menuitem"
              disabled={!action.enabled}
              onClick={() => runAction(action)}
              className={
                action.enabled
                  ? "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-800 hover:bg-neutral-50"
                  : "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-400 cursor-not-allowed"
              }
            >
              <span className="material-icons text-base text-neutral-500">
                {action.icon}
              </span>
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DetailLink({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm font-semibold text-primary-600 hover:text-primary-700 underline underline-offset-2"
    >
      {children}
    </button>
  );
}

function HospitalizationDetailModal({ data, onClose }) {
  const patientName =
    `${data?.nombres || ""} ${data?.apellidos || ""}`.trim() || "—";

  return (
    <Modal title="Detalle de hospitalización" onClose={onClose} size="xl">
      <div className="space-y-6">
        <section>
          <h4 className="text-sm font-semibold text-neutral-900 mb-3">
            Datos generales
          </h4>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            <DetailField label="ID hospitalización" value={data?.id_hospitalizacion} />
            <DetailField label="Cama" value={data?.num_cama} />
            <div className="rounded-lg border border-neutral-200 p-3">
              <p className="text-xs uppercase text-neutral-500">Estado</p>
              <div className="mt-2">
                <StatusBadge estado={data?.estado} />
              </div>
            </div>
            <DetailField
              label="Urgencia"
              value={data?.id_urgencia || data?.urgencia?.id_urgencia}
            />
          </div>
        </section>

        <section>
          <h4 className="text-sm font-semibold text-neutral-900 mb-3">Fechas</h4>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <DetailField
              label="Ingreso"
              value={formatDateTime(data?.ingreso ?? data?.fecha_ingreso)}
            />
            <DetailField
              label="Salida"
              value={formatDateTime(data?.salida ?? data?.fecha_salida)}
            />
          </div>
        </section>

        <section>
          <h4 className="text-sm font-semibold text-neutral-900 mb-3">Paciente</h4>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <DetailField
              label="ID paciente"
              value={data?.id_paciente ?? data?.num_doc_paciente}
            />
            <DetailField label="Nombre completo" value={patientName} />
          </div>
        </section>
      </div>
    </Modal>
  );
}

function DetailField({ label, value }) {
  const display =
    value === null || value === undefined || String(value).trim() === ""
      ? "—"
      : value;
  return (
    <div className="rounded-lg border border-neutral-200 p-3">
      <p className="text-xs uppercase text-neutral-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-neutral-800">{display}</p>
    </div>
  );
}

function AdmissionModal({
  hospitalization,
  onClose,
  onDone,
  setError,
  setMessage,
}) {
  const [numCama, setNumCama] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    const numCamaValue = parsePositiveInt(numCama);
    if (!String(numCama).trim()) {
      setError("El número de cama es obligatorio.");
      return;
    }
    if (!numCamaValue) {
      setError("El número de cama debe ser un número mayor que cero.");
      return;
    }

    try {
      const { data } = await http.get(API.hospitalizations.list, {
        params: buildHospitalizationParams({}, 1, 9999),
      });
      const occupiedBed = unwrapArray(data)
        .map(normalizeHospitalization)
        .find((row) => {
          const rowBed = parsePositiveInt(row?.num_cama);
          return (
            rowBed === numCamaValue &&
            getStatusNumber(row?.estado) === 1 &&
            Number(row?.id_hospitalizacion) !== Number(hospitalization.id_hospitalizacion)
          );
        });

      if (occupiedBed) {
        setError(
          `La cama ${numCamaValue} ya está ocupada por la hospitalización #${occupiedBed.id_hospitalizacion} en estado ingresado.`
        );
        return;
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "No fue posible validar la disponibilidad de la cama."));
      return;
    }

    setSaving(true);
    try {
      await http.put(
        API.hospitalizations.ingreso(hospitalization.id_hospitalizacion),
        {
          num_cama: numCamaValue,
        }
      );
      setMessage("Ingreso de hospitalización registrado correctamente.");
      onClose();
      await onDone();
    } catch (err) {
      setError(
        getApiErrorMessage(err, "No fue posible registrar el ingreso.")
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Realizar ingreso de hospitalización" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Número de cama">
          <Input
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={numCama}
            onChange={(e) => setNumCama(e.target.value)}
            placeholder="Ej: 302"
          />
        </Field>
        <ModalActions onClose={onClose} loading={saving} submitLabel="Ingresar" />
      </form>
    </Modal>
  );
}

function DischargeModal({
  hospitalization,
  onClose,
  onDone,
  setError,
  setMessage,
}) {
  const [saving, setSaving] = React.useState(false);

  async function submit() {
    setSaving(true);
    setError("");
    try {
      await http.put(API.hospitalizations.salida(hospitalization.id_hospitalizacion));
      setMessage("Salida de hospitalización registrada correctamente.");
      onClose();
      await onDone();
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "No fue posible registrar la salida de hospitalización."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Salida de hospitalización" onClose={onClose}>
      <p className="text-neutral-700">
        ¿Confirmas la salida de la hospitalización #
        {hospitalization.id_hospitalizacion}?
      </p>
      <div className="mt-5">
        <ModalActions
          onClose={onClose}
          loading={saving}
          submitLabel="Confirmar salida"
          onSubmit={submit}
        />
      </div>
    </Modal>
  );
}

function CreateMedicationAdministrationModal({
  hospitalization,
  auth,
  onClose,
  setError,
  setMessage,
}) {
  const [items, setItems] = React.useState([]);
  const [totalRows, setTotalRows] = React.useState(null);
  const [administrations, setAdministrations] = React.useState([]);
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const hospitalizationId = getHospitalizationId(hospitalization);

  const adminCountByItemId = React.useMemo(
    () => buildAdministrationCountByItemId(administrations),
    [administrations]
  );

  const loadAdministrations = React.useCallback(async () => {
    if (!hospitalizationId) {
      setAdministrations([]);
      return;
    }
    try {
      const { data } = await http.get(
        API.hospitalizations.medicationAdministrationByHospitalization(
          hospitalizationId
        )
      );
      if (data && typeof data === "object") {
        assertBackendSuccess(
          data,
          "No fue posible cargar el historial de administraciones."
        );
      }
      setAdministrations(unwrapArray(data));
    } catch {
      setAdministrations([]);
    }
  }, [hospitalizationId]);

  const loadPrescriptionItems = React.useCallback(async () => {
    if (!hospitalizationId) {
      setError("No se encontró un ID de hospitalización válido.");
      setItems([]);
      setTotalRows(null);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const primaryRes = await http
        .get(API.hospitalizations.prescriptionItems(hospitalizationId), {
          params: buildHospitalizationPrescriptionItemsParams(page, pageSize),
        })
        .catch((error) => ({ error }));

      let primaryRows = [];
      let primaryTotal = null;
      if (!primaryRes?.error) {
        const normalized = unwrapHospitalizationPrescriptionItems(primaryRes.data);
        primaryRows = normalized.rows;
        primaryTotal = normalized.total;
      }

      setItems(primaryRows);
      setTotalRows(primaryTotal ?? primaryRows.length);
    } catch (err) {
      setItems([]);
      setTotalRows(null);
      setError(
        getApiErrorMessage(
          err,
          "No fue posible cargar los ítems de prescripción de la hospitalización."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [hospitalizationId, page, pageSize, setError]);

  React.useEffect(() => {
    if (!hospitalizationId) return;
    loadAdministrations();
  }, [hospitalizationId, loadAdministrations]);

  React.useEffect(() => {
    if (!hospitalizationId) return;
    loadPrescriptionItems();
  }, [hospitalizationId, loadPrescriptionItems]);

  React.useEffect(() => {
    setSelectedIds((prev) =>
      prev.filter((id) => {
        const item = items.find(
          (row) => String(getPrescriptionItemId(row)) === String(id)
        );
        if (!item) return true;
        return !getItemAdministrationStatus(item, adminCountByItemId).exhausted;
      })
    );
  }, [items, adminCountByItemId]);

  const totalPages = getComputedTotalPages(
    totalRows,
    page,
    pageSize,
    items.length
  );

  const selectableItemsCount = React.useMemo(
    () =>
      items.filter(
        (item) => !getItemAdministrationStatus(item, adminCountByItemId).exhausted
      ).length,
    [items, adminCountByItemId]
  );

  function toggle(id, item) {
    if (item && getItemAdministrationStatus(item, adminCountByItemId).exhausted) {
      return;
    }
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  }

  async function submit() {
    setError("");
    if (!hospitalizationId) {
      setError("No se encontró un ID de hospitalización válido.");
      return;
    }
    const idEnfermera = getAuthNurseId(auth);
    if (!idEnfermera) {
      setError("No se pudo obtener el ID de la enfermera autenticada.");
      return;
    }
    const idEnfermeraNum = Number(idEnfermera);
    if (!Number.isFinite(idEnfermeraNum) || idEnfermeraNum <= 0) {
      setError("El ID de la enfermera autenticada no es válido.");
      return;
    }
    if (selectedIds.length === 0) {
      setError("Debe seleccionar al menos un ítem de prescripción.");
      return;
    }
    const adminMedItems = selectedIds
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id));
    if (adminMedItems.length === 0) {
      setError("Los ítems seleccionados no tienen un id_items válido.");
      return;
    }

    const exhaustedSelection = adminMedItems.filter((id) => {
      const item = items.find(
        (row) => String(getPrescriptionItemId(row)) === String(id)
      );
      if (!item) return false;
      return getItemAdministrationStatus(item, adminCountByItemId).exhausted;
    });
    if (exhaustedSelection.length > 0) {
      setError(
        "Uno o más medicamentos ya alcanzaron las administraciones prescritas."
      );
      return;
    }
    setSaving(true);
    try {
      await http.post(
        API.hospitalizations.medicationAdministration,
        cleanPayload({
          id_enfermera: idEnfermeraNum,
          id_hospitalizacion: hospitalizationId,
          admin_med_items: adminMedItems,
        })
      );
      setMessage("Administración de medicamentos creada correctamente.");
      onClose();
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "No fue posible crear la administración de medicamentos."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Crear administración de medicamentos"
      onClose={onClose}
      size="xl"
    >
      <div className="space-y-5">
        <p className="text-sm text-neutral-600">
          Selecciona los ítems de prescripción que serán administrados. Cada
          medicamento se puede administrar solo hasta completar las veces
          indicadas en la duración de la prescripción.
        </p>

        {loading ? (
          <p className="text-neutral-600">Cargando ítems de prescripción...</p>
        ) : items.length === 0 ? (
          <p className="text-neutral-500">
            No hay ítems de prescripción disponibles para esta hospitalización.
          </p>
        ) : selectableItemsCount === 0 ? (
          <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <span className="material-icons text-neutral-500">check_circle</span>
            <div>
              <p className="text-sm font-semibold text-neutral-800">
                Todos los medicamentos prescritos ya fueron administrados
              </p>
              <p className="mt-1 text-sm text-neutral-600">
                No quedan administraciones pendientes según la prescripción
                médica.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => {
              const id = getPrescriptionItemId(item) ?? index;
              const selected = selectedIds.includes(id);
              const adminStatus = getItemAdministrationStatus(
                item,
                adminCountByItemId
              );
              const { exhausted, administered, limit, remaining } = adminStatus;
              const prescriptionItem = item?.prescripcion_item || item;
              const medication = item?.medicamento || prescriptionItem?.medicamento || {};
              const principioActivo = String(
                medication?.principio_activo ??
                  prescriptionItem?.principio_activo ??
                  ""
              ).trim();
              const presentacion = String(
                medication?.presentacion ?? prescriptionItem?.presentacion ?? ""
              ).trim();
              return (
                <label
                  key={id}
                  className={[
                    "flex gap-3 rounded-xl border p-4",
                    exhausted
                      ? "border-neutral-200 bg-neutral-50 opacity-75 cursor-not-allowed"
                      : "border-neutral-200 hover:bg-neutral-50 cursor-pointer",
                  ].join(" ")}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    disabled={exhausted}
                    onChange={() => toggle(id, item)}
                    className="mt-1 disabled:cursor-not-allowed"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-neutral-900">
                        {getMedicationName(item)}
                      </p>
                      {exhausted ? (
                        <span className="inline-flex items-center rounded-full border border-neutral-300 bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-600">
                          Completado
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-700">
                          {remaining}{" "}
                          {remaining === 1
                            ? "administración restante"
                            : "administraciones restantes"}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-neutral-600">
                      Código:{" "}
                      {medication?.codigo ??
                        prescriptionItem?.codigo ??
                        prescriptionItem?.id_medicamento ??
                        "—"} ·
                      Dosis: {prescriptionItem?.dosis ?? "—"} · Duración:{" "}
                      {prescriptionItem?.duracion ?? "—"} · Cantidad:{" "}
                      {prescriptionItem?.cantidad ?? "—"}
                    </p>
                    <p
                      className={
                        exhausted
                          ? "mt-1 text-xs font-medium text-neutral-500"
                          : "mt-1 text-xs text-neutral-500"
                      }
                    >
                      Administrado {administered} de {limit}{" "}
                      {limit === 1 ? "vez prescrita" : "veces prescritas"}
                    </p>
                    {(principioActivo || presentacion) && (
                      <p className="mt-2 text-xs text-neutral-500">
                        {[principioActivo ? `Principio activo: ${principioActivo}` : null, presentacion ? `Presentación: ${presentacion}` : null]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        )}

        <PaginationControls
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(Math.min(Math.max(size, 10), 100));
            setPage(1);
          }}
          pageSizeOptions={MEDICATION_ITEMS_PAGE_SIZE_OPTIONS}
        />

        <ModalActions
          onClose={onClose}
          loading={saving}
          submitLabel="Crear administración"
          onSubmit={submit}
          submitDisabled={selectableItemsCount === 0}
        />
      </div>
    </Modal>
  );
}

function MedicationAdministrationListModal({
  hospitalization,
  onClose,
  setError,
}) {
  const [rows, setRows] = React.useState([]);
  const [filters, setFilters] = React.useState({
    id_enfermera: "",
    fecha_inicio: "",
    fecha_fin: "",
  });
  const [loading, setLoading] = React.useState(false);

  const hospitalizationId = getHospitalizationId(hospitalization);

  const loadRows = React.useCallback(
    async (activeFilters = filters) => {
      if (!hospitalizationId) {
        setError("No se encontró un ID de hospitalización válido.");
        setRows([]);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const { data } = await http.get(
          API.hospitalizations.medicationAdministrationByHospitalization(
            hospitalizationId
          ),
          {
            params: buildMedicationAdministrationListParams(activeFilters),
          }
        );
        if (data && typeof data === "object") {
          assertBackendSuccess(
            data,
            "No fue posible cargar la administración de medicamentos."
          );
        }
        setRows(unwrapArray(data));
      } catch (err) {
        setRows([]);
        setError(
          getApiErrorMessage(
            err,
            "No fue posible cargar la administración de medicamentos."
          )
        );
      } finally {
        setLoading(false);
      }
    },
    [filters, hospitalizationId, setError]
  );

  React.useEffect(() => {
    if (!hospitalizationId) return;
    loadRows();
  }, [hospitalizationId, loadRows]);

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function applyFilters() {
    loadRows(filters);
  }

  function clearFilters() {
    const empty = { id_enfermera: "", fecha_inicio: "", fecha_fin: "" };
    setFilters(empty);
    loadRows(empty);
  }

  return (
    <Modal title="Administración de medicamentos" onClose={onClose} size="xl">
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Field label="ID enfermera">
            <Input
              type="number"
              min="1"
              value={filters.id_enfermera}
              onChange={(e) => updateFilter("id_enfermera", e.target.value)}
              placeholder="ID enfermera"
            />
          </Field>
          <Field label="Fecha inicio">
            <Input
              type="date"
              value={filters.fecha_inicio}
              onChange={(e) => updateFilter("fecha_inicio", e.target.value)}
            />
          </Field>
          <Field label="Fecha fin">
            <Input
              type="date"
              value={filters.fecha_fin}
              onChange={(e) => updateFilter("fecha_fin", e.target.value)}
            />
          </Field>
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={clearFilters}
              className="w-full rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={applyFilters}
              className="w-full rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600"
            >
              Aplicar
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-neutral-600">Cargando registros...</p>
        ) : rows.length === 0 ? (
          <p className="text-neutral-500">
            No hay administraciones de medicamentos para los filtros actuales.
          </p>
        ) : (
          <div className="space-y-3">
            {rows.map((row, index) => (
              <RecordCard
                key={row?.id_administracion ?? row?.id ?? index}
                title={`Administración #${
                  row?.id_administracion ?? row?.id ?? index + 1
                }`}
                subtitle={[
                  row?.fecha_admin
                    ? `Fecha: ${formatDateTime(row.fecha_admin)}`
                    : null,
                  row?.num_doc_enfermera
                    ? `Doc. enfermera: ${row.num_doc_enfermera}`
                    : null,
                  Array.isArray(row?.items_administrados)
                    ? `${row.items_administrados.length} ítem(s)`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                detailContent={<MedicationAdministrationDetailBody data={row} />}
              />
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

function MedicationAdministrationDetailBody({ data }) {
  const items = Array.isArray(data?.items_administrados) ? data.items_administrados : [];
  const headerFields = [
    { label: "ID administración", value: data?.id_admin_med ?? data?.id_administracion ?? data?.id },
    { label: "ID hospitalización", value: data?.id_hospitalizacion },
    { label: "ID enfermera", value: data?.id_enfermera ?? data?.num_doc_enfermera },
    { label: "Fecha administración", value: data?.fecha_admin ? formatDateTime(data.fecha_admin) : "—" },
  ];

  return (
    <div className="mt-3 space-y-4 rounded-xl border border-neutral-200 bg-white p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {headerFields.map((field) => (
          <div key={field.label} className="rounded-lg border border-neutral-200 p-3">
            <p className="text-xs uppercase text-neutral-500">{field.label}</p>
            <p className="mt-1 text-sm font-semibold text-neutral-800">
              {field.value === null || field.value === undefined || String(field.value).trim() === ""
                ? "—"
                : field.value}
            </p>
          </div>
        ))}
      </div>

      <section className="space-y-2">
        <h5 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Ítems administrados
        </h5>
        {items.length === 0 ? (
          <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <span className="material-icons text-neutral-500">inventory_2</span>
            <div>
              <p className="text-sm font-semibold text-neutral-800">
                No hay ítems administrados
              </p>
              <p className="mt-1 text-sm text-neutral-600">
                Esta administración no tiene ítems asociados.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-neutral-200">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-neutral-600">
                    Medicamento
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-neutral-600">
                    Dosis
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-neutral-600">
                    Cantidad
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-neutral-600">
                    Duración
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-neutral-600">
                    Detalle
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
                {items.map((entry, idx) => {
                  const prescItem = entry?.prescripcion_item || {};
                  const med = entry?.medicamento || {};
                  const medicamentoNombre = String(
                    med?.nombre_medicamento || med?.nombre || med?.nombre_generico || ""
                  ).trim();
                  const principioActivo = String(med?.principio_activo || "").trim();
                  const presentacion = String(med?.presentacion || "").trim();
                  const codigo = med?.codigo ?? prescItem?.id_medicamento ?? null;
                  const detalleBadges = [
                    prescItem?.id_items ? { label: `Ítem #${prescItem.id_items}` } : null,
                    codigo ? { label: `Código ${codigo}` } : null,
                    prescItem?.id_prescripcion ? { label: `Rx #${prescItem.id_prescripcion}` } : null,
                  ].filter(Boolean);

                  return (
                    <tr key={entry?.admin_item_detalle?.id_admin_items ?? prescItem?.id_items ?? idx}>
                      <td className="px-3 py-2 text-neutral-800">
                        <div className="font-medium">
                          {medicamentoNombre || principioActivo || "—"}
                        </div>
                        <div className="mt-0.5 text-xs text-neutral-500">
                          {[principioActivo || null, presentacion || null].filter(Boolean).join(" · ") || "—"}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-neutral-800">{prescItem?.dosis ?? "—"}</td>
                      <td className="px-3 py-2 text-neutral-800">{prescItem?.cantidad ?? "—"}</td>
                      <td className="px-3 py-2 text-neutral-800">
                        {formatDurationWithUnit(prescItem?.duracion)}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1.5">
                          {detalleBadges.length > 0 ? (
                            detalleBadges.map((badge) => (
                              <span
                                key={badge.label}
                                className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] font-medium text-neutral-700"
                              >
                                {badge.label}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-neutral-500">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function CreateAttentionModal({
  hospitalization,
  auth,
  onClose,
  onDone,
  setError,
  setMessage,
}) {
  const [form, setForm] = React.useState({
    observaciones: "",
    tratamiento: "",
  });
  const [formErrors, setFormErrors] = React.useState({});
  const [diagnosticoQuery, setDiagnosticoQuery] = React.useState("");
  const [diagnosticoOptions, setDiagnosticoOptions] = React.useState([]);
  const [selectedDiagnostico, setSelectedDiagnostico] = React.useState(null);
  const [loadingDiagnosticos, setLoadingDiagnosticos] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [medicamentoOptions, setMedicamentoOptions] = React.useState([]);
  const [loadingMedicamentos, setLoadingMedicamentos] = React.useState(false);
  const [prescriptionItems, setPrescriptionItems] = React.useState([]);
  const [selectedPrincipioActivo, setSelectedPrincipioActivo] = React.useState({});
  const [doseWarnings, setDoseWarnings] = React.useState({});
  const [prescriptionErrors, setPrescriptionErrors] = React.useState({});
  const diagDebounceRef = React.useRef(null);

  const idHospitalizacionAtencion = React.useMemo(() => {
    const raw =
      hospitalization?.id_hospitalizacion ??
      hospitalization?.idHospitalizacion ??
      hospitalization?.hospitalizacion?.id_hospitalizacion;
    const numeric = Number(raw);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
  }, [hospitalization]);

  function resetFormState() {
    setForm({ observaciones: "", tratamiento: "" });
    setFormErrors({});
    setDiagnosticoQuery("");
    setDiagnosticoOptions([]);
    setSelectedDiagnostico(null);
    setLoadingDiagnosticos(false);
    setSaving(false);
    setMedicamentoOptions([]);
    setLoadingMedicamentos(false);
    setPrescriptionItems([]);
    setSelectedPrincipioActivo({});
    setDoseWarnings({});
    setPrescriptionErrors({});
  }

  async function finishModal() {
    resetFormState();
    onClose();
    if (onDone) await onDone();
  }

  async function loadDiagnosticos(nombre = "") {
    setLoadingDiagnosticos(true);
    try {
      const params = nombre.trim() ? { nombre: nombre.trim() } : {};
      const { data } = await http.get(API.diagnoses.search, { params });
      const list = unwrapDiagnoses(data);
      setDiagnosticoOptions(list.length > 0 ? list : FALLBACK_DIAGNOSES);
    } catch {
      setDiagnosticoOptions(FALLBACK_DIAGNOSES);
    } finally {
      setLoadingDiagnosticos(false);
    }
  }

  React.useEffect(() => {
    resetFormState();
    loadDiagnosticos();
    loadMedicamentos();
    return () => {
      if (diagDebounceRef.current) clearTimeout(diagDebounceRef.current);
    };
  }, [hospitalization?.id_hospitalizacion]);

  function handleDiagnosticoQueryChange(value) {
    setDiagnosticoQuery(value);
    if (diagDebounceRef.current) clearTimeout(diagDebounceRef.current);
    diagDebounceRef.current = setTimeout(() => {
      loadDiagnosticos(value);
    }, 350);
  }

  function selectDiagnostico(diag) {
    setSelectedDiagnostico(diag);
    setDiagnosticoQuery(getDiagnosisName(diag));
    setFormErrors((prev) => ({ ...prev, diagnostico: "" }));
  }

  function clearDiagnostico() {
    setSelectedDiagnostico(null);
    setDiagnosticoQuery("");
  }

  function validateForm() {
    const nextErrors = {};
    if (!form.observaciones.trim()) {
      nextErrors.observaciones = "Las observaciones son obligatorias.";
    }
    if (!form.tratamiento.trim()) {
      nextErrors.tratamiento = "El tratamiento es obligatorio.";
    }
    if (!selectedDiagnostico?.id_diagnostico) {
      nextErrors.diagnostico = "Debe seleccionar un diagnóstico.";
    }
    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function loadMedicamentos() {
    setLoadingMedicamentos(true);
    try {
      const { data } = await http.get(`${MEDICAL_API}/api/medicamentos/search`);
      const wrapped = unwrapBackendResponse(data);
      setMedicamentoOptions(Array.isArray(wrapped.data) ? wrapped.data : []);
    } catch {
      setMedicamentoOptions([]);
    } finally {
      setLoadingMedicamentos(false);
    }
  }

  function clearPrescriptionFieldError(localId, keys) {
    setPrescriptionErrors((prev) => {
      const updated = { ...prev };
      keys.forEach((key) => delete updated[`${localId}_${key}`]);
      return updated;
    });
  }

  const hasPrescriptionItems = prescriptionItems.length > 0;
  const hasIncompletePrescriptionItems = prescriptionItems.some(
    (item) =>
      !item.codigo ||
      !String(item.dosis || "").trim() ||
      Number(item.duracion) <= 0 ||
      Number(item.cantidad) <= 0
  );
  const willCreatePrescription = hasPrescriptionItems;

  async function submitAttention(e) {
    e.preventDefault();
    setError("");

    const rxErrors = validatePrescriptionItems(
      prescriptionItems,
      selectedPrincipioActivo
    );
    setPrescriptionErrors(rxErrors);

    if (!validateForm()) return;
    if (hasPrescriptionItems && Object.keys(rxErrors).length > 0) {
      setError("Completa todos los campos de cada medicamento antes de guardar.");
      return;
    }
    if (hasIncompletePrescriptionItems) {
      setError("Completa todos los campos de cada medicamento antes de guardar.");
      return;
    }

    if (willCreatePrescription && !idHospitalizacionAtencion) {
      setError(
        "Esta hospitalización no tiene id_hospitalizacion; no se puede crear la prescripción de medicamentos."
      );
      return;
    }

    const idDoctor = getAuthDoctorId(auth);
    const idHospitalizacion = idHospitalizacionAtencion;
    if (!idDoctor) {
      setError(
        "No se pudo obtener el documento del médico autenticado (num_documento)."
      );
      return;
    }
    if (!idHospitalizacion) {
      setError("No se encontró un ID de hospitalización válido.");
      return;
    }

    setSaving(true);
    let attentionWasCreated = false;
    try {
      const attentionRes = await http.post(
        API.hospitalizations.createAttention,
        {
          id_doctor: idDoctor,
          id_diagnostico: Number(selectedDiagnostico.id_diagnostico),
          id_hospitalizacion: idHospitalizacion,
          observaciones: form.observaciones.trim(),
          tratamiento: form.tratamiento.trim(),
        }
      );
      assertBackendSuccess(
        attentionRes.data,
        "No fue posible crear la atención de hospitalización."
      );
      attentionWasCreated = true;
      const idAtencionHospitalizacion = getHospitalizationAttentionId(
        attentionRes.data
      );
      if (idAtencionHospitalizacion) {
        rememberHospitalizationAttentionId(
          idHospitalizacion,
          idAtencionHospitalizacion
        );
      }

      if (willCreatePrescription) {
        if (!idAtencionHospitalizacion) {
          throw new Error(
            "La atención fue creada, pero la respuesta no incluyó id_atencionh para registrar la prescripción."
          );
        }

        const { response: prescriptionRes } = await postHospitalizationPrescription({
          idAtencionHospitalizacion,
          idHospitalizacion,
          prescriptionItems,
        });
        assertBackendSuccess(
          prescriptionRes.data,
          "No fue posible crear la prescripción."
        );
        setMessage("Atención y prescripción de medicamentos registradas correctamente.");
      } else {
        setMessage("Atención de hospitalización creada correctamente.");
      }

      await finishModal();
    } catch (err) {
      if (willCreatePrescription && attentionWasCreated) {
        setError(
          `${getApiErrorMessage(
            err,
            "No fue posible crear la prescripción."
          )} La atención ya fue creada; agrega la prescripción manualmente o reintenta.`
        );
        return;
      }

      setError(
        getApiErrorMessage(
          err,
          willCreatePrescription
            ? "No fue posible guardar la atención o la prescripción."
            : "No fue posible crear la atención de hospitalización."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Crear atención de hospitalización" onClose={onClose} size="xl">
      <form onSubmit={submitAttention} className="space-y-5">
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
          <p>
            Hospitalización:{" "}
            <span className="font-semibold">
              #{hospitalization.id_hospitalizacion}
            </span>
          </p>
          <p>
            Paciente:{" "}
            <span className="font-semibold">
              {`${hospitalization.nombres || ""} ${
                hospitalization.apellidos || ""
              }`.trim() || "—"}
            </span>
          </p>
        </div>

        <section className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-4">
          <h4 className="text-sm font-semibold text-neutral-900">
            Registro de atención
          </h4>

          <Field label="Observaciones">
            <Textarea
              value={form.observaciones}
              onChange={(e) => {
                setForm({ ...form, observaciones: e.target.value });
                setFormErrors((prev) => ({ ...prev, observaciones: "" }));
              }}
              placeholder="Observaciones clínicas"
              rows={5}
            />
            {formErrors.observaciones && (
              <p className="mt-1 text-sm text-emergency-600">
                {formErrors.observaciones}
              </p>
            )}
          </Field>

          <Field label="Tratamiento">
            <Textarea
              value={form.tratamiento}
              onChange={(e) => {
                setForm({ ...form, tratamiento: e.target.value });
                setFormErrors((prev) => ({ ...prev, tratamiento: "" }));
              }}
              placeholder="Tratamiento indicado"
              rows={5}
            />
            {formErrors.tratamiento && (
              <p className="mt-1 text-sm text-emergency-600">
                {formErrors.tratamiento}
              </p>
            )}
          </Field>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-neutral-700">
              Diagnóstico
            </label>
            {selectedDiagnostico ? (
              <div className="flex items-center gap-2 rounded-lg border border-primary-300 bg-primary-50 px-3 py-2">
                <span className="flex-1 text-sm text-primary-800">
                  {getDiagnosisName(selectedDiagnostico)}
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
                    onChange={(e) =>
                      handleDiagnosticoQueryChange(e.target.value)
                    }
                    placeholder="Buscar por nombre de enfermedad..."
                    className={[
                      "block w-full rounded-xl border bg-white px-3 py-2 text-neutral-900",
                      "focus:outline-none focus:ring-2 focus:ring-primary-200",
                      formErrors.diagnostico
                        ? "border-emergency-500"
                        : "border-neutral-300",
                    ].join(" ")}
                  />
                  {loadingDiagnosticos && <Spinner size="sm" />}
                </div>
                {diagnosticoOptions.length > 0 && (
                  <ul className="mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-neutral-200 bg-neutral-50">
                    {diagnosticoOptions.map((d) => (
                      <li
                        key={getDiagnosisId(d)}
                        className="cursor-pointer px-3 py-2 text-sm text-neutral-800 hover:bg-primary-50 hover:text-primary-700"
                        onClick={() => selectDiagnostico(d)}
                      >
                        {getDiagnosisName(d)}
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
            {formErrors.diagnostico && (
              <p className="mt-1 text-sm text-emergency-600">
                {formErrors.diagnostico}
              </p>
            )}
          </div>
        </section>

        {loadingMedicamentos ? (
          <p className="text-sm text-neutral-600">Cargando catálogo de medicamentos...</p>
        ) : (
          <PrescriptionItemsForm
            medicamentoOptions={medicamentoOptions}
            prescriptionItems={prescriptionItems}
            onPrescriptionItemsChange={setPrescriptionItems}
            selectedPrincipioActivo={selectedPrincipioActivo}
            onSelectedPrincipioActivoChange={setSelectedPrincipioActivo}
            doseWarnings={doseWarnings}
            onDoseWarningsChange={setDoseWarnings}
            errors={prescriptionErrors}
            onClearError={clearPrescriptionFieldError}
            disabled={saving}
            title="Prescripciones"
            addLabel="Agregar medicamento"
            minItems={0}
          />
        )}

        {!idHospitalizacionAtencion && hasPrescriptionItems && (
          <p className="text-sm text-amber-700 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
            Esta hospitalización no tiene id_hospitalizacion asociado. Puede guardar la
            atención, pero no se podrá registrar prescripción de medicamentos.
          </p>
        )}

        <ModalActions
          onClose={onClose}
          loading={saving}
          submitLabel={
            willCreatePrescription
              ? "Guardar atención y prescripción"
              : "Guardar atención"
          }
          submitDisabled={hasIncompletePrescriptionItems}
        />
      </form>
    </Modal>
  );
}

function AttentionListModal({ hospitalization, onClose, setError }) {
  const [diagnoses, setDiagnoses] = React.useState(FALLBACK_DIAGNOSES);
  const [rows, setRows] = React.useState([]);
  const [totalRows, setTotalRows] = React.useState(null);
  const [filters, setFilters] = React.useState({ ...EMPTY_ATTENTION_FILTERS });
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);
  const [loading, setLoading] = React.useState(false);

  const loadDiagnoses = React.useCallback(async () => {
    try {
      const { data } = await http.get(API.diagnoses.search);
      const list = unwrapDiagnoses(data);
      if (list.length > 0) {
        setDiagnoses(list);
      }
    } catch {
      setDiagnoses(FALLBACK_DIAGNOSES);
    }
  }, []);

  const loadRows = React.useCallback(
    async (nextPage = page, nextPageSize = pageSize, activeFilters = filters) => {
      setLoading(true);
      setError("");
      try {
        const { data } = await http.get(
          API.hospitalizations.attentionsByHospitalization(
            hospitalization.id_hospitalizacion
          ),
          {
            params: buildAttentionParams(activeFilters, nextPage, nextPageSize),
          }
        );
        const nextRows = unwrapArray(data);
        rememberHospitalizationAttentionRows(
          hospitalization.id_hospitalizacion,
          nextRows
        );
        setRows(nextRows);
        setTotalRows(unwrapTotal(data));
      } catch (err) {
        setRows([]);
        setTotalRows(null);
        setError(
          getApiErrorMessage(
            err,
            "No fue posible cargar las atenciones de hospitalización."
          )
        );
      } finally {
        setLoading(false);
      }
    },
    [filters, hospitalization.id_hospitalizacion, page, pageSize, setError]
  );

  React.useEffect(() => {
    loadDiagnoses();
    loadRows(page, pageSize);
  }, [loadDiagnoses, loadRows, page, pageSize]);

  const totalPages = getComputedTotalPages(
    totalRows,
    page,
    pageSize,
    rows.length
  );

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function applyFilters() {
    setPage(1);
    loadRows(1, pageSize, filters);
  }

  function clearFilters() {
    setFilters({ ...EMPTY_ATTENTION_FILTERS });
    setPage(1);
    loadRows(1, pageSize, { ...EMPTY_ATTENTION_FILTERS });
  }

  return (
    <Modal title="Atenciones de hospitalización" onClose={onClose} size="xl">
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          <Field label="ID paciente">
            <Input
              type="number"
              min="1"
              value={filters.id_paciente}
              onChange={(e) => updateFilter("id_paciente", e.target.value)}
              placeholder="ID paciente"
            />
          </Field>
          <Field label="ID doctor">
            <Input
              type="number"
              min="1"
              value={filters.id_doctor}
              onChange={(e) => updateFilter("id_doctor", e.target.value)}
              placeholder="ID doctor"
            />
          </Field>
          <Field label="Fecha desde">
            <Input
              type="date"
              value={filters.fecha_inicio}
              onChange={(e) => updateFilter("fecha_inicio", e.target.value)}
            />
          </Field>
          <Field label="Fecha hasta">
            <Input
              type="date"
              value={filters.fecha_fin}
              onChange={(e) => updateFilter("fecha_fin", e.target.value)}
            />
          </Field>
          <Field label="Enfermedad">
            <Select
              value={filters.id_diagnostico}
              onChange={(e) =>
                updateFilter("id_diagnostico", e.target.value)
              }
            >
              <option value="">Todas</option>
              {diagnoses.map((diagnosis) => (
                <option
                  key={getDiagnosisId(diagnosis)}
                  value={getDiagnosisId(diagnosis)}
                >
                  {getDiagnosisName(diagnosis)}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={clearFilters}
              aria-label="Limpiar filtros"
              title="Limpiar filtros"
              className="inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border border-neutral-300 text-neutral-600 hover:bg-neutral-50"
            >
              <span className="material-icons text-xl">filter_alt_off</span>
            </button>
            <button
              type="button"
              onClick={applyFilters}
              className="min-w-0 flex-1 rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600"
            >
              Aplicar
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-neutral-600">Cargando atenciones...</p>
        ) : rows.length === 0 ? (
          <p className="text-neutral-500">
            No hay atenciones de hospitalización para los filtros actuales.
          </p>
        ) : (
          <div className="space-y-3">
            {rows.map((row, index) => {
              const attentionId =
                row?.id_atencionh ?? row?.id_atencion ?? row?.id ?? index + 1;
              const patientName =
                `${row?.nombre_paciente || ""} ${row?.apellido_paciente || ""}`.trim();
              const doctorName =
                `${row?.nombre_doctor || ""} ${row?.apellido_doctor || ""}`.trim();
              const diseaseName =
                row?.nombre_enfermedad ||
                row?.diagnostico?.nombre_enfermedad ||
                "";

              return (
                <RecordCard
                  key={attentionId}
                  title={`Atención #${attentionId}`}
                  subtitle={[
                    diseaseName ? `Diagnóstico: ${diseaseName}` : null,
                    patientName ? `Paciente: ${patientName}` : null,
                    doctorName ? `Doctor: ${doctorName}` : null,
                    row?.fecha_atencionh
                      ? `Fecha: ${formatDateTime(row.fecha_atencionh)}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                  detailContent={
                    <AttentionDetailBody
                      data={row}
                      idPaciente={
                        hospitalization?.id_paciente ??
                        hospitalization?.num_doc_paciente ??
                        row?.id_paciente
                      }
                      idHospitalizacion={
                        hospitalization?.id_hospitalizacion ??
                        hospitalization?.idHospitalizacion ??
                        row?.id_hospitalizacion
                      }
                    />
                  }
                />
              );
            })}
          </div>
        )}

        <PaginationControls
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>
    </Modal>
  );
}

function PaginationControls({
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm disabled:opacity-40"
      >
        Anterior
      </button>
      <span className="text-sm text-neutral-600">
        Página {page} de {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm disabled:opacity-40"
      >
        Siguiente
      </button>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      >
        {pageSizeOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function Modal({ title, children, onClose, size = "lg" }) {
  const maxWidth = size === "xl" ? "max-w-6xl" : "max-w-2xl";
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar modal"
        className="absolute inset-0 bg-neutral-900/40"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${maxWidth} max-h-[90vh] overflow-auto rounded-2xl bg-white shadow-xl border border-neutral-200`}
      >
        <div className="sticky top-0 z-10 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <h3 className="font-semibold text-neutral-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-900"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function ModalActions({
  onClose,
  loading,
  submitLabel,
  onSubmit,
  submitDisabled = false,
}) {
  return (
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={onClose}
        className="rounded-xl border border-neutral-300 px-4 py-2 text-neutral-700 hover:bg-neutral-50"
      >
        Cancelar
      </button>
      <button
        type={onSubmit ? "button" : "submit"}
        onClick={onSubmit}
        disabled={loading || submitDisabled}
        className="rounded-xl bg-primary-500 px-4 py-2 font-semibold text-white hover:bg-primary-600 disabled:opacity-50"
      >
        {loading ? "Procesando..." : submitLabel}
      </button>
    </div>
  );
}

function StatusBadge({ estado }) {
  const status = getStatusNumber(estado);
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
        STATUS_CLASS[status] ||
        "bg-neutral-100 text-neutral-700 border-neutral-200"
      }`}
    >
      {STATUS_LABEL[status] ?? "Desconocido"}
    </span>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-neutral-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-900",
        "focus:outline-none focus:ring-2 focus:ring-primary-200",
        props.className || "",
      ].join(" ")}
    />
  );
}

function Select({ children, ...props }) {
  return (
    <select
      {...props}
      className={[
        "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-900",
        "focus:outline-none focus:ring-2 focus:ring-primary-200",
        props.className || "",
      ].join(" ")}
    >
      {children}
    </select>
  );
}

function Textarea(props) {
  return (
    <textarea
      {...props}
      rows={4}
      className={[
        "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-900",
        "focus:outline-none focus:ring-2 focus:ring-primary-200",
        props.className || "",
      ].join(" ")}
    />
  );
}

function Th({ children }) {
  return (
    <th className="px-4 py-3 text-left font-semibold text-neutral-700 whitespace-nowrap">
      {children}
    </th>
  );
}

function Td({ children }) {
  return (
    <td className="px-4 py-3 text-neutral-700 align-top whitespace-nowrap">
      {children}
    </td>
  );
}

function RecordCard({ title, subtitle, detailContent, detailLabel = "Ver detalle" }) {
  const [detailsOpen, setDetailsOpen] = React.useState(false);

  return (
    <article className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <p className="font-semibold text-neutral-900">{title}</p>
      {subtitle && <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>}
      {detailContent ? (
        <RecordDetails
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          detailContent={detailsOpen ? detailContent : null}
          detailLabel={detailLabel}
        />
      ) : null}
    </article>
  );
}

function RecordDetails({ detailContent, open, onOpenChange, detailLabel = "Ver detalle" }) {
  return (
    <details
      className="mt-3 group"
      open={open}
      onToggle={(e) => onOpenChange?.(e.currentTarget.open)}
    >
      <summary className="cursor-pointer text-sm font-medium text-secondary-700 hover:text-secondary-900 list-none flex items-center gap-1">
        <span className="material-icons text-base transition-transform group-open:rotate-180">
          expand_more
        </span>
        {detailLabel}
      </summary>
      {detailContent}
    </details>
  );
}

function getPrescriptionItems(prescription) {
  if (Array.isArray(prescription?.prescripciones_items)) {
    return prescription.prescripciones_items;
  }
  if (Array.isArray(prescription?.medicamentos)) return prescription.medicamentos;
  if (Array.isArray(prescription?.items)) return prescription.items;
  return [];
}

function AttentionPrescriptionsList({ prescriptions, loading, medicationMap }) {
  if (loading) {
    return <p className="text-sm text-neutral-500">Cargando prescripciones...</p>;
  }

  if (!prescriptions.length) {
    return (
      <p className="text-sm text-neutral-500">
        No hay prescripciones registradas para esta atención.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {prescriptions.map((prescription, index) => {
        const items = getPrescriptionItems(prescription);
        const prescriptionId =
          prescription?.id_preinscripcion ??
          prescription?.id_prescripcion ??
          prescription?.id ??
          index + 1;

        return (
          <div
            key={prescriptionId}
            className="rounded-lg border border-neutral-200 overflow-hidden"
          >
            <div className="bg-neutral-50 px-3 py-2 border-b border-neutral-200">
              <p className="text-sm font-semibold text-neutral-800">
                Prescripción #{prescriptionId}
                {prescription?.tipo != null
                  ? ` · Tipo ${prescription.tipo}`
                  : ""}
              </p>
            </div>
            {items.length === 0 ? (
              <p className="px-3 py-3 text-sm text-neutral-500">
                Sin ítems de medicamentos.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-neutral-50 border-b border-neutral-100">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-neutral-600">
                        Medicamento
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-neutral-600">
                        Dosis
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-neutral-600">
                        Cantidad
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-neutral-600">
                        Duración
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {items.map((item, itemIndex) => {
                      const presentacion = getMedicationPresentation(
                        item,
                        medicationMap
                      );
                      return (
                        <tr key={item?.id_items ?? item?.id ?? itemIndex}>
                          <td className="px-3 py-2 text-neutral-800">
                            {getMedicationDisplayLabel(item, medicationMap)}
                          </td>
                          <td className="px-3 py-2 text-neutral-800">
                            {item?.dosis ?? "—"}
                          </td>
                          <td className="px-3 py-2 text-neutral-800">
                            {formatQuantityWithUnit(item?.cantidad, presentacion)}
                          </td>
                          <td className="px-3 py-2 text-neutral-800">
                            {formatDurationWithUnit(item?.duracion)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AttentionDetailBody({ data, idPaciente, idHospitalizacion }) {
  const [prescriptions, setPrescriptions] = React.useState([]);
  const [medicationMap, setMedicationMap] = React.useState(() => new Map());
  const [loadingPrescriptions, setLoadingPrescriptions] = React.useState(false);

  const patientName =
    `${data?.nombre_paciente || ""} ${data?.apellido_paciente || ""}`.trim() ||
    "—";
  const doctorName =
    `${data?.nombre_doctor || ""} ${data?.apellido_doctor || ""}`.trim() || "—";
  const diseaseName =
    data?.nombre_enfermedad ??
    data?.diagnostico?.nombre_enfermedad ??
    "—";
  const resolvedPacienteId =
    idPaciente ??
    data?.id_paciente ??
    data?.num_doc_paciente ??
    null;
  const idAtencionPrescripcion = React.useMemo(() => {
    const raw = data?.id_atencionh ?? data?.id_atencion;
    const numeric = Number(raw);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
  }, [data?.id_atencionh, data?.id_atencion]);
  const prescriptionLookupIds = React.useMemo(() => {
    const ids = [
      idAtencionPrescripcion,
    ]
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0);
    return Array.from(new Set(ids));
  }, [
    idAtencionPrescripcion,
  ]);

  React.useEffect(() => {
    let cancelled = false;

    async function loadDetailData() {
      setLoadingPrescriptions(true);
      try {
        const medsPromise = http
          .get(`${MEDICAL_API}/api/medicamentos/search`)
          .catch(() => null);

        if (prescriptionLookupIds.length === 0) {
          const medsRes = await medsPromise;
          if (!cancelled && medsRes?.data) {
            const wrapped = unwrapBackendResponse(medsRes.data);
            const rows = Array.isArray(wrapped.data)
              ? wrapped.data
              : unwrapArray(medsRes.data);
            setMedicationMap(buildMedicationMap(rows));
          }
          setPrescriptions([]);
          return;
        }

        const [medsRes, rxRes] = await Promise.all([
          medsPromise,
          Promise.all(
            prescriptionLookupIds.map((id) =>
              loadPrescriptionsByAttentionId(id).catch(() => [])
            )
          ),
        ]);

        if (!cancelled) {
          if (medsRes?.data) {
            const wrapped = unwrapBackendResponse(medsRes.data);
            const rows = Array.isArray(wrapped.data)
              ? wrapped.data
              : unwrapArray(medsRes.data);
            setMedicationMap(buildMedicationMap(rows));
          }
          setPrescriptions(rxRes.flat());
        }
      } catch {
        if (!cancelled) {
          setPrescriptions([]);
          setMedicationMap(new Map());
        }
      } finally {
        if (!cancelled) setLoadingPrescriptions(false);
      }
    }

    loadDetailData();
    return () => {
      cancelled = true;
    };
  }, [prescriptionLookupIds]);

  return (
    <div className="mt-3 space-y-4 rounded-xl border border-neutral-200 bg-white p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <DetailField label="ID hospitalización" value={data?.id_hospitalizacion} />
        <DetailField
          label="Fecha de atención"
          value={formatDateTime(data?.fecha_atencionh)}
        />
        <DetailField label="ID doctor" value={data?.id_doctor} />
        <DetailField label="Nombre doctor" value={doctorName} />
        <DetailField label="Nombre paciente" value={patientName} />
        <DetailField label="ID paciente" value={resolvedPacienteId} />
        <DetailField label="Enfermedad" value={diseaseName} />
      </div>

      <div className="rounded-lg border border-neutral-200 p-3">
        <p className="text-xs font-semibold uppercase text-neutral-500">
          Observaciones
        </p>
        <p className="mt-2 text-sm text-neutral-800 whitespace-pre-wrap">
          {data?.observaciones?.trim() ? data.observaciones : "—"}
        </p>
      </div>

      <div className="rounded-lg border border-neutral-200 p-3">
        <p className="text-xs font-semibold uppercase text-neutral-500">
          Tratamiento
        </p>
        <p className="mt-2 text-sm text-neutral-800 whitespace-pre-wrap">
          {data?.tratamiento?.trim() ? data.tratamiento : "—"}
        </p>
      </div>

      <section>
        <h5 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-3">
          Prescripciones
        </h5>
        <AttentionPrescriptionsList
          prescriptions={prescriptions}
          loading={loadingPrescriptions}
          medicationMap={medicationMap}
        />
      </section>
    </div>
  );
}

