import React from 'react';
import { cn } from '../../../utils/cn';
import './Spinner.css';

const sizes = {
  sm: { width: '16px', height: '16px' },
  md: { width: '32px', height: '32px' },
  lg: { width: '48px', height: '48px' },
};

const colorHex = {
  primary: '#1F67A6',
  secondary: '#20A86D',
  success: '#20A86D',
  warning: '#F4A820',
  error: '#DB2C28',
  neutral: '#6B7280',
};

/**
 * Spinner de carga reutilizable con múltiples variantes de diseño.
 * @param {string} size - Tamaño: sm|md|lg
 * @param {string} variant - Tipo de animación: arc|circle|dots|bars|pulse|gradient
 * @param {string} color - Color: primary|secondary|success|warning|error|neutral
 */
export default function Spinner({
  size = 'md',
  variant = 'arc',
  color = 'primary',
  className = '',
}) {
  const sizeStyle = sizes[size];
  const colorValue = colorHex[color];

  // Estilos base por variante
  const getSpinnerContent = () => {
    switch (variant) {
      // 01: Arc (borde curvo - default)
      case 'arc':
        return (
          <div
            className={cn('animate-spin rounded-full spinner-arc', className)}
            style={{
              ...sizeStyle,
              borderWidth: '2px',
              borderStyle: 'solid',
              borderTopColor: colorValue,
              borderRightColor: colorValue,
              borderBottomColor: 'transparent',
              borderLeftColor: 'transparent',
            }}
            role="status"
            aria-label="Cargando"
          />
        );

      // 02: Circle (círculo completo)
      case 'circle':
        return (
          <div
            className={cn('animate-spin rounded-full spinner-circle', className)}
            style={{
              ...sizeStyle,
              borderWidth: '3px',
              borderStyle: 'solid',
              borderColor: `${colorValue}40`,
              borderTopColor: colorValue,
              borderRightColor: colorValue,
            }}
            role="status"
            aria-label="Cargando"
          />
        );

      // 03: Dots (puntos ondulantes)
      case 'dots':
        const dotSize =
          size === 'sm' ? '6px' : size === 'md' ? '8px' : '12px';
        const dotGap =
          size === 'sm' ? '4px' : size === 'md' ? '6px' : '8px';
        return (
          <div
            className={cn('flex items-center spinner-dots', className)}
            style={{ gap: dotGap }}
            role="status"
            aria-label="Cargando"
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-full"
                style={{
                  width: dotSize,
                  height: dotSize,
                  backgroundColor: colorValue,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        );

      // 04: Bars (barras verticales)
      case 'bars':
        const barWidth =
          size === 'sm' ? '2px' : size === 'md' ? '4px' : '6px';
        const barHeight =
          size === 'sm' ? '16px' : size === 'md' ? '32px' : '48px';
        return (
          <div
            className={cn('flex items-end spinner-bars', className)}
            style={{
              gap: size === 'sm' ? '2px' : size === 'md' ? '4px' : '6px',
              height: barHeight,
            }}
            role="status"
            aria-label="Cargando"
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="spinner-bar"
                style={{
                  width: barWidth,
                  height: `${30 + i * 20}%`,
                  backgroundColor: colorValue,
                  borderRadius: '2px',
                  animation: `wave 0.8s ease-in-out infinite`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        );

      // 05: Pulse (punto pulsante)
      case 'pulse':
        return (
          <div
            className={cn('animate-pulse rounded-full spinner-pulse', className)}
            style={{
              ...sizeStyle,
              backgroundColor: colorValue,
            }}
            role="status"
            aria-label="Cargando"
          />
        );

      // 06: Gradient (arco degradado)
      case 'gradient':
        return (
          <div
            className={cn('animate-spin rounded-full spinner-gradient', className)}
            style={{
              ...sizeStyle,
              borderWidth: '3px',
              borderStyle: 'solid',
              borderColor: 'transparent',
              borderTopColor: colorValue,
              borderRightColor: colorValue,
            }}
            role="status"
            aria-label="Cargando"
          />
        );

      default:
        return (
          <div
            className={cn('animate-spin rounded-full spinner-arc', className)}
            style={{
              ...sizeStyle,
              borderWidth: '2px',
              borderStyle: 'solid',
              borderTopColor: colorValue,
              borderRightColor: colorValue,
              borderBottomColor: 'transparent',
              borderLeftColor: 'transparent',
            }}
            role="status"
            aria-label="Cargando"
          />
        );
    }
  };

  return getSpinnerContent();
}
