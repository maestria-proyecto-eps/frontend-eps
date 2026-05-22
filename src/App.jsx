import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider from "./services/auth/AuthProvider";
import ProtectedRoute from "./services/auth/ProtectedRoute";

// auth
import Login from "./pages/auth/Login";
import Home from "./pages/Home";
import Components from "./pages/Components";
import ComponentsOld from "./pages/ComponentsOld";
import Usuarios from "./pages/Usuarios/usuarios";
import DoctorExample from "./pages/doctor/DoctorExample"
import DoctorManager from "./pages/Usuarios/DoctorManager";
import DoctorLayout from "./pages/doctor/DoctorLayout"
import DoctorAppointments from "./pages/doctor/Appointments"
import ConsultationForm from "./pages/doctor/ConsultationForm"
import DoctorPrescriptions from "./pages/doctor/Prescriptions"
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
import AuthenticatedLayout from "./components/layout/authenticated/AuthenticatedLayout"
import DoctorSchedule from "./pages/hr/DoctorSchedule";
import Profile from "./pages/patient/Profile";
import Triages from "./pages/nurse/Triages";
import TriageForm from "./pages/nurse/TriageForm";

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
            <Route index element={<Maintenance />} />
            <Route path="citas" element={<DoctorAppointments />} />
            <Route path="prescriptions" element={<DoctorPrescriptions />} />
            <Route path="consultation/new" element={<ConsultationForm />} />
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
            <Route path="doctors" element={<DoctorManager />} />
            <Route path="doctors/:idDoctor/schedule" element={<DoctorSchedule />} />
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
            <Route path="triage" element={<Triages />} />
            <Route path="triage/new" element={<TriageForm />} />
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
            <Route index element={<Pharmacy />} />
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
            <Route path="citas" element={<PatientAppointments />} />
            <Route path="historia" element={<MedicalHistory />} />
            <Route path="medical-history" element={<MedicalHistory />} />
            <Route path="prescripciones" element={<PatientPrescriptions />} />
            <Route path="referrals" element={<PatientReferrals />} />
            <Route path="perfil" element={<Profile />} />
            <Route path="appointments/new" element={<Calendar />} />
          </Route>

          {/* Cualquier otra ruta → redirigir al home */}
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}