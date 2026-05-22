import React, { useCallback, useMemo, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout';
import { Alert, Button, Input } from '../../components/ui';
import { http } from '../../services/api/http';
import { endpoints } from '../../services/api/endpoints';
import { AuthContext } from '../../services/auth/AuthContext';

const initialForm = {
  id_paciente: '',
  motivo: '',
  nivel: '',
  antecedentes: '',
  alergias: '',
  hallazgos: '',
  medicamentos: '',
  pulso: '',
  presion_arterial: '',
  frecuencia_cardiaca: '',
  frecuencia_respiratoria: '',
  temperatura: '',
  saturacion_oxigeno: '',
  escala_dolor: 1,
  riesgo_vital: false,
};

function isNumeric(value) {
  return value !== '' && !Number.isNaN(Number(value));
}

export default function TriageForm() {
  const auth = useContext(AuthContext);
  const numDocNurse = auth?.payload?.num_documento;
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const validate = useCallback((values) => {
    const nextErrors = {};
    if (!values.id_paciente?.trim()) {
      nextErrors.id_paciente = 'El documento del paciente es obligatorio.';
    }
    if (!values.motivo?.trim()) {
      nextErrors.motivo = 'El motivo es obligatorio.';
    }
    if (!values.nivel?.trim()) {
      nextErrors.nivel = 'El nivel de triage es obligatorio.';
    } else if (!isNumeric(values.nivel) || Number(values.nivel) < 1 || Number(values.nivel) > 5) {
      nextErrors.nivel = 'El nivel debe ser un número entre 1 y 5.';
    }
    if (values.escala_dolor?.toString().trim()) {
      if (!isNumeric(values.escala_dolor) || Number(values.escala_dolor) < 1 || Number(values.escala_dolor) > 10) {
        nextErrors.escala_dolor = 'La escala de dolor debe ser un número entre 1 y 10.';
      }
    }

    return nextErrors;
  }, []);

  const handleChange = useCallback((key, value) => {
    const nextValue = key === 'riesgo_vital' ? value === 'true' : value;
    setForm((prev) => ({ ...prev, [key]: nextValue }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payloadBody = {
        ...form,
        id_paciente: form.id_paciente.trim(),
        id_enfermero: numDocNurse ? Number(numDocNurse) : undefined,
        nivel: Number(form.nivel),
        escala_dolor: form.escala_dolor ? Number(form.escala_dolor) : undefined,
        riesgo_vital: Boolean(form.riesgo_vital),
        estado: 2,
      };

      await http.post(endpoints.emergency.createTriage, payloadBody);
      setSuccess('Triage registrado correctamente. Redirigiendo a la lista...');
      setTimeout(() => navigate('/nurse/triage'), 900);
    } catch (e) {
      console.error('Error creando triage:', e);
      setError('No fue posible registrar el triage. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = useMemo(() => Object.keys(validate(form)).length === 0, [form, validate]);

  return (
    <PageContainer title="Formulario de Triage">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-800">Registrar Triage</h1>
        <p className="text-neutral-600 text-sm mt-1">
          Completa los datos del paciente y registra el triage con el nivel clínico correspondiente.
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <Alert variant="error" title="Error">
            {error}
          </Alert>
        </div>
      )}

      {success && (
        <div className="mb-4">
          <Alert variant="success" title="Éxito">
            {success}
          </Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Input
            label="Documento del paciente"
            name="id_paciente"
            value={form.id_paciente}
            onChange={(e) => handleChange('id_paciente', e.target.value)}
            error={errors.id_paciente}
            disabled={loading}
          />

          <div className="space-y-1">
            <label htmlFor="nivel" className="block text-sm font-medium text-neutral-700">
              Nivel de triage
            </label>
            <select
              id="nivel"
              name="nivel"
              value={form.nivel}
              onChange={(e) => handleChange('nivel', e.target.value)}
              disabled={loading}
              className="block w-full rounded-full border border-neutral-300 bg-white px-4 py-2 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">Selecciona un nivel</option>
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            {errors.nivel && <p className="mt-1 text-sm text-red-600">{errors.nivel}</p>}
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="motivo" className="block text-sm font-medium text-neutral-700">
            Motivo
          </label>
          <textarea
            id="motivo"
            name="motivo"
            rows={3}
            value={form.motivo}
            onChange={(e) => handleChange('motivo', e.target.value)}
            disabled={loading}
            className="block w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          {errors.motivo && <p className="mt-1 text-sm text-red-600">{errors.motivo}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="antecedentes" className="block text-sm font-medium text-neutral-700">
              Antecedentes
            </label>
            <textarea
              id="antecedentes"
              name="antecedentes"
              rows={3}
              value={form.antecedentes}
              onChange={(e) => handleChange('antecedentes', e.target.value)}
              disabled={loading}
              className="block w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="alergias" className="block text-sm font-medium text-neutral-700">
              Alergias
            </label>
            <textarea
              id="alergias"
              name="alergias"
              rows={3}
              value={form.alergias}
              onChange={(e) => handleChange('alergias', e.target.value)}
              disabled={loading}
              className="block w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="hallazgos" className="block text-sm font-medium text-neutral-700">
              Hallazgos
            </label>
            <textarea
              id="hallazgos"
              name="hallazgos"
              rows={3}
              value={form.hallazgos}
              onChange={(e) => handleChange('hallazgos', e.target.value)}
              disabled={loading}
              className="block w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="medicamentos" className="block text-sm font-medium text-neutral-700">
              Medicamentos
            </label>
            <textarea
              id="medicamentos"
              name="medicamentos"
              rows={3}
              value={form.medicamentos}
              onChange={(e) => handleChange('medicamentos', e.target.value)}
              disabled={loading}
              className="block w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Input
            label="Pulso"
            name="pulso"
            value={form.pulso}
            onChange={(e) => handleChange('pulso', e.target.value)}
            error={errors.pulso}
            disabled={loading}
          />
          <Input
            label="Presión arterial"
            name="presion_arterial"
            value={form.presion_arterial}
            onChange={(e) => handleChange('presion_arterial', e.target.value)}
            error={errors.presion_arterial}
            disabled={loading}
          />
          <Input
            label="Frecuencia cardiaca"
            name="frecuencia_cardiaca"
            value={form.frecuencia_cardiaca}
            onChange={(e) => handleChange('frecuencia_cardiaca', e.target.value)}
            error={errors.frecuencia_cardiaca}
            disabled={loading}
          />
          <Input
            label="Frecuencia respiratoria"
            name="frecuencia_respiratoria"
            value={form.frecuencia_respiratoria}
            onChange={(e) => handleChange('frecuencia_respiratoria', e.target.value)}
            error={errors.frecuencia_respiratoria}
            disabled={loading}
          />
          <Input
            label="Temperatura"
            name="temperatura"
            value={form.temperatura}
            onChange={(e) => handleChange('temperatura', e.target.value)}
            error={errors.temperatura}
            disabled={loading}
          />
          <Input
            label="Saturación de oxígeno"
            name="saturacion_oxigeno"
            value={form.saturacion_oxigeno}
            onChange={(e) => handleChange('saturacion_oxigeno', e.target.value)}
            error={errors.saturacion_oxigeno}
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="escala_dolor" className="block text-sm font-medium text-neutral-700">
              Escala de dolor
            </label>
            <select
              id="escala_dolor"
              name="escala_dolor"
              value={form.escala_dolor}
              onChange={(e) => handleChange('escala_dolor', e.target.value)}
              disabled={loading}
              className="block w-full rounded-full border border-neutral-300 bg-white px-4 py-2 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            {errors.escala_dolor && <p className="mt-1 text-sm text-red-600">{errors.escala_dolor}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="riesgo_vital" className="block text-sm font-medium text-neutral-700">
              Riesgo vital
            </label>
            <select
              id="riesgo_vital"
              name="riesgo_vital"
              value={form.riesgo_vital ? 'true' : 'false'}
              onChange={(e) => handleChange('riesgo_vital', e.target.value)}
              disabled={loading}
              className="block w-full rounded-full border border-neutral-300 bg-white px-4 py-2 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="false">No</option>
              <option value="true">Sí</option>
            </select>
            {errors.riesgo_vital && <p className="mt-1 text-sm text-red-600">{errors.riesgo_vital}</p>}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" variant="primary" disabled={loading || !isFormValid}>
            {loading ? 'Guardando...' : 'Guardar triage'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/nurse/triage')} disabled={loading}>
            Cancelar
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
