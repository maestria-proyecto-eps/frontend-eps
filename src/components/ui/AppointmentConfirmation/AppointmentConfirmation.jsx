import React from 'react';
import Modal from '../components/common/Modal'; // Asegúrate de que la ruta sea correcta

export default function AppointmentConfirmation({ 
  open, 
  onClose, 
  onConfirm, 
  appointment 
}) {
  // El footer lo definimos como un elemento aparte para pasárselo al Modal
  const modalFooter = (
    <>
      <button
        onClick={onClose}
        className="px-4 py-2 rounded-lg text-neutral-600 hover:bg-neutral-100 font-medium transition-colors"
      >
        Cancelar
      </button>
      <button
        onClick={onConfirm}
        className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium shadow-sm transition-colors"
      >
        Confirmar Cita
      </button>
    </>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Confirmar Agendamiento"
      footer={modalFooter}
      size="md"
    >
      <div className="space-y-4">
        <p className="text-neutral-600">
          Estás a punto de agendar la siguiente cita médica. Por favor, verifica que los datos sean correctos:
        </p>
        
        <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-100 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-neutral-500">Especialidad:</span>
            <span className="text-sm font-semibold text-neutral-800">{appointment?.specialty}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-neutral-500">Doctor(a):</span>
            <span className="text-sm font-semibold text-neutral-800">{appointment?.doctor}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-neutral-500">Fecha:</span>
            <span className="text-sm font-semibold text-neutral-800">{appointment?.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-neutral-500">Hora:</span>
            <span className="text-sm font-semibold text-neutral-800">{appointment?.time}</span>
          </div>
        </div>

        <p className="text-xs text-neutral-400 italic">
          * Al confirmar, se notificará al centro médico y recibirás un correo de confirmación.
        </p>
      </div>
    </Modal>
  );
}