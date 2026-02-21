import React from 'react';
import { Link } from 'react-router-dom';
import { MainLayout, PageContainer } from '../components/layout';
import {
  Button,
  Input,
  Card,
  Badge,
  Spinner,
  Alert,
  DatePicker,
} from '../components/ui';
import { ROUTES, BRAND_NAME } from '../constants';

const PALETA_PRIMARIA = { nombre: 'Primario (Verde)', hex: '#009E7A', uso: 'Botones principales, iconos médicos, estados activos' };
const PALETA_SECUNDARIA = { nombre: 'Secundario (Azul)', hex: '#1E5AA8', uso: 'Encabezados, tarjetas institucionales' };
const PALETA_ACENTOS = [
  { nombre: 'Acento (Amarillo)', hex: '#F4B400' },
  { nombre: 'Emergencias (Rojo)', hex: '#D32F2F' },
  { nombre: 'Base (Blanco)', hex: '#FFFFFF' },
];

export default function Components() {
  return (
    <MainLayout>
      <PageContainer>
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-800">Componentes y sistema de diseño</h1>
          <Link to={ROUTES.HOME}>
            <Button variant="outline" size="sm">← Volver al inicio</Button>
          </Link>
        </div>

        {/* Sección: Identidad de marca / Sistema de diseño */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">
            Identidad de marca y sistema de diseño
          </h2>
          <p className="text-neutral-600 mb-8">
            Elementos de identidad aplicados en el proyecto. Guía en <code className="bg-neutral-100 px-1 rounded text-sm">docs/brand/</code>.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card padding={true}>
              <Card.Header>
                <h3 className="text-lg font-semibold text-neutral-800">Nombre de la EPS</h3>
              </Card.Header>
              <Card.Body>
                <p className="text-2xl font-bold text-primary-600">{BRAND_NAME}</p>
                <p className="text-sm text-neutral-500 mt-1">Definido en <code className="bg-neutral-100 px-1 rounded">constants/theme.js</code> (BRAND_NAME).</p>
              </Card.Body>
            </Card>

            <Card padding={true}>
              <Card.Header>
                <h3 className="text-lg font-semibold text-neutral-800">Logo</h3>
                <p className="text-sm text-neutral-500">Color, B/N, horizontal, vertical</p>
              </Card.Header>
              <Card.Body>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                    <img src="/logo-horizontal.svg" alt="Logo horizontal" className="h-24 w-auto object-contain" />
                    <span className="text-sm text-neutral-600 mt-2">Horizontal</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                    <img src="/logo-bn.svg" alt="Logo blanco y negro" className="h-24 w-auto object-contain" />
                    <span className="text-sm text-neutral-600 mt-2">B/N</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                    <img src="/logo-vertical.svg" alt="Logo vertical" className="h-32 w-auto object-contain" />
                    <span className="text-sm text-neutral-600 mt-2">Vertical</span>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 mt-4 text-center">
                  Archivos en <code className="bg-neutral-100 px-1 rounded">public/</code>
                </p>
              </Card.Body>
            </Card>
          </div>

          <Card padding={true} className="mb-8">
            <Card.Header>
              <h3 className="text-lg font-semibold text-neutral-800">Paleta de colores (HEX)</h3>
              <p className="text-sm text-neutral-500">Primario, secundario, acentos</p>
            </Card.Header>
            <Card.Body>
              <div className="flex flex-wrap gap-6">
                <div>
                  <div className="w-16 h-16 rounded-lg shadow-inner mb-2" style={{ backgroundColor: PALETA_PRIMARIA.hex }} />
                  <p className="font-medium text-neutral-800">{PALETA_PRIMARIA.nombre}</p>
                  <p className="text-sm text-neutral-500">{PALETA_PRIMARIA.hex}</p>
                </div>
                <div>
                  <div className="w-16 h-16 rounded-lg shadow-inner mb-2" style={{ backgroundColor: PALETA_SECUNDARIA.hex }} />
                  <p className="font-medium text-neutral-800">{PALETA_SECUNDARIA.nombre}</p>
                  <p className="text-sm text-neutral-500">{PALETA_SECUNDARIA.hex}</p>
                </div>
                {PALETA_ACENTOS.map((a) => (
                  <div key={a.nombre}>
                    <div
                      className="w-12 h-12 rounded-lg shadow-inner mb-2"
                      style={{
                        backgroundColor: a.hex,
                        ...(a.hex.toUpperCase() === '#FFFFFF' ? { border: '1px solid #e2e8f0' } : {}),
                      }}
                    />
                    <p className="font-medium text-neutral-800 text-sm">{a.nombre}</p>
                    <p className="text-xs text-neutral-500">{a.hex}</p>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <Card padding={true}>
              <Card.Header>
                <h3 className="text-lg font-semibold text-neutral-800">Tipografía</h3>
                <p className="text-sm text-neutral-500">Títulos, texto, tamaños</p>
              </Card.Header>
              <Card.Body>
                <p className="text-3xl font-bold text-neutral-800 mb-2">Título (h1)</p>
                <p className="text-xl text-neutral-700 mb-2">Subtítulo (h2)</p>
                <p className="text-base text-neutral-600 mb-2">Texto base</p>
                <p className="text-sm text-neutral-500">Texto pequeño. Variables CSS: <code className="bg-neutral-100 px-1 rounded text-xs">--text-h1</code>, <code className="bg-neutral-100 px-1 rounded text-xs">--text-base</code>, etc.</p>
              </Card.Body>
            </Card>
          </div>

          <Card padding={true} className="mb-16">
            <Card.Header>
              <h3 className="text-lg font-semibold text-neutral-800">Recursos del sistema de diseño</h3>
            </Card.Header>
            <Card.Body>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li><strong>Guía de aplicación en interfaces:</strong> <code className="bg-neutral-100 px-1 rounded">docs/brand/GUIA-APLICACION.md</code></li>
                <li><strong>Assets de marca:</strong> <code className="bg-neutral-100 px-1 rounded">public/brand/</code></li>
                <li><strong>Variables CSS generadas:</strong> <code className="bg-neutral-100 px-1 rounded">src/index.css</code> (<code className="bg-neutral-100 px-1 rounded">:root</code>)</li>
              </ul>
            </Card.Body>
          </Card>
        </section>

        {/* Sección: Componentes de layout */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">
            Componentes de layout
          </h2>
          <p className="text-neutral-600 mb-8">
            Header, Footer, MainLayout y PageContainer. Igual que en la página de inicio: <code className="bg-neutral-100 px-1 rounded text-sm">MainLayout</code> envuelve la página y <code className="bg-neutral-100 px-1 rounded text-sm">Container</code> centra el contenido.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card padding={true}>
              <Card.Header>
                <h3 className="text-lg font-semibold text-neutral-800">Header</h3>
                <p className="text-sm text-neutral-500">Barra superior con logo, Inicio e Iniciar sesión</p>
              </Card.Header>
              <Card.Body>
                <p className="text-sm text-neutral-600 mb-2"><code className="bg-neutral-100 px-1 rounded">src/components/layout/Header</code></p>
                <p className="text-xs text-neutral-500">Props: <code className="bg-neutral-100 px-1 rounded">showAuth</code>, <code className="bg-neutral-100 px-1 rounded">className</code>.</p>
              </Card.Body>
            </Card>

            <Card padding={true}>
              <Card.Header>
                <h3 className="text-lg font-semibold text-neutral-800">Footer</h3>
                <p className="text-sm text-neutral-500">Pie de página con enlaces y contacto</p>
              </Card.Header>
              <Card.Body>
                <p className="text-sm text-neutral-600 mb-2"><code className="bg-neutral-100 px-1 rounded">src/components/layout/Footer</code></p>
                <p className="text-xs text-neutral-500">Incluye <code className="bg-neutral-100 px-1 rounded">Container</code> interno.</p>
              </Card.Body>
            </Card>

            <Card padding={true}>
              <Card.Header>
                <h3 className="text-lg font-semibold text-neutral-800">MainLayout</h3>
                <p className="text-sm text-neutral-500">Header + contenido + Footer</p>
              </Card.Header>
              <Card.Body>
                <p className="text-sm text-neutral-600 mb-2">Uso: <code className="bg-neutral-100 px-1 rounded text-xs">{"<MainLayout>{children}</MainLayout>"}</code></p>
                <p className="text-xs text-neutral-500">Props: <code className="bg-neutral-100 px-1 rounded">showHeader</code>, <code className="bg-neutral-100 px-1 rounded">showFooter</code>, <code className="bg-neutral-100 px-1 rounded">className</code>.</p>
              </Card.Body>
            </Card>

            <Card padding={true}>
              <Card.Header>
                <h3 className="text-lg font-semibold text-neutral-800">PageContainer</h3>
                <p className="text-sm text-neutral-500">Contenedor con ancho máximo y padding</p>
              </Card.Header>
              <Card.Body>
                <p className="text-sm text-neutral-600 mb-2">Uso: <code className="bg-neutral-100 px-1 rounded text-xs">{"<PageContainer>{children}</PageContainer>"}</code></p>
                <p className="text-xs text-neutral-500">Props: <code className="bg-neutral-100 px-1 rounded">maxWidth</code> (sm, md, lg, xl), <code className="bg-neutral-100 px-1 rounded">className</code>.</p>
              </Card.Body>
            </Card>
          </div>
        </section>

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
                  <DatePicker
                    label="Fecha de cita"
                    hint="Ejemplo de DatePicker base"
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
