import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider from "./services/auth/AuthProvider";
import ProtectedRoute from "./services/auth/ProtectedRoute";

// auth
import Login from "./pages/auth/Login";
import Home from "./pages/Home";
import Components from "./pages/Components";
import ComponentsOld from "./pages/ComponentsOld";
import Usuarios from "./pages/Usuarios/usuarios";
import DoctorExample from "./pages/doctor/DoctorExample";
import DoctorManager from "./pages/Usuarios/DoctorManager";
import DoctorLayout from "./pages/doctor/DoctorLayout";
import DoctorAppointments from "./pages/doctor/Appointments";
import ConsultationForm from "./pages/doctor/ConsultationForm";
import DoctorPrescriptions from "./pages/doctor/Prescriptions";
import DoctorLayout from "./pages/doctor/DoctorLayout"
import DoctorAppointments from "./pages/doctor/Appointments"
import ConsultationForm from "./pages/doctor/ConsultationForm"
import DoctorPrescriptions from "./pages/doctor/Prescriptions"
import DoctorUrgency from "./pages/doctor/Urgency"
import NewPatient from "./pages/receptionist/newpatient";
import Calendar from "./pages/patient/calendar";
import PatientAppointments from "./pages/patient/Appointments";
import PatientPrescriptions from "./pages/patient/Prescriptions";
import PatientReferrals from "./pages/patient/PatientReferrals";
import MedicalHistory from "./pages/patient/MedicalHistory";
import Bridge from "./pages/Bridge";
import Maintenance from "./pages/Maintenance";
import Pharmacy from "./pages/pharmacy/Pharmacy";
import { ROUTES } from "./constants";
import AuthenticatedLayout from "./components/layout/authenticated/AuthenticatedLayout";
import DoctorSchedule from "./pages/hr/DoctorSchedule";
import Profile from "./pages/patient/Profile";

// Importamos el Dashboard del Sprint
import Dashboard from "./pages/Dashboard";

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

          {/* DOCTOR ROLE */}
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowRoles={["Médico"]}>
                <AuthenticatedLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="citas" element={<DoctorAppointments />} />
            <Route path="prescriptions" element={<DoctorPrescriptions />} />
            <Route path="consultation/new" element={<ConsultationForm />} />
            <Route path="urgencia" element={<DoctorUrgency />} />
            <Route path="remisiones" element={<Maintenance />} />
            <Route path="historial" element={<Maintenance />} />
          </Route>

          {/* Ruta de redirección intermedia tras login */}
          <Route
            path="/bridge"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
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
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="doctors" element={<DoctorManager />} />
            <Route path="doctors/:idDoctor/schedule" element={<DoctorSchedule />} />
          </Route>

          {/* Enfermero */}
          <Route
            path="/nurse"
            element={
              <ProtectedRoute allowRoles={["Enfermero", "Enfermera"]}>
                <AuthenticatedLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="urgencias" element={<Maintenance />} />
            <Route path="triage" element={<Maintenance />} />
            <Route path="hospitalizaciones" element={<Maintenance />} />
          </Route>

          {/* Farmaceuta - SECCIÓN ACTUALIZADA SOLO PARA HABILITAR EL DASHBOARD */}
          <Route
            path="/pharmacist"
            element={
              <ProtectedRoute allowRoles={["Farmaceuta"]}>
                <AuthenticatedLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Pharmacy />} />
            <Route path="farmacia" element={<Pharmacy />} />
            {/* Habilitamos el subpath de manera explícita para que la URL /pharmacist/dashboard funcione */}
            <Route path="dashboard" element={<Dashboard />} />
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
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="citas" element={<PatientAppointments />} />
            
            {/* Rutas duplicadas para soportar historial en inglés y español */}
            <Route path="historia" element={<MedicalHistory />} />
            <Route path="medical-history" element={<MedicalHistory />} />
            <Route path="appointments/history" element={<MedicalHistory />} />
            
            {/* Rutas duplicadas para soportar fórmulas en inglés y español */}
            <Route path="prescripciones" element={<PatientPrescriptions />} />
            <Route path="prescriptions/my" element={<PatientPrescriptions />} />
            
            {/* Rutas duplicadas para soportar datos personales en inglés y español */}
            <Route path="perfil" element={<Profile />} />
            <Route path="profile" element={<Profile />} />
            
            <Route path="referrals" element={<PatientReferrals />} />
            <Route path="appointments/new" element={<Calendar />} />
          </Route>

          {/* Cualquier otra ruta → redirigir al home */}
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}