import { useState } from "react";
import RemisionForm from "../../components/remision/RemisionForm";
import RemisionList from "../../components/remision/RemisionList";
import { MainLayout } from "../../components/layout";
import { Container } from "../../components/ui";

function PatientRemission() {

  const [remisiones, setRemisiones] = useState([]);

  const agregarRemision = (nueva) => {
    setRemisiones([...remisiones, { ...nueva, id: Date.now() }]);
  };

  const eliminarRemision = (id) => {
    setRemisiones(remisiones.filter(r => r.id !== id));
  };

  return (
    <MainLayout>
      <Container>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Gestión de Remisiones
        </h2>

        <div className="bg-white p-6 rounded shadow mb-6">
          <RemisionForm onCreate={agregarRemision} />
        </div>

        <div className="bg-white p-6 rounded shadow">
          <RemisionList 
            remisiones={remisiones} 
            onDelete={eliminarRemision} 
          />
        </div>

      </Container>
    </MainLayout>
  );
}

export default PatientRemission;
