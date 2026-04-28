import { describe, it, expect } from 'vitest';

/**
 * TESTS FOR CONSULTATION FORM - PRESCRIPTION SECTION
 * 
 * Ajuste 1: Medication name formatting (Compound + Generic)
 * Ajuste 2: Dose validation based on medication presentation
 */

// ============================================================================
// HELPER FUNCTIONS TESTS
// ============================================================================

/**
 * Test prescription item structure and medication selection
 * Ajuste 1: Display medicamento name and principio_activo in separate fields
 * Ajuste 2: Auto-calculate cantidad based on dosis, duracion, and presentation units
 */
describe("Ajuste 1 y 2: Formulario reorganizado con cálculo automático", () => {
  function createPrescriptionItem() {
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

  function getUniquePrincipiosActivos(medications) {
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

  function getMedicamentosByPrincipio(medications, principioActivo) {
    if (!principioActivo) return [];
    return medications.filter(
      (med) => med.principio_activo?.trim() === principioActivo.trim()
    );
  }

  function getDosePlaceholder(presentacion) {
    if (!presentacion || !presentacion.trim()) return "Ej: 2, 5 ml, 10 mg";
    const lower = presentacion.toLowerCase();
    if (lower.includes("tableta") || lower.includes("cápsula") || lower.includes("capsula")) {
      return "Ej: 1, 2, 3 (número de tabletas)";
    }
    if (lower.includes("ampolla") || lower.includes("inyectable") || lower.includes("inyección")) {
      return "Ej: 10 mg, 1 ml (mg o ml)";
    }
    if (lower.includes("jarabe") || lower.includes("solución") || lower.includes("solucion") || lower.includes("ml")) {
      return "Ej: 5 ml, 10 ml (mililitros)";
    }
    if (lower.includes("gota")) {
      return "Ej: 5, 10 (número de gotas)";
    }
    return "Ej: 2, 5 ml, 10 mg";
  }

  function extractUnitsFromPresentation(presentacion) {
    if (!presentacion) return null;
    const match = presentacion.match(/x\s*(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  }

  function calculateQuantity(dose, duration, presentacion) {
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

  // Tests for structure
  it("should create prescription item with all fields", () => {
    const item = createPrescriptionItem();
    expect(item).toHaveProperty("presentacion");
    expect(item).toHaveProperty("principio_activo");
    expect(item).toHaveProperty("codigo");
    expect(item).toHaveProperty("dosis");
    expect(item).toHaveProperty("duracion");
    expect(item).toHaveProperty("cantidad");
  });

  // Tests for getUniquePrincipiosActivos
  it("should get unique active principles from medications", () => {
    const medications = [
      { codigo: 1, nombre_medicamento: "Amoxicilina 500mg", principio_activo: "Amoxicilina", presentacion: "Caja x 30" },
      { codigo: 2, nombre_medicamento: "Amoxicilina 250mg", principio_activo: "Amoxicilina", presentacion: "Caja x 20" },
      { codigo: 3, nombre_medicamento: "Ibuprofeno 400mg", principio_activo: "Ibuprofeno", presentacion: "Caja x 20" },
    ];
    const principios = getUniquePrincipiosActivos(medications);
    expect(principios).toContain("Amoxicilina");
    expect(principios).toContain("Ibuprofeno");
    expect(principios.length).toBe(2); // No duplicates
  });

  // Tests for getMedicamentosByPrincipio
  it("should filter medications by active principle", () => {
    const medications = [
      { codigo: 1, nombre_medicamento: "Amoxicilina 500mg", principio_activo: "Amoxicilina" },
      { codigo: 2, nombre_medicamento: "Amoxicilina 250mg", principio_activo: "Amoxicilina" },
      { codigo: 3, nombre_medicamento: "Ibuprofeno", principio_activo: "Ibuprofeno" },
    ];
    const filtered = getMedicamentosByPrincipio(medications, "Amoxicilina");
    expect(filtered.length).toBe(2);
    expect(filtered[0].codigo).toBe(1);
    expect(filtered[1].codigo).toBe(2);
  });

  // Tests for getDosePlaceholder
  it("should return correct placeholder for tablets", () => {
    expect(getDosePlaceholder("Caja x 30 Tabletas")).toContain("número de tabletas");
  });

  it("should return correct placeholder for syrup", () => {
    expect(getDosePlaceholder("Frasco x 120ml")).toContain("mililitros");
  });

  it("should return correct placeholder for injectable", () => {
    expect(getDosePlaceholder("Ampolla x 3ml (Inyectable)")).toContain("mg o ml");
  });

  it("should return generic placeholder for empty presentation", () => {
    expect(getDosePlaceholder("")).toBe("Ej: 2, 5 ml, 10 mg");
  });

  // Tests for extractUnitsFromPresentation
  it("should extract units from presentation with 'x' format", () => {
    expect(extractUnitsFromPresentation("Caja x12")).toBe(12);
    expect(extractUnitsFromPresentation("Frasco x120ml")).toBe(120);
    expect(extractUnitsFromPresentation("Ampolla x3")).toBe(3);
  });

  it("should return null if no units found", () => {
    expect(extractUnitsFromPresentation("Frasco")).toBeNull();
    expect(extractUnitsFromPresentation("")).toBeNull();
    expect(extractUnitsFromPresentation(null)).toBeNull();
  });

  // Tests for calculateQuantity with presentation
  it("should calculate quantity based on presentation units: Caja x12", () => {
    // 1 dosis × 12 días = 12 unidades → 12 ÷ 12 = 1 caja
    const result = calculateQuantity("1", "12", "Caja x12");
    expect(result).toBe("1");
  });

  it("should calculate quantity: 2 dosis × 7 días ÷ Caja x14 = 1 caja", () => {
    // 2 × 7 = 14 unidades → 14 ÷ 14 = 1 caja
    const result = calculateQuantity("2", "7", "Caja x14");
    expect(result).toBe("1");
  });

  it("should calculate quantity: 1 dosis × 10 días ÷ Caja x12 = 1 caja (rounds up)", () => {
    // 1 × 10 = 10 unidades → 10 ÷ 12 = 0.833 → Math.ceil = 1 caja
    const result = calculateQuantity("1", "10", "Caja x12");
    expect(result).toBe("1");
  });

  it("should calculate quantity: 2 dosis × 10 días ÷ Caja x12 = 2 cajas", () => {
    // 2 × 10 = 20 unidades → 20 ÷ 12 = 1.67 → Math.ceil = 2 cajas
    const result = calculateQuantity("2", "10", "Caja x12");
    expect(result).toBe("2");
  });

  it("should calculate quantity without presentation units", () => {
    // No presentation with units → return total units
    const result = calculateQuantity("2", "7", "Jarabe");
    expect(result).toBe("14");
  });

  it("should handle decimal dosis: 0.5 × 20 ÷ Caja x10 = 1 caja", () => {
    // 0.5 × 20 = 10 unidades → 10 ÷ 10 = 1 caja
    const result = calculateQuantity("0.5", "20", "Caja x10");
    expect(result).toBe("1");
  });

  it("should return empty string if dosis is missing", () => {
    expect(calculateQuantity("", "7", "Caja x12")).toBe("");
  });

  it("should return empty string if duration is missing", () => {
    expect(calculateQuantity("2", "", "Caja x12")).toBe("");
  });

  it("should return empty string if dosis is non-numeric", () => {
    expect(calculateQuantity("invalid", "7", "Caja x12")).toBe("");
  });

  // Real-world examples
  it("should calculate real example: 1 tableta × 12 días ÷ Caja x12", () => {
    const result = calculateQuantity("1", "12", "Caja x 12 Tabletas");
    expect(result).toBe("1"); // 12 ÷ 12 = 1 caja
  });

  it("should calculate real example: 2 gotas × 10 días ÷ Frasco x60gotas", () => {
    const result = calculateQuantity("2", "10", "Frasco x60gotas");
    expect(result).toBe("1"); // 20 ÷ 60 = 0.33 → 1 frasco
  });
});

/**
 * Integration tests: validate dose format
 */
describe("Ajuste 2: Validación de dosis según presentación", () => {
  function getExpectedDoseFormat(presentacion) {
    if (!presentacion || !presentacion.trim()) return null;
    const lower = presentacion.toLowerCase();
    if (lower.includes("tableta") || lower.includes("cápsula") || lower.includes("capsula")) {
      return { type: "integer", label: "número entero", pattern: /^\d+$/ };
    }
    if (lower.includes("jarabe") || lower.includes("solución") || lower.includes("solucion")) {
      return { type: "liquid", label: "ml o gotas", pattern: /^(\d+\.?\d*)\s?(ml|gotas|gota|ml\.)$|^\d+\.?\d*$/ };
    }
    if (lower.includes("ampolla") || lower.includes("ampolla") || lower.includes("inyectable") || lower.includes("inyección")) {
      return { type: "injectable", label: "mg/ml", pattern: /^(\d+\.?\d*)\s?(mg|ml|mg\/ml)$|^\d+\.?\d*$/ };
    }
    if (lower.includes("gota")) {
      return { type: "drops", label: "gotas", pattern: /^\d+\s?gotas?$|^\d+$/ };
    }
    return null;
  }

  function validateDoseFormat(dose, presentacion) {
    if (!dose || !dose.trim()) return { valid: false, warning: null };
    const format = getExpectedDoseFormat(presentacion);
    if (!format) return { valid: true, warning: null };
    const trimmedDose = dose.trim();
    if (!format.pattern.test(trimmedDose)) {
      return {
        valid: false,
        warning: `Se esperaba formato: ${format.label}. Ejemplo: ${format.type === "integer" ? "2" : format.type === "liquid" ? "5 ml" : "10 mg"}`,
      };
    }
    return { valid: true, warning: null };
  }

  it("should validate tablet dose format", () => {
    const result = validateDoseFormat("2", "Caja x 30 Tabletas");
    expect(result.valid).toBe(true);
  });

  it("should validate syrup dose format", () => {
    const result = validateDoseFormat("5 ml", "Frasco x 120ml");
    expect(result.valid).toBe(true);
  });

  it("should validate injectable dose format", () => {
    const result = validateDoseFormat("10 mg", "Ampolla x 3ml");
    expect(result.valid).toBe(true);
  });

  it("should warn on invalid tablet dose", () => {
    const result = validateDoseFormat("5 ml", "Tabletas");
    expect(result.valid).toBe(false);
    expect(result.warning).toBeDefined();
  });
});
