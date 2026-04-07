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

function ServiceCard({ title, description }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="h-12 w-12 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center">
        <span className="h-2.5 w-2.5 rounded-full bg-primary-500" />
      </div>
      <h3 className="mt-4 font-semibold text-neutral-900">{title}</h3>
      <p className="mt-2 text-sm text-neutral-600">{description}</p>
    </div>
  );
}
