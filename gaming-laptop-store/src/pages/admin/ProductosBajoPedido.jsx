import React, { useEffect, useState } from "react";
import "./../../styles/admin/dataTable.css";
import "./../../styles/global.css";
import { Clock, Package } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import { FaRegCheckCircle, FaCheck, FaTimes } from "react-icons/fa";
import TitleCrud from "../../components/admin/TitleCrud";
import ProductoBajoPedidoForm from "../../components/admin/ProductoBajoPedidoForm";
import {
  getProductosBajoPedido,
  createProductoBajoPedido,
  updateProductoBajoPedido,
  activateProductoBajoPedido,
  deactivateProductoBajoPedido,
} from "../../services/ProductoBajoPedidoService";

const ProductosBajoPedido = () => {
  const [showModal, setShowModal] = useState(false);
  const [productos, setProductos] = useState([]);
  const [editingProducto, setEditingProducto] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const data = await getProductosBajoPedido();
      setProductos(data.producto_bajo_pedido || data);
    } catch (error) {
      console.error("Error al obtener productos bajo pedido:", error);
    }
  };

  const handleOpenModal = (producto = null) => {
    setEditingProducto(producto);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditingProducto(null);
    setShowModal(false);
  };

  const handleSubmitProducto = async (data, id) => {
    try {
      if (id) {
        await updateProductoBajoPedido(id, data);
      } else {
        await createProductoBajoPedido(data);
      }
      handleCloseModal();
      fetchProductos();
    } catch (error) {
      console.error("Error al guardar producto:", error);
    }
  };

  const handleActivate = async (producto) => {
    if (window.confirm(`¿Estás seguro de activar este producto bajo pedido?`)) {
      try {
        await activateProductoBajoPedido(producto.id);
        fetchProductos();
      } catch (error) {
        console.error("Error al activar producto:", error);
      }
    }
  };

  const handleDeactivate = async (producto) => {
    if (window.confirm(`¿Estás seguro de desactivar este producto bajo pedido?`)) {
      try {
        await deactivateProductoBajoPedido(producto.id);
        fetchProductos();
      } catch (error) {
        console.error("Error al desactivar producto:", error);
      }
    }
  };

  const filteredProductos = productos.filter(
    (p) =>
      p.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.variante_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: "cliente_nombre", label: "Cliente" },
    { key: "variante_nombre", label: "Producto" },
    {
      key: "valor_abono",
      label: "Valor Abono",
      render: (row) => `$${parseFloat(row.valor_abono).toFixed(2)}`,
    },
    { key: "fecha_maxima_compra", label: "Fecha Máxima" },
    {
      key: "estado",
      label: "Estado",
      render: (row) => (
        <span
          className={
            row.estado === "completada"
              ? "status-active"
              : "status-inactive"
          }
        >
          {row.estado.charAt(0).toUpperCase() + row.estado.slice(1)}
        </span>
      ),
    },
    {
      key: "active",
      label: "Activo",
      render: (row) => (
        <span className={row.active ? "status-active" : "status-inactive"}>
          {row.active ? "Sí" : "No"}
        </span>
      ),
    },
  ];

  const stats = [
    {
      label: "Total Productos BP",
      count: productos.length,
      icon: <Package className="icon-card" />,
    },
    {
      label: "Por Comprar",
      count: productos.filter((p) => p.estado === "por_comprar").length,
      icon: <FaRegCheckCircle className="icon-card" />,
    },
  ];

  return (
    <section>
      <div className="table-container">
        <TitleCrud
          title="Gestión de Productos Bajo Pedido"
          icon={Clock}
          description="Administra los pedidos de clientes para comprar productos"
        />

        <SearchBox
          onRegisterClick={() => handleOpenModal()}
          registerLabel="Registrar Nuevo Producto BP"
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por cliente o producto..."
        />

        <CountCard stats={stats} />

        <DataTable
          columns={columns}
          data={filteredProductos}
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
          <ProductoBajoPedidoForm
            onClose={handleCloseModal}
            onSubmit={handleSubmitProducto}
            producto={editingProducto}
          />
        )}
      </div>
    </section>
  );
};

export default ProductosBajoPedido;
