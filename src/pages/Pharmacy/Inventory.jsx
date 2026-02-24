import React, { useState } from 'react';
// Importación de componentes UI del proyecto
import { DataTable } from "../../components/ui/DataTable";
import { Badge } from "../../components/ui/Badge";
import { Alert } from "../../components/ui/Alert";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
// Importación de tu formulario local
import MedicineForm from './MedicineForm';

/**
 * PASO 1: Configuración de Columnas
 * Define cómo se verá la tabla y qué datos mostrará.
 */
const COLUMNAS_FARMACIA = [
  { 
    key: 'nombre', 
    label: 'Medicamento', 
    filterable: true 
  },
  { 
    key: 'lote', 
    label: 'Lote', 
    filterable: true 
  },
  { 
    key: 'stock', 
    label: 'Stock', 
    render: (row) => (
      <Badge variant={row.stock < 10 ? "danger" : "success"}>
        {row.stock} uds
      </Badge>
    )
  },
  { 
    key: 'vencimiento', 
    label: 'Vencimiento',
    render: (row) => {
      const esVencido = new Date(row.vencimiento) < new Date();
      return (
        <span className={esVencido ? "text-red-600 font-bold" : ""}>
          {row.vencimiento}
        </span>
      );
    }
  },
  { 
    key: 'estado', 
    label: 'Estado', 
    filterable: true 
  },
];

// Datos iniciales de prueba (Mock Data)
const MEDICAMENTOS_INICIALES = [
  { id: 1, nombre: "Amoxicilina 500mg", lote: "L-456", stock: 5, vencimiento: "2026-05-20", estado: "Activo" },
  { id: 2, nombre: "Ibuprofeno 400mg", lote: "L-102", stock: 50, vencimiento: "2024-03-01", estado: "Vencido" },
  { id: 3, nombre: "Loratadina 10mg", lote: "L-889", stock: 120, vencimiento: "2027-10-15", estado: "Activo" },
];

const Inventory = () => {
  // ESTADOS (Lógica igual a la de Gestión de Usuarios)
  const [medicamentos, setMedicamentos] = useState(MEDICAMENTOS_INICIALES);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * LÓGICA DE NEGOCIO: Filtrado y Paginación
   * Esta lógica permite que los buscadores de la DataTable funcionen.
   */
  const filtrado = medicamentos.filter((row) => {
    return Object.entries(filters).every(([key, val]) => {
      if (val == null || String(val).trim() === '') return true;
      return String(row[key] ?? '').toLowerCase().includes(String(val).toLowerCase());
    });
  });

  const total = filtrado.length;
  const paginados = filtrado.slice((page - 1) * pageSize, page * pageSize);

  // Funciones de acción para la tabla
  const handleDeactivate = (id) => {
    setMedicamentos((prev) => 
      prev.map((m) => (m.id === id ? { ...m, estado: 'Inactivo' } : m))
    );
  };

  return (
    <div className="p-8 bg-neutral-50 min-h-screen">
      {/* CABECERA */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-neutral-800">Inventario de Farmacia</h1>
        <Button onClick={() => setIsModalOpen(true)}>+ Agregar Medicamento</Button>
      </div>

      {/* ALERTAS DE NEGOCIO (Trello) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Alert 
          type="error" 
          title="Stock Crítico" 
          message="Atención: Hay productos con existencias mínimas." 
        />
        <Alert 
          type="warning" 
          title="Próximos Vencimientos" 
          message="Revisar lotes con fecha de caducidad cercana." 
        />
      </div>

      {/* CONTENEDOR DE LA TABLA */}
      <Card>
        <DataTable
          columns={COLUMNAS_FARMACIA}
          data={paginados}
          filters={filters}
          onFiltersChange={setFilters}
          pagination={{
            page,
            pageSize,
            total,
            pageSizeOptions: [5, 10, 25],
            onPageChange: setPage,
            onPageSizeChange: (size) => { setPageSize(size); setPage(1); },
          }}
          keyExtractor={(row) => row.id}
          emptyMessage="No hay medicamentos que coincidan con la búsqueda"
          onEdit={(item) => {
            console.log("Editando medicamento:", item);
            setIsModalOpen(true);
          }}
          onDeactivate={(id) => handleDeactivate(id)}
        />
      </Card>

      {/* MODAL PARA AGREGAR/EDITAR */}
      <Modal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Gestión de Inventario"
        size="md"
      >
        <MedicineForm onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default Inventory;