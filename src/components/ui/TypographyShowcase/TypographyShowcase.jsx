import React from 'react';

/**
 * TypographyShowcase - Componente para demostrar la tipografía del sistema de diseño
 * Muestra fuentes (Roboto y Archivo) con sus variantes de peso
 * 
 * Props:
 * - className: Clases CSS adicionales
 */
export function TypographyShowcase({ className = '', ...props }) {
  return (
    <div
      className={`w-full ${className}`}
      id="typography-showcase"
      data-testid="typography-showcase"
      {...props}
    >
      {/* Encabezado con fondo azul */}
      <div className="bg-primary-600 text-white py-12 px-8 rounded-t-lg">
        <h2 className="text-4xl font-bold text-center">Tipografías</h2>
      </div>

      {/* Contenedor con dos tarjetas */}
      <div className="bg-neutral-100 px-8 py-12 rounded-b-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Font Body - Roboto */}
          <div
            id="font-body-card"
            data-testid="font-body-card"
            className="bg-white rounded-3xl p-8 shadow-lg text-center"
          >
            <label className="text-sm font-semibold text-neutral-600 uppercase tracking-wide mb-6 block">
              Font Body
            </label>
            <div className="space-y-4">
              {/* Roboto Black */}
              <div id="roboto-black" data-testid="roboto-black">
                <p className="text-3xl font-black mb-1" style={{ fontFamily: 'Roboto' }}>
                  Roboto Black
                </p>
                <p className="text-xs text-neutral-500 font-mono">
                  <code className="bg-neutral-100 px-1 rounded">font-black</code>
                </p>
              </div>

              {/* Roboto Bold */}
              <div id="roboto-bold" data-testid="roboto-bold">
                <p className="text-2xl font-bold mb-1" style={{ fontFamily: 'Roboto' }}>
                  Roboto Bold
                </p>
                <p className="text-xs text-neutral-500 font-mono">
                  <code className="bg-neutral-100 px-1 rounded">font-bold</code>
                </p>
              </div>

              {/* Roboto Semibold */}
              <div id="roboto-semibold" data-testid="roboto-semibold">
                <p className="text-1xl font-semibold mb-1" style={{ fontFamily: 'Roboto' }}>
                  Roboto Semibold
                </p>
                <p className="text-xs text-neutral-500 font-mono">
                  <code className="bg-neutral-100 px-1 rounded">font-semibold</code>
                </p>
              </div>

              {/* Roboto Regular */}
              <div id="roboto-regular" data-testid="roboto-regular">
                <p className="text-1xl font-normal mb-1" style={{ fontFamily: 'Roboto' }}>
                  Roboto Regular
                </p>
                <p className="text-xs text-neutral-500 font-mono">
                  <code className="bg-neutral-100 px-1 rounded">font-normal</code>
                </p>
              </div>

              {/* Roboto Light */}
              <div id="roboto-light" data-testid="roboto-light">
                <p className="text-1xl font-light mb-1" style={{ fontFamily: 'Roboto' }}>
                  Roboto Light
                </p>
                <p className="text-xs text-neutral-500 font-mono">
                  <code className="bg-neutral-100 px-1 rounded">font-light</code>
                </p>
              </div>
            </div>
            <p className="text-xs text-neutral-500 mt-8 font-mono text-center">
              variables css: <br />
              --font-body
            </p>
          </div>

          {/* Font Heading - Archivo */}
          <div
            id="font-heading-card"
            data-testid="font-heading-card"
            className="bg-white rounded-3xl p-8 shadow-lg flex flex-col justify-center items-center text-center"
          >
            <label className="text-sm font-semibold text-neutral-600 uppercase tracking-wide mb-4">
              Font Heading
            </label>
            <div className="space-y-2">
              <p className="text-5xl font-black" style={{ fontFamily: 'Archivo' }}>
                Archivo
              </p>
              <p className="text-4xl font-black" style={{ fontFamily: 'Archivo' }}>
                Black
              </p>
            </div>
            <p className="text-xs text-neutral-500 mt-6 font-mono">
              variables css: <br />
              --font-heading
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TypographyShowcase;
