import React, { useMemo, useState } from "react";
import { History, FileText, Plus, CalendarCheck } from "lucide-react";
import { FaTrashAlt } from "react-icons/fa";

import TitleCrud from "../../../components/admin/TitleCrud";
import DataTable from "../../../components/admin/DataTable";
import ConfirmModal from "../../../components/admin/ConfirmModal";
import MovimientoPrestamoForm from "../../../components/admin/MovimientoPrestamoForm";
import PagoRegularModal from "../../../components/admin/PagoRegularModal";
import {
  useMovimientos,
  useCreateMovimiento,
  useUpdateMovimiento,
  useDeleteMovimiento,
} from "./usePrestamo";
import { formatCOP2, TIPO_LABELS, TIPO_OPTIONS } from "./prestamoUtils";
import "../../../styles/admin/prestamo.css";

const PrestamoMovimientos = () => {
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroTramo, setFiltroTramo] = useState("");
  const params = useMemo(() => {
    const p = {};
    if (filtroTipo) p.tipo = filtroTipo;
    if (filtroTramo) p.tramo = filtroTramo;
    return p;
  }, [filtroTipo, filtroTramo]);

  const { data: movimientos = [], isLoading } = useMovimientos(params);
  const createMut = useCreateMovimiento();
  const updateMut = useUpdateMovimiento();
  const deleteMut = useDeleteMovimiento();

  const [showModal, setShowModal] = useState(false);
  const [showPago, setShowPago] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const openCreate = () => { setEditing(null); setSubmitError(null); setShowModal(true); };
  const openEdit = (row) => { setEditing(row); setSubmitError(null); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); setSubmitError(null); };

  const handleSubmit = async (payload, id) => {
    setSubmitError(null);
    try {
      if (id) await updateMut.mutateAsync({ id, payload });
      else await createMut.mutateAsync(payload);
      closeModal();
    } catch (err) {
      const data = err.response?.data;
      setSubmitError(
        data?.message ||
          (data && typeof data === "object"
            ? Object.values(data).flat().join(" ")
            : "No se pudo guardar el movimiento.")
      );
    }
  };

  const handleDelete = (row) => {
    setConfirmDialog({
      title: `¿Eliminar ${TIPO_LABELS[row.tipo] || row.tipo}?`,
      message: `Se borrará el movimiento de ${formatCOP2(row.monto)} del ${row.fecha}. El motor recalculará la proyección.`,
      confirmLabel: "Sí, eliminar",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deleteMut.mutateAsync(row.id);
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const columns = [
    { key: "fecha", label: "Fecha" },
    {
      key: "tipo",
      label: "Tipo",
      render: (r) => (
        <span className={`pr-badge pr-badge--${r.tramo}`}>
          {TIPO_LABELS[r.tipo] || r.tipo}
        </span>
      ),
    },
    { key: "tramo", label: "Tramo", render: (r) => (r.tramo === "amigo" ? "Amigo" : "Dueño") },
    { key: "monto", label: "Monto", render: (r) => formatCOP2(r.monto) },
    { key: "nota", label: "Nota", render: (r) => r.nota || "—" },
    {
      key: "comprobante_url",
      label: "Comprobante",
      render: (r) =>
        r.comprobante_url ? (
          <a href={r.comprobante_url} target="_blank" rel="noreferrer" className="pr-link">
            <FileText size={14} /> Ver
          </a>
        ) : (
          "—"
        ),
    },
    { key: "autor_email", label: "Autor", render: (r) => r.autor_email || "—" },
  ];

  return (
    <section className="pr-page">
      <TitleCrud title="Movimientos" icon={History} description="Historial de cuotas, abonos y comisiones" />

      <div className="pr-toolbar">
        <button className="pr-btn pr-btn--accent" onClick={() => setShowPago(true)}>
          <CalendarCheck size={16} /> Realizar pago regular
        </button>
        <button className="pr-btn pr-btn--primary" onClick={openCreate}>
          <Plus size={16} /> Registrar abono
        </button>
        <select className="pr-select" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
          <option value="">Todos los tipos</option>
          {TIPO_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select className="pr-select" value={filtroTramo} onChange={(e) => setFiltroTramo(e.target.value)}>
          <option value="">Ambos tramos</option>
          <option value="amigo">Amigo</option>
          <option value="dueno">Dueño</option>
        </select>
      </div>

      {isLoading ? (
        <p className="pr-muted">Cargando movimientos…</p>
      ) : (
        <DataTable
          columns={columns}
          data={movimientos}
          rowKey="id"
          onEdit={openEdit}
          customActions={[
            { icon: FaTrashAlt, handler: handleDelete, show: () => true, title: "Eliminar", destructive: true },
          ]}
        />
      )}

      {showModal && (
        <MovimientoPrestamoForm
          onClose={closeModal}
          onSubmit={handleSubmit}
          movimiento={editing}
          isSubmitting={createMut.isPending || updateMut.isPending}
          submitError={submitError}
        />
      )}

      {showPago && <PagoRegularModal onClose={() => setShowPago(false)} />}

      {confirmDialog && (
        <ConfirmModal
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          isDestructive={confirmDialog.isDestructive}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </section>
  );
};

export default PrestamoMovimientos;
