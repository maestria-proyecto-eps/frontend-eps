import React from 'react';
import { DatePicker, Button, Input } from '../../components/ui';
import { X } from 'lucide-react';
import './ConsultationFilters.css';

export default function ConsultationFilters({
  doctors = [],
  filters = {},
  onFilterChange = () => {},
  onClearFilters = () => {},
}) {
  const handleDateFromChange = (value) => {
    onFilterChange({ ...filters, dateFrom: value ? value : null });
  };

  const handleDateToChange = (value) => {
    onFilterChange({ ...filters, dateTo: value ? value : null });
  };

  const handleDoctorChange = (e) => {
    const value = e.target.value;
    onFilterChange({ ...filters, doctorId: value ? parseInt(value, 10) : null });
  };

  const hasActiveFilters =
    filters.dateFrom || filters.dateTo || filters.doctorId;

  return (
    <div className="consultation-filters">
      <div className="filters-container">
        {/* Date From */}
        <div className="filter-group">
          <label htmlFor="date-from" className="filter-label">
            Desde
          </label>
          <DatePicker
            id="date-from"
            value={filters.dateFrom || ''}
            onChange={handleDateFromChange}
            placeholder="YYYY-MM-DD"
          />
        </div>

        {/* Date To */}
        <div className="filter-group">
          <label htmlFor="date-to" className="filter-label">
            Hasta
          </label>
          <DatePicker
            id="date-to"
            value={filters.dateTo || ''}
            onChange={handleDateToChange}
            placeholder="YYYY-MM-DD"
          />
        </div>

        {/* Doctor Selector */}
        <div className="filter-group">
          <label htmlFor="doctor-select" className="filter-label">
            Médico
          </label>
          <select
            id="doctor-select"
            value={filters.doctorId || ''}
            onChange={handleDoctorChange}
            className="filter-select"
          >
            <option value="">Todos los médicos</option>
            {doctors.map((doctor) => (
              <option key={doctor.id_doctor} value={doctor.id_doctor}>
                {doctor.nombre_doctor}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="filter-group align-end">
            <button
              className="filter-clear-btn"
              onClick={onClearFilters}
              title="Limpiar filtros"
            >
              <X size={18} />
              <span>Limpiar</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
