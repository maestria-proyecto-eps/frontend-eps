import React, { useCallback, useMemo, useState } from "react";
import { Alert, Badge, Button, DataTable, Modal } from "../../components/ui";
import { PageContainer } from "../../components/layout";
import { http } from "../../services/api/http";
import { endpoints } from "../../services/api/endpoints";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 30];

function mapTipoLabel(tipo) {
  if (Number(tipo) === 1) return "Medicamentos";
  if (Number(tipo) === 2) return "Procedimiento";
  if (Number(tipo) === 3) return "Mixta";
  return `Tipo ${tipo ?? "—"}`;
}

function normalizeResponse(payload) {
  const wrapper = payload?.data ?? {};
  const rows = Array.isArray(wrapper?.data) ? wrapper.data : [];
  const page = Number(wrapper?.page) || 1;
  const pages = Number(wrapper?.pages) || 1;
  return { rows, page, pages };
}

export default function Prescriptions() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [backendPages, setBackendPages] = useState(1);
  const [selected, setSelected] = useState(null);

  const loadPrescriptions = useCallback(async (targetPage = page, targetPageSize = pageSize) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await http.get(endpoints.medicalRecords.getDoctorPrescriptions, {
        params: { pag: targetPage, cantidad: targetPageSize },
      });
      const normalized = normalizeResponse(data);
      setRows(normalized.rows);
      setBackendPages(normalized.pages);
      setPage(normalized.page);
    } catch (e) {
      console.error("Error cargando prescripciones del doctor:", e);
      setRows([]);
      setBackendPages(1);
      setError("No fue posible cargar las prescripciones. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  React.useEffect(() => {
    loadPrescriptions(1, pageSize);
  }, [loadPrescriptions, pageSize]);

  const total = useMemo(() => backendPages * pageSize, [backendPages, pageSize]);

  const columns = useMemo(
    () => [
      { key: "id_preinscripcion", label: "ID Prescripción", filterable: false },
      { key: "id_atencion", label: "ID Atención", filterable: false },
      {
        key: "tipo",
        label: "Tipo",
        filterable: false,
        render: (value) => (
          <Badge variant="neutral" size="sm">
            {mapTipoLabel(value)}
          </Badge>
        ),
      },
      {
        key: "prescripciones_items",
        label: "Ítems",
        filterable: false,
        render: (value) => (Array.isArray(value) ? value.length : 0),
      },
    ],
    []
  );

  return (
    <PageContainer>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Prescripciones</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Consulta las prescripciones creadas por el doctor autenticado.
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="error" title="Error" fixed>
          {error}
        </Alert>
      )}

      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        onReload={() => loadPrescriptions(page, pageSize)}
        pagination={{
          page,
          pageSize,
          total,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          onPageChange: (newPage) => loadPrescriptions(newPage, pageSize),
          onPageSizeChange: (newSize) => {
            setPageSize(newSize);
            loadPrescriptions(1, newSize);
          },
        }}
        keyExtractor={(row) => row.id_preinscripcion}
        renderRowActions={(row) => (
          <Button variant="ghost" size="sm" onClick={() => setSelected(row)}>
            Ver detalle
          </Button>
        )}
        emptyMessage={loading ? "Cargando..." : "No hay prescripciones para mostrar."}
      />

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`Detalle prescripción #${selected?.id_preinscripcion ?? ""}`}
        size="lg"
        footer={
          <Button variant="outline" onClick={() => setSelected(null)}>
            Cerrar
          </Button>
        }
      >
        {!selected ? null : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-neutral-200 p-3">
                <p className="text-xs uppercase text-neutral-500">ID atención</p>
                <p className="mt-1 text-sm font-semibold text-neutral-800">{selected.id_atencion ?? "—"}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 p-3">
                <p className="text-xs uppercase text-neutral-500">Tipo</p>
                <p className="mt-1 text-sm font-semibold text-neutral-800">{mapTipoLabel(selected.tipo)}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 p-3">
                <p className="text-xs uppercase text-neutral-500">Total ítems</p>
                <p className="mt-1 text-sm font-semibold text-neutral-800">
                  {Array.isArray(selected.prescripciones_items) ? selected.prescripciones_items.length : 0}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-neutral-200">
              <table className="w-full min-w-[640px] border-collapse">
                <thead>
                  <tr className="bg-neutral-50">
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-neutral-600">Medicamento</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-neutral-600">Dosis</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-neutral-600">Cantidad</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-neutral-600">Duración</th>
                  </tr>
                </thead>
                <tbody>
                  {(selected.prescripciones_items ?? []).map((it) => (
                    <tr key={it.id_items} className="border-t border-neutral-100">
                      <td className="px-3 py-2 text-sm text-neutral-800">#{it.id_medicamento ?? "—"}</td>
                      <td className="px-3 py-2 text-sm text-neutral-800">{it.dosis ?? "—"}</td>
                      <td className="px-3 py-2 text-sm text-neutral-800">{it.cantidad ?? "—"}</td>
                      <td className="px-3 py-2 text-sm text-neutral-800">{it.duracion ?? "—"}</td>
                    </tr>
                  ))}
                  {(selected.prescripciones_items ?? []).length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-sm text-neutral-500">
                        Esta prescripción no tiene ítems.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
