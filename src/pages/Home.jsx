import React from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "../components/layout";
import { Button, Container } from "../components/ui";
import { ROUTES, BRAND_NAME } from "../constants";

/**
 * Home (HU)
 * - Página de bienvenida
 * - Logo (arriba izq)
 * - Nombre + descripción EPS
 * - Botón /login (header y CTA principal)
 * - "Nuestros servicios": Hospitalizaciones, Urgencias, Atención médica especializada, Medicamentos
 * - CTA final para iniciar sesión
 *
 * Ajuste solicitado:
 * - Eliminar "Panel de atención"
 * - Usar ilustración /general.svg (fondo blanco) en el bloque derecho del hero
 */

const SERVICES = [
  {
    key: "hospitalizaciones",
    title: "Hospitalizaciones",
    description:
      "Gestión y seguimiento de procesos de hospitalización y autorizaciones.",
    iconSrc: "/services/hospitalizaciones.svg",
    iconBg: "bg-secondary-50 border-secondary-100",
    ring: "hover:ring-secondary-200",
  },
  {
    key: "urgencias",
    title: "Urgencias",
    description: "Acceso rápido a rutas de atención y soporte para casos urgentes.",
    iconSrc: "/services/urgencias.svg",
    // Emergency SOLO para urgencias (manual)
    iconBg: "bg-emergency-50 border-emergency-500/20",
    ring: "hover:ring-emergency-500/20",
  },
  {
    key: "especializada",
    title: "Atención médica especializada",
    description: "Consulta y coordinación de especialidades médicas y remisiones.",
    iconSrc: "/services/atencion-especializada.svg",
    iconBg: "bg-primary-50 border-primary-100",
    ring: "hover:ring-primary-200",
  },
  {
    key: "medicamentos",
    title: "Medicamentos",
    description: "Información de fórmulas, dispensación y seguimiento de tratamientos.",
    iconSrc: "/services/medicamentos.svg",
    iconBg: "bg-neutral-50 border-neutral-200",
    ring: "hover:ring-neutral-300",
  },
];

export default function Home() {
  return (
    <MainLayout>
      {/* HERO */}
      <section className="bg-white">
        <Container className="py-10 md:py-14">
          {/* Top row: Logo izq + Login der */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo-horizontal.svg"
                alt={`${BRAND_NAME} - Logo`}
                className="h-20 sm:h-24 md:h-28 w-auto object-contain"
                loading="eager"
              />
            </div>

            <Link to={ROUTES.LOGIN}>
              <Button variant="outline" size="md">
                Iniciar sesión
              </Button>
            </Link>
          </div>

          {/* Hero content */}
          <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2 md:items-start">
            {/* Left: copy */}
            <div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900">
                Bienvenido a{" "}
                <span className="text-secondary-500">{BRAND_NAME}</span>
              </h1>

              <p className="mt-4 text-base md:text-lg text-neutral-700 max-w-xl">
                {BRAND_NAME} es una Entidad Promotora de Salud enfocada en la prevención, el bienestar
                y la atención integral. Desde esta plataforma podrás gestionar afiliaciones, trámites
                y procesos administrativos con una experiencia moderna, consistente y segura.
              </p>

              <ul className="mt-6 space-y-2 text-neutral-700">
                <li className="flex gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary-500" />
                  Consulta de información y afiliación
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary-500" />
                  Gestión de trámites y solicitudes
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary-500" />
                  Acceso seguro y control de roles
                </li>
              </ul>

              {/* Único CTA funcional requerido */}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to={ROUTES.LOGIN}>
                  <Button size="lg">Ingresar al sistema</Button>
                </Link>
              </div>
            </div>

            {/* Right: ilustración general (general.svg) */}
            <div className="md:justify-self-end w-full">
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 md:p-6 shadow-sm">
                <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-white">
                  <img
                    src="/general.svg"
                    alt="Ilustración general EPS"
                    className="h-full w-full object-contain"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* NUESTROS SERVICIOS */}
      <section className="bg-neutral-50 border-t border-neutral-200">
        <Container className="py-12 md:py-16">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
              Nuestros servicios
            </h2>
            <p className="mt-2 text-neutral-600">
              Hospitalizaciones, urgencias, atención médica especializada y medicamentos.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((s) => (
              <ServiceCard key={s.key} {...s} />
            ))}
          </div>
        </Container>
      </section>

      {/* CTA FINAL */}
      <section className="bg-primary-700">
        <Container className="py-10 md:py-12">
          <div className="rounded-2xl bg-primary-800/40 border border-primary-600/40 px-6 py-8 md:px-10 md:py-10 text-center">
            <h3 className="text-xl md:text-2xl font-bold text-white">
              Accede ahora a la plataforma para iniciar tu gestión
            </h3>
            <p className="mt-2 text-primary-100">
              Inicia sesión para continuar con tus procesos de manera segura.
            </p>
            <div className="mt-6 flex justify-center">
              <Link to={ROUTES.LOGIN}>
                <Button variant="secondary" size="lg">
                  Iniciar sesión
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </MainLayout>
  );
}

function ServiceCard({ title, description, iconSrc, iconBg, ring }) {
  return (
    <div
      className={[
        "rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition",
        "ring-1 ring-transparent",
        ring,
      ].join(" ")}
    >
      <div
        className={[
          "h-14 w-14 rounded-2xl border flex items-center justify-center overflow-hidden",
          iconBg,
        ].join(" ")}
      >
        <img src={iconSrc} alt="" className="h-10 w-10 object-contain" loading="lazy" />
      </div>

      <h3 className="mt-4 text-base font-semibold text-neutral-900">{title}</h3>
      <p className="mt-2 text-sm text-neutral-600">{description}</p>
    </div>
  );
}
