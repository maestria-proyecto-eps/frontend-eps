import React from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "../components/layout";
import { Button, Container } from "../components/ui";
import { ROUTES, BRAND_NAME } from "../constants";

export default function Home() {
  return (
    <MainLayout>
      {/* HERO */}
      <section className="bg-white">
        <Container className="py-10 md:py-14">
          {/* Header ligero (solo para Home): Logo izq + botón der */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo-horizontal.svg"
                alt={`${BRAND_NAME} - Logo`}
                className="h-40 md:h-44 w-auto object-contain"
                loading="eager"
              />
            </div>

            <Link to={ROUTES.LOGIN}>
              <Button variant="outline" size="md">
                Iniciar sesión
              </Button>
            </Link>
          </div>

          {/* Contenido hero */}
          <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
            {/* Texto */}
            <div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900">
                Bienvenido a <span className="text-secondary-500">{BRAND_NAME}</span>
              </h1>

              <p className="mt-4 text-base md:text-lg text-neutral-600 max-w-xl">
                Plataforma enfocada en gestionar usuarios, información y procesos administrativos
                de salud con una experiencia moderna y consistente.
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

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to={ROUTES.LOGIN}>
                  <Button size="lg">Ingresar al sistema</Button>
                </Link>

                <Link to={ROUTES.COMPONENTS}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-secondary-500 text-secondary-600 hover:bg-secondary-50"
                  >
                    Ver componentes
                  </Button>
                </Link>
              </div>
            </div>

            {/* Ilustración / panel derecho */}
            <div className="md:justify-self-end">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-secondary-600">Panel de atención</p>
                    <p className="mt-1 text-sm text-neutral-600">
                      Accesos rápidos y estado de servicios.
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-700 font-bold">+</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="h-10 rounded-xl bg-white border border-neutral-200" />
                  <div className="h-10 rounded-xl bg-white border border-neutral-200" />
                  <div className="h-10 rounded-xl bg-white border border-neutral-200" />
                </div>

                <div className="mt-6 rounded-xl bg-secondary-50 border border-secondary-100 p-4">
                  <p className="text-sm font-medium text-secondary-700">Recomendación</p>
                  <p className="text-sm text-secondary-700/80">
                    Mantén tus datos actualizados para agilizar tus trámites.
                  </p>
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
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">Nuestros servicios</h2>
            <p className="mt-2 text-neutral-600">
              Accede a funcionalidades clave de la plataforma desde un solo lugar.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            <ServiceCard
              title="Afiliación y datos"
              description="Consulta y gestiona información básica de usuarios."
            />
            <ServiceCard
              title="Trámites"
              description="Radica solicitudes y haz seguimiento del estado."
            />
            <ServiceCard
              title="Atención"
              description="Canales e información de contacto para soporte."
            />
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
