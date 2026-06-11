import React from "react";
import { ShieldCheck } from "lucide-react";

import TitleCrud from "../../../components/admin/TitleCrud";
import DataTable from "../../../components/admin/DataTable";
import { useAuditoria } from "./usePrestamo";
import "../../../styles/admin/prestamo.css";

const ACCION_LABELS = { crear: "Creó", editar: "Editó", borrar: "Borró" };

function resumenCambio(row) {
  const after = row.valores_despues;
  const before = row.valores_antes;
  const ref = after || before || {};
  const partes = [];
  if (ref.tipo) partes.push(ref.tipo);
  if (ref.monto) partes.push(`$${ref.monto}`);
  if (ref.fecha) partes.push(ref.fecha);
  return partes.join(" · ") || "—";
}

const PrestamoAuditoria = () => {
  const { data: auditoria = [], isLoading } = useAuditoria();

  const columns = [
    {
      key: "timestamp",
      label: "Fecha/hora",
      render: (r) => new Date(r.timestamp).toLocaleString("es-CO"),
    },
    { key: "usuario_email", label: "Usuario", render: (r) => r.usuario_email || "—" },
    {
      key: "accion",
      label: "Acción",
      render: (r) => (
        <span className={`pr-badge pr-badge--${r.accion}`}>
          {ACCION_LABELS[r.accion] || r.accion}
        </span>
      ),
    },
    { key: "modelo", label: "Entidad", render: (r) => `${r.modelo}#${r.objeto_id}` },
    { key: "detalle", label: "Detalle", render: resumenCambio },
  ];

  return (
    <section className="pr-page">
      <TitleCrud
        title="Auditoría"
        icon={ShieldCheck}
        description="Bitácora inmutable de todos los cambios (solo lectura)"
      />

      {isLoading ? (
        <p className="pr-muted">Cargando auditoría…</p>
      ) : (
        <DataTable columns={columns} data={auditoria} rowKey="id" showEdit={false} />
      )}
    </section>
  );
};

export default PrestamoAuditoria;
