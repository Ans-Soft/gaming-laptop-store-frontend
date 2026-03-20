import React, { useEffect, useState } from "react";
import "./../../styles/admin/dataTable.css";
import "./../../styles/global.css";
import { ShoppingCart, Package } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import { FaRegCheckCircle, FaCheck, FaTimes } from "react-icons/fa";
import TitleCrud from "../../components/admin/TitleCrud";
import OrdenCompraForm from "../../components/admin/OrdenCompraForm";
import {
  getOrdenesCompra,
  createOrdenCompra,
  updateOrdenCompra,
  activateOrdenCompra,
  deactivateOrdenCompra,
} from "../../services/OrdenCompraService";

const OrdenesCompra = () => {
  const [showModal, setShowModal] = useState(false);
  const [ordenes, setOrdenes] = useState([]);
  const [editingOrden, setEditingOrden] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrdenes();
  }, []);

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

  const handleActivate = async (orden) => {
    if (window.confirm(`¿Estás seguro de activar esta orden de compra?`)) {
      try {
        await activateOrdenCompra(orden.id);
        fetchOrdenes();
      } catch (error) {
        console.error("Error al activar orden:", error);
      }
    }
  };

  const handleDeactivate = async (orden) => {
    if (window.confirm(`¿Estás seguro de desactivar esta orden de compra?`)) {
      try {
        await deactivateOrdenCompra(orden.id);
        fetchOrdenes();
      } catch (error) {
        console.error("Error al desactivar orden:", error);
      }
    }
  };

  const filteredOrdenes = ordenes.filter(
    (orden) =>
      orden.unidad_serial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.numero_orden?.includes(searchTerm) ||
      orden.proveedor_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: "unidad_serial", label: "Unidad (Serial)" },
    {
      key: "tipo",
      label: "Tipo",
      render: (row) => (
        <span className="tipo-badge">
          {row.tipo === "compra_externa" ? "Compra Externa" : "Canje Cliente"}
        </span>
      ),
    },
    {
      key: "proveedor_nombre",
      label: "Proveedor/Cliente",
      render: (row) =>
        row.tipo === "compra_externa" ? row.proveedor_nombre : row.cliente_nombre,
    },
    { key: "numero_orden", label: "N° Orden" },
    {
      key: "costo_compra",
      label: "Costo Compra",
      render: (row) => `$${parseFloat(row.costo_compra).toFixed(2)}`,
    },
    {
      key: "impuesto_importacion",
      label: "Impuesto (2%)",
      render: (row) => `$${parseFloat(row.impuesto_importacion).toFixed(2)}`,
    },
    { key: "numero_tracking", label: "Seguimiento" },
    {
      key: "active",
      label: "Estado",
      render: (row) => (
        <span className={row.active ? "status-active" : "status-inactive"}>
          {row.active ? "Activo" : "Inactivo"}
        </span>
      ),
    },
  ];

  const stats = [
    {
      label: "Total Órdenes",
      count: ordenes.length,
      icon: <Package className="icon-card" />,
    },
    {
      label: "Órdenes Activas",
      count: ordenes.filter((o) => o.active).length,
      icon: <FaRegCheckCircle className="icon-card" />,
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
          placeholder="Buscar por serial, orden, proveedor o cliente..."
        />

        <CountCard stats={stats} />

        <DataTable
          columns={columns}
          data={filteredOrdenes}
          rowKey="id"
          onEdit={handleOpenModal}
          customActions={[
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

        {showModal && (
          <OrdenCompraForm
            onClose={handleCloseModal}
            onSubmit={handleSubmitOrden}
            orden={editingOrden}
          />
        )}
      </div>
    </section>
  );
};

export default OrdenesCompra;
