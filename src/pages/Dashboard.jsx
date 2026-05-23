import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DoctorDashboard from './roles/DoctorDashboard';
import PatientDashboard from './roles/PatientDashboard';
import HRDashboard from './roles/HRDashboard';
import PharmacistDashboard from './roles/PharmacistDashboard';
import NurseDashboard from './roles/NurseDashboard';

const Dashboard = () => {
  const [activeRole, setActiveRole] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const path = window.location.pathname.toLowerCase();
    
    // Fuerza la detección del rol basándose exclusivamente en la URL del navegador
    let roleDetected = "";
    if (path.includes('/hr')) roleDetected = "hr";
    else if (path.includes('/doctor')) roleDetected = "doctor";
    // Corregimos la coincidencia para que sea específica al subpath del dashboard en farmacia
    else if (path.includes('/pharmacist/dashboard')) roleDetected = "pharmacist";
    else if (path.includes('/nurse')) roleDetected = "nurse";
    else if (path.includes('/patient')) roleDetected = "patient";

    // Si no lo detecta por URL (o si es la raíz /pharmacist), recurre al localStorage como plan de respaldo seguro
    if (!roleDetected && storedUser?.role) {
      const r = storedUser.role.toLowerCase();
      if (r.includes('talento') || r.includes('recursos')) roleDetected = "hr";
      else if (r.includes('médico') || r.includes('doctor')) roleDetected = "doctor";
      else if (r.includes('farmaceuta') || r.includes('boticario')) roleDetected = "pharmacist";
      else if (r.includes('enfermer')) roleDetected = "nurse";
      else roleDetected = "patient";
    }

    setActiveRole(roleDetected);
    setUser(storedUser || { name: "Personal EPS" });
    setLoading(false);
  }, [location]);

  if (loading) return <div className="p-6 text-center text-gray-500">Cargando módulo de atención...</div>;

  // Evitamos que el Dashboard se dibuje si estamos en la vista del catálogo de la farmacia
  const isPharmacyCatalog = window.location.pathname.toLowerCase() === '/pharmacist' || window.location.pathname.toLowerCase() === '/pharmacist/farmacia';

  if (isPharmacyCatalog) {
    return null; // Deja que App.jsx renderice el catálogo <Pharmacy /> libremente sin estorbar
  }

  // Renderizado directo basado en la bandera limpia de la URL
  return (
    <div className="w-full h-full">
      {activeRole === "hr" && <HRDashboard user={user} />}
      {activeRole === "doctor" && <DoctorDashboard user={user} />}
      {activeRole === "pharmacist" && <PharmacistDashboard user={user} />}
      {activeRole === "nurse" && <NurseDashboard user={user} />}
      {activeRole === "patient" && <PatientDashboard user={user} />}
    </div>
  );
};

export default Dashboard;