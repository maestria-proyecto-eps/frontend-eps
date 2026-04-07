import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./services/auth/AuthProvider";
import ProtectedRoute from "./services/auth/ProtectedRoute";

// Importaciones de páginas
import Login from "./pages/auth/Login";
import Home from "./pages/Home";
import Components from "./pages/Components";
import Usuarios from "./pages/Usuarios/usuarios";
import DoctorExample from "./pages/doctor/DoctorExample";
import DoctorLayout from "./pages/doctor/DoctorLayout";
import NewPatient from "./pages/receptionist/newpatient";
import Pharmacy from "./pages/receptionist/Pharmacy.jsx"; 
import Calendar from "./pages/patient/calendar";
import { ROUTES } from "./constants";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* RUTAS PÚBLICAS */}
          <Route path="/" element={<Home />} />
          <Route path="/components" element={<Components />} />
          <Route path="/login" element={<Login />} />

          {/* RUTA DE FARMACIA (TU TAREA SPRINT 2) */}
          <Route path="/pharmacy/inventory" element={<Pharmacy />} />
          {/* Dejamos test-farmacia por si el QA la busca ahí */}
          <Route path="/test-farmacia" element={<Pharmacy />} /> 

          {/* RUTA DE CALENDARIO */}
          <Route path="/patient/appointments/new" element={<Calendar />} />

          {/* RUTAS PROTEGIDAS - DOCTOR */}
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowRoles={["doctor"]}>
                <DoctorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DoctorExample />} />
            <Route path="example1" element={<DoctorExample />} />
          </Route>

          {/* RUTAS RECEPCIONISTA */}
          <Route path="/receptionist">
            <Route index element={<NewPatient />} />
            <Route path="afiliacion" element={<NewPatient />} />
          </Route>

          {/* RUTAS RECURSOS HUMANOS / USUARIOS */}
          <Route path="/hr">
            <Route index element={<Usuarios />} />
            <Route path="usuarios" element={<Usuarios />} />
          </Route>

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}