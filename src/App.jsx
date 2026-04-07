import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider from "./services/auth/AuthProvider";
import ProtectedRoute from "./services/auth/ProtectedRoute";

// Importaciones de páginas
import Login from "./pages/auth/Login";
import Home from "./pages/Home";
import Components from "./pages/Components";
import Usuarios from "./pages/Usuarios/usuarios";
import DoctorExample from "./pages/doctor/DoctorExample";
import DoctorManager from "./pages/Usuarios/DoctorManager";
import DoctorLayout from "./pages/doctor/DoctorLayout";
import DoctorAppointments from "./pages/doctor/Appointments";
import ConsultationForm from "./pages/doctor/ConsultationForm";
import NewPatient from "./pages/receptionist/newpatient";
import Pharmacy from "./pages/receptionist/Pharmacy.jsx"; 
import Calendar from "./pages/patient/calendar";
import PatientAppointments from "./pages/patient/Appointments";
import Bridge from "./pages/Bridge";
import Maintenance from "./pages/Maintenance";
import { ROUTES } from "./constants";
import AuthenticatedLayout from "./components/layout/authenticated/AuthenticatedLayout";
import DoctorSchedule from "./pages/hr/DoctorSchedule";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* RUTAS PÚBLICAS */}
          <Route path="/" element={<Home />} />
          <Route path="/components" element={<Components />} />
          <Route path="/login" element={<Login />} />

          {/* RUTA DE FARMACIA (SPRINT 2) */}
          <Route path="/pharmacy/inventory" element={<Pharmacy />} />
          <Route path="/test-farmacia" element={<Pharmacy />} /> 

          {/* RUTAS PROTEGIDAS - DOCTOR */}
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowRoles={["Médico"]}>
                <AuthenticatedLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Maintenance />} />
            <Route path="citas" element={<DoctorAppointments />} />
            <Route path="consultation/new" element={<ConsultationForm />} />
            <Route path="remisiones" element={<Maintenance />} />
            <Route path="historial" element={<Maintenance />} />
          </Route>

          {/* PUENTE DE AUTENTICACIÓN */}
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
          
          {/* RECEPCIONISTA */}
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

          {/* TALENTO HUMANO / HR */}
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
            <Route path="doctors" element={<DoctorManager />} />
            <Route path="doctors/:idDoctor/schedule" element={<DoctorSchedule />} />
          </Route>

          {/* ENFERMERO */}
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

          {/* FARMACEUTA */}
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

          {/* PACIENTE */}
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowRoles={["Paciente"]}>
                <AuthenticatedLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Maintenance />} />
            <Route path="citas" element={<PatientAppointments />} />
            <Route path="historia" element={<Maintenance />} />
            <Route path="prescripciones" element={<Maintenance />} />
            <Route path="perfil" element={<Maintenance />} />
            <Route path="appointments/new" element={<Calendar />} />
          </Route>

          {/* REDIRECCIÓN POR DEFECTO */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}