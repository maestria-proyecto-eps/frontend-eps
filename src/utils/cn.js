/**
 * Utilidad para concatenar clases de Tailwind condicionalmente.
 * Evita conflictos y permite sobrescribir estilos.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
