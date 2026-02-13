import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./services/auth/AuthProvider";
import ProtectedRoute from "./services/auth/ProtectedRoute";

// auth
import Login from "./pages/auth/Login";
import Home from "./pages/Home"
import DoctorExample from "./pages/doctor/DoctorExample"
import DoctorLayout from "./pages/doctor/DoctorLayout"

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* RUTAS PÚBLICAS */}
          <Route path="/" element={<Home />} />

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

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
