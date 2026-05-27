import React from "react";
import { Badge, Button, Input } from "../ui";
import {
  calculateQuantity,
  createPrescriptionItem,
  getDosePlaceholder,
  getMedicamentosByPrincipio,
  getUniquePrincipiosActivos,
  validateDoseFormat,
} from "./prescriptionFormUtils";

/**
 * Formulario de ítems de prescripción (misma UI que ConsultationForm).
 */
export default function PrescriptionItemsForm({
  medicamentoOptions = [],
  prescriptionItems,
  onPrescriptionItemsChange,
  selectedPrincipioActivo,
  onSelectedPrincipioActivoChange,
  doseWarnings,
  onDoseWarningsChange,
  errors = {},
  onClearError,
  disabled = false,
  title = "Medicamentos",
  addLabel = "Agregar",
  minItems = 1,
}) {
  function updatePrescriptionItem(localId, key, value) {
    if (key === "principio_activo") {
      onSelectedPrincipioActivoChange((prev) => ({ ...prev, [localId]: value }));
      onPrescriptionItemsChange((prev) =>
        prev.map((item) =>
          item.localId === localId
            ? {
                ...item,
                codigo: "",
                dosis: "",
                duracion: "",
                cantidad: "",
                presentacion: "",
              }
            : item
        )
      );
      onClearError?.(localId, ["codigo", "dosis", "duracion"]);
      return;
    }

    if (key === "codigo" && value) {
      const selectedMed = medicamentoOptions.find((m) => m.codigo === Number(value));
      onPrescriptionItemsChange((prev) =>
        prev.map((item) =>
          item.localId === localId
            ? selectedMed
              ? {
                  ...item,
                  [key]: value,
                  presentacion: selectedMed.presentacion || "",
                  principio_activo: selectedMed.principio_activo || "",
                }
              : { ...item, [key]: value, presentacion: "", principio_activo: "" }
            : item
        )
      );
    } else if (key === "dosis") {
      const item = prescriptionItems.find((i) => i.localId === localId);
      const validation = validateDoseFormat(value, item?.presentacion);
      const newCantidad = calculateQuantity(
        value,
        item?.duracion,
        item?.presentacion
      );

      onPrescriptionItemsChange((prev) =>
        prev.map((item) =>
          item.localId === localId
            ? { ...item, [key]: value, cantidad: newCantidad }
            : item
        )
      );

      onDoseWarningsChange((prev) => {
        const updated = { ...prev };
        if (validation.warning) {
          updated[localId] = validation.warning;
        } else {
          delete updated[localId];
        }
        return updated;
      });
    } else if (key === "duracion") {
      const item = prescriptionItems.find((i) => i.localId === localId);
      const newCantidad = calculateQuantity(
        item?.dosis,
        value,
        item?.presentacion
      );
      onPrescriptionItemsChange((prev) =>
        prev.map((item) =>
          item.localId === localId
            ? { ...item, [key]: value, cantidad: newCantidad }
            : item
        )
      );
    } else {
      onPrescriptionItemsChange((prev) =>
        prev.map((item) => (item.localId === localId ? { ...item, [key]: value } : item))
      );
    }

    onClearError?.(localId, [key]);
  }

  function addPrescriptionItem() {
    onPrescriptionItemsChange((prev) => [...prev, createPrescriptionItem()]);
  }

  function removePrescriptionItem(localId) {
    if (prescriptionItems.length <= minItems) return;
    onPrescriptionItemsChange((prev) =>
      prev.filter((item) => item.localId !== localId)
    );
    onSelectedPrincipioActivoChange((prev) => {
      const updated = { ...prev };
      delete updated[localId];
      return updated;
    });
    onDoseWarningsChange((prev) => {
      const updated = { ...prev };
      delete updated[localId];
      return updated;
    });
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-neutral-900">{title}</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={addPrescriptionItem}
          disabled={disabled}
          type="button"
        >
          {addLabel}
        </Button>
      </div>

      <div className="space-y-4">
        {prescriptionItems.map((item, index) => (
          <div
            key={item.localId}
            className="rounded-xl border border-neutral-200 p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-700">
                Medicamento #{index + 1}
              </h3>
              <Button
                variant="danger"
                size="sm"
                onClick={() => removePrescriptionItem(item.localId)}
                disabled={disabled}
                type="button"
              >
                Quitar
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2 space-y-1">
                <label className="block text-sm font-medium text-neutral-700">
                  Principio Activo *
                </label>
                <select
                  value={selectedPrincipioActivo[item.localId] || ""}
                  onChange={(e) =>
                    updatePrescriptionItem(
                      item.localId,
                      "principio_activo",
                      e.target.value
                    )
                  }
                  disabled={disabled}
                  className={[
                    "block w-full rounded-lg border px-3 py-2 text-neutral-900 bg-white",
                    "focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
                    "disabled:bg-neutral-100 disabled:cursor-not-allowed",
                    errors[`${item.localId}_principio_activo`]
                      ? "border-emergency-500"
                      : "border-neutral-300",
                  ].join(" ")}
                >
                  <option value="">Seleccione principio activo</option>
                  {getUniquePrincipiosActivos(medicamentoOptions).map((principio) => (
                    <option key={principio} value={principio}>
                      {principio}
                    </option>
                  ))}
                </select>
                {errors[`${item.localId}_principio_activo`] && (
                  <p className="text-sm text-emergency-600">
                    {errors[`${item.localId}_principio_activo`]}
                  </p>
                )}
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="block text-sm font-medium text-neutral-700">
                  Medicamento *
                </label>
                <select
                  value={item.codigo}
                  onChange={(e) =>
                    updatePrescriptionItem(item.localId, "codigo", e.target.value)
                  }
                  disabled={!selectedPrincipioActivo[item.localId] || disabled}
                  className={[
                    "block w-full rounded-lg border px-3 py-2 text-neutral-900 bg-white",
                    "focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
                    "disabled:bg-neutral-100 disabled:cursor-not-allowed",
                    errors[`${item.localId}_codigo`]
                      ? "border-emergency-500"
                      : "border-neutral-300",
                  ].join(" ")}
                >
                  <option value="">
                    {selectedPrincipioActivo[item.localId]
                      ? "Seleccione medicamento"
                      : "Seleccione primero un principio activo"}
                  </option>
                  {selectedPrincipioActivo[item.localId] &&
                    getMedicamentosByPrincipio(
                      medicamentoOptions,
                      selectedPrincipioActivo[item.localId]
                    ).map((med) => (
                      <option key={med.codigo} value={med.codigo}>
                        {med.nombre_medicamento}
                      </option>
                    ))}
                </select>
                {errors[`${item.localId}_codigo`] && (
                  <p className="text-sm text-emergency-600">
                    {errors[`${item.localId}_codigo`]}
                  </p>
                )}
              </div>

              {item.presentacion && (
                <div className="md:col-span-2 space-y-1">
                  <label className="block text-sm font-medium text-neutral-700">
                    Presentación
                  </label>
                  <Badge variant="secondary">{item.presentacion}</Badge>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-sm font-medium text-neutral-700">
                  Dosis *
                </label>
                <input
                  type="text"
                  value={item.dosis}
                  onChange={(e) =>
                    updatePrescriptionItem(item.localId, "dosis", e.target.value)
                  }
                  placeholder={getDosePlaceholder(item.presentacion)}
                  disabled={disabled}
                  className={[
                    "block w-full rounded-lg border px-3 py-2 text-neutral-900",
                    errors[`${item.localId}_dosis`]
                      ? "border-emergency-500"
                      : doseWarnings[item.localId]
                        ? "border-amber-300"
                        : "border-neutral-300",
                  ].join(" ")}
                />
                {errors[`${item.localId}_dosis`] && (
                  <p className="text-sm text-emergency-600">
                    {errors[`${item.localId}_dosis`]}
                  </p>
                )}
                {doseWarnings[item.localId] && !errors[`${item.localId}_dosis`] && (
                  <p className="text-sm text-amber-600">
                    {doseWarnings[item.localId]}
                  </p>
                )}
              </div>

              <Input
                label="Duración (días) *"
                type="number"
                min="1"
                value={item.duracion}
                onChange={(e) =>
                  updatePrescriptionItem(item.localId, "duracion", e.target.value)
                }
                error={errors[`${item.localId}_duracion`]}
                disabled={disabled}
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-neutral-700">
                  Cantidad
                </label>
                <input
                  type="text"
                  value={item.cantidad}
                  readOnly
                  disabled
                  placeholder="Se calcula automáticamente"
                  className="block w-full rounded-lg border border-neutral-200 px-3 py-2 text-neutral-700 bg-neutral-50 cursor-not-allowed"
                />
                {errors[`${item.localId}_cantidad`] && (
                  <p className="text-sm text-emergency-600">
                    {errors[`${item.localId}_cantidad`]}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
