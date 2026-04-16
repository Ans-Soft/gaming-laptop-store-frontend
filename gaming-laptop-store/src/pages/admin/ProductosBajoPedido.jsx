import React, { useEffect, useState } from "react";
import "./../../styles/admin/dataTable.css";
import "./../../styles/global.css";
import { Clock, Package } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import { FaRegCheckCircle, FaCheck, FaTimes, FaShoppingCart, FaEdit } from "react-icons/fa";
import TitleCrud from "../../components/admin/TitleCrud";
import ConfirmModal from "../../components/admin/ConfirmModal";
import OrdenCompraForm from "../../components/admin/OrdenCompraForm";
import ModalBase from "../../components/admin/ModalBase";
import {
  getProductosBajoPedido,
  activateProductoBajoPedido,
  deactivateProductoBajoPedido,
  patchProductoBajoPedido,
} from "../../services/ProductoBajoPedidoService";
import { createOrdenCompra, updateOrdenCompra } from "../../services/OrdenCompraService";

const ESTADO_LOGISTICO_LABELS = {
  viajando: "Viajando",
  en_oficina_importadora: "En Ofic. Importadora",
  en_oficina: "En Oficina Local",
};

const ESTADO_LOGISTICO_COLORS = {
  viajando: { bg: "#fef3c7", text: "#92400e" },
  en_oficina_importadora: { bg: "#ede9fe", text: "#5b21b6" },
  en_oficina: { bg: "#d1fae5", text: "#065f46" },
};

const ProductosBajoPedido = () => {
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Create OC modal
  const [showOCForm, setShowOCForm] = useState(false);
  const [solicitudParaOC, setSolicitudParaOC] = useState(null);

  // Update estado logístico modal
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [solicitudParaEstado, setSolicitudParaEstado] = useState(null);
  const [nuevoEstadoLogistico, setNuevoEstadoLogistico] = useState("viajando");

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const data = await getProductosBajoPedido();
      setProductos(Array.isArray(data) ? data : (data.producto_bajo_pedido || []));
    } catch (error) {
      console.error("Error al obtener productos bajo pedido:", error);
    }
  };

  const handleActivate = (producto) => {
    setConfirmDialog({
      title: "¿Activar este producto bajo pedido?",
      message: "El registro volverá a estar activo en el sistema.",
      confirmLabel: "Sí, activar",
      isDestructive: false,
      onConfirm: async () => {
        try {
          await activateProductoBajoPedido(producto.id);
          fetchProductos();
        } catch (error) {
          console.error("Error al activar producto:", error);
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleDeactivate = (producto) => {
    setConfirmDialog({
      title: "¿Desactivar este producto bajo pedido?",
      message: "El registro quedará inactivo en el sistema.",
      confirmLabel: "Sí, desactivar",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deactivateProductoBajoPedido(producto.id);
          fetchProductos();
        } catch (error) {
          console.error("Error al desactivar producto:", error);
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleOpenOCForm = (solicitud) => {
    setSolicitudParaOC(solicitud);
    setShowOCForm(true);
  };

  const handleOCSubmit = async (ocData, ocId) => {
    try {
      let nuevaOC;
      if (ocId) {
        nuevaOC = await updateOrdenCompra(ocId, ocData);
      } else {
        nuevaOC = await createOrdenCompra(ocData);
      }

      const ocIdResult = nuevaOC?.orden_compra?.id || nuevaOC?.id;
      if (ocIdResult && solicitudParaOC) {
        await patchProductoBajoPedido(solicitudParaOC.id, { orden_compra: ocIdResult });
      }

      setShowOCForm(false);
      setSolicitudParaOC(null);
      fetchProductos();
    } catch (error) {
      console.error("Error al crear orden de compra:", error);
      throw error;
    }
  };

  const handleOpenEstadoModal = (solicitud) => {
    setSolicitudParaEstado(solicitud);
    setNuevoEstadoLogistico(solicitud.orden_compra_estado || "viajando");
    setShowEstadoModal(true);
  };

  const handleUpdateEstado = async () => {
    if (!solicitudParaEstado?.orden_compra) return;
    try {
      await updateOrdenCompra(solicitudParaEstado.orden_compra, {
        estado_logistico: nuevoEstadoLogistico,
      });
      setShowEstadoModal(false);
      setSolicitudParaEstado(null);
      fetchProductos();
    } catch (error) {
      console.error("Error al actualizar estado logístico:", error);
      alert("No se pudo actualizar el estado.");
    }
  };

  const filteredProductos = productos.filter(
    (p) =>
      p.active !== false &&
      ((p.cliente_nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.bajo_pedido_str || p.bajo_pedido_producto_nombre || "").toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getEstadoBadge = (row) => {
    if (!row.orden_compra) {
      return (
        <span style={{ display: "inline-block", padding: "0.3rem 0.7rem", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 600, background: "#f3f4f6", color: "#4b5563" }}>
          Por comprar
        </span>
      );
    }
    const est = row.orden_compra_estado;
    const colors = ESTADO_LOGISTICO_COLORS[est] || { bg: "#f3f4f6", text: "#4b5563" };
    return (
      <span style={{ display: "inline-block", padding: "0.3rem 0.7rem", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 600, background: colors.bg, color: colors.text }}>
        {ESTADO_LOGISTICO_LABELS[est] || est}
      </span>
    );
  };

  const columns = [
    { key: "cliente_nombre", label: "Cliente" },
    {
      key: "bajo_pedido_str",
      label: "Producto",
      render: (row) => row.bajo_pedido_producto_nombre || row.bajo_pedido_str || "—",
    },
    {
      key: "bajo_pedido_condicion",
      label: "Condición",
      render: (row) => {
        const labels = { nuevo: "Nuevo", open_box: "Open Box", refurbished: "Refurbished", usado: "Usado" };
        return labels[row.bajo_pedido_condicion] || row.bajo_pedido_condicion || "—";
      },
    },
    {
      key: "valor_abono",
      label: "Abono",
      render: (row) => `$${Number(row.valor_abono).toLocaleString("es-CO")}`,
    },
    { key: "fecha_maxima_compra", label: "Fecha Máx." },
    {
      key: "orden_compra_estado",
      label: "Estado Logístico",
      render: (row) => getEstadoBadge(row),
    },
    {
      key: "estado",
      label: "Estado",
      render: (row) => (
        <span className={row.estado === "completada" ? "status-active" : "status-inactive"}>
          {row.estado ? row.estado.charAt(0).toUpperCase() + row.estado.slice(1) : "—"}
        </span>
      ),
    },
  ];

  const stats = [
    {
      label: "Total",
      count: productos.filter((p) => p.active !== false).length,
      icon: <Package className="icon-card" />,
    },
    {
      label: "Por Comprar",
      count: productos.filter((p) => p.active !== false && !p.orden_compra).length,
      icon: <FaRegCheckCircle className="icon-card" />,
    },
    {
      label: "En Tránsito",
      count: productos.filter((p) => p.active !== false && p.orden_compra_estado === "viajando").length,
      icon: <Clock className="icon-card" />,
    },
    {
      label: "En Oficina",
      count: productos.filter((p) => p.active !== false && p.orden_compra_estado === "en_oficina").length,
      icon: <Package className="icon-card" />,
    },
  ];

  return (
    <section>
      <div className="table-container">
        <TitleCrud
          title="Gestión de Productos Bajo Pedido"
          icon={Clock}
          description="Sigue el flujo de pedidos de clientes: desde la solicitud hasta la llegada del producto"
        />

        <SearchBox
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por cliente o producto..."
        />

        <CountCard stats={stats} />

        <DataTable
          columns={columns}
          data={filteredProductos}
          rowKey="id"
          showEdit={false}
          customActions={[
            {
              icon: FaShoppingCart,
              handler: handleOpenOCForm,
              show: (row) => row.active && !row.orden_compra,
              title: "Registrar Orden de Compra",
            },
            {
              icon: FaEdit,
              handler: handleOpenEstadoModal,
              show: (row) => row.active && Boolean(row.orden_compra),
              title: "Actualizar Estado Logístico",
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

        {showOCForm && solicitudParaOC && (
          <OrdenCompraForm
            onClose={() => { setShowOCForm(false); setSolicitudParaOC(null); }}
            onSubmit={handleOCSubmit}
            preselectedProducto={
              solicitudParaOC.bajo_pedido_producto_id
                ? { id: solicitudParaOC.bajo_pedido_producto_id, nombre: solicitudParaOC.bajo_pedido_producto_nombre }
                : null
            }
          />
        )}

        {showEstadoModal && solicitudParaEstado && (
          <ModalBase
            title="Actualizar Estado Logístico"
            subtitle={`Producto: ${solicitudParaEstado.bajo_pedido_producto_nombre || solicitudParaEstado.bajo_pedido_str}`}
            onClose={() => { setShowEstadoModal(false); setSolicitudParaEstado(null); }}
            onSubmit={handleUpdateEstado}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <label style={{ fontSize: "0.9rem", fontWeight: 500 }}>Nuevo estado de la orden de compra:</label>
              <select
                value={nuevoEstadoLogistico}
                onChange={(e) => setNuevoEstadoLogistico(e.target.value)}
                style={{ padding: "0.6rem 0.75rem", borderRadius: "6px", border: "1px solid var(--fourth-color, #e5e7eb)", fontFamily: "inherit", fontSize: "0.9rem" }}
              >
                <option value="viajando">Viajando</option>
                <option value="en_oficina_importadora">En Oficina Importadora</option>
                <option value="en_oficina">En Oficina Local</option>
              </select>
            </div>
          </ModalBase>
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

export default ProductosBajoPedido;
