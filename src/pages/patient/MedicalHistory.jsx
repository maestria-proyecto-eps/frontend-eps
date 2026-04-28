import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout';
import { Spinner, Alert } from '../../components/ui';
import { AuthContext } from '../../services/auth/AuthContext';
import { http } from '../../services/api/http';
import { endpoints } from '../../services/api/endpoints';
import ConsultationTimeline from '../../components/sections/ConsultationTimeline';
import ConsultationFilters from '../../components/sections/ConsultationFilters';
import './MedicalHistory.css';

export default function MedicalHistory() {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const patientId = auth?.payload?.num_documento;

  const [consultations, setConsultations] = useState([]);
  const [filteredConsultations, setFilteredConsultations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    dateFrom: null,
    dateTo: null,
    doctorId: null,
  });

  // Cargar historial clínico
  useEffect(() => {
    let cancelled = false;

    const fetchMedicalHistory = async () => {
      if (!patientId) {
        setError('ID de paciente no disponible');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        // Obtener historial clínico, citas y lista de doctores en paralelo
        let historyResponse = { data: { data: [] } };
        let appointmentsResponse = { data: [] };
        let doctorsResponse = { data: [] };
        
        try {
          historyResponse = await http.get(endpoints.medicalRecords.getPatientHistory(patientId));
        } catch (err) {
          if (err.response?.status === 401) {
            throw err;
          }
        }
        
        try {
          appointmentsResponse = await http.get(`${endpoints.appointments.list}?id_paciente=${patientId}`);
        } catch (err) {
          // Error getting appointments, continue with empty data
        }
        
        try {
          doctorsResponse = await http.get(endpoints.doctors.list);
        } catch (err) {
          // Error getting doctors, continue with empty data
        }
        
        // Extraer datos de la respuesta
        const responseData = historyResponse.data || { data: [] };
        const historias = responseData.data || [];
        const appointments = appointmentsResponse.data || [];
        const doctorsList = doctorsResponse.data || [];

        if (!cancelled) {
          // Crear mapa de doctores por id_doctor
          const doctorsMap = new Map();
          
          if (Array.isArray(doctorsList)) {
            doctorsList.forEach((doctor, index) => {
              // Usar id_medico como ID principal
              const doctorId = doctor.id_doctor || doctor.id_medico || doctor.id || doctor.num_licencia || doctor.identificacion || doctor.numero_documento;
              
              // Construir nombre: nombres + apellidos (campos reales del endpoint)
              // Validar que nombres y apellidos sean strings válidos
              const nombres = typeof doctor.nombres === 'string' && doctor.nombres.trim() && doctor.nombres !== 'string' ? doctor.nombres.trim() : '';
              const apellidos = typeof doctor.apellidos === 'string' && doctor.apellidos.trim() && doctor.apellidos !== 'string' ? doctor.apellidos.trim() : '';
              const fullName = `${nombres} ${apellidos}`.trim();
              
              const nombreDoctor = doctor.nombre_doctor || doctor.nombre_medico || doctor.nombre || doctor.nombre_usuario || 
                                   (fullName || `Doctor ${doctorId}`);
              
              if (doctorId) {
                doctorsMap.set(doctorId, {
                  id_doctor: doctorId,
                  nombre_doctor: nombreDoctor,
                  especialidad: doctor.especialidad || doctor.id_especialidad || doctor.especialidadId || '',
                });
              }
            });
          }

          // Crear mapa de citas para búsqueda rápida
          const appointmentMap = new Map();
          if (Array.isArray(appointments)) {
            appointments.forEach((apt) => {
              // Intentar múltiples claves posibles para el ID de la cita
              const citaId = apt.id_cita || apt.id || apt.id_appointment;
              if (citaId) {
                appointmentMap.set(citaId, {
                  ...apt,
                  fecha: apt.fecha || new Date().toISOString().split('T')[0],
                  hora_inicio: apt.hora_inicio || apt.horaInicio || '',
                  id_doctor: apt.id_doctor || apt.idDoctor || null,
                });
              }
            });
          }

          // Transformar registros de historia clínica a formato de consultas
          const consultationList = [];
          
          if (Array.isArray(historias) && historias.length > 0) {
            const historia = historias[0]; // Tomar primera historia clínica
            const registros = historia.registros_historia || [];
            
            // Enriquecer cada registro con información de cita y doctor
            registros.forEach((registro) => {
              const cita = appointmentMap.get(registro.id_cita) || {};
              const doctorId = cita.id_doctor;
              const doctor = doctorsMap.get(doctorId) || { 
                id_doctor: doctorId, 
                nombre_doctor: 'Doctor desconocido' 
              };
              
              consultationList.push({
                id_consulta: registro.id_registro,
                id_cita: registro.id_cita,
                fecha_consulta: cita.fecha || new Date().toISOString().split('T')[0],
                hora_inicio: cita.hora_inicio || '',
                nombre_doctor: doctor.nombre_doctor,
                id_doctor: doctor.id_doctor || doctorId,
                motivo_consulta: registro.nombre_enfermedad || 'Sin diagnóstico',
                diagnostico: registro.nombre_enfermedad || 'Sin diagnóstico',
                notas: `Observaciones: ${registro.observaciones}\nTratamiento: ${registro.tratamiento}`,
                observaciones: registro.observaciones || '',
                tratamiento: registro.tratamiento || '',
                id_diagnostico: registro.id_diagnostico,
                prescripciones: [], // Por ahora sin prescripciones
              });
            });
          }

          // Ordenar por fecha descendente (más reciente primero)
          const sorted = [...consultationList].sort((a, b) => {
            const dateA = new Date(a.fecha_consulta || 0);
            const dateB = new Date(b.fecha_consulta || 0);
            return dateB - dateA;
          });

          setConsultations(sorted);
          setFilteredConsultations(sorted);

          // Extraer doctores únicos (directamente de la lista mapeada)
          const uniqueDoctorsList = Array.from(doctorsMap.values())
            .filter((d) => d.nombre_doctor !== 'Doctor desconocido' && 
                          d.nombre_doctor && 
                          d.nombre_doctor.trim() !== '' &&
                          d.nombre_doctor !== 'string string' &&
                          d.nombre_doctor !== 'undefined undefined')
            .sort((a, b) =>
              String(a.nombre_doctor).localeCompare(String(b.nombre_doctor), 'es')
            );

          setDoctors(uniqueDoctorsList);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.status === 401
              ? 'Sesión expirada. Por favor inicia sesión nuevamente.'
              : 'Error al cargar el historial clínico. Intenta más tarde.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchMedicalHistory();

    return () => {
      cancelled = true;
    };
  }, [patientId]);

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...consultations];

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter((c) => {
        const consultDate = new Date(c.fecha_consulta || c.fecha || 0);
        consultDate.setHours(0, 0, 0, 0);
        return !isNaN(consultDate.getTime()) && consultDate >= fromDate;
      });
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((c) => {
        const consultDate = new Date(c.fecha_consulta || c.fecha || 0);
        return !isNaN(consultDate.getTime()) && consultDate <= toDate;
      });
    }

    if (filters.doctorId) {
      const selectedDoctorId = typeof filters.doctorId === 'string' 
        ? parseInt(filters.doctorId, 10) 
        : filters.doctorId;
      
      filtered = filtered.filter((c) => {
        const consultDoctorId = typeof c.id_doctor === 'string' 
          ? parseInt(c.id_doctor, 10) 
          : c.id_doctor;
        return consultDoctorId === selectedDoctorId;
      });
    }

    setFilteredConsultations(filtered);
  }, [consultations, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      dateFrom: null,
      dateTo: null,
      doctorId: null,
    });
  };

  if (loading) {
    return (
      <PageContainer className="medical-history-page">
        <div className="flex justify-center items-center min-h-screen">
          <Spinner />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer className="medical-history-page">
        <div className="mb-6">
          <Alert variant="danger" title="Error">
            {error}
          </Alert>
        </div>
        {error.includes('Sesión expirada') && (
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:opacity-90"
          >
            Ir a Login
          </button>
        )}
      </PageContainer>
    );
  }

  return (
    <PageContainer className="medical-history-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Historia Clínica</h1>
        <p className="text-gray-600">
          Consulta tu historial de atenciones médicas, diagnósticos y prescripciones.
        </p>
      </div>

      {/* Filtros */}
      <ConsultationFilters
        doctors={doctors}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Timeline */}
      <ConsultationTimeline consultations={filteredConsultations} />
    </PageContainer>
  );
}
