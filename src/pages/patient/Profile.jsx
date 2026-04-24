import React, { useContext } from "react";
import { PageContainer } from "../../components/layout";
import { Button } from "../../components/ui";
import { http } from "../../services/api/http";
import { endpoints } from "../../services/api/endpoints";

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

function onlyDigits(value) {
  return String(value ?? "").replace(/[^\d]/g, "");
}

function normalize(value) {
  return String(value ?? "").trim();
}

function validateEditableFields(form) {
  const errors = {};

  if (!normalize(form.direccion)) errors.direccion = "Dirección es requerida.";
  if (normalize(form.direccion) && form.direccion.trim().length < 5) {
    errors.direccion = "Dirección debe tener al menos 5 caracteres.";
  }
  if (normalize(form.direccion) && form.direccion.trim().length > 100) {
    errors.direccion = "Dirección no puede exceder 100 caracteres.";
  }

  if (!form.telefono || !onlyDigits(form.telefono)) errors.telefono = "Teléfono es requerido (solo dígitos).";

  if (!normalize(form.contacto_emergencia)) errors.contacto_emergencia = "Contacto de emergencia es requerido.";
  if (normalize(form.contacto_emergencia) && form.contacto_emergencia.trim().length < 2) {
    errors.contacto_emergencia = "Contacto debe tener al menos 2 caracteres.";
  }
  if (normalize(form.contacto_emergencia) && form.contacto_emergencia.trim().length > 50) {
    errors.contacto_emergencia = "Contacto no puede exceder 50 caracteres.";
  }

  return errors;
}

function validatePasswordChange(form) {
  const errors = {};

  if (!form.oldPassword || form.oldPassword.trim().length < 8) {
    errors.oldPassword = "Contraseña actual requerida (mínimo 8 caracteres).";
  }

  if (!form.newPassword || form.newPassword.trim().length < 8) {
    errors.newPassword = "Nueva contraseña requerida (mínimo 8 caracteres).";
  }

  if (!form.confirmPassword || form.confirmPassword.trim().length < 8) {
    errors.confirmPassword = "Confirmación de contraseña requerida (mínimo 8 caracteres).";
  }

  if (form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword) {
    errors.confirmPassword = "Las contraseñas no coinciden.";
  }

  if (form.oldPassword && form.newPassword && form.oldPassword === form.newPassword) {
    errors.newPassword = "La nueva contraseña debe ser diferente a la actual.";
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

function InfoDisplay({ label, value }) {
  return (
    <div>
      <label className="text-sm font-medium text-neutral-800">{label}</label>
      <p className="mt-1 text-neutral-700">{value || "—"}</p>
    </div>
  );
}

export default function Profile() {
  const [user, setUser] = React.useState(null);
  const [loadingUser, setLoadingUser] = React.useState(true);
  const [loadUserError, setLoadUserError] = React.useState("");

  const [editForm, setEditForm] = React.useState({
    direccion: "",
    telefono: "",
    contacto_emergencia: "",
  });

  const [originalForm, setOriginalForm] = React.useState({
    direccion: "",
    telefono: "",
    contacto_emergencia: "",
  });

  const [passwordForm, setPasswordForm] = React.useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = React.useState({});
  const [passwordErrors, setPasswordErrors] = React.useState({});
  const [busySubmit, setBusySubmit] = React.useState(false);
  const [busyPassword, setBusyPassword] = React.useState(false);
  const [submitError, setSubmitError] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [passwordSuccess, setPasswordSuccess] = React.useState(false);

  // Cargar datos del usuario
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingUser(true);
        const response = await http.get(endpoints.patients.getProfile);
        const userData = response?.data?.Data ?? response?.data?.data ?? response?.data;
        if (!cancelled) {
          setUser(userData);
          const formData = {
            direccion: userData?.direccion || "",
            telefono: userData?.telefono ? String(userData.telefono) : "",
            contacto_emergencia: userData?.contacto_emergencia || "",
          };
          setEditForm(formData);
          setOriginalForm(formData);
          setLoadingUser(false);
        }
      } catch (err) {
        console.error("Error cargando datos del usuario:", err);
        setLoadUserError(err?.response?.data?.Message || err.message || "Error al cargar los datos del usuario.");
        setLoadingUser(false);
      }
    })();
    return () => {
      cancelled = true;
    }
  }, []);

  // Detectar si hay cambios en los datos básicos
  const hasChanges = 
    editForm.direccion !== originalForm.direccion ||
    editForm.telefono !== originalForm.telefono ||
    editForm.contacto_emergencia !== originalForm.contacto_emergencia;

  // Verificar si el formulario de cambio de contraseña es válido
  const isPasswordFormValid =
    passwordForm.oldPassword.trim().length >= 8 &&
    passwordForm.newPassword.trim().length >= 8 &&
    passwordForm.confirmPassword.trim().length >= 8 &&
    passwordForm.newPassword === passwordForm.confirmPassword &&
    passwordForm.oldPassword !== passwordForm.newPassword;

  const updateField = (key) => (e) => {
    const value = e?.target?.type === "checkbox" ? e.target.checked : e.target.value;

    setEditForm((prev) => {
      if (key === "telefono") return { ...prev, [key]: onlyDigits(value) };
      return { ...prev, [key]: value };
    });

    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

    if (submitSuccess) setSubmitSuccess(false);
  };

  const updatePasswordField = (key) => (e) => {
    const value = e.target.value;

    setPasswordForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setPasswordErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

    if (passwordSuccess) setPasswordSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess(false);

    const v = validateEditableFields(editForm);
    setErrors(v);
    if (Object.keys(v).length) return;

    setBusySubmit(true);
    try {
      const payload = {
        contacto_emergencia: editForm.contacto_emergencia.trim(),
        direccion: editForm.direccion.trim(),
        telefono: Number(onlyDigits(editForm.telefono)),
      };

      const response = await http.put(endpoints.patients.updateProfile, payload);
      const updatedUserData = response?.data?.Data ?? response?.data?.data ?? response?.data;

      if (!updatedUserData) {
        throw new Error("No se recibieron datos actualizados.");
      }

      setSubmitSuccess(true);
      setOriginalForm({
        direccion: updatedUserData.direccion || "",
        telefono: updatedUserData.telefono ? String(updatedUserData.telefono) : "",
        contacto_emergencia: updatedUserData.contacto_emergencia || "",
      });

      if (user) {
        setUser({
          ...user,
          direccion: updatedUserData.direccion,
          telefono: updatedUserData.telefono,
          contacto_emergencia: updatedUserData.contacto_emergencia,
        });
      }
    } catch (err) {
      let errorMessage = "Error al actualizar datos. Verifica los datos o tu sesión.";
      const response = err?.response?.data;

      if (response?.detail) {
        if (Array.isArray(response.detail)) {
          const fields = response.detail
            .map((e) => {
              const field = e.loc?.[e.loc.length - 1];
              return `${field}: ${e.msg}`;
            })
            .join("; ");
          errorMessage = `Errores de validación: ${fields}`;
        } else if (typeof response.detail === "string") {
          errorMessage = response.detail;
        }
      } else if (response?.Message) {
        errorMessage = response.Message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setSubmitError(errorMessage);
    } finally {
      setBusySubmit(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    const v = validatePasswordChange(passwordForm);
    setPasswordErrors(v);
    if (Object.keys(v).length) return;

    setBusyPassword(true);
    try {
      const payload = {
        old_password: passwordForm.oldPassword.trim(),
        new_password: passwordForm.newPassword.trim(),
        confirm_password: passwordForm.confirmPassword.trim(),
      };

      await http.put(endpoints.patients.changePassword, payload);

      setPasswordSuccess(true);
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      let errorMessage = "Error al cambiar la contraseña. Verifica la contraseña actual.";
      const response = err?.response?.data;

      if (response?.detail) {
        if (Array.isArray(response.detail)) {
          errorMessage = response.detail.map((e) => e.msg).join("; ");
        } else if (typeof response.detail === "string") {
          errorMessage = response.detail;
        }
      } else if (response?.Message) {
        errorMessage = response.Message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setPasswordError(errorMessage);
    } finally {
      setBusyPassword(false);
    }
  };

  if (loadingUser) {
    return (
      <PageContainer>
        <div className="mb-8 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">Datos de perfil</h1>
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center">
          <p className="text-neutral-600">Cargando datos del usuario...</p>
        </div>
      </PageContainer>
    );
  }

  if (loadUserError || !user) {
    return (
      <PageContainer>
        <div className="mb-8 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">Datos de perfil</h1>
          </div>
        </div>
        <div className="rounded-2xl border border-emergency-500/30 bg-emergency-50 p-6">
          <p className="text-emergency-600 font-medium">{loadUserError}</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-8 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">Datos de perfil</h1>
          <p className="mt-1 text-neutral-600">
            Datos básicos y actualización de dirección, teléfono y contacto de emergencia.
          </p>
        </div>
      </div>

      {/* 1) Información Básica y Médica (Lectura) */}
      <section className="mb-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <SectionTitle icon="1" title="Información Básica" subtitle="Datos personales y médicos." />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <InfoDisplay label="Nombres" value={user.nombres} />
          <InfoDisplay label="Apellidos" value={user.apellidos} />
          <InfoDisplay label="Email" value={user.email} />
          <InfoDisplay
            label="Fecha de nacimiento"
            value={user.fecha_nacimiento ? new Date(user.fecha_nacimiento).toLocaleDateString() : "—"}
          />
          <InfoDisplay
            label="Género"
            value={GENDERS.find((g) => g.value === user.genero)?.label || user.genero}
          />
          <InfoDisplay
            label="Tipo de sangre"
            value={user.tipo_sangre || "—"}
          />
          <InfoDisplay label="Documento" value={user.id_paciente} />
          <InfoDisplay label="Número de afiliación" value={user.num_afiliacion || "—"} />
        </div>
      </section>

      {/* 2) Actualizar Datos Editables */}
      {submitSuccess && (
        <div className="mb-6 rounded-2xl border border-primary-500/30 bg-primary-50 p-4">
          <p className="text-sm font-medium text-primary-600">✓ Datos actualizados correctamente.</p>
        </div>
      )}

      {submitError && (
        <div className="mb-6 rounded-2xl border border-emergency-500/30 bg-emergency-50 p-4">
          <p className="text-sm font-medium text-emergency-500">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-8">
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <SectionTitle icon="2" title="Actualizar Información" subtitle="Dirección, teléfono y contacto de emergencia." />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-6">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-neutral-800">Dirección</label>
              <input
                value={editForm.direccion}
                onChange={updateField("direccion")}
                placeholder="Calle 10 #20-30, Apto 301"
                className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
              <FieldError message={errors.direccion} />
              <p className="mt-1 text-xs text-neutral-500">5-100 caracteres</p>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-800">Teléfono</label>
              <input
                inputMode="numeric"
                value={editForm.telefono}
                onChange={updateField("telefono")}
                placeholder="Ej: 3001234567"
                className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
              <FieldError message={errors.telefono} />
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-800">Contacto de emergencia</label>
              <input
                value={editForm.contacto_emergencia}
                onChange={updateField("contacto_emergencia")}
                placeholder="Nombre completo"
                className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
              <FieldError message={errors.contacto_emergencia} />
              <p className="mt-1 text-xs text-neutral-500">2-50 caracteres</p>
            </div>
          </div>

          <div className="border-t border-neutral-200 pt-6 flex justify-end">
            <button
              type="submit"
              disabled={busySubmit || !hasChanges}
              title={!hasChanges ? "No hay cambios para guardar" : ""}
              className={[
                "inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold transition",
                busySubmit || !hasChanges
                  ? "bg-neutral-200 text-neutral-600 cursor-not-allowed"
                  : "bg-primary-500 text-white hover:bg-primary-600",
              ].join(" ")}
            >
              {busySubmit ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </section>
      </form>

      {/* 3) Cambio de Contraseña */}
      {passwordSuccess && (
        <div className="mb-6 rounded-2xl border border-primary-500/30 bg-primary-50 p-4">
          <p className="text-sm font-medium text-primary-600">✓ Contraseña actualizada correctamente.</p>
        </div>
      )}

      {passwordError && (
        <div className="mb-6 rounded-2xl border border-emergency-500/30 bg-emergency-50 p-4">
          <p className="text-sm font-medium text-emergency-500">{passwordError}</p>
        </div>
      )}

      <form onSubmit={handleChangePassword}>
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <SectionTitle icon="3" title="Cambiar Contraseña" subtitle="Actualiza tu contraseña de acceso." />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-6">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-neutral-800">Contraseña Actual</label>
              <input
                type="password"
                value={passwordForm.oldPassword}
                onChange={updatePasswordField("oldPassword")}
                placeholder="Contraseña actual"
                className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
              <FieldError message={passwordErrors.oldPassword} />
              <p className="mt-1 text-xs text-neutral-500">Mínimo 8 caracteres</p>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-800">Nueva Contraseña</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={updatePasswordField("newPassword")}
                placeholder="Nueva contraseña"
                className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
              <FieldError message={passwordErrors.newPassword} />
              <p className="mt-1 text-xs text-neutral-500">Mínimo 8 caracteres</p>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-800">Confirmar Contraseña</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={updatePasswordField("confirmPassword")}
                placeholder="Confirmar contraseña"
                className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
              <FieldError message={passwordErrors.confirmPassword} />
              <p className="mt-1 text-xs text-neutral-500">Las contraseñas deben coincidir</p>
            </div>
          </div>

          <div className="border-t border-neutral-200 pt-6 flex justify-end">
            <button
              type="submit"
              disabled={busyPassword || !isPasswordFormValid}
              title={!isPasswordFormValid ? "Completa todos los campos correctamente" : ""}
              className={[
                "inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold transition",
                busyPassword || !isPasswordFormValid
                  ? "bg-neutral-200 text-neutral-600 cursor-not-allowed"
                  : "bg-primary-500 text-white hover:bg-primary-600",
              ].join(" ")}
            >
              {busyPassword ? "Cambiando…" : "Cambiar Contraseña"}
            </button>
          </div>
        </section>
      </form>
    </PageContainer>
  );
}