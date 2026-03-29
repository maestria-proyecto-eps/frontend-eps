import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Container } from '../ui';
import { ROUTES, BRAND_NAME } from '../../constants';

/**
 * HeroBanner - Sección principal de bienvenida
 * Con degradado suave, título impactante, subtítulo y CTA
 * Imagen de fondo en la columna derecha
 */
export default function HeroBanner() {
    return (
        <section
            className="relative bg-gradient-to-br from-primary-50 via-white to-blue-50 overflow-hidden"
            style={{
                backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.05)), url(/images/hero-banner.png)',
                backgroundSize: 'cover',
                backgroundPosition: '50% 10%',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'scroll',
            }}
        >
            <Container className="py-12 md:py-20">
                <div className="grid grid-cols-1 md:items-center">
                    {/* Columna izquierda: Texto */}
                    <div className="flex flex-col justify-center">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900">
                            Cuidando tu salud con <br />
                            <span className="text-primary-600">confianza</span>
                        </h1>

                        <p className="mt-6 text-lg md:text-xl text-neutral-700 max-w-lg">
                            Tu bienestar es nuestra prioridad. Servicios médicos de calidad en cada paso de tu viaje hacia la salud.
                        </p>

                        <ul className="mt-8 space-y-3">
                            <li className="flex items-center gap-3">
                                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary-100 text-primary-600 text-sm font-semibold">
                                    ✓
                                </span>
                                <span className="text-neutral-700">Consulta de información y afiliación</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary-100 text-primary-600 text-sm font-semibold">
                                    ✓
                                </span>
                                <span className="text-neutral-700">Gestión de trámites y solicitudes</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary-100 text-primary-600 text-sm font-semibold">
                                    ✓
                                </span>
                                <span className="text-neutral-700">Acceso seguro y control de roles</span>
                            </li>
                        </ul>

                        <div className="mt-10 flex gap-4">
                            <Link to={ROUTES.LOGIN}>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    rightIcon={<span className="material-icons">arrow_forward</span>}
                                >
                                    Iniciar Sesión
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
