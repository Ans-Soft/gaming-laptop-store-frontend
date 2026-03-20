import React, { useEffect, useState } from "react";
import "../../styles/admin/dataTable.css";
import "../../styles/global.css";
import { ShoppingBag } from "lucide-react";
import { FaCheck, FaTimes } from "react-icons/fa";
import DataTable from "../../components/admin/DataTable";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import TitleCrud from "../../components/admin/TitleCrud";
import ProductoForm from "../../components/admin/ProductoForm";

import {
  getProductos,
  createProducto,
  updateProducto,
  activateProducto,
  deactivateProducto,
} from "../../services/ProductoService";

/**
 * Productos admin page.
 * Manages the Producto domain model.
 * Uses DataTable + ProductoForm inside ModalBase for CRUD.
 */
const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [editingProducto, setEditingProducto] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const data = await getProductos();
      setProductos(data);
    } catch (error) {
      console.error("Error cargando productos:", error);
    }
  };

  const handleOpenModal = (producto = null) => {
    setEditingProducto(producto);
    setSubmitError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditingProducto(null);
    setSubmitError(null);
    setShowModal(false);
  };

  const handleSubmit = async (formData, id) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (id) {
        await updateProducto(id, formData);
      } else {
        await createProducto(formData);
      }
      handleCloseModal();
      fetchProductos();
    } catch (error) {
      console.error("Error al guardar producto:", error);
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

  const handleActivate = async (producto) => {
    if (window.confirm(`Activar producto "${producto.nombre}"?`)) {
      try {
        await activateProducto(producto.id);
        fetchProductos();
      } catch (error) {
        console.error("Error al activar producto:", error);
      }
    }
  };

  const handleDeactivate = async (producto) => {
    if (window.confirm(`Desactivar producto "${producto.nombre}"?`)) {
      try {
        await deactivateProducto(producto.id);
        fetchProductos();
      } catch (error) {
        console.error("Error al desactivar producto:", error);
      }
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "nombre", label: "Nombre" },
    {
      key: "marca_nombre",
      label: "Marca",
    },
    {
      key: "tipo_producto_nombre",
      label: "Tipo",
    },
    {
      key: "categorias_data",
      label: "Categorias",
      render: (row) =>
        row.categorias_data && row.categorias_data.length > 0
          ? row.categorias_data.map((c) => c.name).join(", ")
          : "-",
    },
    {
      key: "imagenes",
      label: "Imagenes",
      render: (row) =>
        row.imagenes ? `${row.imagenes.length}` : "0",
    },
    {
      key: "active",
      label: "Estado",
      render: (row) => (
        <span
          style={{
            display: "inline-block",
            padding: "0.35rem 0.75rem",
            borderRadius: "20px",
            fontSize: "0.8rem",
            fontWeight: "600",
            backgroundColor: row.active ? "#d1fae5" : "#fee2e2",
            color: row.active ? "#065f46" : "#991b1b",
          }}
        >
          {row.active ? "Activo" : "Inactivo"}
        </span>
      ),
    },
  ];

  const stats = [
    {
      label: "Productos",
      count: productos.length,
      icon: <ShoppingBag className="icon-card" />,
    },
    {
      label: "Activos",
      count: productos.filter((p) => p.active).length,
      icon: <ShoppingBag className="icon-card" />,
    },
  ];

  return (
    <section>
      <div className="table-container">
        <TitleCrud
          title="Productos"
          icon={ShoppingBag}
          description="Administra el catalogo de productos"
        />

        <SearchBox
          onRegisterClick={() => handleOpenModal()}
          registerLabel="Nuevo Producto"
        />

        <CountCard stats={stats} />

        <DataTable
          columns={columns}
          data={productos}
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
          <ProductoForm
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
            producto={editingProducto}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        )}
      </div>
    </section>
  );
};

export default Productos;
