import React, { useEffect, useState } from "react";
import "./../../styles/admin/dataTable.css";
import "./../../styles/global.css";
import { Package } from "lucide-react";
import { FaCheck, FaTimes, FaPlus, FaRegEye } from "react-icons/fa";
import DataTable from "../../components/admin/DataTable";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import TitleCrud from "../../components/admin/TitleCrud";

import BaseProductsForm from "../../components/admin/BaseProductsForm";
import ProductsForm from "../../components/admin/ProductsForm";
import VariantsList from "../../components/admin/VariantsList";
import ModalBase from "../../components/admin/ModalBase";

import {
  getBaseProducts,
  createBaseProduct,
  updateBaseProduct,
  activateBaseProduct,
  deactivateBaseProduct,
} from "../../services/BaseProduct";

import { createProductVariant } from "../../services/ProductVariant";

const BaseProducts = () => {
  // ── Base product CRUD state ─────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [showTypeSelection, setShowTypeSelection] = useState(false);
  const [productType, setProductType] = useState(null);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // ── Quick-create variant state ──────────────────────────────────────────────
  const [showQuickVariantModal, setShowQuickVariantModal] = useState(false);
  const [selectedProductForVariant, setSelectedProductForVariant] = useState(null);
  const [isVariantSubmitting, setIsVariantSubmitting] = useState(false);
  const [variantSubmitError, setVariantSubmitError] = useState(null);

  // ── View variants list state ────────────────────────────────────────────────
  const [showVariantsListModal, setShowVariantsListModal] = useState(false);
  const [selectedProductForList, setSelectedProductForList] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getBaseProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error al obtener productos base:", error);
    }
  };

  // ── Base product handlers ───────────────────────────────────────────────────

  const handleOpenModal = (product = null) => {
    setEditingProduct(product);
    setSubmitError(null);

    if (product) {
      setShowModal(true);
    } else {
      setShowTypeSelection(true);
    }
  };

  const handleCloseModal = () => {
    setEditingProduct(null);
    setSubmitError(null);
    setShowModal(false);
    setProductType(null);
  };

  const handleSubmitProduct = async (data, id) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (id) {
        await updateBaseProduct(id, data);
      } else {
        await createBaseProduct(data);
      }
      handleCloseModal();
      fetchProducts();
    } catch (error) {
      console.error("❌ Error al guardar producto base:", error);
      const errors = error.response?.data;
      if (errors) {
        const formattedError = Object.entries(errors)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
          .join("; ");
        setSubmitError(formattedError);
      } else {
        setSubmitError("Ocurrió un error inesperado.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivate = async (product) => {
    if (window.confirm(`¿Activar producto base ${product.model_name}?`)) {
      await activateBaseProduct(product.id);
      fetchProducts();
    }
  };

  const handleDeactivate = async (product) => {
    if (window.confirm(`¿Desactivar producto base ${product.model_name}?`)) {
      await deactivateBaseProduct(product.id);
      fetchProducts();
    }
  };

  const handleSelectProductType = (type) => {
    setProductType(type);
    setShowTypeSelection(false);
    setShowModal(true);
  };

  const handleGoBack = () => {
    setShowModal(false);
    setShowTypeSelection(true);
  };

  // ── Quick-create variant handlers ───────────────────────────────────────────

  const handleQuickCreateVariant = (product) => {
    setSelectedProductForVariant(product);
    setVariantSubmitError(null);
    setShowQuickVariantModal(true);
  };

  const handleCloseQuickVariant = () => {
    setShowQuickVariantModal(false);
    setSelectedProductForVariant(null);
    setVariantSubmitError(null);
  };

  const handleSubmitQuickVariant = async (data) => {
    setIsVariantSubmitting(true);
    setVariantSubmitError(null);
    try {
      await createProductVariant(data);
      handleCloseQuickVariant();
    } catch (error) {
      console.error("Error al crear variante:", error);
      const errors = error.response?.data;
      if (errors) {
        const formattedError = Object.entries(errors)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
          .join("; ");
        setVariantSubmitError(formattedError);
      } else {
        setVariantSubmitError("Ocurrió un error inesperado.");
      }
    } finally {
      setIsVariantSubmitting(false);
    }
  };

  // ── View variants list handlers ─────────────────────────────────────────────

  const handleViewVariants = (product) => {
    setSelectedProductForList(product);
    setShowVariantsListModal(true);
  };

  const handleCloseVariantsList = () => {
    setShowVariantsListModal(false);
    setSelectedProductForList(null);
  };

  // ── Table config ────────────────────────────────────────────────────────────

  const columns = [
    { key: "model_name", label: "Modelo" },
    { key: "long_description", label: "Descripción" },
    { key: "brand", label: "Marca", render: (row) => row.brand?.name },
  ];

  const stats = [
    {
      label: "Productos Base",
      count: products.length,
      icon: <Package className="icon-card" />,
    },
  ];

  return (
    <section>
      <div className="table-container">
        <TitleCrud
          title="Productos Base"
          icon={Package}
          description="Administra los productos base"
        />

        <SearchBox
          onRegisterClick={() => handleOpenModal()}
          registerLabel="Nuevo Producto Base"
        />

        <CountCard stats={stats} />

        <DataTable
          columns={columns}
          data={products}
          rowKey="id"
          onEdit={handleOpenModal}
          customActions={[
            {
              icon: FaPlus,
              handler: handleQuickCreateVariant,
              show: (row) => row.active,
              title: "Agregar variante",
            },
            {
              icon: FaRegEye,
              handler: handleViewVariants,
              show: () => true,
              title: "Ver variantes",
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

        {/* Product type selection */}
        {showTypeSelection && (
          <ModalBase
            title="Seleccionar Tipo de Producto"
            onClose={() => setShowTypeSelection(false)}
          >
            <div
              style={{
                display: "flex",
                gap: "20px",
                justifyContent: "center",
                marginTop: "20px",
              }}
            >
              <button
                onClick={() => handleSelectProductType("Tarjeta gráfica")}
                style={{
                  padding: "15px 30px",
                  border: "2px solid #007bff",
                  borderRadius: "8px",
                  background: "#007bff",
                  color: "white",
                  fontSize: "1.1em",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  width: "200px",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "#0056b3";
                  e.currentTarget.style.borderColor = "#0056b3";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#007bff";
                  e.currentTarget.style.borderColor = "#007bff";
                }}
              >
                Tarjeta gráfica
              </button>
              <button
                onClick={() => handleSelectProductType("Laptop")}
                style={{
                  padding: "15px 30px",
                  border: "2px solid #007bff",
                  borderRadius: "8px",
                  background: "#007bff",
                  color: "white",
                  fontSize: "1.1em",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  width: "200px",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "#0056b3";
                  e.currentTarget.style.borderColor = "#0056b3";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#007bff";
                  e.currentTarget.style.borderColor = "#007bff";
                }}
              >
                Laptop
              </button>
            </div>
          </ModalBase>
        )}

        {/* Edit / create base product */}
        {showModal && (
          <BaseProductsForm
            onClose={handleCloseModal}
            onSubmit={handleSubmitProduct}
            product={editingProduct}
            productType={productType}
            onBack={handleGoBack}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        )}

        {/* Quick-create variant */}
        {showQuickVariantModal && selectedProductForVariant && (
          <ProductsForm
            onClose={handleCloseQuickVariant}
            onSubmit={handleSubmitQuickVariant}
            isSubmitting={isVariantSubmitting}
            submitError={variantSubmitError}
            lockedBaseProduct={selectedProductForVariant}
          />
        )}

        {/* View variants list */}
        {showVariantsListModal && selectedProductForList && (
          <VariantsList
            baseProduct={selectedProductForList}
            onClose={handleCloseVariantsList}
          />
        )}
      </div>
    </section>
  );
};

export default BaseProducts;
