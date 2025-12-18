import React, { useEffect, useState } from "react";
import "../../styles/admin/dataTable.css";
import "../../styles/global.css";
import { Package } from "lucide-react";
import { FaRegCheckCircle, FaCheck, FaTimes } from "react-icons/fa";
import DataTable from "../../components/admin/DataTable";
import DashboardHeader from "../../components/admin/DashboardHeader";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import TitleCrud from "../../components/admin/TitleCrud";

import ProductsForm from "../../components/admin/ProductsForm";

import {
  getProductVariants,
  createProductVariant,
  updateProductVariant,
  activateProductVariant,
  deactivateProductVariant,
} from "../../services/ProductVariant";

//  Función para formatear dinero en COP
const formatMoney = (value) => {
  if (!value && value !== 0) return "";
  return value.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  });
};

const Products = () => {
  const [showModal, setShowModal] = useState(false);
  const [variants, setVariants] = useState([]);
  const [editingVariant, setEditingVariant] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    fetchVariants();
  }, []);

  const fetchVariants = async () => {
    try {
      const data = await getProductVariants();
      setVariants(data);
    } catch (error) {
      console.error("Error cargando variantes:", error);
    }
  };

  const handleOpenModal = (variant = null) => {
    setEditingVariant(variant);
    setSubmitError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditingVariant(null);
    setSubmitError(null);
    setShowModal(false);
  };

  const handleSubmitVariant = async (data, id) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      id
        ? await updateProductVariant(id, data)
        : await createProductVariant(data);
      handleCloseModal();
      fetchVariants();
    } catch (error) {
      const errors = error.response?.data;

      if (errors) {
        const formatted = Object.entries(errors)
          .map(([k, v]) => `${k}: ${v.join(", ")}`)
          .join("; ");
        setSubmitError(formatted);
      } else {
        setSubmitError("Ocurrió un error inesperado.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivate = async (variant) => {
    if (window.confirm(`¿Activar variante ${variant.id}?`)) {
      await activateProductVariant(variant.id);
      fetchVariants();
    }
  };

  const handleDeactivate = async (variant) => {
    if (window.confirm(`¿Desactivar variante ${variant.id}?`)) {
      await deactivateProductVariant(variant.id);
      fetchVariants();
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    {
      key: "base_product",
      label: "Producto Base",
      render: (row) => row.base_product?.model_name,
    },
    { key: "condition", label: "Condición" },
    { key: "stock_status", label: "Stock" },

    //  Formato de dinero
    {
      key: "price",
      label: "Precio",
      render: (row) => formatMoney(row.price),
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
      label: "Variantes",
      count: variants.length,
      icon: <Package className="icon-card" />,
    },
    {
      label: "Productos Activas",
      count: variants.filter((b) => b.active).length,
      icon: <FaRegCheckCircle className="icon-card" />,
    },
  ];

  return (
    <section>
      <DashboardHeader />

      <div className="table-container">
        <TitleCrud
          title="Variantes de Producto"
          icon={Package}
          description="Administra las variantes de cada producto"
        />

        <SearchBox
          onRegisterClick={() => handleOpenModal()}
          registerLabel="Nueva Variante"
        />

        <CountCard stats={stats} />

        <DataTable
          columns={columns}
          data={variants}
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
          <ProductsForm
            onClose={handleCloseModal}
            onSubmit={handleSubmitVariant}
            variant={editingVariant}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        )}
      </div>
    </section>
  );
};

export default Products;
