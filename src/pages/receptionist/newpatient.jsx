// src/pages/receptionist/newpatient.jsx
import React from "react";
import { Link } from "react-router-dom";
import { MainLayout, PageContainer } from "../../components/layout";
import { Button } from "../../components/ui";
import { ROUTES, BRAND_NAME } from "../../constants";
import { http } from "../../services/api/http";
import { endpoints } from "../../services/api/endpoints";

/**
 * HU: Interfaz de afiliación con consentimiento
 * Ruta: /receptionist/patients/new
 *
 * OBJETIVO DE ESTE ARCHIVO:
 * - Dejar la vista y el modelo de datos alineados con el backend (POST /api/patients)
 * - NO consumir aún el endpoint (se deja "hook point" claro para el siguiente dev)
 *
 * BACKEND (request keys):
 *  - num_documento:number
 *  - password:string
 *  - nombres:string
 *  - apellidos:string
 *  - fecha_nac:YYYY-MM-DD
 *  - genero:string
 *  - direccion:string
 *  - email:string
 *  - contacto_emergencia:string
 *  - telefono_emergencia:number
 *  - grupo_sanguineo:string (ejemplo backend: "O+")
 *  - factor_RH:string (ejemplo backend: "+")
 *  - consentimiento_datos:boolean
 */

const DOC_TYPES = [
  { value: "CC", label: "Cédula de ciudadanía (CC)" },
  { value: "TI", label: "Tarjeta de identidad (TI)" },
  { value: "CE", label: "Cédula de extranjería (CE)" },
  { value: "PA", label: "Pasaporte (PA)" },
];

const GENDERS = [
  { value: "Femenino", label: "Femenino" },
  { value: "Masculino", label: "Masculino" },
  { value: "Otro", label: "Otro" },
  { value: "Prefiero no decirlo", label: "Prefiero no decirlo" },
];

const BLOOD_TYPES = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((x) => ({
  value: x,
  label: x,
}));

// Mock local anti-duplicado (UI only). El siguiente dev lo reemplaza por GET real.
const MOCK_EXISTING_PATIENTS = [
  { num_documento: 1012345678, num_afiliacion_formateado: "EPS-20260228-3" },
  { num_documento: 99001122, num_afiliacion_formateado: "EPS-20260110-9" },
];

function onlyDigits(value) {
  return String(value ?? "").replace(/[^\d]/g, "");
}

function normalize(value) {
  return String(value ?? "").trim();
}

function inferRHFromBloodType(bt) {
  // "O+" -> "+"
  if (!bt) return "";
  const last = bt.slice(-1);
  return last === "+" || last === "-" ? last : "";
}

function validate(form) {
  const errors = {};

  // Datos usuario
  if (!form.documentType) errors.documentType = "Selecciona el tipo de documento.";
  if (!normalize(form.num_documento)) errors.num_documento = "El número de documento es requerido.";
  if (normalize(form.num_documento) && !/^\d+$/.test(onlyDigits(form.num_documento))) {
    errors.num_documento = "El documento debe ser numérico (sin puntos ni espacios).";
  }
  if (!form.password || form.password.trim().length < 8) {
    errors.password = "La contraseña es requerida (mínimo 8 caracteres).";
  }

  // Info personal
  if (!normalize(form.nombres)) errors.nombres = "Nombres son requeridos.";
  if (!normalize(form.apellidos)) errors.apellidos = "Apellidos son requeridos.";
  if (!form.fecha_nac) errors.fecha_nac = "Fecha de nacimiento es requerida.";
  if (!form.genero) errors.genero = "Selecciona el género.";
  if (!normalize(form.email)) errors.email = "Email es requerido.";
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Email no es válido.";
  }
  if (!normalize(form.direccion)) errors.direccion = "Dirección es requerida.";
  if (!normalize(form.contacto_emergencia)) errors.contacto_emergencia = "Contacto de emergencia es requerido.";
  if (!normalize(form.telefono_emergencia)) errors.telefono_emergencia = "Teléfono de emergencia es requerido.";
  if (normalize(form.telefono_emergencia) && !/^\d+$/.test(onlyDigits(form.telefono_emergencia))) {
    errors.telefono_emergencia = "Teléfono de emergencia debe ser numérico.";
  }

  // Info médica
  if (!form.tipo_sangre) errors.tipo_sangre = "Selecciona el tipo de sangre.";

  // Consentimiento
  if (!form.consentimiento_datos) {
    errors.consentimiento_datos = "Debes aceptar el consentimiento para continuar.";
  }

  return errors;
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-emergency-500">{message}</p>;
}

function SectionTitle({ icon, title, subtitle }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center">
          <span className="text-primary-700 font-bold">{icon}</span>
        </div>
        <h2 className="text-lg md:text-xl font-semibold text-neutral-900">{title}</h2>
      </div>
      {subtitle ? <p className="mt-1 text-sm text-neutral-600">{subtitle}</p> : null}
    </div>
  );
}

function Modal({ open, title, children, onClose, primaryAction }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-neutral-900/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl bg-white border border-neutral-200 shadow-xl">
          <div className="p-5 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
          </div>
          <div className="p-5">{children}</div>
          <div className="p-5 border-t border-neutral-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition"
            >
              Cerrar
            </button>
            {primaryAction}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewPatient() {
  const [form, setForm] = React.useState({
    // UI-only
    documentType: "",

    // Backend keys
    num_documento: "",
    password: "",
    nombres: "",
    apellidos: "",
    fecha_nac: "",
    genero: "",
    direccion: "",
    email: "",
    contacto_emergencia: "",
    telefono_emergencia: "",
    // UX: un solo campo; backend requiere ambos
    tipo_sangre: "", // "O+"
    consentimiento_datos: false,
  });

  const [errors, setErrors] = React.useState({});
  const [busySearch, setBusySearch] = React.useState(false);
  const [busySubmit, setBusySubmit] = React.useState(false);

  const [duplicateInfo, setDuplicateInfo] = React.useState(null);

  // Modal (preparado para response real del backend)
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [createdPatient, setCreatedPatient] = React.useState(null); // aquí irá el JSON del backend

  const update = (key) => (e) => {
    const value = e?.target?.type === "checkbox" ? e.target.checked : e.target.value;

    setForm((prev) => {
      // Normalizaciones críticas
      if (key === "num_documento") return { ...prev, [key]: onlyDigits(value) };
      if (key === "telefono_emergencia") return { ...prev, [key]: onlyDigits(value) };
      return { ...prev, [key]: value };
    });

    // Limpieza incremental de error por campo
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  function buildCreatePayload(currentForm) {
    const tipoSangre = currentForm.tipo_sangre; // ej: "O+"
    const rh = inferRHFromBloodType(tipoSangre);

    return {
      apellidos: currentForm.apellidos.trim(),
      consentimiento_datos: !!currentForm.consentimiento_datos,
      contacto_emergencia: currentForm.contacto_emergencia.trim(),
      direccion: currentForm.direccion.trim(),
      email: currentForm.email.trim(),
      factor_RH: rh, // "+" | "-"
      fecha_nac: currentForm.fecha_nac, // "YYYY-MM-DD"
      genero: currentForm.genero, // "Femenino" ...
      grupo_sanguineo: tipoSangre, // backend example: "O+"
      nombres: currentForm.nombres.trim(),
      num_documento: Number(onlyDigits(currentForm.num_documento)),
      password: currentForm.password,
      telefono_emergencia: Number(onlyDigits(currentForm.telefono_emergencia)),
    };
  }

  const handleSearchByDocument = async () => {
    setDuplicateInfo(null);

    const docType = form.documentType;
    const docNumber = onlyDigits(form.num_documento);

    const localErrors = {};
    if (!docType) localErrors.documentType = "Selecciona el tipo de documento para buscar.";
    if (!docNumber) localErrors.num_documento = "Ingresa el número de documento para buscar.";

    if (Object.keys(localErrors).length) {
      setErrors((prev) => ({ ...prev, ...localErrors }));
      return;
    }

    setBusySearch(true);
    try {
      // Simulación IO
      await new Promise((r) => setTimeout(r, 350));

      const found = MOCK_EXISTING_PATIENTS.find((p) => String(p.num_documento) === String(docNumber));

      if (found) {
        setDuplicateInfo({
          type: "found",
          message: `Ya existe un paciente con este documento. N° de afiliación: ${found.num_afiliacion_formateado}`,
        });
      } else {
        setDuplicateInfo({
          type: "notfound",
          message: "No se encontraron duplicados. Puedes continuar con el registro.",
        });
      }
    } finally {
      setBusySearch(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDuplicateInfo(null);

    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;

    // Anti-duplicado (mock UI). El backend hará su propia validación.
    const docNumber = onlyDigits(form.num_documento);
    const found = MOCK_EXISTING_PATIENTS.find((p) => String(p.num_documento) === String(docNumber));
    if (found) {
      setDuplicateInfo({
        type: "found",
        message: `Registro bloqueado: documento duplicado. N° afiliación existente: ${found.num_afiliacion_formateado}`,
      });
      return;
    }

    setBusySubmit(true);
    try {
      const payload = buildCreatePayload(form);

      // Llamado real al backend: POST /api/patients (requiere token bearer)
      const res = await http.post(endpoints.patients.create, payload);

      // El backend puede responder plano (PacienteResponse) o envuelto (APIResponse.Data).
      const patient = res?.data?.Data ?? res?.data;
      setCreatedPatient(patient);
      setConfirmOpen(true);
    } catch (err) {
      const apiMessage = err?.response?.data?.detail || err?.response?.data?.Message;
      setDuplicateInfo({
        type: "found",
        message: apiMessage || "Error al registrar paciente. Verifica los datos o tu sesión.",
      });
    } finally {
      setBusySubmit(false);
    }
  };

  const ConsentText = () => (
    <div className="space-y-3 text-sm text-neutral-700 leading-relaxed">
      <p className="font-semibold text-neutral-900">
        Autorización expresa para el tratamiento de datos personales (Ley 1581 de 2012)
      </p>

      <p>
        En cumplimiento de la Ley 1581 de 2012 y normas concordantes, autorizo de manera previa,
        expresa e informada a <span className="font-medium">{BRAND_NAME}</span> para recolectar,
        almacenar, usar, circular y suprimir mis datos personales, incluyendo datos sensibles
        cuando aplique, con el fin de gestionar la prestación de servicios de salud.
      </p>

      <p className="font-medium text-neutral-900">Finalidades del tratamiento:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Servicios de salud, autorizaciones y atención integral.</li>
        <li>Gestión de citas, programación, recordatorios y continuidad del cuidado.</li>
        <li>Administración de historia clínica y procesos asistenciales relacionados.</li>
        <li>Comunicaciones informativas y administrativas asociadas a afiliación y trámites.</li>
      </ul>

      <p className="font-medium text-neutral-900">Derechos del titular:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Conocer, actualizar y rectificar sus datos personales.</li>
        <li>Solicitar prueba de la autorización otorgada.</li>
        <li>Ser informado sobre el uso dado a sus datos.</li>
        <li>Presentar quejas ante la autoridad competente por infracciones.</li>
        <li>Revocar la autorización y/o solicitar la supresión del dato cuando proceda.</li>
      </ul>

      <p className="text-neutral-600">
        Al aceptar, declara que la información suministrada es veraz y que ha leído y comprendido
        el alcance de esta autorización.
      </p>
    </div>
  );

  const affiliation =
    createdPatient?.num_afiliacion_formateado ??
    (createdPatient?.num_afiliacion != null ? String(createdPatient.num_afiliacion) : null);

  return (
    <MainLayout>
      <PageContainer>
        <div className="mb-8 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">Afiliación de pacientes</h1>
            <p className="mt-1 text-neutral-600">
              Registro de paciente con consentimiento para tratamiento de datos.
            </p>
          </div>

          <Link to={ROUTES.HOME}>
            <Button variant="outline" size="sm">
              ← Volver
            </Button>
          </Link>
        </div>

        {duplicateInfo ? (
          <div
            className={[
              "mb-6 rounded-2xl border p-4",
              duplicateInfo.type === "found"
                ? "bg-emergency-50 border-emergency-500/30"
                : "bg-primary-50 border-primary-500/20",
            ].join(" ")}
          >
            <p
              className={[
                "text-sm font-medium",
                duplicateInfo.type === "found" ? "text-emergency-500" : "text-primary-700",
              ].join(" ")}
            >
              {duplicateInfo.message}
            </p>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1) Datos Usuario */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <SectionTitle
              icon="1"
              title="Datos Usuario"
              subtitle="Identificación del paciente para búsqueda y registro."
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <label className="text-sm font-medium text-neutral-800">Tipo de documento</label>
                <select
                  value={form.documentType}
                  onChange={update("documentType")}
                  className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-200"
                >
                  <option value="">Selecciona…</option>
                  {DOC_TYPES.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.documentType} />
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-800">Número de documento</label>
                <input
                  inputMode="numeric"
                  value={form.num_documento}
                  onChange={update("num_documento")}
                  placeholder="Ej: 1012345678"
                  className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
                <FieldError message={errors.num_documento} />
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-800">Contraseña</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={update("password")}
                  placeholder="Mín. 8 caracteres"
                  className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
                <FieldError message={errors.password} />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleSearchByDocument}
                  disabled={busySearch}
                  className={[
                    "w-full rounded-xl px-4 py-2 font-medium transition",
                    busySearch
                      ? "bg-neutral-200 text-neutral-600 cursor-not-allowed"
                      : "bg-secondary-500 text-white hover:bg-secondary-600",
                  ].join(" ")}
                >
                  {busySearch ? "Buscando…" : "Buscar duplicado"}
                </button>
              </div>
            </div>
          </section>

          {/* 2) Info Personal */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <SectionTitle icon="2" title="Info Personal" subtitle="Datos básicos y de contacto." />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-neutral-800">Nombres</label>
                <input
                  value={form.nombres}
                  onChange={update("nombres")}
                  className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
                <FieldError message={errors.nombres} />
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-800">Apellidos</label>
                <input
                  value={form.apellidos}
                  onChange={update("apellidos")}
                  className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
                <FieldError message={errors.apellidos} />
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-800">Fecha de nacimiento</label>
                <input
                  type="date"
                  value={form.fecha_nac}
                  onChange={update("fecha_nac")}
                  className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
                <FieldError message={errors.fecha_nac} />
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-800">Género</label>
                <select
                  value={form.genero}
                  onChange={update("genero")}
                  className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200"
                >
                  <option value="">Selecciona…</option>
                  {GENDERS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.genero} />
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-800">Email</label>
                <input
                  value={form.email}
                  onChange={update("email")}
                  placeholder="camila.diaz@example.com"
                  className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
                <FieldError message={errors.email} />
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-800">Dirección</label>
                <input
                  value={form.direccion}
                  onChange={update("direccion")}
                  placeholder="Calle 10 #20-30, Apto 301"
                  className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
                <FieldError message={errors.direccion} />
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-800">Contacto de emergencia</label>
                <input
                  value={form.contacto_emergencia}
                  onChange={update("contacto_emergencia")}
                  placeholder="Nombre completo"
                  className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
                <FieldError message={errors.contacto_emergencia} />
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-800">Teléfono de emergencia</label>
                <input
                  inputMode="numeric"
                  value={form.telefono_emergencia}
                  onChange={update("telefono_emergencia")}
                  placeholder="Ej: 3001234567"
                  className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
                <FieldError message={errors.telefono_emergencia} />
              </div>
            </div>
          </section>

          {/* 3) Info Médica */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <SectionTitle icon="3" title="Info Médica" subtitle="Información clínica básica." />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-neutral-800">Tipo de sangre</label>
                <select
                  value={form.tipo_sangre}
                  onChange={update("tipo_sangre")}
                  className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200"
                >
                  <option value="">Selecciona…</option>
                  {BLOOD_TYPES.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.tipo_sangre} />
                {/* Nota: backend requiere grupo_sanguineo + factor_RH, se derivan desde tipo_sangre */}
                <p className="mt-1 text-xs text-neutral-500">
                  Se enviará como: grupo_sanguineo="{form.tipo_sangre || "—"}" y factor_RH="
                  {inferRHFromBloodType(form.tipo_sangre) || "—"}".
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-sm font-semibold text-neutral-900">Resumen (request payload)</p>
                <p className="mt-2 text-xs text-neutral-600">
                  Este resumen es para alinear con backend. No expone datos sensibles en producción.
                </p>
                <div className="mt-3 text-xs text-neutral-700 space-y-1">
                  <div>
                    <span className="font-medium">num_documento:</span>{" "}
                    {form.num_documento ? Number(form.num_documento) : "—"}
                  </div>
                  <div>
                    <span className="font-medium">nombres:</span> {form.nombres || "—"}
                  </div>
                  <div>
                    <span className="font-medium">apellidos:</span> {form.apellidos || "—"}
                  </div>
                  <div>
                    <span className="font-medium">fecha_nac:</span> {form.fecha_nac || "—"}
                  </div>
                  <div>
                    <span className="font-medium">genero:</span> {form.genero || "—"}
                  </div>
                  <div>
                    <span className="font-medium">grupo_sanguineo:</span> {form.tipo_sangre || "—"}
                  </div>
                  <div>
                    <span className="font-medium">factor_RH:</span>{" "}
                    {inferRHFromBloodType(form.tipo_sangre) || "—"}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 4) Consentimiento Datos */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <SectionTitle icon="4" title="Consentimiento Datos" subtitle="Requerido para completar la afiliación." />

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50">
              <div className="max-h-56 overflow-auto p-4">
                <ConsentText />
              </div>

              <div className="border-t border-neutral-200 p-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={form.consentimiento_datos}
                    onChange={update("consentimiento_datos")}
                    className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-200"
                  />
                  <span className="text-sm text-neutral-800">
                    He leído y acepto el consentimiento para el tratamiento de datos personales.
                    <span className="text-emergency-500"> *</span>
                  </span>
                </label>

                <FieldError message={errors.consentimiento_datos} />

                <div className="mt-3 text-sm">
                  <a
                    href="/privacy"
                    className="text-secondary-600 hover:text-secondary-700 underline underline-offset-2"
                  >
                    Ver Política de Privacidad completa
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link to={ROUTES.HOME} className="text-sm text-neutral-600 hover:text-neutral-900">
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={busySubmit}
              className={[
                "inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold transition",
                busySubmit
                  ? "bg-neutral-200 text-neutral-600 cursor-not-allowed"
                  : "bg-primary-500 text-white hover:bg-primary-600",
              ].join(" ")}
            >
              {busySubmit ? "Registrando…" : "Registrar paciente"}
            </button>
          </div>
        </form>

        {/* Modal confirmación */}
        <Modal
          open={confirmOpen}
          title="Registro exitoso"
          onClose={() => setConfirmOpen(false)}
          primaryAction={
            <button
              type="button"
              onClick={() => {
                setConfirmOpen(false);
                setCreatedPatient(null);
                setDuplicateInfo(null);
                setErrors({});
                setForm({
                  documentType: "",
                  num_documento: "",
                  password: "",
                  nombres: "",
                  apellidos: "",
                  fecha_nac: "",
                  genero: "",
                  direccion: "",
                  email: "",
                  contacto_emergencia: "",
                  telefono_emergencia: "",
                  tipo_sangre: "",
                  consentimiento_datos: false,
                });
              }}
              className="px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition"
            >
              Registrar otro
            </button>
          }
        >
          <div className="space-y-3">
            <p className="text-neutral-700">
              El paciente fue registrado correctamente en <span className="font-medium">{BRAND_NAME}</span>.
            </p>

            <div className="rounded-2xl border border-primary-500/20 bg-primary-50 p-4">
              <p className="text-sm text-primary-700 font-medium">Número de afiliación</p>

              {affiliation ? (
                <p className="mt-1 text-xl font-bold text-primary-700">{affiliation}</p>
              ) : (
                <p className="mt-1 text-sm text-neutral-700">
                  Pendiente: se mostrará el <span className="font-medium">num_afiliacion_formateado</span> real
                  cuando se integre el POST <span className="font-mono">/api/patients</span>.
                </p>
              )}
            </div>

            <p className="text-sm text-neutral-600">
              Usa este número para trámites, citas y consulta de información.
            </p>
          </div>
        </Modal>
      </PageContainer>
    </MainLayout>
  );
}
