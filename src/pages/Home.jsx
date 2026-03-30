import React from "react";
import { MainLayout } from "../components/layout";
import {
  HeroBanner,
  ServicesSection,
  AdminRolesSection,
  PatientFeaturesSection,
} from "../components/sections";

/**
 * Home - Página principal de bienvenida
 * Estructura modular con secciones independientes:
 * 1. HeroBanner - Banner principal con CTA
 * 2. ServicesSection - Grid de servicios principales
 * 3. AdminRolesSection - Roles disponibles en el sistema
 * 4. PatientFeaturesSection - Funcionalidades para pacientes
 *
 * El navbar y footer son mantenidos por MainLayout
 */
export default function Home() {
  return (
    <MainLayout>
      {/* Sección 1: Hero Banner */}
      <HeroBanner />

      {/* Sección 2: Servicios */}
      <ServicesSection />

      {/* Sección 3: Roles Administrativos */}
      <AdminRolesSection />

      {/* Sección 4: Funcionalidades para Pacientes */}
      <PatientFeaturesSection />
    </MainLayout>
  );
}
