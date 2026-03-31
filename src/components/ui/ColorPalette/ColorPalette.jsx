import React from 'react';

/**
 * Componente ColorPalette
 * Muestra la paleta de colores del sistema de diseño con sus variaciones de opacidad.
 * 
 * Props:
 * - colors: array de objetos con { name, hex, label?, description? }
 * - showOpacity: mostrar variaciones 75%, 50%, 25% (default: true)
 */
export default function ColorPalette({ 
  colors = [], 
  showOpacity = true,
  className = '' 
}) {
  // Función para convertir HEX a RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '0, 0, 0';
  };

  // Función para generar color con opacidad
  const getColorWithOpacity = (hex, opacity) => {
    const rgb = hexToRgb(hex);
    return `rgba(${rgb}, ${opacity / 100})`;
  };

  return (
    <div id="color-palette" data-testid="color-palette-component" className={className}>
      {colors.map((colorGroup) => (
        <div 
          key={colorGroup.name}
          id={`color-group-${colorGroup.name.toLowerCase().replace(/\s+/g, '-')}`}
          data-testid={`color-group-${colorGroup.name}`}
          className="mb-12"
        >
          <div className="mb-4">
            <h3 
              id={`color-title-${colorGroup.name}`}
              data-testid={`color-title-${colorGroup.name}`}
              className="text-lg font-semibold text-neutral-800"
            >
              {colorGroup.label || colorGroup.name}
            </h3>
            {colorGroup.description && (
              <p 
                className="text-sm text-neutral-500"
              >
                {colorGroup.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {/* Color base */}
            <div 
              id={`color-swatch-${colorGroup.name}-base`}
              data-testid={`color-swatch-${colorGroup.name}-base`}
              className="flex flex-col"
            >
              <div
                className="w-full h-24 rounded-lg shadow-md border-2 border-neutral-200 mb-2 transition-transform hover:scale-105"
                style={{ backgroundColor: colorGroup.hex }}
              />
              <p 
                id={`color-label-${colorGroup.name}-base`}
                className="text-xs font-medium text-neutral-700 mb-1"
              >
                Base
              </p>
              <p 
                id={`color-hex-${colorGroup.name}-base`}
                data-testid={`color-hex-${colorGroup.name}`}
                className="text-xs text-neutral-500 font-mono"
              >
                {colorGroup.hex}
              </p>
            </div>

            {/* Variaciones de opacidad */}
            {showOpacity && (
              <>
                {/* 75% opacity */}
                <div 
                  id={`color-swatch-${colorGroup.name}-75`}
                  data-testid={`color-swatch-${colorGroup.name}-75`}
                  className="flex flex-col"
                >
                  <div
                    className="w-full h-24 rounded-lg shadow-md border-2 border-neutral-200 mb-2 transition-transform hover:scale-105"
                    style={{ backgroundColor: getColorWithOpacity(colorGroup.hex, 75) }}
                  />
                  <p className="text-xs font-medium text-neutral-700 mb-1">75%</p>
                  <p 
                    id={`color-opacity-${colorGroup.name}-75`}
                    className="text-xs text-neutral-500 font-mono"
                  >
                    rgba
                  </p>
                </div>

                {/* 50% opacity */}
                <div 
                  id={`color-swatch-${colorGroup.name}-50`}
                  data-testid={`color-swatch-${colorGroup.name}-50`}
                  className="flex flex-col"
                >
                  <div
                    className="w-full h-24 rounded-lg shadow-md border-2 border-neutral-200 mb-2 transition-transform hover:scale-105"
                    style={{ backgroundColor: getColorWithOpacity(colorGroup.hex, 50) }}
                  />
                  <p className="text-xs font-medium text-neutral-700 mb-1">50%</p>
                  <p 
                    id={`color-opacity-${colorGroup.name}-50`}
                    className="text-xs text-neutral-500 font-mono"
                  >
                    rgba
                  </p>
                </div>

                {/* 25% opacity */}
                <div 
                  id={`color-swatch-${colorGroup.name}-25`}
                  data-testid={`color-swatch-${colorGroup.name}-25`}
                  className="flex flex-col"
                >
                  <div
                    className="w-full h-24 rounded-lg shadow-md border-2 border-neutral-200 mb-2 transition-transform hover:scale-105"
                    style={{ backgroundColor: getColorWithOpacity(colorGroup.hex, 25) }}
                  />
                  <p className="text-xs font-medium text-neutral-700 mb-1">25%</p>
                  <p 
                    id={`color-opacity-${colorGroup.name}-25`}
                    className="text-xs text-neutral-500 font-mono"
                  >
                    rgba
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
