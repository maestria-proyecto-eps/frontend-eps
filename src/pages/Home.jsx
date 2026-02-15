import React from 'react';
import { Link } from 'react-router-dom';
import { MainLayout, PageContainer } from '../components/layout';
import {
  Button,
  Input,
  Card,
  Badge,
  Container,
  Spinner,
  Alert,
} from '../components/ui';
import { ROUTES } from '../constants';

export default function Home() {
  return (
    <MainLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-16 md:py-24">
        <Container className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Bienvenido a EPS
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
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              Más información
            </Button>
          </div>
        </Container>
      </section>

      <PageContainer>
        {/* Sección: Componentes UI base */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">
            Componentes base de la aplicación
          </h2>
          <p className="text-neutral-600 mb-8">
            Estos componentes se utilizarán en todo el desarrollo del proyecto EPS.
          </p>

          <div className="space-y-12">
            {/* Buttons */}
            <Card padding={true}>
              <Card.Header>
                <h3 className="text-lg font-semibold text-neutral-800">Botones (Button)</h3>
                <p className="text-sm text-neutral-500">Variantes y tamaños</p>
              </Card.Header>
              <Card.Body>
                <div className="flex flex-wrap gap-3 mb-4">
                  <Button variant="primary">Principal</Button>
                  <Button variant="secondary">Secundario</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Peligro</Button>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                  <Button size="sm">Pequeño</Button>
                  <Button size="md">Mediano</Button>
                  <Button size="lg">Grande</Button>
                  <Button disabled>Deshabilitado</Button>
                </div>
              </Card.Body>
            </Card>

            {/* Inputs */}
            <Card padding={true}>
              <Card.Header>
                <h3 className="text-lg font-semibold text-neutral-800">Campos de texto (Input)</h3>
                <p className="text-sm text-neutral-500">Con label, hint y estado de error</p>
              </Card.Header>
              <Card.Body>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                  <Input
                    label="Usuario"
                    placeholder="Ej: Juan Pérez"
                    name="user"
                  />
                  <Input
                    label="Contraseña"
                    type="password"
                    placeholder="••••••••"
                    name="password"
                  />
                  <Input
                    label="Con mensaje de ayuda"
                    hint="Ingresa tu número de documento"
                    placeholder="Cédula"
                    className="md:col-span-2"
                  />
                  <Input
                    label="Con error"
                    error="Este campo es obligatorio"
                    placeholder="Email"
                    className="md:col-span-2"
                  />
                </div>
              </Card.Body>
            </Card>

            {/* Cards */}
            <Card padding={true}>
              <Card.Header>
                <h3 className="text-lg font-semibold text-neutral-800">Tarjetas (Card)</h3>
                <p className="text-sm text-neutral-500">Estructura con Header, Body y Footer</p>
              </Card.Header>
              <Card.Body>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card padding={true} className="border-2 border-primary-200">
                    <Card.Header>
                      <h4 className="font-medium text-primary-700">Tarjeta de ejemplo 1</h4>
                    </Card.Header>
                    <Card.Body>
                      <p className="text-sm text-neutral-600">
                        Contenido de la tarjeta. Ideal para resúmenes o formularios.
                      </p>
                    </Card.Body>
                    <Card.Footer>
                      <Button variant="outline" size="sm">Acción</Button>
                    </Card.Footer>
                  </Card>
                  <Card padding={true} className="border-2 border-secondary-200">
                    <Card.Header>
                      <h4 className="font-medium text-secondary-700">Tarjeta de ejemplo 2</h4>
                    </Card.Header>
                    <Card.Body>
                      <p className="text-sm text-neutral-600">
                        Otra tarjeta con el mismo patrón compound.
                      </p>
                    </Card.Body>
                    <Card.Footer>
                      <Button variant="secondary" size="sm">Aceptar</Button>
                    </Card.Footer>
                  </Card>
                </div>
              </Card.Body>
            </Card>

            {/* Badges */}
            <Card padding={true}>
              <Card.Header>
                <h3 className="text-lg font-semibold text-neutral-800">Etiquetas (Badge)</h3>
                <p className="text-sm text-neutral-500">Estados y categorías</p>
              </Card.Header>
              <Card.Body>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="primary">Activo</Badge>
                  <Badge variant="secondary">Aprobado</Badge>
                  <Badge variant="success">Completado</Badge>
                  <Badge variant="warning">Pendiente</Badge>
                  <Badge variant="error">Rechazado</Badge>
                  <Badge variant="neutral">Información</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge size="sm">Pequeño</Badge>
                  <Badge size="md">Mediano</Badge>
                  <Badge size="lg">Grande</Badge>
                </div>
              </Card.Body>
            </Card>

            {/* Spinner & Alert */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card padding={true}>
                <Card.Header>
                  <h3 className="text-lg font-semibold text-neutral-800">Spinner</h3>
                  <p className="text-sm text-neutral-500">Indicador de carga</p>
                </Card.Header>
                <Card.Body>
                  <div className="flex gap-6 items-center">
                    <Spinner size="sm" />
                    <Spinner size="md" />
                    <Spinner size="lg" />
                  </div>
                </Card.Body>
              </Card>
              <Card padding={true}>
                <Card.Header>
                  <h3 className="text-lg font-semibold text-neutral-800">Alertas (Alert)</h3>
                  <p className="text-sm text-neutral-500">Mensajes de feedback</p>
                </Card.Header>
                <Card.Body>
                  <div className="space-y-3">
                    <Alert variant="success" title="Éxito">
                      Operación completada correctamente.
                    </Alert>
                    <Alert variant="error" title="Error">
                      Ha ocurrido un error. Intenta de nuevo.
                    </Alert>
                    <Alert variant="info">
                      Mensaje informativo sin título.
                    </Alert>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>
        </section>

        {/* Resumen de estructura */}
        <section className="border-t border-neutral-200 pt-12">
          <h2 className="text-2xl font-bold text-neutral-800 mb-4">
            Estructura del proyecto
          </h2>
          <Card padding={true}>
            <ul className="list-disc list-inside space-y-2 text-neutral-600 text-sm">
              <li><code className="bg-neutral-100 px-1 rounded">src/components/ui</code> — Button, Input, Card, Badge, Container, Spinner, Alert</li>
              <li><code className="bg-neutral-100 px-1 rounded">src/components/layout</code> — Header, Footer, MainLayout, PageContainer</li>
              <li><code className="bg-neutral-100 px-1 rounded">src/constants</code> — theme, ROUTES</li>
              <li><code className="bg-neutral-100 px-1 rounded">src/utils</code> — cn (clases condicionales)</li>
              <li><code className="bg-neutral-100 px-1 rounded">src/services</code> — auth, api</li>
              <li><code className="bg-neutral-100 px-1 rounded">src/pages</code> — páginas y rutas</li>
            </ul>
          </Card>
        </section>
      </PageContainer>
    </MainLayout>
  );
}
