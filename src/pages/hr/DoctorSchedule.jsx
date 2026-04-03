import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { http } from '../../services/api/http';
import { endpoints } from '../../services/api/endpoints';
import { Modal, Button, Badge, Alert, Spinner, DatePicker } from '../../components/ui';
import { cn } from '../../utils/cn';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function timesOverlap(s1, e1, s2, e2) {
  return s1 < e2 && s2 < e1;
}

function generateDates(startStr, endStr, selectedDays) {
  const result = [];
  const end = parseDate(endStr);
  const current = parseDate(startStr);
  while (current <= end) {
    if (selectedDays.includes(current.getDay())) {
      result.push(formatDate(current));
    }
    current.setDate(current.getDate() + 1);
  }
  return result;
}

// Ensures time string has seconds (HH:MM → HH:MM:SS)
function toTimeWithSeconds(t) {
  if (!t) return t;
  return t.length === 5 ? `${t}:00` : t;
}

// Trims seconds for display and input (HH:MM:SS → HH:MM)
function toTimeHHMM(t) {
  return (t ?? '').substring(0, 5);
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const DIAS_SEMANA_OPTIONS = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
  { value: 0, label: 'Dom' },
];

// estado: 1 = disponible (no appointment), 0 = ocupado (has appointment)
const ESTADO_CONFIG = {
  1: { label: 'Disponible', variant: 'success' },
  0: { label: 'Ocupado',    variant: 'warning' },
};

const EMPTY_FORM = {
  tipo_fecha:  'single',
  fecha:       '',
  fechaInicio: '',
  fechaFin:    '',
  diasSemana:  [1, 2, 3, 4, 5],
  hora_inicio: '',
  hora_fin:    '',
};

const EMPTY_EDIT_FORM = { fecha: '', hora_inicio: '', hora_fin: '' };

// ── Main Component ─────────────────────────────────────────────────────────────

export default function DoctorSchedule() {
  const { idDoctor } = useParams();
  const location     = useLocation();
  const navigate     = useNavigate();

  const {
    id_doctor,
    id_especialidad,
    nombres,
    apellidos,
    num_licencia,
    nombre_especialidad,
  } = location.state ?? {};

  // Prefer location state id_doctor; fall back to route param
  const doctorId      = id_doctor      ?? Number(idDoctor);
  const especialidadId = id_especialidad ?? null;
  const doctorNombre  = nombres && apellidos ? `${nombres} ${apellidos}`.trim() : `Médico #${doctorId}`;

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const todayStr = formatDate(today);

  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [agenda,    setAgenda]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [pageError, setPageError] = useState(null);

  // Add modal
  const [showAdd,    setShowAdd]    = useState(false);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});

  // Preview modal
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState({ dates: [], overlaps: [] });

  // Edit modal
  const [showEdit,       setShowEdit]       = useState(false);
  const [editTarget,     setEditTarget]     = useState(null);
  const [editForm,       setEditForm]       = useState(EMPTY_EDIT_FORM);
  const [editFormErrors, setEditFormErrors] = useState({});

  // Delete modals
  const [deleteTarget,      setDeleteTarget]      = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCitaWarning,   setShowCitaWarning]   = useState(false);

  // Week days (Mon–Sun)
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    }),
    [weekStart]
  );

  // ── Data fetching ────────────────────────────────────────────────────────────

  const fetchAgenda = useCallback(async () => {
    setLoading(true);
    setPageError(null);
    try {
      const { data: res } = await http.get(endpoints.schedules.getByDoctor(doctorId));
      const list = res?.data ?? res ?? [];
      setAgenda(Array.isArray(list) ? list : []);
    } catch {
      setPageError('Error al cargar la agenda del médico.');
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchAgenda();
  }, [fetchAgenda]);

  // ── Derived data ──────────────────────────────────────────────────────────────

  const blocksByDay = useMemo(() => {
    const map = {};
    weekDays.forEach((d) => { map[formatDate(d)] = []; });
    agenda.forEach((block) => {
      const dateStr = (block.fecha ?? '').split('T')[0];
      if (map[dateStr] !== undefined) {
        map[dateStr].push(block);
      }
    });
    Object.keys(map).forEach((k) => {
      map[k].sort((a, b) => (a.hora_inicio ?? '').localeCompare(b.hora_inicio ?? ''));
    });
    return map;
  }, [agenda, weekDays]);

  // ── Form validation ────────────────────────────────────────────────────────────

  const validateForm = () => {
    const errs = {};
    if (!form.hora_inicio) errs.hora_inicio = 'Requerido';
    if (!form.hora_fin)    errs.hora_fin    = 'Requerido';
    if (form.hora_inicio && form.hora_fin && form.hora_inicio >= form.hora_fin) {
      errs.hora_fin = 'La hora de fin debe ser posterior a la de inicio';
    }
    if (form.tipo_fecha === 'single') {
      if (!form.fecha) errs.fecha = 'Requerido';
      else if (parseDate(form.fecha) < today) errs.fecha = 'Solo se permiten fechas futuras';
    } else {
      if (!form.fechaInicio) errs.fechaInicio = 'Requerido';
      if (!form.fechaFin)    errs.fechaFin    = 'Requerido';
      if (form.fechaInicio && form.fechaFin && form.fechaInicio > form.fechaFin) {
        errs.fechaFin = 'La fecha fin debe ser posterior a la fecha inicio';
      }
      if (form.fechaInicio && parseDate(form.fechaInicio) < today) {
        errs.fechaInicio = 'Solo se permiten fechas futuras';
      }
      if (form.diasSemana.length === 0) errs.diasSemana = 'Seleccione al menos un día';
    }
    return errs;
  };

  const validateEditForm = () => {
    const errs = {};
    if (!editForm.fecha)       errs.fecha       = 'Requerido';
    if (!editForm.hora_inicio) errs.hora_inicio = 'Requerido';
    if (!editForm.hora_fin)    errs.hora_fin    = 'Requerido';
    if (editForm.hora_inicio && editForm.hora_fin && editForm.hora_inicio >= editForm.hora_fin) {
      errs.hora_fin = 'La hora de fin debe ser posterior a la de inicio';
    }
    return errs;
  };

  // ── Add block flow ─────────────────────────────────────────────────────────────

  const handlePreview = () => {
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setFormErrors({});

    const rawDates =
      form.tipo_fecha === 'single'
        ? [form.fecha]
        : generateDates(form.fechaInicio, form.fechaFin, form.diasSemana);

    const futureDates = rawDates.filter((d) => parseDate(d) >= today);

    const overlaps = [];
    futureDates.forEach((date) => {
      agenda
        .filter((b) => (b.fecha ?? '').split('T')[0] === date)
        .forEach((existing) => {
          if (timesOverlap(form.hora_inicio, form.hora_fin, existing.hora_inicio, existing.hora_fin)) {
            overlaps.push({ date, existing });
          }
        });
    });

    setPreviewData({ dates: futureDates, overlaps });
    setShowPreview(true);
  };

  const handleConfirmAdd = async () => {
    if (previewData.overlaps.length > 0) return;
    setSaving(true);
    setPageError(null);
    try {
      await Promise.all(
        previewData.dates.map((fecha) =>
          http.post(endpoints.schedules.create, {
            id_doctor:       Number(doctorId),
            id_especialidad: Number(especialidadId),
            fecha,
            hora_inicio:     toTimeWithSeconds(form.hora_inicio),
            hora_fin:        toTimeWithSeconds(form.hora_fin),
            estado:          1,
          })
        )
      );
      setShowPreview(false);
      setShowAdd(false);
      setForm(EMPTY_FORM);
      await fetchAgenda();
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Error al guardar los bloques.';
      setPageError(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Edit block flow ───────────────────────────────────────────────────────────

  const handleOpenEdit = (block) => {
    setEditTarget(block);
    setEditForm({
      fecha:       (block.fecha ?? '').split('T')[0],
      hora_inicio: toTimeHHMM(block.hora_inicio),
      hora_fin:    toTimeHHMM(block.hora_fin),
    });
    setEditFormErrors({});
    setShowEdit(true);
  };

  const handleConfirmEdit = async () => {
    const errs = validateEditForm();
    if (Object.keys(errs).length > 0) {
      setEditFormErrors(errs);
      return;
    }
    setSaving(true);
    setPageError(null);
    try {
      await http.put(endpoints.schedules.update(editTarget.id_agenda), {
        id_doctor:       editTarget.id_doctor,
        id_especialidad: editTarget.id_especialidad,
        fecha:           editForm.fecha,
        hora_inicio:     toTimeWithSeconds(editForm.hora_inicio),
        hora_fin:        toTimeWithSeconds(editForm.hora_fin),
        estado:          editTarget.estado,
      });
      setShowEdit(false);
      setEditTarget(null);
      await fetchAgenda();
    } catch {
      setPageError('Error al actualizar el bloque.');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete flow ────────────────────────────────────────────────────────────────

  const handleBlockDelete = (block) => {
    const blockDate = parseDate((block.fecha ?? '').split('T')[0]);
    if (blockDate < today) return;

    setDeleteTarget({ block, hasCita: block.estado === 0 });
    if (block.estado === 0) {
      setShowCitaWarning(true);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await http.delete(endpoints.schedules.delete(deleteTarget.block.id_agenda));
      setShowDeleteConfirm(false);
      setShowCitaWarning(false);
      setDeleteTarget(null);
      await fetchAgenda();
    } catch {
      setPageError('Error al eliminar el bloque.');
    } finally {
      setSaving(false);
    }
  };

  // ── Week navigation ────────────────────────────────────────────────────────────

  const goToPrevWeek = () =>
    setWeekStart((prev) => { const d = new Date(prev); d.setDate(d.getDate() - 7); return d; });
  const goToNextWeek = () =>
    setWeekStart((prev) => { const d = new Date(prev); d.setDate(d.getDate() + 7); return d; });
  const goToCurrentWeek = () => setWeekStart(getWeekStart(new Date()));

  // ── Render ─────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-sm text-primary-600 hover:underline mb-2 inline-block"
            >
              ← Volver
            </button>
            <h1 className="text-2xl font-bold text-neutral-800">Agenda del médico</h1>
            <p className="text-sm text-neutral-700 mt-1 font-medium">{doctorNombre}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-sm text-neutral-500">
              {nombre_especialidad && <span>Especialidad: {nombre_especialidad}</span>}
              {num_licencia        && <span>Licencia: {num_licencia}</span>}
              <span>ID Médico: {doctorId}</span>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={() => { setForm(EMPTY_FORM); setFormErrors({}); setShowAdd(true); }}
          >
            + Agregar bloque
          </Button>
        </div>

        {pageError && (
          <Alert variant="error" title="Error" className="mb-4">
            {pageError}
          </Alert>
        )}

        {/* Week navigation */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Button variant="outline" size="sm" onClick={goToPrevWeek}>‹ Anterior</Button>
          <Button variant="ghost"   size="sm" onClick={goToCurrentWeek}>Hoy</Button>
          <Button variant="outline" size="sm" onClick={goToNextWeek}>Siguiente ›</Button>
          <span className="text-sm font-medium text-neutral-600">
            {weekDays[0].toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
            {' – '}
            {weekDays[6].toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>

        {/* Weekly grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-neutral-200">
              {weekDays.map((day, i) => {
                const dateStr = formatDate(day);
                const isToday = dateStr === todayStr;
                return (
                  <div
                    key={dateStr}
                    className={cn(
                      'px-2 py-3 text-center border-r last:border-r-0 border-neutral-200',
                      isToday && 'bg-primary-50'
                    )}
                  >
                    <div className={cn('text-xs font-medium uppercase tracking-wide', isToday ? 'text-primary-600' : 'text-neutral-500')}>
                      {DAY_LABELS[i]}
                    </div>
                    <div className={cn('text-lg font-semibold mt-0.5', isToday ? 'text-primary-700' : 'text-neutral-800')}>
                      {day.getDate()}
                    </div>
                    <div className="text-xs text-neutral-400">
                      {day.toLocaleDateString('es-CO', { month: 'short' })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 min-h-[400px]">
              {weekDays.map((day) => {
                const dateStr = formatDate(day);
                const blocks  = blocksByDay[dateStr] ?? [];
                const isToday = dateStr === todayStr;
                const isPast  = parseDate(dateStr) < today;
                return (
                  <div
                    key={dateStr}
                    className={cn(
                      'border-r last:border-r-0 border-neutral-200 p-1.5 space-y-1.5',
                      isToday && 'bg-primary-50/30',
                      isPast  && 'bg-neutral-50'
                    )}
                  >
                    {blocks.length === 0 && (
                      <p className="text-xs text-neutral-400 text-center mt-6">–</p>
                    )}
                    {blocks.map((block) => {
                      const estadoCfg = ESTADO_CONFIG[block.estado] ?? { label: String(block.estado), variant: 'neutral' };
                      const canModify = !isPast;
                      return (
                        <div
                          key={block.id_agenda}
                          className={cn(
                            'rounded-lg border px-2 py-1.5 text-xs',
                            block.estado === 1
                              ? 'border-primary-200 bg-primary-50'
                              : 'border-amber-200 bg-amber-50'
                          )}
                        >
                          <div className="font-medium text-neutral-700 truncate">
                            {toTimeHHMM(block.hora_inicio)} – {toTimeHHMM(block.hora_fin)}
                          </div>
                          <div className="flex items-center justify-between mt-1 gap-1">
                            <Badge variant={estadoCfg.variant} size="sm">
                              {estadoCfg.label}
                            </Badge>
                            {canModify && (
                              <div className="flex gap-1 shrink-0">
                                <button
                                  type="button"
                                  className="text-neutral-400 hover:text-primary-600 transition-colors"
                                  onClick={() => handleOpenEdit(block)}
                                  title="Editar bloque"
                                  aria-label="Editar bloque"
                                >
                                  ✎
                                </button>
                                <button
                                  type="button"
                                  className="text-neutral-400 hover:text-emergency-600 transition-colors"
                                  onClick={() => handleBlockDelete(block)}
                                  title="Eliminar bloque"
                                  aria-label="Eliminar bloque"
                                >
                                  ✕
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Add Block Modal ───────────────────────────────────────────────────── */}
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Agregar bloque de horario"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handlePreview}>Vista previa</Button>
          </>
        }
      >
        <AddBlockForm
          form={form}
          errors={formErrors}
          today={todayStr}
          onChange={(field, value) => setForm((prev) => ({ ...prev, [field]: value }))}
        />
      </Modal>

      {/* ── Preview Modal ─────────────────────────────────────────────────────── */}
      <Modal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title="Vista previa: bloques a insertar"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowPreview(false)}>Atrás</Button>
            <Button
              variant="primary"
              onClick={handleConfirmAdd}
              disabled={previewData.overlaps.length > 0 || previewData.dates.length === 0 || saving}
            >
              {saving ? 'Guardando...' : 'Confirmar e insertar'}
            </Button>
          </>
        }
      >
        <PreviewContent
          data={previewData}
          form={form}
          nombreEspecialidad={nombre_especialidad}
        />
      </Modal>

      {/* ── Edit Block Modal ──────────────────────────────────────────────────── */}
      <Modal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        title="Editar bloque de horario"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowEdit(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleConfirmEdit} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </>
        }
      >
        <EditBlockForm
          form={editForm}
          errors={editFormErrors}
          today={todayStr}
          onChange={(field, value) => setEditForm((prev) => ({ ...prev, [field]: value }))}
        />
      </Modal>

      {/* ── Delete confirm (no appointment) ──────────────────────────────────── */}
      <Modal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Eliminar bloque"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancelar</Button>
            <Button variant="danger" onClick={handleConfirmDelete} disabled={saving}>
              {saving ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </>
        }
      >
        <p className="text-neutral-700">
          ¿Está seguro que desea eliminar este bloque?
        </p>
        {deleteTarget && (
          <p className="mt-2 text-sm text-neutral-500">
            {(deleteTarget.block.fecha ?? '').split('T')[0]} · {toTimeHHMM(deleteTarget.block.hora_inicio)} – {toTimeHHMM(deleteTarget.block.hora_fin)}
          </p>
        )}
      </Modal>

      {/* ── Cita warning ──────────────────────────────────────────────────────── */}
      <Modal
        open={showCitaWarning}
        onClose={() => setShowCitaWarning(false)}
        title="Advertencia: cita asociada"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowCitaWarning(false)}>Cancelar</Button>
            <Button variant="danger" onClick={handleConfirmDelete} disabled={saving}>
              {saving ? 'Eliminando...' : 'Eliminar de todas formas'}
            </Button>
          </>
        }
      >
        <Alert variant="warning" title="Este bloque tiene una cita asociada">
          Al eliminar este bloque, la cita asociada también quedará afectada. ¿Desea continuar?
        </Alert>
        {deleteTarget && (
          <p className="mt-3 text-sm text-neutral-600">
            Bloque: {(deleteTarget.block.fecha ?? '').split('T')[0]} · {toTimeHHMM(deleteTarget.block.hora_inicio)} – {toTimeHHMM(deleteTarget.block.hora_fin)}
          </p>
        )}
      </Modal>
    </div>
  );
}

// ── Add Block Form ──────────────────────────────────────────────────────────────

function AddBlockForm({ form, errors, today, onChange }) {
  return (
    <div className="space-y-5">
      {/* Tipo de fecha */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-700">Tipo de fecha</label>
        <div className="flex gap-6">
          {[
            { value: 'single', label: 'Fecha única' },
            { value: 'range',  label: 'Rango de fechas' },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tipo_fecha"
                value={opt.value}
                checked={form.tipo_fecha === opt.value}
                onChange={() => onChange('tipo_fecha', opt.value)}
                className="accent-primary-600"
              />
              <span className="text-sm text-neutral-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Fecha / Rango */}
      {form.tipo_fecha === 'single' ? (
        <DatePicker
          label="Fecha"
          value={form.fecha}
          onChange={(val) => onChange('fecha', val)}
          min={today}
          error={errors.fecha}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <DatePicker
              label="Fecha inicio"
              value={form.fechaInicio}
              onChange={(val) => onChange('fechaInicio', val)}
              min={today}
              error={errors.fechaInicio}
            />
            <DatePicker
              label="Fecha fin"
              value={form.fechaFin}
              onChange={(val) => onChange('fechaFin', val)}
              min={form.fechaInicio || today}
              error={errors.fechaFin}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">Días de la semana</label>
            <div className="flex flex-wrap gap-2">
              {DIAS_SEMANA_OPTIONS.map((dia) => {
                const checked = form.diasSemana.includes(dia.value);
                return (
                  <button
                    key={dia.value}
                    type="button"
                    onClick={() => {
                      const next = checked
                        ? form.diasSemana.filter((d) => d !== dia.value)
                        : [...form.diasSemana, dia.value];
                      onChange('diasSemana', next);
                    }}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                      checked
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'bg-white text-neutral-600 border-neutral-300 hover:border-primary-400'
                    )}
                  >
                    {dia.label}
                  </button>
                );
              })}
            </div>
            {errors.diasSemana && (
              <p className="text-sm text-emergency-600">{errors.diasSemana}</p>
            )}
          </div>
        </>
      )}

      {/* Horario */}
      <TimeRangeFields
        hora_inicio={form.hora_inicio}
        hora_fin={form.hora_fin}
        errors={errors}
        onChange={onChange}
      />
    </div>
  );
}

// ── Edit Block Form ─────────────────────────────────────────────────────────────

function EditBlockForm({ form, errors, today, onChange }) {
  return (
    <div className="space-y-5">
      <DatePicker
        label="Fecha"
        value={form.fecha}
        onChange={(val) => onChange('fecha', val)}
        min={today}
        error={errors.fecha}
      />
      <TimeRangeFields
        hora_inicio={form.hora_inicio}
        hora_fin={form.hora_fin}
        errors={errors}
        onChange={onChange}
      />
    </div>
  );
}

// ── Shared: Time Range Fields ───────────────────────────────────────────────────

function TimeRangeFields({ hora_inicio, hora_fin, errors, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1">
        <label className="block text-sm font-medium text-neutral-700">Hora inicio</label>
        <input
          type="time"
          value={hora_inicio}
          onChange={(e) => onChange('hora_inicio', e.target.value)}
          className={cn(
            'block w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900',
            'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
            errors.hora_inicio && 'border-emergency-500'
          )}
        />
        {errors.hora_inicio && (
          <p className="text-sm text-emergency-600">{errors.hora_inicio}</p>
        )}
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-neutral-700">Hora fin</label>
        <input
          type="time"
          value={hora_fin}
          onChange={(e) => onChange('hora_fin', e.target.value)}
          className={cn(
            'block w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900',
            'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
            errors.hora_fin && 'border-emergency-500'
          )}
        />
        {errors.hora_fin && (
          <p className="text-sm text-emergency-600">{errors.hora_fin}</p>
        )}
      </div>
    </div>
  );
}

// ── Preview Content ─────────────────────────────────────────────────────────────

function PreviewContent({ data, form, nombreEspecialidad }) {
  return (
    <div className="space-y-4">
      <div className="bg-neutral-50 rounded-lg p-4 space-y-1 text-sm">
        {nombreEspecialidad && (
          <div><span className="font-medium">Especialidad:</span> {nombreEspecialidad}</div>
        )}
        <div><span className="font-medium">Horario:</span> {form.hora_inicio} – {form.hora_fin}</div>
        <div>
          <span className="font-medium">Registros a insertar:</span>{' '}
          <span className={data.overlaps.length > 0 ? 'text-emergency-600 font-semibold' : 'text-primary-700 font-semibold'}>
            {data.dates.length}
          </span>
        </div>
      </div>

      {data.dates.length === 0 && (
        <Alert variant="warning" title="Sin fechas válidas">
          No se generaron fechas futuras con los parámetros seleccionados.
        </Alert>
      )}

      {data.overlaps.length > 0 ? (
        <>
          <Alert variant="error" title={`${data.overlaps.length} solapamiento(s) detectado(s)`}>
            No se puede continuar. Existen bloques con franjas horarias que se cruzan con
            registros ya existentes. Ajuste las fechas u horarios e intente nuevamente.
          </Alert>
          <div className="space-y-1">
            <p className="text-sm font-medium text-neutral-700">Conflictos:</p>
            <ul className="text-sm text-neutral-600 space-y-1 max-h-40 overflow-y-auto">
              {data.overlaps.map((o, i) => (
                <li key={i} className="bg-emergency-50 rounded px-3 py-1.5">
                  {o.date} — existente: {toTimeHHMM(o.existing.hora_inicio)}–{toTimeHHMM(o.existing.hora_fin)}
                  {' '}(ID agenda: {o.existing.id_agenda})
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        data.dates.length > 0 && (
          <>
            <Alert variant="success" title="Sin solapamientos detectados">
              Los {data.dates.length} bloque(s) pueden insertarse sin conflictos.
            </Alert>
            <div className="space-y-1">
              <p className="text-sm font-medium text-neutral-700">Fechas a insertar:</p>
              <ul className="text-sm text-neutral-600 space-y-0.5 max-h-48 overflow-y-auto">
                {data.dates.map((d) => (
                  <li key={d} className="bg-primary-50 rounded px-3 py-1">
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )
      )}
    </div>
  );
}
