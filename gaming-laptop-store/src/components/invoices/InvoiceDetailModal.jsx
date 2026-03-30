import React from "react";
import { FileText, Download } from "lucide-react";
import ModalBase from "../admin/ModalBase";
import { downloadInvoice } from "../../services/InvoiceService";
import "../../styles/admin/invoiceForm.css";

const CONCEPTO_DISPLAY = {
  venta: "Venta",
  separacion: "Separación",
};
const ITEM_DISPLAY = {
  laptop: "Laptop",
  tarjeta_grafica: "Tarjeta Gráfica",
  hardware: "Hardware",
  pc_mesa: "PC de Mesa",
};
const PAYMENT_DISPLAY = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  transferencia: "Transferencia",
  otro: "Otro",
};

function formatCurrency(amount) {
  try {
    const n = Number(amount);
    return `COP $${n.toLocaleString("es-CO")}`;
  } catch {
    return String(amount);
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

const Row = ({ label, value }) => (
  <div className="inv-detail-row">
    <span className="inv-detail-label">{label}</span>
    <span className="inv-detail-value">{value || "-"}</span>
  </div>
);

const InvoiceDetailModal = ({ invoice, onClose }) => {
  const handleDownload = async () => {
    try {
      await downloadInvoice(invoice.id, invoice.bill_id);
    } catch (err) {
      alert("Error al descargar la factura. Intenta nuevamente.");
    }
  };

  return (
    <ModalBase
      title="Detalle de Factura"
      icon={<FileText size={24} />}
      badge={invoice.bill_id}
      subtitle="Información completa de la factura"
      onClose={onClose}
    >
      <div className="inv-detail">
        <div className="inv-section">
          <h3 className="inv-section-title">Datos del Cliente</h3>
          <Row label="Nombre" value={invoice.cliente_nombre} />
          <Row label="Cédula" value={invoice.cliente_cedula} />
        </div>

        <div className="inv-section">
          <h3 className="inv-section-title">Datos de la Venta</h3>
          <Row label="Concepto" value={CONCEPTO_DISPLAY[invoice.concepto] || invoice.concepto} />
          <Row label="Producto" value={ITEM_DISPLAY[invoice.item] || invoice.item} />
          <Row label="Serial" value={invoice.serial_item} />
          <Row label="Total" value={formatCurrency(invoice.total_amount)} />
          <Row label="Método de pago" value={PAYMENT_DISPLAY[invoice.payment_method] || invoice.payment_method} />
          <Row label="Fecha de emisión" value={formatDate(invoice.due_date)} />
        </div>

        <div className="inv-section">
          <h3 className="inv-section-title">Metadatos</h3>
          <Row label="Bill ID" value={invoice.bill_id} />
          {invoice.venta && <Row label="Venta vinculada" value={`#${invoice.venta}`} />}
          {invoice.separacion && <Row label="Separación vinculada" value={`#${invoice.separacion}`} />}
          <Row
            label="Correo enviado"
            value={
              invoice.email_sent ? (
                <span style={{ color: "#16a34a" }}>✓ Enviado</span>
              ) : (
                <span style={{ color: "#dc2626" }}>✗ No enviado</span>
              )
            }
          />
          <Row
            label="Creada"
            value={
              invoice.created_at
                ? new Date(invoice.created_at).toLocaleString("es-CO")
                : "-"
            }
          />
        </div>

        {invoice.file_path && (
          <div className="inv-download-section">
            <button
              type="button"
              className="inv-download-btn"
              onClick={handleDownload}
            >
              <Download size={16} />
              Descargar Factura (.docx)
            </button>
          </div>
        )}
      </div>
    </ModalBase>
  );
};

export default InvoiceDetailModal;
