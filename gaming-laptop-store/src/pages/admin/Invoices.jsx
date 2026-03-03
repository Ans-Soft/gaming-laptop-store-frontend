import React, { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { FaRegEye, FaDownload, FaEnvelope, FaRegTrashAlt } from "react-icons/fa";
import DashboardHeader from "../../components/admin/DashboardHeader";
import TitleCrud from "../../components/admin/TitleCrud";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import DataTable from "../../components/admin/DataTable";
import InvoiceFormModal from "../../components/invoices/InvoiceFormModal";
import InvoiceDetailModal from "../../components/invoices/InvoiceDetailModal";
import {
  getInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  downloadInvoice,
  resendInvoiceEmail,
} from "../../services/InvoiceService";
import "../../styles/admin/dataTable.css";
import "../../styles/global.css";

const CONCEPTO_DISPLAY = { venta: "Venta", separacion: "Separación" };
const ITEM_DISPLAY = {
  laptop: "Laptop",
  tarjeta_grafica: "Tarjeta Gráfica",
  hardware: "Hardware",
  pc_mesa: "PC de Mesa",
};

function formatCurrency(amount) {
  try {
    return `COP $${Number(amount).toLocaleString("es-CO")}`;
  } catch {
    return String(amount);
  }
}

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [warnMsg, setWarnMsg] = useState("");

  const [viewingInvoice, setViewingInvoice] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    if (!q) {
      setFiltered(invoices);
    } else {
      setFiltered(
        invoices.filter(
          (inv) =>
            inv.bill_id?.toLowerCase().includes(q) ||
            inv.client_name?.toLowerCase().includes(q) ||
            (CONCEPTO_DISPLAY[inv.concepto] || "").toLowerCase().includes(q)
        )
      );
    }
  }, [search, invoices]);

  const fetchInvoices = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getInvoices();
      const list = data.invoices || data;
      setInvoices(list);
      setFiltered(list);
    } catch (err) {
      setError("Error al cargar las facturas. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingInvoice(null);
    setShowForm(true);
  };

  const handleOpenEdit = (invoice) => {
    setEditingInvoice(invoice);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setEditingInvoice(null);
    setShowForm(false);
  };

  const handleSubmit = async (data, id) => {
    setIsSubmitting(true);
    setSuccessMsg("");
    setWarnMsg("");
    try {
      if (id) {
        await updateInvoice(id, data);
        setSuccessMsg("Factura actualizada exitosamente.");
      } else {
        const result = await createInvoice(data);
        const invoice = result.invoice || result;
        if (invoice.email_sent === false) {
          setWarnMsg(
            "Factura creada, pero el correo no pudo enviarse. Puedes reenviarlo desde la tabla."
          );
        } else {
          setSuccessMsg(
            `Factura generada y enviada al correo del cliente (${data.client_email}).`
          );
        }
      }
      handleCloseForm();
      fetchInvoices();
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.bill_id?.[0] ||
        "Error al guardar la factura. Verifica los datos.";
      setWarnMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (invoice) => {
    if (
      !window.confirm(
        `¿Eliminar la factura ${invoice.bill_id}? Esta acción no se puede deshacer.`
      )
    )
      return;
    try {
      await deleteInvoice(invoice.id);
      fetchInvoices();
    } catch {
      alert("Error al eliminar la factura.");
    }
  };

  const handleDownload = async (invoice) => {
    try {
      await downloadInvoice(invoice.id, invoice.bill_id);
    } catch {
      alert("Error al descargar la factura.");
    }
  };

  const handleResendEmail = async (invoice) => {
    if (
      !window.confirm(
        `¿Reenviar la factura a ${invoice.client_email}?`
      )
    )
      return;
    try {
      await resendInvoiceEmail(invoice.id);
      setSuccessMsg("Correo reenviado exitosamente.");
      fetchInvoices();
    } catch {
      setWarnMsg("No se pudo reenviar el correo.");
    }
  };

  const columns = [
    { key: "bill_id", label: "Bill ID" },
    { key: "client_name", label: "Cliente" },
    {
      key: "concepto",
      label: "Concepto",
      render: (row) => CONCEPTO_DISPLAY[row.concepto] || row.concepto,
    },
    {
      key: "item",
      label: "Producto",
      render: (row) => ITEM_DISPLAY[row.item] || row.item,
    },
    { key: "serial_item", label: "Serial" },
    {
      key: "total_amount",
      label: "Total",
      render: (row) => formatCurrency(row.total_amount),
    },
    { key: "due_date", label: "Fecha emisión" },
    {
      key: "email_sent",
      label: "Email",
      render: (row) =>
        row.email_sent ? (
          <span className="status-active">Enviado</span>
        ) : (
          <span className="status-inactive">No enviado</span>
        ),
    },
  ];

  const stats = [
    {
      label: "Total Facturas",
      count: invoices.length,
      icon: <FileText className="icon-card" />,
    },
    {
      label: "Ventas",
      count: invoices.filter((i) => i.concepto === "venta").length,
      icon: <FileText className="icon-card" />,
    },
    {
      label: "Separaciones",
      count: invoices.filter((i) => i.concepto === "separacion").length,
      icon: <FileText className="icon-card" />,
    },
  ];

  return (
    <section>
      <DashboardHeader />
      <div className="table-container">
        <TitleCrud
          title="Gestión de Facturas"
          icon={FileText}
          description="Genera y administra facturas de ventas y separaciones"
        />

        <SearchBox
          onRegisterClick={handleOpenCreate}
          registerLabel="Nueva Factura"
        />

        <div className="inv-search-bar">
          <input
            type="text"
            placeholder="Buscar por Bill ID, cliente o concepto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="inv-search-input"
          />
        </div>

        <CountCard stats={stats} />

        {successMsg && (
          <div className="inv-alert inv-alert--success">{successMsg}</div>
        )}
        {warnMsg && (
          <div className="inv-alert inv-alert--warn">{warnMsg}</div>
        )}

        {loading ? (
          <p style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
            Cargando facturas...
          </p>
        ) : error ? (
          <p style={{ textAlign: "center", padding: "2rem", color: "#dc2626" }}>
            {error}
          </p>
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            rowKey="id"
            onEdit={handleOpenEdit}
            showView={true}
            onView={(row) => setViewingInvoice(row)}
            customActions={[
              {
                icon: FaDownload,
                handler: handleDownload,
                show: (row) => Boolean(row.file_path),
                title: "Descargar .docx",
              },
              {
                icon: FaEnvelope,
                handler: handleResendEmail,
                show: () => true,
                title: "Reenviar correo",
              },
              {
                icon: FaRegTrashAlt,
                handler: handleDelete,
                show: () => true,
                title: "Eliminar",
              },
            ]}
          />
        )}

        {showForm && (
          <InvoiceFormModal
            onClose={handleCloseForm}
            onSubmit={handleSubmit}
            invoice={editingInvoice}
            isSubmitting={isSubmitting}
          />
        )}

        {viewingInvoice && (
          <InvoiceDetailModal
            invoice={viewingInvoice}
            onClose={() => setViewingInvoice(null)}
          />
        )}
      </div>
    </section>
  );
};

export default Invoices;
