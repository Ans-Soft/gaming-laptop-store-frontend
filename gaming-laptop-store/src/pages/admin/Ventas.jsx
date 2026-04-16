import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./../../styles/admin/dataTable.css";
import "./../../styles/global.css";
import { ShoppingCart, CheckCircle, Ban, DollarSign, Edit, Eye, Trash2, Mail } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import TitleCrud from "../../components/admin/TitleCrud";
import VentaForm from "../../components/admin/VentaForm";
import ConfirmModal from "../../components/admin/ConfirmModal";
import GenerarReciboVentaModal from "../../components/admin/GenerarReciboVentaModal";
import NotifyModal from "../../components/admin/NotifyModal";
import * as VentaService from "../../services/VentaService";
import * as InvoiceService from "../../services/InvoiceService";
import "../../styles/admin/ventasPage.css";

const Ventas = () => {
  const navigate = useNavigate();
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [generarReciboTarget, setGenerarReciboTarget] = useState(null);
  const [notify, setNotify] = useState(null);

  useEffect(() => {
    loadVentas();
  }, []);

  const loadVentas = async () => {
    setLoading(true);
    try {
      const data = await VentaService.getVentas();
      setVentas(Array.isArray(data) ? data : data.ventas || []);
    } catch (error) {
      console.error("Error al cargar ventas:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVentas = ventas.filter((v) => {
    if (!searchTerm.trim()) return true;
    return (v.cliente_nombre || "").toLowerCase().includes(searchTerm.trim().toLowerCase());
  });

  const handleCreateNew = () => {
    setSelectedVenta(null);
    setShowModal(true);
  };

  const handleEdit = (venta) => {
    setSelectedVenta(venta);
    setShowModal(true);
  };

  const handleView = (venta) => {
    navigate(`/admin/ventas/${venta.id}`);
  };

  const handleDelete = (venta) => {
    setConfirmDialog({
      title: `¿Eliminar venta #${venta.id}?`,
      message: `Se eliminará permanentemente la venta de ${venta.cliente_nombre}. Las unidades vendidas volverán a estar disponibles.`,
      confirmLabel: "Sí, eliminar",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await VentaService.deleteVenta(venta.id);
          loadVentas();
        } catch (error) {
          console.error("Error al eliminar venta:", error);
          setNotify({
            variant: "error",
            title: "Error al eliminar",
            message: "No se pudo eliminar la venta. Intenta nuevamente.",
          });
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const resendExistingRecibo = async (invoice) => {
    try {
      await InvoiceService.resendInvoiceEmail(invoice.id);
      setNotify({
        variant: "success",
        title: "Recibo reenviado",
        message: "El recibo existente fue reenviado por correo al cliente exitosamente.",
      });
    } catch (error) {
      console.error("Error al reenviar recibo:", error);
      const data = error.response?.data;
      const msg = data?.error || data?.detail || "No se pudo reenviar el recibo por correo. Verifica tu conexión e intenta nuevamente.";
      setNotify({
        variant: "error",
        title: "Error al reenviar",
        message: typeof msg === "object" ? JSON.stringify(msg) : msg,
      });
    }
  };

  const handleEnviarRecibo = async (venta) => {
    try {
      const data = await InvoiceService.getInvoices();
      const invoices = Array.isArray(data) ? data : data.invoices || [];
      const existing = invoices.find((inv) => inv.venta === venta.id && inv.active !== false);

      if (existing) {
        setConfirmDialog({
          title: "Reenviar recibo existente",
          message: `Ya existe el recibo ${existing.bill_id} para esta venta. ¿Deseas reenviarlo por correo al cliente?`,
          confirmLabel: "Sí, reenviar",
          isDestructive: false,
          onConfirm: async () => {
            setConfirmDialog(null);
            await resendExistingRecibo(existing);
          },
        });
        return;
      }

      setGenerarReciboTarget(venta);
    } catch (error) {
      console.error("Error al enviar recibo:", error);
      const data = error.response?.data;
      const msg = data?.error || data?.detail || "No se pudo consultar los recibos existentes";
      setNotify({
        variant: "error",
        title: "Error al enviar recibo",
        message: typeof msg === "object" ? JSON.stringify(msg) : msg,
      });
    }
  };

  const handleGenerarReciboSubmit = async (invoiceData) => {
    try {
      await InvoiceService.createInvoice(invoiceData);
      setGenerarReciboTarget(null);
      setNotify({
        variant: "success",
        title: "Recibo enviado",
        message: "El recibo fue generado y enviado por correo al cliente exitosamente.",
      });
    } catch (error) {
      console.error("Error al generar recibo:", error);
      const data = error.response?.data;
      let msg =
        data?.error ||
        data?.detail ||
        (Array.isArray(data?.serial_item) ? data.serial_item[0] : data?.serial_item) ||
        (Array.isArray(data?.non_field_errors) ? data.non_field_errors[0] : null) ||
        "No se pudo generar el recibo. Intenta nuevamente.";

      if (typeof msg === "string" && msg.toLowerCase().includes("bill_id")) {
        msg = "Ya existe un recibo con esa fecha y serial para esta venta. Cambia la fecha del recibo para generar uno nuevo.";
      }
      setNotify({
        variant: "error",
        title: "Error al generar recibo",
        message: typeof msg === "object" ? JSON.stringify(msg) : msg,
      });
    }
  };

  const handleSubmit = async (formData, ventaId, invoiceData) => {
    try {
      if (ventaId) {
        await VentaService.updateVenta(ventaId, {
          cliente: formData.cliente,
          notas: formData.notas,
          estado_entrega: formData.estado_entrega,
        });
      } else {
        const result = await VentaService.createVenta({
          cliente: formData.cliente,
          notas: formData.notas,
          separacion: formData.separacion || null,
          items_data: formData.items_data,
          estado_entrega: formData.estado_entrega,
        });
        const venta = result.venta || result;

        if (invoiceData && venta?.id) {
          const items = formData.items_data || [];
          const serials = items.map((i) => i.unidad_serial).filter(Boolean).join(", ");
          const total = items.reduce((s, i) => s + parseFloat(i.precio || 0), 0);
          try {
            await InvoiceService.createInvoice({
              cliente: formData.cliente,
              venta: venta.id,
              concepto: "venta",
              serial_item: serials || `VENTA-${venta.id}`,
              total_amount: total,
              payment_method: invoiceData.payment_method,
              due_date: invoiceData.due_date,
            });
          } catch (invoiceErr) {
            console.warn("Venta creada, pero error al generar la factura:", invoiceErr?.response?.data || invoiceErr);
          }
        }
      }
      setShowModal(false);
      loadVentas();
    } catch (error) {
      console.error("Error al guardar venta:", error);
      setNotify({
        variant: "error",
        title: "Error al guardar",
        message: "No se pudo guardar la venta. Intenta nuevamente.",
      });
    }
  };

  const formatCOP = (value) => "$" + Number(value || 0).toLocaleString("es-CO");

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => <span style={{ fontWeight: 600 }}>#{row.id}</span>,
    },
    {
      key: "cliente_nombre",
      label: "Cliente",
      render: (row) => <span style={{ fontWeight: 600 }}>{row.cliente_nombre || "—"}</span>,
    },
    {
      key: "fecha",
      label: "Fecha",
      render: (row) => new Date(row.fecha).toLocaleDateString("es-CO"),
    },
    {
      key: "total",
      label: "Total",
      render: (row) => (
        <span style={{ fontWeight: 600, color: "var(--primary-color)" }}>{formatCOP(row.total)}</span>
      ),
    },
    {
      key: "items",
      label: "Productos",
      render: (row) => {
        const items = row.items || [];
        if (items.length === 0) return <span style={{ color: "#9ca3af" }}>Sin productos</span>;
        const nombres = items.map((i) => i.producto_nombre).filter(Boolean);
        const primero = nombres[0] || `${items.length} producto${items.length === 1 ? "" : "s"}`;
        const extra = items.length > 1 ? ` +${items.length - 1} más` : "";
        const truncado = primero.length > 32 ? primero.substring(0, 32) + "…" : primero;
        return (
          <span title={nombres.join(", ")}>
            {truncado}
            {extra && <span className="vp-extra-count">{extra}</span>}
          </span>
        );
      },
    },
    {
      key: "estado_entrega",
      label: "Entrega",
      render: (row) =>
        row.estado_entrega === "entregado" ? (
          <span className="vp-badge-entregado">Entregado</span>
        ) : (
          <span className="vp-badge-por-entregar">Por Entregar</span>
        ),
    },
    {
      key: "active",
      label: "Estado",
      render: (row) =>
        row.active ? (
          <span className="vp-badge-active">Activa</span>
        ) : (
          <span className="vp-badge-inactive">Inactiva</span>
        ),
    },
  ];

  const customActions = [
    {
      show: () => true,
      icon: Eye,
      title: "Ver detalle",
      handler: handleView,
    },
    {
      show: () => true,
      icon: Edit,
      title: "Editar",
      handler: handleEdit,
    },
    {
      show: () => true,
      icon: Mail,
      title: "Enviar Recibo",
      handler: handleEnviarRecibo,
    },
    {
      show: () => true,
      icon: Trash2,
      title: "Eliminar",
      handler: handleDelete,
      destructive: true,
    },
  ];

  const totalIngresos = ventas.reduce((sum, v) => sum + Number(v.total || 0), 0);

  const stats = [
    {
      label: "Total Ventas",
      count: ventas.length,
      icon: (
        <ShoppingCart
          className="icon-card"
          style={{ stroke: "#3730a3", color: "#3730a3", backgroundColor: "#e0e7ff" }}
        />
      ),
    },
    {
      label: "Activas",
      count: ventas.filter((v) => v.active).length,
      icon: (
        <CheckCircle
          className="icon-card"
          style={{ stroke: "#065f46", color: "#065f46", backgroundColor: "#d1fae5" }}
        />
      ),
    },
    {
      label: "Inactivas",
      count: ventas.filter((v) => !v.active).length,
      icon: (
        <Ban
          className="icon-card"
          style={{ stroke: "#991b1b", color: "#991b1b", backgroundColor: "#fee2e2" }}
        />
      ),
    },
    {
      label: "Ingresos Totales",
      count: formatCOP(totalIngresos),
      icon: (
        <DollarSign
          className="icon-card"
          style={{ stroke: "#92400e", color: "#92400e", backgroundColor: "#fef3c7" }}
        />
      ),
    },
  ];

  return (
    <section>
      <div className="table-container">
        <TitleCrud
          title="Gestión de Ventas"
          icon={ShoppingCart}
          description="Administra las ventas registradas y genera recibos"
        />

        <SearchBox
          onRegisterClick={handleCreateNew}
          registerLabel="Registrar Nueva Venta"
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por cliente..."
        />

        <CountCard stats={stats} />

        <DataTable
          columns={columns}
          data={filteredVentas}
          rowKey="id"
          showEdit={false}
          customActions={customActions}
        />

        {showModal && (
          <VentaForm
            onClose={() => setShowModal(false)}
            onSubmit={handleSubmit}
            venta={selectedVenta}
          />
        )}

        {generarReciboTarget && (
          <GenerarReciboVentaModal
            venta={generarReciboTarget}
            onClose={() => setGenerarReciboTarget(null)}
            onSubmit={handleGenerarReciboSubmit}
          />
        )}

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

        {notify && (
          <NotifyModal
            variant={notify.variant}
            title={notify.title}
            message={notify.message}
            onClose={() => setNotify(null)}
          />
        )}

      </div>
    </section>
  );
};

export default Ventas;
