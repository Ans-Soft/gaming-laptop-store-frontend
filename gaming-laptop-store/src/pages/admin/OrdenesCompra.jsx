import React, { useEffect, useState } from "react";
import "./../../styles/admin/dataTable.css";
import "./../../styles/global.css";
import { ShoppingCart, Package } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import { FaTrash } from "react-icons/fa";
import TitleCrud from "../../components/admin/TitleCrud";
import OrdenCompraForm from "../../components/admin/OrdenCompraForm";
import ConfirmModal from "../../components/admin/ConfirmModal";
import * as TRMService from "../../services/TRMService";
import {
  getOrdenesCompra,
  createOrdenCompra,
  updateOrdenCompra,
  deactivateOrdenCompra,
} from "../../services/OrdenCompraService";

const OrdenesCompra = () => {
  const [showModal, setShowModal] = useState(false);
  const [ordenes, setOrdenes] = useState([]);
  const [editingOrden, setEditingOrden] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [trm, setTrm] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // orden to delete

  useEffect(() => {
    fetchOrdenes();
    fetchTRM();
  }, []);

  const fetchTRM = async () => {
    try {
      const data = await TRMService.getTRM();
      const latest = data.trm_history?.[0];
      if (latest) setTrm(parseFloat(latest.valor_cop));
    } catch {
      // TRM unavailable — COP column will show "—"
    }
  };

  const fetchOrdenes = async () => {
    try {
      const data = await getOrdenesCompra();
      setOrdenes(data.orden_compra || data);
    } catch (error) {
      console.error("Error al obtener órdenes:", error);
    }
  };

  const handleOpenModal = (orden = null) => {
    setEditingOrden(orden);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditingOrden(null);
    setShowModal(false);
  };

  const handleSubmitOrden = async (data, id) => {
    try {
      if (id) {
        await updateOrdenCompra(id, data);
      } else {
        await createOrdenCompra(data);
      }
      handleCloseModal();
      fetchOrdenes();
    } catch (error) {
      console.error("Error al guardar orden:", error);
    }
  };

  const handleDelete = (orden) => {
    setConfirmDelete(orden);
  };

  const handleConfirmDelete = async () => {
    try {
      await deactivateOrdenCompra(confirmDelete.id);
      fetchOrdenes();
    } catch (error) {
      console.error("Error al eliminar orden:", error);
    } finally {
      setConfirmDelete(null);
    }
  };

  const filteredOrdenes = ordenes.filter(
    (orden) =>
      orden.active !== false &&
      (orden.producto_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orden.numero_orden?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orden.proveedor_nombre?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const estadoLogisticoLabel = {
    viajando: "Viajando",
    en_oficina_importadora: "En Oficina Importadora",
    en_oficina: "En Oficina Tienda",
  };

  const columns = [
    {
      key: "producto_nombre",
      label: "Producto",
      render: (row) => (
        <div>
          <div className="cell-primary">{row.producto_nombre || "—"}</div>
          {row.unidad_serial && !row.unidad_serial.startsWith("SIN-SERIAL-")
            ? <div className="cell-secondary cell-code">Serial: {row.unidad_serial}</div>
            : <div className="cell-secondary--warning">Serial pendiente</div>
          }
        </div>
      ),
    },
    {
      key: "condicion",
      label: "Condición",
      render: (row) => (
        <span className={`status-badge condicion-${row.condicion}`}>
          {row.condicion_display || row.condicion}
        </span>
      ),
    },
    {
      key: "proveedor_nombre",
      label: "Proveedor",
      render: (row) => (
        <span className={row.proveedor_nombre ? "cell-primary" : "cell-empty"}>
          {row.proveedor_nombre || "—"}
        </span>
      ),
    },
    {
      key: "numero_orden",
      label: "N° Orden",
      render: (row) => <span className="cell-primary">{row.numero_orden}</span>,
    },
    {
      key: "numero_tracking",
      label: "Tracking",
      render: (row) => row.numero_tracking
        ? <span className="cell-code">{row.numero_tracking}</span>
        : <span className="cell-empty">—</span>,
    },
    {
      key: "costo_compra",
      label: "Costo Compra",
      render: (row) => {
        const usd = parseFloat(row.costo_compra || 0);
        const cop = trm ? usd * trm : null;
        return (
          <div>
            <div className="cell-primary--strong">
              {cop ? `$${cop.toLocaleString("es-CO", { maximumFractionDigits: 0 })}` : "—"}
            </div>
            <div className="cell-secondary">
              (${usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD)
            </div>
          </div>
        );
      },
    },
    {
      key: "costos_extra",
      label: "Import. + Impuesto",
      render: (row) => {
        const usd = parseFloat(row.costo_importacion || 0) + parseFloat(row.impuesto_importacion || 0);
        const cop = trm ? usd * trm : null;
        if (usd === 0) return <span className="cell-empty">—</span>;
        return (
          <div>
            <div className="cell-primary--strong">
              {cop ? `$${cop.toLocaleString("es-CO", { maximumFractionDigits: 0 })}` : "—"}
            </div>
            <div className="cell-secondary">
              (${usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD)
            </div>
          </div>
        );
      },
    },
    {
      key: "costo_total",
      label: "Costo Total",
      render: (row) => {
        const usd = parseFloat(row.costo_compra || 0)
          + parseFloat(row.costo_importacion || 0)
          + parseFloat(row.impuesto_importacion || 0);
        const cop = trm ? usd * trm : null;
        return (
          <div>
            <div className="cell-primary--strong">
              {cop ? `$${cop.toLocaleString("es-CO", { maximumFractionDigits: 0 })}` : "—"}
            </div>
            <div className="cell-secondary">
              (${usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD)
            </div>
          </div>
        );
      },
    },
    {
      key: "unidad_precio",
      label: "Precio de Venta",
      render: (row) => row.unidad_precio
        ? <span className="cell-primary--accent">
            ${parseFloat(row.unidad_precio).toLocaleString("es-CO", { maximumFractionDigits: 0 })}
          </span>
        : <span className="cell-empty">—</span>,
    },
    {
      key: "estado_logistico",
      label: "Estado Logístico",
      render: (row) => (
        <span className={`status-badge estado-${row.estado_logistico}`}>
          {estadoLogisticoLabel[row.estado_logistico] || row.estado_logistico}
        </span>
      ),
    },
  ];

  const activeOrdenes = ordenes.filter((o) => o.active !== false);

  const stats = [
    {
      label: "Total Órdenes Activas",
      count: activeOrdenes.length,
      icon: <Package className="icon-card" />,
    },
  ];

  return (
    <section>
      <div className="table-container">
        <TitleCrud
          title="Gestión de Órdenes de Compra"
          icon={ShoppingCart}
          description="Administra las órdenes de compra y canjes de clientes"
        />

        <SearchBox
          onRegisterClick={() => handleOpenModal()}
          registerLabel="Registrar Orden de Compra"
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por producto, orden o proveedor..."
        />

        <CountCard stats={stats} />

        <DataTable
          columns={columns}
          data={filteredOrdenes}
          rowKey="id"
          onEdit={handleOpenModal}
          customActions={[
            {
              icon: FaTrash,
              handler: handleDelete,
              show: () => true,
              title: "Eliminar",
            },
          ]}
        />

        {showModal && (
          <OrdenCompraForm
            onClose={handleCloseModal}
            onSubmit={handleSubmitOrden}
            orden={editingOrden}
          />
        )}

        {confirmDelete && (
          <ConfirmModal
            title="¿Eliminar orden de compra?"
            message={`Se eliminará la orden ${confirmDelete.numero_orden}. Esta acción no se puede deshacer.`}
            confirmLabel="Sí, eliminar"
            onConfirm={handleConfirmDelete}
            onCancel={() => setConfirmDelete(null)}
          />
        )}
      </div>
    </section>
  );
};

export default OrdenesCompra;
