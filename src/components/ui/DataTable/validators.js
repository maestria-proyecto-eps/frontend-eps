export const VALIDATORS = {
  required: (value, field) => {
    if (value == null || String(value).trim() === "") {
      return `${field?.label || field?.key || "Campo"} es obligatorio`;
    }
    return null;
  },
  email: (value, field) => {
    if (value == null || String(value).trim() === "") return null;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      const label = field?.label || "Email";
      return `${label} no válido`;
    }
    return null;
  },
  document: (value, field, _form, options = {}) => {
    if (value == null || String(value).trim() === "") return null;
    const min = options.min ?? 5;
    const max = options.max ?? 20;
    const str = String(value).trim();
    if (str.length < min) return `${field?.label || "Documento"} debe tener al menos ${min} caracteres`;
    if (str.length > max) return `${field?.label || "Documento"} debe tener máximo ${max} caracteres`;
    if (!/^[a-zA-Z0-9-]+$/.test(str)) {
      return `${field?.label || "Documento"} solo admite letras, números y guiones`;
    }
    return null;
  },
};
