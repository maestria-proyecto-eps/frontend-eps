export function createPrescriptionItem() {
  return {
    localId: crypto.randomUUID(),
    codigo: "",
    dosis: "",
    duracion: "",
    cantidad: "",
    presentacion: "",
    principio_activo: "",
  };
}

export function getDosePlaceholder(presentacion) {
  if (!presentacion || !presentacion.trim()) return "Ej: 2, 5 ml, 10 mg";

  const lower = presentacion.toLowerCase();

  if (
    lower.includes("tableta") ||
    lower.includes("cápsula") ||
    lower.includes("capsula")
  ) {
    return "Ej: 1, 2, 3 (número de tabletas)";
  }
  if (
    lower.includes("ampolla") ||
    lower.includes("inyectable") ||
    lower.includes("inyección")
  ) {
    return "Ej: 10 mg, 1 ml (mg o ml)";
  }
  if (
    lower.includes("jarabe") ||
    lower.includes("solución") ||
    lower.includes("solucion") ||
    lower.includes("ml")
  ) {
    return "Ej: 5 ml, 10 ml (mililitros)";
  }
  if (lower.includes("gota")) {
    return "Ej: 5, 10 (número de gotas)";
  }

  return "Ej: 2, 5 ml, 10 mg";
}

export function extractUnitsFromPresentation(presentacion) {
  if (!presentacion) return null;
  const match = presentacion.match(/x\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

export function calculateQuantity(dose, duration, presentacion) {
  if (!dose || !duration) return "";

  const doseNumeric = parseFloat(dose);
  const durationNumeric = parseInt(duration, 10);

  if (isNaN(doseNumeric) || isNaN(durationNumeric)) return "";

  const totalUnits = doseNumeric * durationNumeric;
  const unitsPerPresentation = extractUnitsFromPresentation(presentacion);
  if (unitsPerPresentation && unitsPerPresentation > 0) {
    return Math.ceil(totalUnits / unitsPerPresentation).toString();
  }

  return totalUnits.toString();
}

export function getUniquePrincipiosActivos(medications) {
  const seen = new Set();
  const principios = [];

  medications.forEach((med) => {
    const principio = med.principio_activo?.trim();
    if (principio && !seen.has(principio)) {
      seen.add(principio);
      principios.push(principio);
    }
  });

  return principios.sort();
}

export function getMedicamentosByPrincipio(medications, principioActivo) {
  if (!principioActivo) return [];
  return medications.filter(
    (med) => med.principio_activo?.trim() === principioActivo.trim()
  );
}

export function getExpectedDoseFormat(presentacion) {
  if (!presentacion || !presentacion.trim()) return null;

  const lower = presentacion.toLowerCase();

  if (
    lower.includes("tableta") ||
    lower.includes("cápsula") ||
    lower.includes("capsula")
  ) {
    return { type: "integer", label: "número entero", pattern: /^\d+$/ };
  }
  if (
    lower.includes("jarabe") ||
    lower.includes("solución") ||
    lower.includes("solucion")
  ) {
    return {
      type: "liquid",
      label: "ml o gotas",
      pattern: /^(\d+\.?\d*)\s?(ml|gotas|gota|ml\.)$|^\d+\.?\d*$/,
    };
  }
  if (
    lower.includes("ampolla") ||
    lower.includes("inyectable") ||
    lower.includes("inyección")
  ) {
    return {
      type: "injectable",
      label: "mg/ml",
      pattern: /^(\d+\.?\d*)\s?(mg|ml|mg\/ml)$|^\d+\.?\d*$/,
    };
  }
  if (lower.includes("gota")) {
    return { type: "drops", label: "gotas", pattern: /^\d+\s?gotas?$|^\d+$/ };
  }

  return null;
}

export function validateDoseFormat(dose, presentacion) {
  if (!dose || !dose.trim()) return { valid: false, warning: null };

  const format = getExpectedDoseFormat(presentacion);
  if (!format) return { valid: true, warning: null };

  const trimmedDose = dose.trim();

  if (!format.pattern.test(trimmedDose)) {
    return {
      valid: false,
      warning: `Se esperaba formato: ${format.label}. Ejemplo: ${
        format.type === "integer"
          ? "2"
          : format.type === "liquid"
            ? "5 ml"
            : "10 mg"
      }`,
    };
  }

  return { valid: true, warning: null };
}

export function validatePrescriptionItems(
  prescriptionItems,
  selectedPrincipioActivo
) {
  const newErrors = {};

  prescriptionItems.forEach((item) => {
    const hasAny = item.codigo || item.dosis || item.duracion;
    if (!hasAny) return;

    if (!selectedPrincipioActivo[item.localId]) {
      newErrors[`${item.localId}_principio_activo`] =
        "Debe seleccionar un principio activo.";
    }
    if (!item.codigo) {
      newErrors[`${item.localId}_codigo`] = "Debe seleccionar un medicamento.";
    }
    if (!item.dosis.trim()) {
      newErrors[`${item.localId}_dosis`] = "La dosis es obligatoria.";
    }
    if (!item.duracion || Number(item.duracion) <= 0) {
      newErrors[`${item.localId}_duracion`] =
        "La duración debe ser mayor a cero.";
    }
    if (!item.cantidad || Number(item.cantidad) <= 0) {
      newErrors[`${item.localId}_cantidad`] =
        "La cantidad calculada debe ser mayor a cero.";
    }
  });

  return newErrors;
}

export function getValidPrescriptionItems(prescriptionItems) {
  return prescriptionItems.filter(
    (item) =>
      item.codigo &&
      item.dosis.trim() &&
      Number(item.duracion) > 0 &&
      Number(item.cantidad) > 0
  );
}

export function buildPrescriptionApiPayload(idAtencion, prescriptionItems, tipo = 1) {
  const validItems = getValidPrescriptionItems(prescriptionItems);
  return {
    id_atencion: Number(idAtencion),
    tipo,
    prescripciones_items: validItems.map((item) => ({
      id_medicamento: Number(item.codigo),
      dosis: item.dosis.trim(),
      duracion: String(item.duracion).trim(),
      cantidad: parseInt(String(item.cantidad).trim(), 10),
    })),
  };
}
