import { Outlet } from "react-router-dom";

function PatientLayout() {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Panel del Paciente</h2>
      <Outlet />
    </div>
  );
}

export default PatientLayout;
