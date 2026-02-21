import React from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../components/layout';
import { Button, Container } from '../components/ui';
import { ROUTES, BRAND_NAME } from '../constants';

export default function Home() {
  return (
    <MainLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-16 md:py-24">
        <Container className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Bienvenido a {BRAND_NAME}
          </h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto mb-8">
            Salud y bienestar para ti y tu familia. Conoce los componentes base del proyecto.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to={ROUTES.LOGIN}>
              <Button variant="secondary" size="lg">
                Iniciar sesión
              </Button>
            </Link>
            <Link to={ROUTES.COMPONENTS}>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                Ver componentes
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </MainLayout>
  );
}
