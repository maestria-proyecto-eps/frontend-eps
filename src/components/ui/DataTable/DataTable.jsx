import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '../../../utils/cn';
import { Button } from '../Button';
import { Input } from '../Input';
import { Card } from '../Card';
import { Spinner } from '../Spinner';
import { Modal } from '../Modal';
import { Alert } from '../Alert';
import { VALIDATORS } from './validators';

/**
 * Construye el objeto vacío del formulario a partir de formConfig.fields.
 */
function getEmptyForm(fields = []) {
  return fields.reduce((acc, f) => {
    if (f.type === 'select' && f.options?.length) {
      acc[f.key] = f.defaultValue ?? f.options[0].value ?? '';
    } else {
      acc[f.key] = f.defaultValue ?? '';
    }
    return acc;
  }, {});
}

/**
 * Aplica las reglas de validación (por nombre o función) a un formulario.
 * field.validation puede ser ['required', 'email'] o ['required', { name: 'document', options: { min, max } }].
 * Si no hay field.validation, se usa required por defecto y email si type === 'email'.
 */
function runFieldValidation(form, fields, context = {}) {
  const err = {};
  fields.forEach((f) => {
    const val = form[f.key];
    const rules = f.validation ?? (f.required === false ? [] : ['required']);
    const ruleList = Array.isArray(rules) ? rules : [rules];
    if (ruleList.length === 0) return;
    if (f.type === 'email' && !ruleList.includes('email')) {
      ruleList.push('email');
    }
    for (const rule of ruleList) {
      const name = typeof rule === 'string' ? rule : rule?.name;
      const options = typeof rule === 'object' && rule != null ? rule.options : undefined;
      const fn = typeof rule === 'function' ? rule : VALIDATORS[name];
      if (!fn) continue;
      const msg = fn(val, f, form, options ?? f.validationOptions?.[name], context);
      if (msg) {
        err[f.key] = msg;
        break;
      }
    }
  });
  return err;
}

/**
 * DataTable — Tabla preparada para datos de API: columnas y datos inyectados desde la página.
 * La página define: datos (data, loading), columnas, qué campos son editables (formConfig.fields),
 * validaciones (field.validation con reglas o formConfig.validate) y la lógica CRUD (onCreate/onEdit/onDeactivate
 * que pueden llamar al API y actualizar estado).
 *
 * - data: filas a mostrar (típicamente desde estado que la página llena con el API).
 * - loading: indica carga inicial o recarga.
 * - formConfig.fields: solo los campos que la página permite crear/editar; createOnly/editOnly controlan en qué modal aparecen.
 * - formConfig.validate: validación custom (ej. unicidad en API); si no se pasa, se usan las reglas por campo (VALIDATORS).
 * - onCreate/onEdit/onDeactivate: pueden ser async; el componente muestra carga en el botón y errores si fallan.
 */
export default function DataTable({
  columns = [],
  data = [],
  pagination,
  filters = {},
  onFiltersChange,
  formConfig,
  onCreate,
  onEdit,
  onDeactivate,
  onActivate,
  keyExtractor = (row) => row.id ?? row.documento ?? JSON.stringify(row),
  loading = false,
  emptyMessage = 'No hay datos',
  renderRowActions,
  className = '',
}) {
  const hasCrud = formConfig && (onCreate || onEdit || onDeactivate || onActivate);
  const fields = useMemo(() => formConfig?.fields ?? [], [formConfig?.fields]);
  const statusKey = formConfig?.statusKey;
  const activeValue = formConfig?.activeValue ?? 'Activo';
  const deactivatedValue = formConfig?.deactivatedValue;

  const [modalCreate, setModalCreate] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [modalDeactivate, setModalDeactivate] = useState(false);
  const [deactivatingRow, setDeactivatingRow] = useState(null);
  const [form, setForm] = useState(() => getEmptyForm(fields));
  const [formErrors, setFormErrors] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const getEmptyFormState = useCallback(() => getEmptyForm(fields), [fields]);
  const fieldsForMode = useCallback(
    (mode) =>
      fields.filter(
        (f) => (mode === 'create' && !f.editOnly) || (mode === 'edit' && !f.createOnly)
      ),
    [fields]
  );
  const validate = useCallback(
    (values, context = {}) => {
      const mode = context.mode ?? 'create';
      const fieldsToValidate = fieldsForMode(mode);
      return formConfig?.validate
        ? formConfig.validate(values, fieldsToValidate, context)
        : runFieldValidation(values, fieldsToValidate, context);
    },
    [formConfig, fieldsForMode]
  );

  const openCreate = () => {
    setForm(getEmptyFormState());
    setFormErrors({});
    setModalCreate(true);
  };

  const openEdit = (row) => {
    setEditingRow(row);
    const values = {};
    fields.forEach((f) => { values[f.key] = row[f.key] ?? (f.type === 'select' && f.options?.length ? f.options[0].value : ''); });
    setForm(values);
    setFormErrors({});
    setModalEdit(true);
  };

  const closeEdit = () => {
    setModalEdit(false);
    setEditingRow(null);
  };

  const openDeactivate = (row) => {
    setDeactivatingRow(row);
    setModalDeactivate(true);
  };

  const closeDeactivate = () => {
    setModalDeactivate(false);
    setDeactivatingRow(null);
  };

  const handleCreate = async () => {
    const err = validate(form, { mode: 'create' });
    if (Object.keys(err).length > 0) {
      setFormErrors(err);
      return;
    }
    setSubmitting(true);
    setFormErrors({});
    try {
      const newRow = { ...form };
      const result = onCreate?.(newRow);
      if (result && typeof result.then === 'function') await result;
      setModalCreate(false);
      setFeedback({ type: 'success', message: formConfig?.createSuccessMessage ?? 'Registro creado correctamente.' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (e) {
      setFeedback({ type: 'error', message: e?.message ?? 'Error al crear.' });
      setTimeout(() => setFeedback(null), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    const err = validate(form, { mode: 'edit', editingRow });
    if (Object.keys(err).length > 0) {
      setFormErrors(err);
      return;
    }
    if (!editingRow) return;
    setSubmitting(true);
    setFormErrors({});
    try {
      const id = keyExtractor(editingRow);
      const updatedRow = { ...editingRow, ...form };
      const result = onEdit?.(id, updatedRow);
      if (result && typeof result.then === 'function') await result;
      closeEdit();
      setFeedback({ type: 'success', message: formConfig?.editSuccessMessage ?? 'Registro actualizado correctamente.' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (e) {
      setFeedback({ type: 'error', message: e?.message ?? 'Error al actualizar.' });
      setTimeout(() => setFeedback(null), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivatingRow) return;
    setSubmitting(true);
    try {
      const id = keyExtractor(deactivatingRow);
      const result = onDeactivate?.(id);
      if (result && typeof result.then === 'function') await result;
      closeDeactivate();
      setFeedback({ type: 'success', message: formConfig?.deactivateSuccessMessage ?? 'Registro desactivado.' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (e) {
      setFeedback({ type: 'error', message: e?.message ?? 'Error al desactivar.' });
      setTimeout(() => setFeedback(null), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const showRowDeactivate = useCallback(
    (row) => statusKey && row[statusKey] === activeValue,
    [statusKey, activeValue]
  );

  const showRowActivate = useCallback(
    (row) => statusKey && deactivatedValue !== undefined && row[statusKey] === deactivatedValue,
    [statusKey, deactivatedValue]
  );

  /** Solo filas activas pueden editarse (si hay statusKey en formConfig). */
  const showRowEdit = useCallback(
    (row) => {
      if (!statusKey) return true;
      return row[statusKey] === activeValue;
    },
    [statusKey, activeValue]
  );

  const hasFilters = columns.some((col) => col.filterable);
  const page = pagination?.page ?? 1;
  const pageSize = pagination?.pageSize ?? 10;
  const total = pagination?.total ?? 0;
  const pageSizeOptions = pagination?.pageSizeOptions ?? [5, 10, 25, 50];
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const handleFilterChange = (columnKey, value) => {
    if (!onFiltersChange) return;
    onFiltersChange({ ...filters, [columnKey]: value });
  };

  const handlePageSizeChange = (e) => {
    const size = Number(e.target.value);
    pagination?.onPageSizeChange?.(size);
    pagination?.onPageChange?.(1);
  };

  const renderFormFields = (mode) =>
    fieldsForMode(mode).map((f) => {
      if (f.type === 'select' && f.options) {
        return (
          <div key={f.key} className="space-y-1">
            <label className="block text-sm font-medium text-neutral-700">{f.label}</label>
            <select
              value={form[f.key] ?? ''}
              onChange={(e) => setField(f.key, e.target.value)}
              disabled={submitting}
              className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-70"
            >
              {f.placeholderOption && <option value="">{f.placeholderOption}</option>}
              {f.options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {formErrors[f.key] && (
              <p className="text-sm text-emergency-600" role="alert">{formErrors[f.key]}</p>
            )}
          </div>
        );
      }
      return (
        <Input
          key={f.key}
          label={f.label}
          type={f.type === 'email' ? 'email' : f.type === 'password' ? 'password' : f.type === 'number' ? 'number' : 'text'}
          value={form[f.key] ?? ''}
          onChange={(e) => setField(f.key, e.target.value)}
          error={formErrors[f.key]}
          placeholder={f.placeholder}
          disabled={submitting}
        />
      );
    });

  const defaultRowActions = hasCrud
    ? (row) => (
        <div className="flex justify-end items-center gap-2">
          {onEdit && showRowEdit(row) && (
            <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
              Editar
            </Button>
          )}
          {onActivate && showRowActivate(row) && (
            <Button variant="primary" size="sm" className="min-w-[110px]" onClick={() => onActivate(keyExtractor(row))}>
              Activar
            </Button>
          )}
          {onDeactivate && showRowDeactivate(row) && (
            <Button variant="deactivate" size="sm" className="min-w-[110px]" onClick={() => openDeactivate(row)}>
              Desactivar
            </Button>
          )}
          {renderRowActions?.(row)}
        </div>
      )
    : renderRowActions;

  const showActionsColumn = !!defaultRowActions;

  return (
    <div className="space-y-4">
      {feedback && (
        <Alert variant={feedback.type} title={feedback.type === 'success' ? 'Éxito' : 'Error'}>
          {feedback.message}
        </Alert>
      )}

      {hasCrud && onCreate && (
        <div className="flex justify-end">
          <Button variant="primary" onClick={openCreate}>
            {formConfig?.createButtonLabel ?? 'Crear'}
          </Button>
        </div>
      )}

      <Card padding={false} className={cn('overflow-hidden', className)}>
        {hasFilters && onFiltersChange && (
          <div className="p-4 border-b border-neutral-200 bg-neutral-50/80">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {columns.filter((col) => col.filterable).map((col) => (
                <div key={col.key}>
                  {col.filterType === 'select' && col.filterOptions ? (
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-neutral-700">{col.label}</label>
                      <select
                        value={filters[col.key] ?? ''}
                        onChange={(e) => handleFilterChange(col.key, e.target.value)}
                        className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        <option value="">Todos</option>
                        {col.filterOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <Input
                      label={col.label}
                      placeholder={`Filtrar por ${col.label.toLowerCase()}`}
                      value={filters[col.key] ?? ''}
                      onChange={(e) => handleFilterChange(col.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="relative overflow-x-auto">
          {loading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-b-xl">
              <Spinner size="lg" />
            </div>
          )}
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr className="bg-neutral-100 border-b border-neutral-200">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="text-left text-sm font-semibold text-neutral-700 px-4 py-3 whitespace-nowrap"
                  >
                    {col.label}
                  </th>
                ))}
                {showActionsColumn && (
                  <th className="text-right text-sm font-semibold text-neutral-700 px-4 py-3 w-32">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={columns.length + (showActionsColumn ? 1 : 0)}
                    className="px-4 py-12 text-center text-neutral-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
              {data.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  className="border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm text-neutral-800">
                      {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '—')}
                    </td>
                  ))}
                  {showActionsColumn && (
                    <td className="px-4 py-3 text-right">{defaultRowActions(row)}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination && total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-neutral-200 bg-neutral-50/50">
            <div className="flex items-center gap-4 text-sm text-neutral-600">
              <span>Mostrando {from}–{to} de {total}</span>
              {pageSizeOptions.length > 0 && (
                <div className="flex items-center gap-2">
                  <label htmlFor="data-table-pagesize" className="text-neutral-600">Filas:</label>
                  <select
                    id="data-table-pagesize"
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    className="rounded border border-neutral-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    {pageSizeOptions.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => pagination?.onPageChange?.(page - 1)}
              >
                Anterior
              </Button>
              <span className="text-sm text-neutral-600 px-2">Página {page} de {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => pagination?.onPageChange?.(page + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </Card>

      {hasCrud && (
        <>
          {onCreate && (
            <Modal
              open={modalCreate}
              onClose={() => !submitting && setModalCreate(false)}
              title={formConfig?.createTitle ?? 'Crear'}
              size="md"
              footer={
                <>
                  <Button variant="outline" onClick={() => setModalCreate(false)} disabled={submitting}>Cancelar</Button>
                  <Button variant="primary" onClick={handleCreate} disabled={submitting}>
                    {submitting ? (formConfig?.submittingLabel ?? 'Guardando...') : (formConfig?.createSubmitLabel ?? 'Crear')}
                  </Button>
                </>
              }
            >
              <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }} className="space-y-4">
                {renderFormFields('create')}
              </form>
            </Modal>
          )}

          {onEdit && (
            <Modal
              open={modalEdit}
              onClose={() => !submitting && closeEdit()}
              title={formConfig?.editTitle ?? 'Editar'}
              size="md"
              footer={
                <>
                  <Button variant="outline" onClick={closeEdit} disabled={submitting}>Cancelar</Button>
                  <Button variant="primary" onClick={handleEdit} disabled={submitting}>
                    {submitting ? (formConfig?.submittingLabel ?? 'Guardando...') : (formConfig?.editSubmitLabel ?? 'Guardar')}
                  </Button>
                </>
              }
            >
              <form onSubmit={(e) => { e.preventDefault(); handleEdit(); }} className="space-y-4">
                {renderFormFields('edit')}
              </form>
            </Modal>
          )}

          {onDeactivate && (
            <Modal
              open={modalDeactivate}
              onClose={() => !submitting && closeDeactivate()}
              title={formConfig?.confirmDeactivateTitle ?? 'Confirmar desactivación'}
              footer={
                <>
                  <Button variant="outline" onClick={closeDeactivate} disabled={submitting}>Cancelar</Button>
                  <Button variant="danger" onClick={handleDeactivate} disabled={submitting}>
                    {submitting ? (formConfig?.submittingLabel ?? 'Guardando...') : 'Desactivar'}
                  </Button>
                </>
              }
            >
              <div className="text-neutral-700">
                {typeof formConfig?.confirmDeactivateMessage === 'function'
                  ? formConfig.confirmDeactivateMessage(deactivatingRow)
                  : formConfig?.confirmDeactivateMessage ?? '¿Está seguro que desea desactivar este registro?'}
              </div>
            </Modal>
          )}
        </>
      )}
    </div>
  );
}
