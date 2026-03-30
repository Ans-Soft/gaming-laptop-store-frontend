import React, { useEffect, useState } from "react";
import "../../styles/admin/dataTable.css";
import "../../styles/global.css";
import { Clock } from "lucide-react";
import { FaCheck, FaTimes, FaPlus } from "react-icons/fa";
import DataTable from "../../components/admin/DataTable";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import TitleCrud from "../../components/admin/TitleCrud";
import BajoPedidoForm from "../../components/admin/BajoPedidoForm";
import BajoPedidoCreateUnitForm from "../../components/admin/BajoPedidoCreateUnitForm";
import ConfirmModal from "../../components/admin/ConfirmModal";

import {
  getBajoPedidos,
  getBajoPedidoDetail,
  createBajoPedido,
  updateBajoPedido,
  activateBajoPedido,
  deactivateBajoPedido,
} from "../../services/BajoPedidoService";

import { createUnidad } from "../../services/UnidadService";

const formatCOP = (value) => "$" + Number(value).toLocaleString("es-CO");

/**
 * BajoPedido admin page.
 * Manages on-demand sourcing records with automatic Celery price updates.
 * Uses DataTable + BajoPedidoForm inside ModalBase for CRUD.
 */
const BajoPedido = () => {
  const [bajoPedidos, setBajoPedidos] = useState([]);
  const [editingBajoPedido, setEditingBajoPedido] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Create unit from BajoPedido state
  const [showCreateUnitModal, setShowCreateUnitModal] = useState(false);
  const [selectedBajoPedido, setSelectedBajoPedido] = useState(null);
  const [isCreatingUnit, setIsCreatingUnit] = useState(false);
  const [createUnitError, setCreateUnitError] = useState(null);

  useEffect(() => {
    fetchBajoPedidos();
  }, []);

  const fetchBajoPedidos = async () => {
    try {
      const data = await getBajoPedidos();
      setBajoPedidos(data);
    } catch (error) {
      console.error("Error cargando bajo pedidos:", error);
    }
  };

  const handleOpenModal = async (bajoPedido = null) => {
    setSubmitError(null);
    if (bajoPedido) {
      // Edit mode: fetch full detail
      try {
        const detail = await getBajoPedidoDetail(bajoPedido.id);
        setEditingBajoPedido(detail);
      } catch (error) {
        console.error("Error cargando detalle de bajo pedido:", error);
        setEditingBajoPedido(bajoPedido);
      }
      setShowModal(true);
    } else {
      // Create mode
      setEditingBajoPedido(null);
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setEditingBajoPedido(null);
    setSubmitError(null);
    setShowModal(false);
  };

  const handleSubmit = async (formData, id) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (id) {
        await updateBajoPedido(id, formData);
      } else {
        await createBajoPedido(formData);
      }
      handleCloseModal();
      fetchBajoPedidos();
    } catch (error) {
      console.error("Error al guardar bajo pedido:", error);
      const errors = error.response?.data;
      if (errors) {
        const formatted = Object.entries(errors)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join("; ");
        setSubmitError(`Error: ${formatted}`);
      } else {
        setSubmitError("No se pudo completar la operación. Verifica tu conexión e intenta de nuevo.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivate = (bajoPedido) => {
    setConfirmDialog({
      title: `¿Activar bajo pedido #${bajoPedido.id}?`,
      message: "El registro volverá a estar activo en el sistema.",
      confirmLabel: "Sí, activar",
      isDestructive: false,
      onConfirm: async () => {
        try {
          await activateBajoPedido(bajoPedido.id);
          fetchBajoPedidos();
        } catch (error) {
          console.error("Error al activar bajo pedido:", error);
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleDeactivate = (bajoPedido) => {
    setConfirmDialog({
      title: `¿Desactivar bajo pedido #${bajoPedido.id}?`,
      message: "El registro quedará inactivo en el sistema.",
      confirmLabel: "Sí, desactivar",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deactivateBajoPedido(bajoPedido.id);
          fetchBajoPedidos();
        } catch (error) {
          console.error("Error al desactivar bajo pedido:", error);
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleOpenCreateUnit = (bajoPedido) => {
    setCreateUnitError(null);
    setSelectedBajoPedido(bajoPedido);
    setShowCreateUnitModal(true);
  };

  const handleCloseCreateUnitModal = () => {
    setSelectedBajoPedido(null);
    setCreateUnitError(null);
    setShowCreateUnitModal(false);
  };

  const handleCreateUnitSubmit = async (payload) => {
    setIsCreatingUnit(true);
    setCreateUnitError(null);
    try {
      await createUnidad(payload);
      handleCloseCreateUnitModal();
      fetchBajoPedidos(); // Refresh list
    } catch (error) {
      console.error("Error creating unit from bajo pedido:", error);
      const errors = error.response?.data;
      if (errors) {
        const formatted = Object.entries(errors)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join("; ");
        setCreateUnitError(`Error: ${formatted}`);
      } else {
        setCreateUnitError("No se pudo crear la unidad. Verifica tu conexión e intenta de nuevo.");
      }
    } finally {
      setIsCreatingUnit(false);
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    {
      key: "producto_nombre",
      label: "Producto",
      render: (row) => (
        <span style={{ fontSize: "0.9em", fontWeight: "500" }}>
          {row.producto_nombre}
        </span>
      ),
    },
    {
      key: "condicion",
      label: "Condición",
      render: (row) => (
        <span style={{ fontSize: "0.85em", color: "#666" }}>
          {row.condicion.charAt(0).toUpperCase() + row.condicion.slice(1)}
        </span>
      ),
    },
    {
      key: "precio",
      label: "Precio (Celery)",
      render: (row) => formatCOP(row.precio),
    },
    {
      key: "estado",
      label: "Estado",
      render: (row) => {
        let bgColor, textColor;
        if (row.estado === "activo") {
          bgColor = "#d1fae5";
          textColor = "#065f46";
        } else if (row.estado === "sin_existencias") {
          bgColor = "#fee2e2";
          textColor = "#991b1b";
        } else {
          bgColor = "#f3f4f6";
          textColor = "#374151";
        }
        return (
          <span
            style={{
              display: "inline-block",
              padding: "0.35rem 0.75rem",
              borderRadius: "20px",
              fontSize: "0.8rem",
              fontWeight: "600",
              backgroundColor: bgColor,
              color: textColor,
            }}
          >
            {row.estado.charAt(0).toUpperCase() + row.estado.slice(1)}
          </span>
        );
      },
    },
    {
      key: "proveedor_nombre",
      label: "Proveedor",
      render: (row) => row.proveedor_nombre || "-",
    },
    {
      key: "enlace_proveedor",
      label: "Enlace eBay",
      render: (row) =>
        row.enlace_proveedor ? (
          <a
            href={row.enlace_proveedor}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#3b82f6", textDecoration: "underline", fontSize: "0.85em" }}
          >
            Ver
          </a>
        ) : (
          <span style={{ color: "#9ca3af" }}>—</span>
        ),
    },
  ];

  const stats = [
    {
      label: "Total Bajo Pedido",
      count: bajoPedidos.length,
      icon: <Clock className="icon-card" />,
    },
    {
      label: "Activos",
      count: bajoPedidos.filter((bp) => bp.estado === "activo").length,
      icon: <Clock className="icon-card" />,
    },
    {
      label: "Sin Existencias",
      count: bajoPedidos.filter((bp) => bp.estado === "sin_existencias").length,
      icon: <Clock className="icon-card" />,
    },
  ];

  return (
    <section>
      <div className="table-container">
        <TitleCrud
          title="Bajo Pedido (Sourcing)"
          icon={Clock}
          description="Administra productos con sourcing en demanda. Los precios se actualizan automáticamente cada 30 minutos."
        />

        <SearchBox
          onRegisterClick={() => handleOpenModal()}
          registerLabel="Nuevo Bajo Pedido"
        />

        <CountCard stats={stats} />

        <DataTable
          columns={columns}
          data={bajoPedidos.filter((bp) => bp.active !== false)}
          rowKey="id"
          onEdit={handleOpenModal}
          customActions={[
            {
              icon: FaPlus,
              handler: handleOpenCreateUnit,
              show: () => true,
              title: "Crear Unidad",
            },
            {
              icon: FaCheck,
              handler: handleActivate,
              show: (row) => row.estado !== "activo",
              title: "Activar",
            },
            {
              icon: FaTimes,
              handler: handleDeactivate,
              show: (row) => row.estado === "activo",
              title: "Desactivar",
            },
          ]}
        />

        {showModal && (
          <BajoPedidoForm
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
            bajoPedido={editingBajoPedido}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        )}

        {showCreateUnitModal && selectedBajoPedido && (
          <BajoPedidoCreateUnitForm
            bajoPedido={selectedBajoPedido}
            onClose={handleCloseCreateUnitModal}
            onSubmit={handleCreateUnitSubmit}
            isSubmitting={isCreatingUnit}
            submitError={createUnitError}
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
      </div>
    </section>
  );
};

export default BajoPedido;
