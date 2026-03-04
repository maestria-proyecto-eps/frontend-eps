/**
 * Validadores de alto nivel reutilizables para campos habituales (email, documento, etc.).
 * La página puede usar estos nombres en field.validation o definir lógica propia en formConfig.validate.
 */
export const VALIDATORS = {
  required: (value, _field) => {
    if (value == null || String(value).trim() === '') {
      return `${_field.label || _field.key} es obligatorio`;
    }
    return null;
  },
  email: (value) => {
    if (value == null || String(value).trim() === '') return null;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Email no válido';
    }
    return null;
  },
  /** Verifica que el campo coincida con el campo 'password' del formulario. */
  passwordMatch: (value, _field, form) => {
    if (value == null || String(value).trim() === '') return null;
    if (value !== form.password) return 'Las contraseñas no coinciden';
    return null;
  },
  /** Identificación / documento: solo números y letras, longitud configurable (min/max por defecto 5-20). */
  document: (value, _field, _form, options = {}) => {
    if (value == null || String(value).trim() === '') return null;
    const min = options.min ?? 5;
    const max = options.max ?? 20;
    const str = String(value).trim();
    if (str.length < min) return `Mínimo ${min} caracteres`;
    if (str.length > max) return `Máximo ${max} caracteres`;
    if (!/^[a-zA-Z0-9-]+$/.test(str)) {
      return 'Solo letras, números y guiones';
    }
    return null;
  },
};
