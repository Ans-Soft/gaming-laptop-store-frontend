import React, { useEffect, useState } from "react";
import "./../../styles/admin/dataTable.css";
import "./../../styles/global.css";
import { Package, Tag } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import { FaRegCheckCircle, FaCheck, FaTimes } from "react-icons/fa";
import TitleCrud from "../../components/admin/TitleCrud";
import ProductTypesForm from "../../components/admin/ProductTypesForm";
import {
  getProductTypes,
  getProductTypeDetail,
  createProductType,
  updateProductType,
  activateProductType,
  deactivateProductType,
} from "../../services/ProductTypeService";

/**
 * Admin page for managing product types (TipoProducto).
 * Provides full CRUD: list, create, edit (with integrated field associations),
 * activate, and deactivate.
 *
 * When editing, the detail endpoint is called first to pre-populate the
 * associated campos in the form.
 */
const ProductTypes = () => {
  const [showModal, setShowModal] = useState(false);
  const [productTypes, setProductTypes] = useState([]);
  const [editingProductType, setEditingProductType] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    fetchProductTypes();
  }, []);

  const fetchProductTypes = async () => {
    try {
      const data = await getProductTypes();
      setProductTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener tipos de producto:", error);
    }
  };

  /**
   * Open the create modal (productType = null) or the edit modal.
   * For edit mode the detail endpoint is called to include the campos array
   * so the form can pre-select the already associated fields.
   */
  const handleOpenModal = async (productType = null) => {
    setSubmitError(null);

    if (productType) {
      try {
        const detail = await getProductTypeDetail(productType.id);
        setEditingProductType(detail.tipo_producto ?? detail);
      } catch (error) {
        console.error("Error al cargar detalle del tipo de producto:", error);
        // Fall back to the list data (no campos pre-populated)
        setEditingProductType(productType);
      }
    } else {
      setEditingProductType(null);
    }

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditingProductType(null);
    setSubmitError(null);
    setShowModal(false);
  };

  const handleSubmit = async (data, id) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (id) {
        await updateProductType(id, data);
      } else {
        await createProductType(data);
      }
      handleCloseModal();
      fetchProductTypes();
    } catch (error) {
      console.error("Error al guardar tipo de producto:", error);
      const errorMessage =
        error.response?.data?.message || "Ocurrió un error inesperado.";
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivate = async (productType) => {
    if (window.confirm(`¿Activar el tipo de producto "${productType.nombre}"?`)) {
      try {
        await activateProductType(productType.id);
        fetchProductTypes();
      } catch (error) {
        console.error("Error al activar tipo de producto:", error);
      }
    }
  };

  const handleDeactivate = async (productType) => {
    if (window.confirm(`¿Desactivar el tipo de producto "${productType.nombre}"?`)) {
      try {
        await deactivateProductType(productType.id);
        fetchProductTypes();
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "No se pudo desactivar el tipo de producto.";
        alert(errorMessage);
        console.error("Error al desactivar tipo de producto:", error);
      }
    }
  };

  const columns = [
    { key: "nombre", label: "Nombre" },
    {
      key: "descripcion",
      label: "Descripción",
      render: (row) => row.descripcion || "—",
    },
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
      label: "Total Tipos",
      count: productTypes.length,
      icon: <Package className="icon-card" />,
    },
    {
      label: "Tipos Activos",
      count: productTypes.filter((pt) => pt.active).length,
      icon: <FaRegCheckCircle className="icon-card" />,
    },
  ];

  return (
    <section>
      <div className="table-container">
        <TitleCrud
          title="Gestión de Tipos de Producto"
          icon={Tag}
          description="Administra los tipos de producto disponibles"
        />

        <SearchBox
          onRegisterClick={() => handleOpenModal()}
          registerLabel="Registrar Tipo de Producto"
        />

        <CountCard stats={stats} />

        <DataTable
          columns={columns}
          data={productTypes}
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
          <ProductTypesForm
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
            productType={editingProductType}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        )}
      </div>
    </section>
  );
};

export default ProductTypes;
