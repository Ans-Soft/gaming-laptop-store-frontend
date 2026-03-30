import React, { useEffect, useState } from "react";
import "../../styles/admin/dataTable.css";
import "../../styles/global.css";
import { Package } from "lucide-react";
import { FaRegCheckCircle, FaCheck, FaTimes } from "react-icons/fa";
import DataTable from "../../components/admin/DataTable";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import TitleCrud from "../../components/admin/TitleCrud";

import ProductsForm from "../../components/admin/ProductsForm";
import ConfirmModal from "../../components/admin/ConfirmModal";

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
  const [confirmDialog, setConfirmDialog] = useState(null);

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

  const handleActivate = (variant) => {
    setConfirmDialog({
      title: `¿Activar variante ${variant.id}?`,
      message: "La variante volverá a estar disponible en el sistema.",
      confirmLabel: "Sí, activar",
      isDestructive: false,
      onConfirm: async () => {
        try {
          await activateProductVariant(variant.id);
          fetchVariants();
        } catch (error) {
          console.error("Error al activar variante:", error);
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleDeactivate = (variant) => {
    setConfirmDialog({
      title: `¿Desactivar variante ${variant.id}?`,
      message: "La variante quedará inactiva en el sistema.",
      confirmLabel: "Sí, desactivar",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deactivateProductVariant(variant.id);
          fetchVariants();
        } catch (error) {
          console.error("Error al desactivar variante:", error);
        } finally {
          setConfirmDialog(null);
        }
      },
    });
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
          data={variants.filter((v) => v.active !== false)}
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

export default Products;
