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
                <DoctorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DoctorExample />} />
            <Route path="example1" element={<DoctorExample />} />
            <Route path="example2" element={<DoctorExample />} />
          </Route>

          {/* Rutas protegidas, requiere autenticación */}
          
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
            ...
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
            ...
          </Route>

          {/* Paciente */}
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowRoles={["Paciente"]}>
                <DoctorExample />
              </ProtectedRoute>
            }
          />

          {/* Ruta de prueba del calendario */}
          <Route path="/patient/appointments/new" element={<Calendar />} />

          {/* Cualquier otra ruta → redirigir al home */}
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
