import React from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const MedicineForm = ({ onClose }) => {
  return (
    <form className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-neutral-700">Nombre</label>
        <Input placeholder="Ej. Acetaminofén" className="w-full" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-700">Stock</label>
          <Input type="number" className="w-full" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-700">Lote</label>
          <Input placeholder="L-123" className="w-full" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-neutral-700">Vencimiento</label>
        <Input type="date" className="w-full" />
      </div>

      {/* Acciones del formulario sincronizadas con el diseño de la imagen */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onClose} type="button">
          Cancelar
        </Button>
        <Button variant="primary" type="submit">
          Guardar
        </Button>
      </div>
    </form>
  );
};

export default MedicineForm;