import React, { useEffect, useState } from "react";
import "./../../styles/admin/dataTable.css";
import "./../../styles/global.css";
import { Package } from "lucide-react";
import { FaCheck, FaTimes } from "react-icons/fa";
import DataTable from "../../components/admin/DataTable";
import DashboardHeader from "../../components/admin/DashboardHeader";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import TitleCrud from "../../components/admin/TitleCrud";

import BaseProductsForm from "../../components/admin/BaseProductsForm";
import ModalBase from "../../components/admin/ModalBase";

import {
  getBaseProducts,
  createBaseProduct,
  updateBaseProduct,
  activateBaseProduct,
  deactivateBaseProduct,
} from "../../services/BaseProduct";

const BaseProducts = () => {
  const [showModal, setShowModal] = useState(false);
  const [showTypeSelection, setShowTypeSelection] = useState(false);
  const [productType, setProductType] = useState(null);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

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
        // Formatear el mensaje de error para mostrarlo
        const formattedError = Object.entries(errors)
          .map(([key, value]) => `${key}: ${value.join(", ")}`)
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

  const handleSelectProductType = (type) => {
    setProductType(type);
    setShowTypeSelection(false);
    setShowModal(true);
  };

  const handleGoBack = () => {
    setShowModal(false);
    setShowTypeSelection(true);
  };

  const handleDeactivate = async (product) => {
    if (window.confirm(`¿Desactivar producto base ${product.model_name}?`)) {
      await deactivateBaseProduct(product.id);
      fetchProducts();
    }
  };

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
      <DashboardHeader />

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

        {showTypeSelection && (
          <ModalBase
            title="Seleccionar Tipo de Producto"
            onClose={() => setShowTypeSelection(false)}
          >
            <div
              className="type-selection"
              style={{
                display: "flex",
                gap: "20px",
                justifyContent: "center",
                marginTop: "20px",
              }}
            >
              <button
                className="type-selection-button"
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
                  width: "200px", // Fixed width
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
                className="type-selection-button"
                onClick={() => handleSelectProductType("Laptop")}
                style={{
                  padding: "15px 30px",
                  border: "2px solid #007bff", // Same border color
                  borderRadius: "8px",
                  background: "#007bff", // Same background color
                  color: "white",
                  fontSize: "1.1em",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  width: "200px", // Fixed width
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "#0056b3"; // Same hover color
                  e.currentTarget.style.borderColor = "#0056b3"; // Same hover color
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#007bff"; // Same normal color
                  e.currentTarget.style.borderColor = "#007bff"; // Same normal color
                }}
              >
                Laptop
              </button>
            </div>
          </ModalBase>
        )}

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
      </div>
    </section>
  );
};

export default BaseProducts;
