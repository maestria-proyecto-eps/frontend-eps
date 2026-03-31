import React from 'react';

/**
 * ColorPaletteTable - Componente para mostrar la paleta de colores en formato tabla
 * con el color completo y sus variaciones de opacidad (75%, 50%, 25%, 0%)
 * 
 * Props:
 * - colors: Array de objetos { name, hex, label, description }
 * - className: Clases CSS adicionales
 */
export function ColorPaletteTable({ colors = [], className = '', ...props }) {
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
    };

    const getColorWithOpacity = (hex, opacity) => {
        const rgb = hexToRgb(hex);
        return `rgba(${rgb}, ${opacity / 100})`;
    };

    return (
        <div
            className={`w-full overflow-x-auto ${className}`}
            id="color-palette-table"
            data-testid="color-palette-table"
            {...props}
        >
            {/* Tabla visual con colores */}
            <div className="border-b border-l border-r border-neutral-300 overflow-hidden">

                {/* Filas de colores */}
                {colors.map((color, index) => {
                    const isLightBg = color.hex === '#F2F2F2' || color.hex === '#FFFFFF';
                    const labelColor = isLightBg ? 'text-neutral-800' : 'text-white';

                    return (
                        <div
                            key={`${color.id || index}`}
                            id={`color-row-${color.id || index}`}
                            data-testid={`color-row-${color.id || index}`}
                            className="grid grid-cols-6 gap-0 border-b border-neutral-300 last:border-b-0"
                        >
                            {/* 100% (color completo) */}
                            <div
                                className="p-4 flex items-center justify-center min-h-[120px]"
                                style={{ backgroundColor: color.hex }}
                                id={`color-100-${color.id || index}`}
                                data-testid={`color-100-${color.id || index}`}
                            ></div>
                            {/* Nombre y HEX */}
                            <div
                                className="p-4 flex flex-col justify-end items-end min-h-[120px] text-sm"
                                style={{ backgroundColor: color.hex }}
                                id={`color-label-${color.id || index}`}
                                data-testid={`color-label-${color.id || index}`}
                            >
                                <p className={`font-bold text-lg ${labelColor} text-right`}>{color.name}</p>
                                <p className={`font-mono text-xs ${labelColor} text-right`}>HEX. {color.hex}</p>
                            </div>



                            {/* 75% */}
                            <div
                                className="p-4 flex items-end justify-end min-h-[120px] font-semibold text-neutral-700"
                                style={{ backgroundColor: getColorWithOpacity(color.hex, 75) }}
                                id={`color-75-${color.id || index}`}
                                data-testid={`color-75-${color.id || index}`}
                            >
                                75%
                            </div>

                            {/* 50% */}
                            <div
                                className="p-4 flex items-end justify-end min-h-[120px] font-semibold text-neutral-700"
                                style={{ backgroundColor: getColorWithOpacity(color.hex, 50) }}
                                id={`color-50-${color.id || index}`}
                                data-testid={`color-50-${color.id || index}`}
                            >
                                50%
                            </div>

                            {/* 25% */}
                            <div
                                className="p-4 flex items-end justify-end min-h-[120px] font-semibold text-neutral-700"
                                style={{ backgroundColor: getColorWithOpacity(color.hex, 25) }}
                                id={`color-25-${color.id || index}`}
                                data-testid={`color-25-${color.id || index}`}
                            >
                                25%
                            </div>

                            {/* 0% (blanco/transparente) */}
                            <div
                                className="p-4 flex items-end justify-end min-h-[120px] font-semibold text-neutral-700 bg-white border-l border-neutral-200"
                                id={`color-0-${color.id || index}`}
                                data-testid={`color-0-${color.id || index}`}
                            >
                                {color.hex !== '#F2F2F2' && color.hex !== '#FFFFFF' ? '0%' : '0%'}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ColorPaletteTable;
