/**
 * Formatea una fecha según un formato específico.
 * @param {Date} date - La fecha a formatear.
 * @param {string} format - El formato deseado (e.g., "dd/mm/yyyy").
 * @returns {string} La fecha formateada.
 */

export function dateFormat(date, format) {
  const d = new Date(date);
  
  const map = {
    dd: d.getDate().toString().padStart(2, '0'),
    mm: (d.getMonth() + 1).toString().padStart(2, '0'),
    yyyy: d.getFullYear(),
    yy: d.getFullYear().toString().slice(-2),
    hh: d.getHours().toString().padStart(2, '0'),  
    mi: d.getMinutes().toString().padStart(2, '0'),  
    ss: d.getSeconds().toString().padStart(2, '0'),  
  };

  return format.replace(/yyyy|yy|mm|dd|hh|mi|ss/gi, matched => map[matched.toLowerCase()]);
}