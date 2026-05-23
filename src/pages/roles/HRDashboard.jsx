import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const HRDashboard = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lógica para calcular los días hábiles (Lun a Vie) dentro del rango: Hoy ~ 7 días adelante
    const generateWeekDaysRange = () => {
      const daysList = [];
      const daysOfWeekNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      
      for (let i = 0; i < 8; i++) {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + i);
        
        const dayIndex = currentDate.getDay();
        // Criterio de aceptación: Filtrar solo días de la semana (Lunes a Viernes)
        if (dayIndex !== 0 && dayIndex !== 6) {
          const dayName = daysOfWeekNames[dayIndex];
          const dayOfMonth = currentDate.getDate();
          const monthName = currentDate.toLocaleString('es-ES', { month: 'short' }).replace('.', '');
          
          // Valores de ejemplo de citas para pintar las barras de la gráfica funcionalmente
          const mockCitasCount = Math.floor(Math.random() * 25) + 5; 

          daysList.push({
            headerLabel: `${dayName} ${dayOfMonth} ${monthName}`,
            citas: mockCitasCount
          });
        }
      }
      setChartData(daysList);
      setLoading(false);
    };

    generateWeekDaysRange();
  }, []);

  // Buscamos el valor máximo de citas para calcular de manera proporcional la altura de las barras
  const maxCitas = chartData.length > 0 ? Math.max(...chartData.map(d => d.citas)) : 30;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <header className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Panel de Talento Humano</h1>
          <p className="text-sm text-gray-500">Gestión de Personal, Horarios y Control de Demanda</p>
        </div>
        <span className="bg-purple-100 text-purple-800 text-sm font-semibold px-3 py-1 rounded-full">
          Rol: Talento Humano
        </span>
      </header>

      {/* Criterio de Aceptación: Gráfica de Barras (Citas por rango de fechas - Días de la semana) */}
      <section className="bg-white p-6 rounded-xl shadow border border-gray-100">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-700">📊 Ocupación General y Demanda de Citas</h3>
          <p className="text-xs text-gray-400">Rango activo: Día actual ~ 7 días en adelante (Lunes a Viernes)</p>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500 animate-pulse py-8 text-center">Calculando métricas de asistencia...</p>
        ) : (
          <div className="space-y-6">
            <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-6 px-2 border-b border-gray-200 relative">
              <div className="absolute left-0 right-0 top-1/4 border-t border-gray-100 pointer-events-none"></div>
              <div className="absolute left-0 right-0 top-2/4 border-t border-gray-100 pointer-events-none"></div>
              <div className="absolute left-0 right-0 top-3/4 border-t border-gray-100 pointer-events-none"></div>

              {chartData.map((data, index) => {
                const barHeightPercent = (data.citas / maxCitas) * 100;
                return (
                  <div key={index} className="flex flex-col items-center flex-1 group relative z-10">
                    <span className="mb-2 bg-gray-800 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition absolute -top-6 font-semibold">
                      {data.citas} citas
                    </span>
                    <div 
                      style={{ height: `${Math.max(barHeightPercent, 10)}%` }}
                      className="w-full bg-gradient-to-t from-purple-600 to-indigo-500 rounded-t-md hover:from-purple-700 hover:to-indigo-600 transition-all duration-500 flex items-end justify-center pb-2 shadow-sm"
                    >
                      <span className="text-white text-xs font-bold hidden sm:inline">{data.citas}</span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium text-gray-500 mt-2 text-center block rotate-12 sm:rotate-0 whitespace-nowrap">
                      {data.headerLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Navegación Rápida */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Navegación Rápida</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/hr/usuarios" className="p-5 bg-white rounded-lg shadow border hover:border-purple-400 transition flex items-center space-x-4">
            <span className="text-3xl">👥</span>
            <div>
              <span className="block font-bold text-gray-800">Control de Usuarios</span>
              <span className="text-xs text-gray-400">Administrar cuentas, credenciales y perfiles</span>
            </div>
          </Link>
          <Link to="/hr/doctors" className="p-5 bg-white rounded-lg shadow border hover:border-purple-400 transition flex items-center space-x-4">
            <span className="text-3xl">📅</span>
            <div>
              <span className="block font-bold text-gray-800">Horarios Médicos</span>
              <span className="text-xs text-gray-400">Asignar turnos, agendas y agendas de especialistas</span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HRDashboard;