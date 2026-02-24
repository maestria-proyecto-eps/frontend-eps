import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./services/auth/AuthProvider";
import ProtectedRoute from "./services/auth/ProtectedRoute";

// auth
import Login from "./pages/auth/Login";
import Home from "./pages/Home";
import Components from "./pages/Components";
import Usuarios from "./pages/Usuarios/usuarios"; // La de tu compañero
import Inventory from "./pages/Pharmacy/Inventory"; // TU INTERFAZ DE FARMACIA
import DoctorExample from "./pages/doctor/DoctorExample"
import DoctorLayout from "./pages/doctor/DoctorLayout"
import { ROUTES } from "./constants";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* RUTAS PÚBLICAS */}
          <Route path="/" element={<Home />} />
          <Route path="/components" element={<Components />} />
          <Route path="/usuarios" element={<Usuarios />} />

          {/* NUEVA RUTA DE FARMACIA (TU TAREA) */}
          <Route path="/pharmacy/inventory" element={<Inventory />} />

          {/* LOGIN */}
          <Route path="/login" element={<Login />} />

          {/* DOCTOR ROLE EXAMPLE */}
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
            <Route path="example2" element={<DoctorExample />} />
          </Route>

          {/* Cualquier otra ruta → redirigir al home */}
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}