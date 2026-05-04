import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Alert, Badge, DataTable } from "../../components/ui";
import { PageContainer } from "../../components/layout";
import { http } from "../../services/api/http";
import { endpoints } from "../../services/api/endpoints";
import { AuthContext } from "../../services/auth/AuthContext";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 30];

/**
 * Calcula si una remisión está vigente comparando la fecha de expiración con hoy.
 */
function isReferralVigent(expiracion) {
  if (!expiracion) return false;
  try {
    const expiryDate = new Date(expiracion);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);
    return expiryDate >= today;
  } catch {
    return false;
  }
}

/**
 * Formatea la fecha en formato locale.
 */
function formatFecha(fecha) {
  if (!fecha) return "—";
  try {
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return String(fecha);
    return d.toLocaleDateString("es-CO", { 
      year: "numeric", 
      month: "2-digit", 
      day: "2-digit" 
    });
  } catch {
    return String(fecha);
  }
}

/**
 * Mapea vigencia a badge.
 */
function mapVigenciaToBadge(vigente) {
  return vigente
    ? { variant: "success", label: "Vigente" }
    : { variant: "error", label: "Expirada" };
}

export default function PatientReferrals() {
  const auth = useContext(AuthContext);
  const patientId = auth?.payload?.num_documento;

  const [allReferrals, setAllReferrals] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({});

  /**
   * Carga especialidades para mostrar nombres en lugar de IDs.
   */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await http.get(endpoints.specialties.list);
        if (!cancelled) {
          const specialtiesArray = Array.isArray(data) ? data : [];
          setSpecialties(specialtiesArray);
        }
      } catch (e) {
        console.error("Error cargando especialidades:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Carga remisiones del paciente autenticado.
   */
  const loadReferrals = useCallback(async () => {
    if (!patientId) {
      setError("ID de paciente no disponible");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { data } = await http.get(endpoints.referrals.list, {
        params: { id_paciente: patientId },
      });

      // Maneja respuesta con formato { hasError, message, data: [...] }
      if (data?.hasError) {
        setError(data.message || "Error desconocido al cargar remisiones");
        setAllReferrals([]);
        return;
      }

      const referrals = Array.isArray(data?.data) ? data.data : [];
      
      // Enriquece cada remisión con campo vigente calculado
      const enriched = referrals.map((ref) => ({
        ...ref,
        vigente: isReferralVigent(ref.expiracion),
      }));

      setAllReferrals(enriched);
    } catch (e) {
      console.error("Error cargando remisiones del paciente:", e);
      setAllReferrals([]);
      setError("No fue posible cargar tus remisiones. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadReferrals();
  }, [loadReferrals]);

  /**
   * Obtiene nombre de especialidad por ID.
   */
  const getEspecialidadNombre = useCallback(
    (id_especialidad) => {
      const specialty = specialties.find((s) => s.id_especialidad === id_especialidad);
      return specialty?.nombre_especialidad ?? `ID ${id_especialidad}`;
    },
    [specialties]
  );

  /**
   * Filtra remisiones según los filtros aplicados.
   */
  const filteredReferrals = useMemo(() => {
    return allReferrals.filter((ref) => {
      // Filtro por especialidad
      if (filters.id_especialidad && ref.id_especialidad !== Number(filters.id_especialidad)) {
        return false;
      }
      // Filtro por estado vigente
      if (filters.vigente !== undefined && ref.vigente !== (filters.vigente === "true")) {
        return false;
      }
      return true;
    });
  }, [allReferrals, filters]);

  /**
   * Pagina los resultados filtrados.
   */
  const paginatedReferrals = useMemo(() => {
    const startIdx = (page - 1) * pageSize;
    return filteredReferrals.slice(startIdx, startIdx + pageSize);
  }, [filteredReferrals, page, pageSize]);

  const total = filteredReferrals.length;

  /**
   * Opciones de especialidad para el filtro.
   */
  const specialtyOptions = useMemo(() => {
    const unique = [...new Set(allReferrals.map((r) => r.id_especialidad))];
    return unique
      .map((id) => ({
        value: String(id),
        label: getEspecialidadNombre(id),
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "es"));
  }, [allReferrals, getEspecialidadNombre]);

  /**
   * Configuración de columnas.
   */
  const columns = useMemo(
    () => [
      { key: "id_remision", label: "ID Remisión", filterable: false },
      {
        key: "id_especialidad",
        label: "Especialidad",
        filterable: true,
        filterType: "select",
        filterOptions: specialtyOptions,
        render: (value) => getEspecialidadNombre(value),
      },
      { key: "id_registro", label: "ID Registro", filterable: false },
      {
        key: "expiracion",
        label: "Expiración",
        filterable: false,
        render: (value) => formatFecha(value),
      },
      {
        key: "vigente",
        label: "Estado",
        filterable: true,
        filterType: "select",
        filterOptions: [
          { value: "true", label: "Vigente" },
          { value: "false", label: "Expirada" },
        ],
        render: (value) => {
          const { variant, label } = mapVigenciaToBadge(value);
          return (
            <Badge variant={variant} size="sm">
              {label}
            </Badge>
          );
        },
      },
    ],
    [specialtyOptions, getEspecialidadNombre]
  );

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reinicia a página 1 cuando cambian filtros
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1);
  };

  return (
    <PageContainer>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Mis remisiones</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Revisa tus remisiones a otras especialidades.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <Alert variant="error" title="Error">
            {error}
          </Alert>
        </div>
      )}

      <DataTable
        columns={columns}
        data={paginatedReferrals}
        loading={loading}
        filters={filters}
        onFiltersChange={handleFilterChange}
        onReload={() => {
          setFilters({});
          setPage(1);
          loadReferrals();
        }}
        pagination={{
          page,
          pageSize,
          total,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
        keyExtractor={(row) => row.id_remision}
        emptyMessage={
          loading ? "Cargando..." : "No tienes remisiones para mostrar."
        }
      />
    </PageContainer>
  );
}
