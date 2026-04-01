import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../../styles/admin/dataTable.css";
import "../../styles/global.css";
import { Box } from "lucide-react";
import { FaCheck, FaTimes, FaShoppingCart, FaLock } from "react-icons/fa";
import DataTable from "../../components/admin/DataTable";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import TitleCrud from "../../components/admin/TitleCrud";
import UnidadProductoForm from "../../components/admin/UnidadProductoForm";
import OrdenCompraForm from "../../components/admin/OrdenCompraForm";
import VentaForm from "../../components/admin/VentaForm";
import SeparacionForm from "../../components/admin/SeparacionForm";
import BreadcrumbNav from "../../components/admin/BreadcrumbNav";
import ConfirmModal from "../../components/admin/ConfirmModal";
import { createOrdenCompra, updateOrdenCompra } from "../../services/OrdenCompraService";
import { createVenta } from "../../services/VentaService";
import { createSeparacion } from "../../services/SeparacionService";

import {
  getUnidades,
  getUnidadDetail,
  updateUnidad,
  activateUnidad,
  deactivateUnidad,
} from "../../services/UnidadService";

const ESTADO_VENTA_LABELS = {
  sin_vender: "Sin Vender",
  separado: "Separado",
  vendido: "Vendido",
  por_encargo: "Por Encargo",
  entregado_garantia: "Entregado Garantía",
  danado: "Dañado",
  solicitud_metodo_aliado: "Método Aliado",
};

const ESTADO_PRODUCTO_LABELS = {
  en_stock: "En Stock",
  viajando: "Viajando",
  por_comprar: "Por Comprar",
  por_entregar: "Por Entregar",
  entregado: "Entregado",
  por_reparar: "Por Reparar",
  en_reparacion: "En Reparación",
};

const CONDICION_LABELS = {
  nuevo: "Nuevo",
  open_box: "Open Box",
  refurbished: "Refurbished",
  usado: "Usado",
};

const formatCOP = (value) => "$" + Number(value).toLocaleString("es-CO");

const Unidades = () => {
  const [searchParams] = useSearchParams();
  // URL param: ?producto_id=<id> to pre-filter by product
  const filterProductoId = searchParams.get("producto_id") || null;

  const [unidades, setUnidades] = useState([]);
  const [editingUnidad, setEditingUnidad] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstadoVenta, setFilterEstadoVenta] = useState("");
  const [filterEstadoProducto, setFilterEstadoProducto] = useState("");
  const [filterCondicion, setFilterCondicion] = useState("");

  // Context product name (for breadcrumb/title when filtered by product)
  const [contextProductoNombre, setContextProductoNombre] = useState(null);

  // Venta / Separación quick-action modals
  const [ventaTargetUnidad, setVentaTargetUnidad] = useState(null);
  const [separacionTargetUnidad, setSeparacionTargetUnidad] = useState(null);

  // OrdenCompra form (for creating new units — order creation auto-creates the unit)
  const [showOrdenForm, setShowOrdenForm] = useState(false);

  useEffect(() => {
    fetchUnidades();
  }, [filterProductoId]);

  const fetchUnidades = async () => {
    try {
      const data = await getUnidades(
        filterProductoId ? Number(filterProductoId) : null
      );
      setUnidades(data);
      if (filterProductoId && data.length > 0) {
        setContextProductoNombre(data[0].producto_nombre || null);
      }
    } catch (error) {
      console.error("Error cargando unidades:", error);
    }
  };

  const handleOpenModal = async (unidad = null) => {
    setSubmitError(null);
    if (unidad) {
      // Edit mode: open UnidadProductoForm with full detail
      try {
        const detail = await getUnidadDetail(unidad.id);
        setEditingUnidad(detail);
      } catch {
        setEditingUnidad(unidad);
      }
      setShowModal(true);
    } else {
      // Create mode: open OrdenCompraForm — creating an order auto-creates the linked unit
      setShowOrdenForm(true);
    }
  };

  const handleCloseModal = () => {
    setEditingUnidad(null);
    setSubmitError(null);
    setShowModal(false);
  };

  const handleOrdenSubmit = async (data, id) => {
    try {
      if (id) {
        await updateOrdenCompra(id, data);
      } else {
        await createOrdenCompra(data);
      }
      setShowOrdenForm(false);
      fetchUnidades();
    } catch (error) {
      console.error("Error al guardar orden:", error);
      throw error; // let OrdenCompraForm show its own error
    }
  };

  const handleSubmit = async (payload, id) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await updateUnidad(id, payload);
      handleCloseModal();
      fetchUnidades();
    } catch (error) {
      console.error("Error al guardar unidad:", error);
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

  const handleActivate = (unidad) => {
    setConfirmDialog({
      title: "¿Activar unidad?",
      message: `Serial: ${unidad.serial}. La variante padre se actualizará automáticamente.`,
      confirmLabel: "Sí, activar",
      isDestructive: false,
      onConfirm: async () => {
        try {
          await activateUnidad(unidad.id);
          fetchUnidades();
        } catch (error) {
          console.error("Error al activar unidad:", error);
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleDeactivate = (unidad) => {
    setConfirmDialog({
      title: "¿Desactivar unidad?",
      message: `Serial: ${unidad.serial}. La variante padre se actualizará automáticamente.`,
      confirmLabel: "Sí, desactivar",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deactivateUnidad(unidad.id);
          fetchUnidades();
        } catch (error) {
          console.error("Error al desactivar unidad:", error);
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleVentaSubmit = async (data) => {
    try {
      await createVenta(data);
      setVentaTargetUnidad(null);
      fetchUnidades();
    } catch (error) {
      console.error("Error al registrar venta:", error);
    }
  };

  const handleSeparacionSubmit = async (data) => {
    try {
      await createSeparacion(data);
      setSeparacionTargetUnidad(null);
      fetchUnidades();
    } catch (error) {
      console.error("Error al registrar separación:", error);
    }
  };

  const activeUnidades = unidades.filter((u) => u.active !== false);

  const filteredUnidades = activeUnidades.filter((u) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      !searchTerm ||
      u.serial?.toLowerCase().includes(term) ||
      u.producto_nombre?.toLowerCase().includes(term) ||
      u.producto_marca?.toLowerCase().includes(term);
    const matchEstadoVenta = !filterEstadoVenta || u.estado_venta === filterEstadoVenta;
    const matchEstadoProducto = !filterEstadoProducto || u.estado_producto === filterEstadoProducto;
    const matchCondicion = !filterCondicion || u.condicion === filterCondicion;
    return matchSearch && matchEstadoVenta && matchEstadoProducto && matchCondicion;
  });

  const columns = [
    {
      key: "producto_nombre",
      label: "Producto",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.producto_nombre || "—"}</div>
          {row.producto_marca && (
            <div style={{ fontSize: "0.78rem", color: "var(--subtitle-color)", marginTop: "2px" }}>
              {row.producto_marca}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "condicion",
      label: "Condición",
      render: (row) => (
        <span className={`status-badge condicion-${row.condicion}`}>
          {CONDICION_LABELS[row.condicion] || row.condicion}
        </span>
      ),
    },
    {
      key: "serial",
      label: "Serial",
      render: (row) => {
        const isPending = !row.serial || row.serial.startsWith("SIN-SERIAL-");
        return isPending ? (
          <span style={{ color: "var(--warning-color)", fontWeight: 600, fontSize: "0.85rem" }}>
            Serial pendiente
          </span>
        ) : (
          <code
            style={{
              fontFamily: "Courier New, monospace",
              backgroundColor: "var(--icon-bg)",
              padding: "0.25rem 0.5rem",
              borderRadius: "4px",
              fontSize: "0.82rem",
              fontWeight: 600,
            }}
          >
            {row.serial}
          </code>
        );
      },
    },
    {
      key: "precio",
      label: "Precio",
      render: (row) => (
        <span style={{ fontWeight: 600, color: "var(--primary-color)" }}>
          {formatCOP(row.precio)}
        </span>
      ),
    },
    {
      key: "estado_venta",
      label: "Estado Venta",
      render: (row) => (
        <span className={`status-badge estado-venta-${row.estado_venta}`}>
          {ESTADO_VENTA_LABELS[row.estado_venta] || row.estado_venta}
        </span>
      ),
    },
    {
      key: "estado_producto",
      label: "Estado Producto",
      render: (row) => (
        <span className={`status-badge estado-prod-${row.estado_producto}`}>
          {ESTADO_PRODUCTO_LABELS[row.estado_producto] || row.estado_producto}
        </span>
      ),
    },
  ];

  const stats = [
    {
      label: "Total Activas",
      count: activeUnidades.length,
      icon: <Box className="icon-card" />,
    },
    {
      label: "Sin Vender",
      count: activeUnidades.filter((u) => u.estado_venta === "sin_vender").length,
      icon: <Box className="icon-card" />,
    },
    {
      label: "En Stock",
      count: activeUnidades.filter((u) => u.estado_producto === "en_stock").length,
      icon: <Box className="icon-card" />,
    },
    {
      label: "Vendidas",
      count: activeUnidades.filter((u) => u.estado_venta === "vendido").length,
      icon: <Box className="icon-card" />,
    },
    {
      label: "Separadas",
      count: activeUnidades.filter((u) => u.estado_venta === "separado").length,
      icon: <Box className="icon-card" />,
    },
  ];

  return (
    <section>
      <div className="table-container">
        {filterProductoId && contextProductoNombre && (
          <BreadcrumbNav
            segments={[
              { label: "Productos", path: "/admin/productos" },
              { label: contextProductoNombre, path: `/admin/unidades?producto_id=${filterProductoId}` },
            ]}
          />
        )}

        <TitleCrud
          title="Unidades de Producto"
          icon={Box}
          description={
            filterProductoId && contextProductoNombre
              ? `Mostrando unidades de: ${contextProductoNombre}`
              : "Administra las unidades físicas de cada producto (serial, estado y precio individual)"
          }
        />

        <SearchBox
          onRegisterClick={() => handleOpenModal()}
          registerLabel="Registrar Orden / Unidad"
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por serial o producto..."
        />

        {/* Inline filters */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
          <select
            value={filterEstadoVenta}
            onChange={(e) => setFilterEstadoVenta(e.target.value)}
          >
            <option value="">Todos los estados de venta</option>
            {Object.entries(ESTADO_VENTA_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <select
            value={filterEstadoProducto}
            onChange={(e) => setFilterEstadoProducto(e.target.value)}
          >
            <option value="">Todos los estados del producto</option>
            {Object.entries(ESTADO_PRODUCTO_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <select
            value={filterCondicion}
            onChange={(e) => setFilterCondicion(e.target.value)}
          >
            <option value="">Todas las condiciones</option>
            {Object.entries(CONDICION_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        <CountCard stats={stats} />

        <DataTable
          columns={columns}
          data={filteredUnidades}
          rowKey="id"
          onEdit={(row) => handleOpenModal(row)}
          customActions={[
            {
              icon: FaShoppingCart,
              handler: (row) => setVentaTargetUnidad(row),
              show: (row) => row.active && row.estado_venta === "sin_vender",
              title: "Registrar Venta",
            },
            {
              icon: FaLock,
              handler: (row) => setSeparacionTargetUnidad(row),
              show: (row) => row.active && row.estado_venta === "sin_vender",
              title: "Registrar Separación",
            },
            {
              icon: FaCheck,
              handler: handleActivate,
              show: (row) => !row.active,
              title: "Activar",
            },
            {
              icon: FaTimes,
              handler: handleDeactivate,
              show: (row) => row.active,
              title: "Desactivar",
            },
          ]}
        />

        {/* Create flow: OrdenCompraForm auto-creates the linked unit */}
        {showOrdenForm && (
          <OrdenCompraForm
            onClose={() => setShowOrdenForm(false)}
            onSubmit={handleOrdenSubmit}
            preselectedProducto={filterProductoId ? { id: Number(filterProductoId) } : null}
          />
        )}

        {/* Edit flow: UnidadProductoForm for updating an existing unit */}
        {showModal && editingUnidad && (
          <UnidadProductoForm
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
            unidad={editingUnidad}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        )}

        {ventaTargetUnidad && (
          <VentaForm
            onClose={() => setVentaTargetUnidad(null)}
            onSubmit={handleVentaSubmit}
            preselectedUnidadId={ventaTargetUnidad.id}
          />
        )}

        {separacionTargetUnidad && (
          <SeparacionForm
            onClose={() => setSeparacionTargetUnidad(null)}
            onSubmit={handleSeparacionSubmit}
            preselectedUnidadId={separacionTargetUnidad.id}
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

export default Unidades;
