import React from "react";
import { AuthContext } from "../../services/auth/AuthContext";
import { http } from "../../services/api/http";
import { endpoints } from "../../services/api/endpoints";

/* -------------------------------------------------------------------------- */
/* CONFIGURACIÓN                                                              */
/* -------------------------------------------------------------------------- */

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

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

const API = {
  hospitalizations: {
    list: endpoints?.hospitalizations?.list || "/api/hospitalizacion",
    ingreso:
      endpoints?.hospitalizations?.ingreso ||
      ((id) => `/api/hospitalizacion/ingreso/${id}`),
    salida:
      endpoints?.hospitalizations?.salida ||
      ((id) => `/api/hospitalizacion/salida/${id}`),
    prescriptionItems:
      endpoints?.hospitalizations?.prescriptionItems ||
      ((id) => `/api/prescriptions/items/hospitalizacion/${id}`),
    medicationAdministration:
      endpoints?.hospitalizations?.medicationAdministration ||
      "/api/administracion_medicamentos",
    medicationAdministrationByHospitalization:
      endpoints?.hospitalizations?.medicationAdministrationByHospitalization ||
      ((id) => `/api/administracion_medicamentos/${id}`),
    createAttention:
      endpoints?.hospitalizations?.createAttention ||
      "/api/hospitalizacion/atencion",
    attentionsByHospitalization:
      endpoints?.hospitalizations?.attentionsByHospitalization ||
      ((id) => `/api/hospitalizacion/atencion/${id}`),
  },
  diagnoses: {
    search: endpoints?.diagnosticos?.search || "/api/diagnosticos/search",
  },
};

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params || {}).filter(([, value]) => {
      return value !== "" && value !== null && value !== undefined;
    })
  );
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

function getApiErrorMessage(error, fallback) {
  const data = error?.response?.data;
  if (typeof data?.Message === "string") return data.Message;
  if (typeof data?.message === "string") return data.message;
  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((item) => item?.msg || item?.message || JSON.stringify(item))
      .join(" ");
  }
  return fallback;
}

function normalizeDate(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
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
      paciente?.id_paciente ??
      paciente?.idPaciente ??
      paciente?.id ??
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
    estado: getStatusNumber(row?.estado),
    fecha_ingreso: normalizeDate(row?.fecha_ingreso ?? row?.fechaIngreso),
    fecha_salida: normalizeDate(row?.fecha_salida ?? row?.fechaSalida),
  };
}

function includesValue(filter, value) {
  if (!filter) return true;
  return String(value ?? "")
    .toLowerCase()
    .includes(String(filter).toLowerCase());
}

function dateEquals(filter, value) {
  if (!filter) return true;
  if (!value) return false;
  return normalizeDate(value) === filter;
}

function dateBetween(value, from, to) {
  if (!from && !to) return true;
  if (!value) return false;
  const date = normalizeDate(value);
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
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
  return (
    auth?.payload?.id_doctor ??
    auth?.payload?.doctor?.id_doctor ??
    auth?.payload?.medico?.id_doctor ??
    auth?.payload?.idDoctor ??
    auth?.payload?.id_usuario ??
    auth?.payload?.id ??
    auth?.payload?.num_documento ??
    undefined
  );
}

function getPrescriptionItemId(item) {
  return (
    item?.id_prescripcion_item ??
    item?.id_prescripciones_item ??
    item?.id_prescripcionItems ??
    item?.id_prescripcion_items ??
    item?.id_item ??
    item?.id ??
    item?.codigo
  );
}

function getMedicationName(item) {
  return (
    item?.medicamento?.nombre_generico ??
    item?.medicamento?.nombre ??
    item?.medicamento?.compuesto ??
    item?.nombre_generico ??
    item?.nombre ??
    item?.compuesto ??
    "Medicamento"
  );
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
  return cleanParams({
    num_doc_paciente: filters.num_documento,
    num_documento: filters.num_documento,
    num_cama: filters.num_cama,
    estado: filters.estado,
    fecha_ingreso: filters.fecha_ingreso,
    fecha_salida: filters.fecha_salida,
    skip: (page - 1) * pageSize,
    limit: pageSize,
  });
}

function buildMedicationAdministrationParams(filters, page, pageSize) {
  return cleanParams({
    num_doc_enfermera: filters.num_doc_enfermera,
    fecha_admin_desde: filters.fecha_admin_desde,
    fecha_admin_hasta: filters.fecha_admin_hasta,
    skip: (page - 1) * pageSize,
    limit: pageSize,
  });
}

function buildAttentionParams(filters, page, pageSize) {
  return cleanParams({
    num_doc_paciente: filters.num_doc_paciente,
    num_doc_doctor: filters.num_doc_doctor,
    fecha_atencionH_desde: filters.fecha_atencionH_desde,
    fecha_atencionH_hasta: filters.fecha_atencionH_hasta,
    id_diagnostico: filters.id_diagnostico,
    skip: (page - 1) * pageSize,
    limit: pageSize,
  });
}

/* -------------------------------------------------------------------------- */
/* COMPONENTE MAIN                                                            */
/* -------------------------------------------------------------------------- */

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
    num_documento: "",
    num_cama: "",
    estado: "",
    fecha_ingreso: "",
    fecha_salida: "",
  });

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const [modal, setModal] = React.useState(null);
  const [selectedHospitalization, setSelectedHospitalization] =
    React.useState(null);

  async function loadHospitalizations(nextPage = page, nextPageSize = pageSize) {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const { data } = await http.get(API.hospitalizations.list, {
        params: buildHospitalizationParams(filters, nextPage, nextPageSize),
      });
      const rows = unwrapArray(data).map(normalizeHospitalization);
      setHospitalizations(rows);
      setTotalRows(unwrapTotal(data));
    } catch (err) {
      setHospitalizations([]);
      setTotalRows(null);
      setError(
        getApiErrorMessage(err, "No fue posible cargar las hospitalizaciones.")
      );
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadHospitalizations(page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const visibleRows = React.useMemo(() => {
    return hospitalizations.filter((row) => {
      return (
        includesValue(filters.num_documento, row.num_documento) &&
        includesValue(filters.num_cama, row.num_cama) &&
        (filters.estado === "" ||
          Number(filters.estado) === Number(row.estado)) &&
        dateEquals(filters.fecha_ingreso, row.fecha_ingreso) &&
        dateEquals(filters.fecha_salida, row.fecha_salida)
      );
    });
  }, [hospitalizations, filters]);

  const totalPages = getComputedTotalPages(
    totalRows,
    page,
    pageSize,
    hospitalizations.length
  );

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function applyFilters() {
    setPage(1);
    loadHospitalizations(1, pageSize);
  }

  function clearFilters() {
    setFilters({
      num_documento: "",
      num_cama: "",
      estado: "",
      fecha_ingreso: "",
      fecha_salida: "",
    });
    setPage(1);
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

      {message && <Notice type="info">{message}</Notice>}
      {error && <Notice type="error">{error}</Notice>}

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Filtros</h2>
            <p className="text-sm text-neutral-600">
              Filtra por documento del paciente, cama, estado, fecha de
              ingreso y fecha de salida.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
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

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
          <Field label="Documento paciente">
            <Input
              value={filters.num_documento}
              onChange={(e) => updateFilter("num_documento", e.target.value)}
              placeholder="Número de documento"
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
          <Field label="Fecha ingreso">
            <Input
              type="date"
              value={filters.fecha_ingreso}
              onChange={(e) => updateFilter("fecha_ingreso", e.target.value)}
            />
          </Field>
          <Field label="Fecha salida">
            <Input
              type="date"
              value={filters.fecha_salida}
              onChange={(e) => updateFilter("fecha_salida", e.target.value)}
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
              Registros visibles: {visibleRows.length}
              {Number.isFinite(totalRows) && totalRows !== null
                ? ` · Total backend: ${totalRows}`
                : ""}
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
        ) : visibleRows.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            No hay hospitalizaciones que coincidan con los filtros.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <Th>ID hospitalización</Th>
                  <Th>ID paciente</Th>
                  <Th>Paciente</Th>
                  <Th>Documento</Th>
                  <Th>Cama</Th>
                  <Th>Estado</Th>
                  <Th>Fecha ingreso</Th>
                  <Th>Fecha salida</Th>
                  <Th>Acciones</Th>
                  <Th>Detalle</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {visibleRows.map((row) => (
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
        <JsonModal
          title="Detalle completo de hospitalización"
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
          hospitalization={selectedHospitalization}
          auth={auth}
          onClose={closeModal}
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

/* -------------------------------------------------------------------------- */
/* FILA PRINCIPAL                                                             */
/* -------------------------------------------------------------------------- */

function HospitalizationRow({ row, isNurse, isDoctor, openModal }) {
  const canAdmission = row.estado === 0;
  const canCreateMedicationAdministration = row.estado === 1;
  const canDischarge = row.estado === 1;
  const canViewMedicationAdministration = row.estado === 1 || row.estado === 2;
  const canCreateAttention = row.estado === 1;
  const canViewAttentions = row.estado === 1;

  return (
    <tr className="hover:bg-neutral-50">
      <Td>{row.id_hospitalizacion}</Td>
      <Td>{row.id_paciente || "—"}</Td>
      <Td>{`${row.nombres || ""} ${row.apellidos || ""}`.trim() || "—"}</Td>
      <Td>{row.num_documento || "—"}</Td>
      <Td>{row.num_cama || "—"}</Td>
      <Td>
        <StatusBadge estado={row.estado} />
      </Td>
      <Td>{row.fecha_ingreso || "—"}</Td>
      <Td>{row.fecha_salida || "—"}</Td>
      <Td>
        <div className="flex flex-wrap gap-2">
          {isNurse && (
            <>
              <ActionButton
                disabled={!canAdmission}
                onClick={() => openModal("ingreso", row)}
              >
                Realizar ingreso
              </ActionButton>
              <ActionButton
                disabled={!canCreateMedicationAdministration}
                onClick={() =>
                  openModal("createMedicationAdministration", row)
                }
              >
                Crear adm. medicamento
              </ActionButton>
              <ActionButton
                disabled={!canDischarge}
                onClick={() => openModal("salida", row)}
              >
                Salida
              </ActionButton>
              <ActionButton
                disabled={!canViewMedicationAdministration}
                onClick={() => openModal("viewMedicationAdministration", row)}
              >
                Ver adm. medicamento
              </ActionButton>
            </>
          )}
          {isDoctor && (
            <>
              <ActionButton
                disabled={!canCreateAttention}
                onClick={() => openModal("createAttention", row)}
              >
                Crear atención
              </ActionButton>
              <ActionButton
                disabled={!canViewAttentions}
                onClick={() => openModal("viewAttentions", row)}
              >
                Ver atenciones
              </ActionButton>
            </>
          )}
        </div>
      </Td>
      <Td>
        <ActionButton disabled={false} onClick={() => openModal("detail", row)}>
          Ver detalle
        </ActionButton>
      </Td>
    </tr>
  );
}

/* -------------------------------------------------------------------------- */
/* MODAL INGRESO                                                              */
/* -------------------------------------------------------------------------- */

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
    if (!String(numCama).trim()) {
      setError("El número de cama es obligatorio.");
      return;
    }
    setSaving(true);
    try {
      await http.put(
        API.hospitalizations.ingreso(hospitalization.id_hospitalizacion),
        {
          num_cama: toApiValue(String(numCama).trim()),
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

/* -------------------------------------------------------------------------- */
/* MODAL SALIDA                                                               */
/* -------------------------------------------------------------------------- */

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
      await http.put(
        API.hospitalizations.salida(hospitalization.id_hospitalizacion)
      );
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

/* -------------------------------------------------------------------------- */
/* CREAR ADMINISTRACIÓN DE MEDICAMENTOS                                       */
/* -------------------------------------------------------------------------- */

function CreateMedicationAdministrationModal({
  hospitalization,
  onClose,
  setError,
  setMessage,
}) {
  const [items, setItems] = React.useState([]);
  const [totalRows, setTotalRows] = React.useState(null);
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  async function loadItems(nextPage = page, nextPageSize = pageSize) {
    setLoading(true);
    setError("");
    try {
      const { data } = await http.get(
        API.hospitalizations.prescriptionItems(
          hospitalization.id_hospitalizacion
        ),
        {
          params: cleanParams({
            skip: (nextPage - 1) * nextPageSize,
            limit: nextPageSize,
          }),
        }
      );
      setItems(unwrapArray(data));
      setTotalRows(unwrapTotal(data));
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
  }

  React.useEffect(() => {
    loadItems(page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const totalPages = getComputedTotalPages(
    totalRows,
    page,
    pageSize,
    items.length
  );

  function toggle(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  async function createAdministrations() {
    const normalizedIds = selectedIds.map(toApiValue);
    await Promise.all(
      normalizedIds.map((id) =>
        http.post(
          API.hospitalizations.medicationAdministration,
          cleanPayload({
            id_hospitalizacion: toApiValue(
              hospitalization.id_hospitalizacion
            ),
            id_prescripcion_item: id,
          })
        )
      )
    );
  }

  async function submit() {
    setError("");
    if (selectedIds.length === 0) {
      setError("Debe seleccionar al menos un ítem de prescripción.");
      return;
    }
    setSaving(true);
    try {
      await createAdministrations();
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
          Selecciona los ítems de prescripción que serán administrados. La
          información de enfermería debe ser resuelta por el backend desde la
          sesión autenticada.
        </p>

        {loading ? (
          <p className="text-neutral-600">Cargando ítems de prescripción...</p>
        ) : items.length === 0 ? (
          <p className="text-neutral-500">
            No hay ítems de prescripción disponibles para esta hospitalización.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => {
              const id = getPrescriptionItemId(item) ?? index;
              const selected = selectedIds.includes(id);
              return (
                <label
                  key={id}
                  className="flex gap-3 rounded-xl border border-neutral-200 p-4 hover:bg-neutral-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggle(id)}
                    className="mt-1"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-neutral-900">
                      {getMedicationName(item)}
                    </p>
                    <p className="mt-1 text-sm text-neutral-600">
                      Código:{" "}
                      {item?.medicamento?.codigo ?? item?.codigo ?? "—"} ·
                      Dosis: {item?.dosis ?? "—"} · Duración:{" "}
                      {item?.duracion ?? "—"} · Cantidad:{" "}
                      {item?.cantidad ?? "—"}
                    </p>
                    <RecordDetails data={item} />
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
            setPageSize(size);
            setPage(1);
          }}
        />

        <ModalActions
          onClose={onClose}
          loading={saving}
          submitLabel="Crear administración"
          onSubmit={submit}
        />
      </div>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/* VER ADMINISTRACIÓN DE MEDICAMENTOS                                         */
/* -------------------------------------------------------------------------- */

function MedicationAdministrationListModal({
  hospitalization,
  onClose,
  setError,
}) {
  const [rows, setRows] = React.useState([]);
  const [totalRows, setTotalRows] = React.useState(null);
  const [filters, setFilters] = React.useState({
    num_doc_enfermera: "",
    fecha_admin_desde: "",
    fecha_admin_hasta: "",
  });
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);
  const [loading, setLoading] = React.useState(false);

  async function loadRows(nextPage = page, nextPageSize = pageSize) {
    setLoading(true);
    setError("");
    try {
      const { data } = await http.get(
        API.hospitalizations.medicationAdministrationByHospitalization(
          hospitalization.id_hospitalizacion
        ),
        {
          params: buildMedicationAdministrationParams(
            filters,
            nextPage,
            nextPageSize
          ),
        }
      );
      setRows(unwrapArray(data));
      setTotalRows(unwrapTotal(data));
    } catch (err) {
      setRows([]);
      setTotalRows(null);
      setError(
        getApiErrorMessage(
          err,
          "No fue posible cargar la administración de medicamentos."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadRows(page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const visibleRows = React.useMemo(() => {
    return rows.filter((row) => {
      return (
        includesValue(filters.num_doc_enfermera, row?.num_doc_enfermera) &&
        dateBetween(
          row?.fecha_admin,
          filters.fecha_admin_desde,
          filters.fecha_admin_hasta
        )
      );
    });
  }, [rows, filters]);

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
    loadRows(1, pageSize);
  }

  return (
    <Modal title="Administración de medicamentos" onClose={onClose} size="xl">
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Field label="Documento enfermera">
            <Input
              value={filters.num_doc_enfermera}
              onChange={(e) =>
                updateFilter("num_doc_enfermera", e.target.value)
              }
              placeholder="Num. documento"
            />
          </Field>
          <Field label="Fecha admin desde">
            <Input
              type="date"
              value={filters.fecha_admin_desde}
              onChange={(e) =>
                updateFilter("fecha_admin_desde", e.target.value)
              }
            />
          </Field>
          <Field label="Fecha admin hasta">
            <Input
              type="date"
              value={filters.fecha_admin_hasta}
              onChange={(e) =>
                updateFilter("fecha_admin_hasta", e.target.value)
              }
            />
          </Field>
          <div className="flex items-end">
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
        ) : visibleRows.length === 0 ? (
          <p className="text-neutral-500">
            No hay administraciones de medicamentos para los filtros actuales.
          </p>
        ) : (
          <div className="space-y-3">
            {visibleRows.map((row, index) => (
              <RecordCard
                key={row?.id_administracion ?? row?.id ?? index}
                title={`Administración #${
                  row?.id_administracion ?? row?.id ?? index + 1
                }`}
                subtitle={[
                  row?.fecha_admin
                    ? `Fecha: ${normalizeDate(row.fecha_admin)}`
                    : null,
                  row?.num_doc_enfermera
                    ? `Doc. enfermera: ${row.num_doc_enfermera}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                data={row}
              />
            ))}
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

/* -------------------------------------------------------------------------- */
/* CREAR ATENCIÓN DE HOSPITALIZACIÓN                                          */
/* -------------------------------------------------------------------------- */

function CreateAttentionModal({
  hospitalization,
  auth,
  onClose,
  setError,
  setMessage,
}) {
  const [diagnoses, setDiagnoses] = React.useState(FALLBACK_DIAGNOSES);
  const [diagnosisSearch, setDiagnosisSearch] = React.useState("");
  const [form, setForm] = React.useState({
    observaciones: "",
    tratamiento: "",
    id_diagnostico: "",
    crear_prescripcion: false,
    prescripcion: {
      tipo_prescripcion: 0,
      medicamentos: [],
    },
  });
  const [loadingDiagnoses, setLoadingDiagnoses] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  async function searchDiagnoses() {
    setLoadingDiagnoses(true);
    try {
      const { data } = await http.get(API.diagnoses.search, {
        params: cleanParams({
          nombre: diagnosisSearch,
        }),
      });
      const list = unwrapArray(data);
      setDiagnoses(list.length > 0 ? list : FALLBACK_DIAGNOSES);
    } catch {
      setDiagnoses(FALLBACK_DIAGNOSES);
    } finally {
      setLoadingDiagnoses(false);
    }
  }

  React.useEffect(() => {
    searchDiagnoses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addMedicationItem() {
    setForm((prev) => ({
      ...prev,
      prescripcion: {
        ...prev.prescripcion,
        medicamentos: [
          ...prev.prescripcion.medicamentos,
          {
            codigo: "",
            dosis: "",
            duracion: "",
            cantidad: "",
          },
        ],
      },
    }));
  }

  function updateMedicationItem(index, key, value) {
    setForm((prev) => {
      const medicamentos = [...prev.prescripcion.medicamentos];
      medicamentos[index] = {
        ...medicamentos[index],
        [key]: value,
      };
      return {
        ...prev,
        prescripcion: {
          ...prev.prescripcion,
          medicamentos,
        },
      };
    });
  }

  function removeMedicationItem(index) {
    setForm((prev) => ({
      ...prev,
      prescripcion: {
        ...prev.prescripcion,
        medicamentos: prev.prescripcion.medicamentos.filter(
          (_, itemIndex) => itemIndex !== index
        ),
      },
    }));
  }

  function validateForm() {
    if (!form.observaciones.trim()) {
      return "Las observaciones son obligatorias.";
    }
    if (!form.tratamiento.trim()) {
      return "El tratamiento es obligatorio.";
    }
    if (!form.id_diagnostico) {
      return "Debe seleccionar el nombre de la enfermedad.";
    }
    if (form.crear_prescripcion) {
      if (form.prescripcion.medicamentos.length === 0) {
        return "Debe agregar al menos un ítem de prescripción.";
      }
      const invalidItem = form.prescripcion.medicamentos.some((item) => {
        return (
          !String(item.codigo).trim() ||
          !String(item.dosis).trim() ||
          !String(item.duracion).trim() ||
          !String(item.cantidad).trim()
        );
      });
      if (invalidItem) {
        return "Todos los ítems de prescripción deben tener código, dosis, duración y cantidad.";
      }
    }
    return "";
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    try {
      const idDoctor = getAuthDoctorId(auth);
      const payload = cleanPayload({
        id_hospitalizacion: toApiValue(hospitalization.id_hospitalizacion),
        id_doctor: idDoctor,
        observaciones: form.observaciones.trim(),
        tratamiento: form.tratamiento.trim(),
        id_diagnostico: toApiValue(form.id_diagnostico),
        crear_prescripcion: form.crear_prescripcion,
        prescripcion: form.crear_prescripcion
          ? {
              tipo_prescripcion: toApiValue(form.prescripcion.tipo_prescripcion),
              medicamentos: form.prescripcion.medicamentos.map((item) => ({
                codigo: toApiValue(item.codigo),
                dosis: item.dosis,
                duracion: toApiValue(item.duracion),
                cantidad: toApiValue(item.cantidad),
              })),
            }
          : undefined,
      });
      await http.post(API.hospitalizations.createAttention, payload);
      setMessage("Atención de hospitalización creada correctamente.");
      onClose();
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "No fue posible crear la atención de hospitalización."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Crear atención de hospitalización" onClose={onClose} size="xl">
      <form onSubmit={submit} className="space-y-5">
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

        <Field label="Observaciones">
          <Textarea
            value={form.observaciones}
            onChange={(e) =>
              setForm({ ...form, observaciones: e.target.value })
            }
            placeholder="Observaciones clínicas"
          />
        </Field>

        <Field label="Tratamiento">
          <Textarea
            value={form.tratamiento}
            onChange={(e) =>
              setForm({ ...form, tratamiento: e.target.value })
            }
            placeholder="Tratamiento indicado"
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
          <Field label="Buscar enfermedad">
            <Input
              value={diagnosisSearch}
              onChange={(e) => setDiagnosisSearch(e.target.value)}
              placeholder="Nombre de enfermedad"
            />
          </Field>
          <div className="flex items-end">
            <button
              type="button"
              onClick={searchDiagnoses}
              disabled={loadingDiagnoses}
              className="rounded-xl bg-secondary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-secondary-600 disabled:opacity-50"
            >
              {loadingDiagnoses ? "Buscando..." : "Buscar"}
            </button>
          </div>
        </div>

        <Field label="Nombre enfermedad">
          <Select
            value={form.id_diagnostico}
            onChange={(e) =>
              setForm({ ...form, id_diagnostico: e.target.value })
            }
          >
            <option value="">Selecciona...</option>
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

        <label className="flex items-center gap-2 rounded-xl border border-neutral-200 p-3 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={form.crear_prescripcion}
            onChange={(e) =>
              setForm({ ...form, crear_prescripcion: e.target.checked })
            }
          />
          Crear prescripción y prescripción items
        </label>

        {form.crear_prescripcion && (
          <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h4 className="font-semibold text-neutral-900">
                  Prescripción
                </h4>
                <p className="text-sm text-neutral-600">
                  Registra los medicamentos asociados a la atención de
                  hospitalización.
                </p>
              </div>
              <button
                type="button"
                onClick={addMedicationItem}
                className="rounded-xl border border-primary-500/30 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50"
              >
                Agregar ítem
              </button>
            </div>

            <Field label="Tipo prescripción">
              <Select
                value={form.prescripcion.tipo_prescripcion}
                onChange={(e) =>
                  setForm({
                    ...form,
                    prescripcion: {
                      ...form.prescripcion,
                      tipo_prescripcion: e.target.value,
                    },
                  })
                }
              >
                <option value="0">Medicamento</option>
                <option value="1">Otra</option>
              </Select>
            </Field>

            {form.prescripcion.medicamentos.length === 0 ? (
              <p className="text-sm text-neutral-500">
                No has agregado ítems de prescripción.
              </p>
            ) : (
              <div className="space-y-3">
                {form.prescripcion.medicamentos.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-neutral-200 bg-white p-4 grid grid-cols-1 md:grid-cols-5 gap-3"
                  >
                    <Field label="Código medicamento">
                      <Input
                        value={item.codigo}
                        onChange={(e) =>
                          updateMedicationItem(index, "codigo", e.target.value)
                        }
                        placeholder="Código"
                      />
                    </Field>
                    <Field label="Dosis">
                      <Input
                        value={item.dosis}
                        onChange={(e) =>
                          updateMedicationItem(index, "dosis", e.target.value)
                        }
                        placeholder="Ej: 500mg cada 8h"
                      />
                    </Field>
                    <Field label="Duración">
                      <Input
                        type="number"
                        min="1"
                        value={item.duracion}
                        onChange={(e) =>
                          updateMedicationItem(
                            index,
                            "duracion",
                            e.target.value
                          )
                        }
                        placeholder="Días"
                      />
                    </Field>
                    <Field label="Cantidad">
                      <Input
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) =>
                          updateMedicationItem(
                            index,
                            "cantidad",
                            e.target.value
                          )
                        }
                        placeholder="Cantidad"
                      />
                    </Field>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeMedicationItem(index)}
                        className="w-full rounded-xl border border-emergency-500/30 px-3 py-2 text-sm font-semibold text-emergency-600 hover:bg-emergency-50"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <ModalActions
          onClose={onClose}
          loading={saving}
          submitLabel="Crear atención"
        />
      </form>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/* VER ATENCIONES DE HOSPITALIZACIÓN                                          */
/* -------------------------------------------------------------------------- */

function AttentionListModal({ hospitalization, onClose, setError }) {
  const [diagnoses, setDiagnoses] = React.useState(FALLBACK_DIAGNOSES);
  const [rows, setRows] = React.useState([]);
  const [totalRows, setTotalRows] = React.useState(null);
  const [filters, setFilters] = React.useState({
    num_doc_paciente: "",
    num_doc_doctor: "",
    fecha_atencionH_desde: "",
    fecha_atencionH_hasta: "",
    id_diagnostico: "",
  });
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);
  const [loading, setLoading] = React.useState(false);

  async function loadDiagnoses() {
    try {
      const { data } = await http.get(API.diagnoses.search);
      const list = unwrapArray(data);
      if (list.length > 0) {
        setDiagnoses(list);
      }
    } catch {
      setDiagnoses(FALLBACK_DIAGNOSES);
    }
  }

  async function loadRows(nextPage = page, nextPageSize = pageSize) {
    setLoading(true);
    setError("");
    try {
      const { data } = await http.get(
        API.hospitalizations.attentionsByHospitalization(
          hospitalization.id_hospitalizacion
        ),
        {
          params: buildAttentionParams(filters, nextPage, nextPageSize),
        }
      );
      setRows(unwrapArray(data));
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
  }

  React.useEffect(() => {
    loadDiagnoses();
    loadRows(page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const visibleRows = React.useMemo(() => {
    return rows.filter((row) => {
      return (
        includesValue(filters.num_doc_paciente, row?.num_doc_paciente) &&
        includesValue(filters.num_doc_doctor, row?.num_doc_doctor) &&
        dateBetween(
          row?.fecha_atencionH,
          filters.fecha_atencionH_desde,
          filters.fecha_atencionH_hasta
        ) &&
        (filters.id_diagnostico === "" ||
          Number(filters.id_diagnostico) === Number(row?.id_diagnostico))
      );
    });
  }, [rows, filters]);

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
    loadRows(1, pageSize);
  }

  return (
    <Modal title="Atenciones de hospitalización" onClose={onClose} size="xl">
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <Field label="Doc. paciente">
            <Input
              value={filters.num_doc_paciente}
              onChange={(e) =>
                updateFilter("num_doc_paciente", e.target.value)
              }
            />
          </Field>
          <Field label="Doc. doctor">
            <Input
              value={filters.num_doc_doctor}
              onChange={(e) => updateFilter("num_doc_doctor", e.target.value)}
            />
          </Field>
          <Field label="Fecha desde">
            <Input
              type="date"
              value={filters.fecha_atencionH_desde}
              onChange={(e) =>
                updateFilter("fecha_atencionH_desde", e.target.value)
              }
            />
          </Field>
          <Field label="Fecha hasta">
            <Input
              type="date"
              value={filters.fecha_atencionH_hasta}
              onChange={(e) =>
                updateFilter("fecha_atencionH_hasta", e.target.value)
              }
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
          <div className="flex items-end">
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
          <p className="text-neutral-600">Cargando atenciones...</p>
        ) : visibleRows.length === 0 ? (
          <p className="text-neutral-500">
            No hay atenciones de hospitalización para los filtros actuales.
          </p>
        ) : (
          <div className="space-y-3">
            {visibleRows.map((row, index) => (
              <RecordCard
                key={row?.id_atencion ?? row?.id ?? index}
                title={`Atención #${row?.id_atencion ?? row?.id ?? index + 1}`}
                subtitle={[
                  row?.nombre_enfermedad ||
                  row?.diagnostico?.nombre_enfermedad
                    ? `Diagnóstico: ${
                        row?.nombre_enfermedad ||
                        row?.diagnostico?.nombre_enfermedad
                      }`
                    : null,
                  row?.nombre_paciente || row?.apellido_paciente
                    ? `Paciente: ${`${row?.nombre_paciente || ""} ${
                        row?.apellido_paciente || ""
                      }`.trim()}`
                    : null,
                  row?.nombre_doctor || row?.apellido_doctor
                    ? `Doctor: ${`${row?.nombre_doctor || ""} ${
                        row?.apellido_doctor || ""
                      }`.trim()}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                data={row}
              />
            ))}
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

/* -------------------------------------------------------------------------- */
/* UI COMPONENTS                                                              */
/* -------------------------------------------------------------------------- */

function PaginationControls({
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
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
        {PAGE_SIZE_OPTIONS.map((option) => (
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

function ModalActions({ onClose, loading, submitLabel, onSubmit }) {
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
        disabled={loading}
        className="rounded-xl bg-primary-500 px-4 py-2 font-semibold text-white hover:bg-primary-600 disabled:opacity-50"
      >
        {loading ? "Procesando..." : submitLabel}
      </button>
    </div>
  );
}

function Notice({ children, type }) {
  const classes =
    type === "error"
      ? "bg-emergency-50 text-emergency-700 border-emergency-500/20"
      : "bg-secondary-50 text-secondary-700 border-secondary-100";
  return (
    <div className={`rounded-2xl border p-4 text-sm ${classes}`}>
      {children}
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

function ActionButton({ children, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={
        disabled
          ? "rounded-lg px-3 py-1.5 text-xs font-medium bg-neutral-100 text-neutral-400 cursor-not-allowed"
          : "rounded-lg px-3 py-1.5 text-xs font-medium bg-primary-500 text-white hover:bg-primary-600"
      }
    >
      {children}
    </button>
  );
}

function RecordCard({ title, subtitle, data }) {
  return (
    <article className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <p className="font-semibold text-neutral-900">{title}</p>
      {subtitle && <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>}
      <RecordDetails data={data} />
    </article>
  );
}

function RecordDetails({ data }) {
  return (
    <details className="mt-3">
      <summary className="cursor-pointer text-sm font-medium text-secondary-700">
        Ver datos completos
      </summary>
      <pre className="mt-2 overflow-auto rounded-lg border border-neutral-200 bg-white p-3 text-xs text-neutral-700">
        {JSON.stringify(data, null, 2)}
      </pre>
    </details>
  );
}

function JsonModal({ title, data, onClose }) {
  return (
    <Modal title={title} onClose={onClose} size="xl">
      <pre className="overflow-auto rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-700">
        {JSON.stringify(data, null, 2)}
      </pre>
    </Modal>
  );
}
