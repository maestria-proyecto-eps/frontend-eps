import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider from "./services/auth/AuthProvider";
import ProtectedRoute from "./services/auth/ProtectedRoute";

// auth
import Login from "./pages/auth/Login";
import Home from "./pages/Home";
import Components from "./pages/Components";
import Usuarios from "./pages/Usuarios/usuarios";
import DoctorExample from "./pages/doctor/DoctorExample"
import DoctorLayout from "./pages/doctor/DoctorLayout"
import NewPatient from "./pages/receptionist/newpatient";
import Calendar from "./pages/patient/calendar";
import Bridge from "./pages/Bridge";
import Maintenance from "./pages/Maintenance";
import { ROUTES } from "./constants";
import AuthenticatedLayout from "./components/layout/authenticated/AuthenticatedLayout"
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* RUTAS PÚBLICAS */}
          <Route path="/" element={<Home />} />
          <Route path="/components" element={<Components />} />
          {/* LOGIN */}
          <Route path="/login" element={<Login />} />

          {/* DOCTOR ROLE EXAMPLE */}
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowRoles={["Médico"]}>
                <AuthenticatedLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DoctorExample />} />
            <Route path="citas" element={<Maintenance />} />
            <Route path="remisiones" element={<Maintenance />} />
            <Route path="historial" element={<Maintenance />} />
          </Route>

          {/* Rutas protegidas, requiere autenticación */}

          <Route
            path="/bridge"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Bridge />} />
          </Route>
          
          {/* Recepcionista */}
          <Route
            path="/receptionist"
            element={
              <ProtectedRoute allowRoles={["Recepcionista"]}>
                <AuthenticatedLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<NewPatient />} />
            <Route path="afiliacion" element={<NewPatient />} />
          </Route>

          {/* Talento Humano */}
          <Route
            path="/hr"
            element={
              <ProtectedRoute allowRoles={["Talento Humano"]}>
                <AuthenticatedLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Usuarios />} />
            <Route path="usuarios" element={<Usuarios />} />
          </Route>

          {/* Enfermero */}
          <Route
            path="/nurse"
            element={
              <ProtectedRoute allowRoles={["Enfermero"]}>
                <AuthenticatedLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Maintenance />} />
            <Route path="urgencias" element={<Maintenance />} />
            <Route path="triage" element={<Maintenance />} />
            <Route path="hospitalizaciones" element={<Maintenance />} />
          </Route>

          {/* Farmaceuta */}
          <Route
            path="/pharmacist"
            element={
              <ProtectedRoute allowRoles={["Farmaceuta"]}>
                <AuthenticatedLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Maintenance />} />
            <Route path="inventario" element={<Maintenance />} />
            <Route path="dispensacion" element={<Maintenance />} />
            <Route path="alertas" element={<Maintenance />} />
          </Route>

          {/* Paciente */}
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowRoles={["Paciente"]}>
                <AuthenticatedLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Maintenance />} />
            <Route path="citas" element={<Maintenance />} />
            <Route path="historia" element={<Maintenance />} />
            <Route path="prescripciones" element={<Maintenance />} />
            <Route path="perfil" element={<Maintenance />} />
          </Route>

          {/* Ruta de prueba del calendario */}
          <Route path="/patient/appointments/new" element={<Calendar />} />

          {/* Cualquier otra ruta → redirigir al home */}
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
