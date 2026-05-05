import React, { useEffect, useState } from "react";
import "../../styles/admin/dataTable.css";
import "../../styles/global.css";
import { ShoppingBag, ShoppingCart, FileSpreadsheet, List } from "lucide-react";
import { FaCheck, FaTimes } from "react-icons/fa";
import DataTable from "../../components/admin/DataTable";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import TitleCrud from "../../components/admin/TitleCrud";
import ProductoForm from "../../components/admin/ProductoForm";
import OrdenCompraForm from "../../components/admin/OrdenCompraForm";
import TypeFilterBar from "../../components/admin/TypeFilterBar";
import ConfirmModal from "../../components/admin/ConfirmModal";
import CargueMasivo from "./CargueMasivo";
import "../../styles/admin/cargueMasivo.css";

import {
  getProductos,
  createProducto,
  updateProducto,
  activateProducto,
  deactivateProducto,
} from "../../services/ProductoService";
import { getProductTypes } from "../../services/ProductTypeService";
import { createOrdenCompra } from "../../services/OrdenCompraService";

/**
 * Productos admin page.
 * Manages the Producto domain model.
 * Uses DataTable + ProductoForm inside ModalBase for CRUD.
 */
const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("");
  const [editingProducto, setEditingProducto] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showOrdenModal, setShowOrdenModal] = useState(false);
  const [selectedProductoForOrden, setSelectedProductoForOrden] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [activeTab, setActiveTab] = useState("catalogo"); // "catalogo" | "masivo"

  useEffect(() => {
    fetchProductos();
    fetchProductTypes();
  }, []);

  // Refetch when returning to the Catalogo tab so any product just created
  // via the bulk upload (or modified elsewhere) shows up immediately.
  useEffect(() => {
    if (activeTab === "catalogo") {
      fetchProductos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchProductos = async () => {
    try {
      const data = await getProductos();
      setProductos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando productos:", error);
    }
  };

  const fetchProductTypes = async () => {
    try {
      const data = await getProductTypes();
      const typesList = Array.isArray(data) ? data : (data.tipo_producto || []);
      setProductTypes(typesList);
    } catch (error) {
      console.error("Error cargando tipos de producto:", error);
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

  const handleOpenOrdenModal = (producto) => {
    setSelectedProductoForOrden(producto);
    setShowOrdenModal(true);
  };

  const handleCloseOrdenModal = () => {
    setSelectedProductoForOrden(null);
    setShowOrdenModal(false);
  };

  const handleCreateOrden = async (data, id) => {
    try {
      await createOrdenCompra(data);
      handleCloseOrdenModal();
      // Optionally refresh the list or show success message
      console.log("Orden de compra creada exitosamente");
    } catch (error) {
      console.error("Error al crear orden de compra:", error);
    }
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

  const handleActivate = (producto) => {
    setConfirmDialog({
      title: `¿Activar producto "${producto.nombre}"?`,
      message: "El producto volverá a estar disponible en el sistema.",
      confirmLabel: "Sí, activar",
      isDestructive: false,
      onConfirm: async () => {
        try {
          await activateProducto(producto.id);
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
      title: `¿Desactivar producto "${producto.nombre}"?`,
      message: "El producto quedará inactivo en el sistema.",
      confirmLabel: "Sí, desactivar",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deactivateProducto(producto.id);
          fetchProductos();
        } catch (error) {
          console.error("Error al desactivar producto:", error);
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  // Filter products by type
  const filteredProductos = selectedTypeFilter
    ? productos.filter(
        (p) => p.tipo_producto && p.tipo_producto.toString() === selectedTypeFilter
      )
    : productos;

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
      key: "imagenes",
      label: "Imágenes",
      render: (row) =>
        row.imagenes ? `${row.imagenes.length}` : "0",
    },
  ];

  const stats = [
    {
      label: "Productos",
      count: filteredProductos.length,
      icon: <ShoppingBag className="icon-card" />,
    },
    {
      label: "Activos",
      count: filteredProductos.filter((p) => p.active).length,
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

        {/* Tabs: catálogo CRUD vs cargue masivo desde Excel */}
        <div className="cm-tabs" style={{ marginTop: "0.25rem", marginBottom: "1.25rem" }}>
          <button
            className={`cm-tab ${activeTab === "catalogo" ? "active" : ""}`}
            onClick={() => setActiveTab("catalogo")}
          >
            <List size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
            Catálogo
          </button>
          <button
            className={`cm-tab ${activeTab === "masivo" ? "active" : ""}`}
            onClick={() => setActiveTab("masivo")}
          >
            <FileSpreadsheet size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
            Cargue masivo
          </button>
        </div>

        {activeTab === "catalogo" && (
          <>
            <SearchBox
              onRegisterClick={() => handleOpenModal()}
              registerLabel="Nuevo Producto"
            />

            {/* Filter by Product Type */}
            <TypeFilterBar
              productTypes={productTypes}
              productos={productos}
              selectedTypeFilter={selectedTypeFilter}
              onFilterChange={setSelectedTypeFilter}
            />

            <CountCard stats={stats} />

            <DataTable
              columns={columns}
              data={filteredProductos.filter((p) => p.active !== false)}
              rowKey="id"
              onEdit={handleOpenModal}
              customActions={[
                {
                  icon: ShoppingCart,
                  handler: handleOpenOrdenModal,
                  title: "Crear Orden de Compra",
                  show: (row) => true,
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
          </>
        )}

        {activeTab === "masivo" && <CargueMasivo onCommitted={fetchProductos} />}

        {showModal && (
          <ProductoForm
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
            producto={editingProducto}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        )}

        {showOrdenModal && selectedProductoForOrden && (
          <OrdenCompraForm
            onClose={handleCloseOrdenModal}
            onSubmit={handleCreateOrden}
            preselectedProducto={selectedProductoForOrden}
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

export default Productos;
