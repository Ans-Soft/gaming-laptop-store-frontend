import React, { useEffect, useState } from "react";
import "./../../styles/admin/dataTable.css";
import "./../../styles/global.css";
import { Sliders } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import { FaRegCheckCircle, FaCheck, FaTimes } from "react-icons/fa";
import TitleCrud from "../../components/admin/TitleCrud";
import ProductFieldsForm from "../../components/admin/ProductFieldsForm";
import ConfirmModal from "../../components/admin/ConfirmModal";
import {
  getProductFields,
  createProductField,
  updateProductField,
  activateProductField,
  deactivateProductField,
} from "../../services/ProductFieldService";

/**
 * Admin page for managing product fields (CampoProducto).
 * Provides full CRUD: list, create, edit, activate, deactivate.
 */
const ProductFields = () => {
  const [showModal, setShowModal] = useState(false);
  const [productFields, setProductFields] = useState([]);
  const [editingField, setEditingField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  useEffect(() => {
    fetchProductFields();
  }, []);

  const fetchProductFields = async () => {
    try {
      const data = await getProductFields();
      setProductFields(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener campos de producto:", error);
    }
  };

  const handleOpenModal = (field = null) => {
    setEditingField(field);
    setSubmitError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditingField(null);
    setSubmitError(null);
    setShowModal(false);
  };

  const handleSubmit = async (data, id) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (id) {
        await updateProductField(id, data);
      } else {
        await createProductField(data);
      }
      handleCloseModal();
      fetchProductFields();
    } catch (error) {
      console.error("Error al guardar campo de producto:", error);
      const errorMessage =
        error.response?.data?.message || "Ocurrió un error inesperado.";
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivate = (field) => {
    setConfirmDialog({
      title: `¿Activar el campo "${field.nombre}"?`,
      message: "El campo volverá a estar disponible en el sistema.",
      confirmLabel: "Sí, activar",
      isDestructive: false,
      onConfirm: async () => {
        try {
          await activateProductField(field.id);
          fetchProductFields();
        } catch (error) {
          console.error("Error al activar campo de producto:", error);
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleDeactivate = (field) => {
    setConfirmDialog({
      title: `¿Desactivar el campo "${field.nombre}"?`,
      message: "El campo quedará inactivo en el sistema.",
      confirmLabel: "Sí, desactivar",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deactivateProductField(field.id);
          fetchProductFields();
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || "No se pudo desactivar el campo de producto.";
          alert(errorMessage);
          console.error("Error al desactivar campo de producto:", error);
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const columns = [
    { key: "nombre", label: "Nombre" },
    {
      key: "tipo_display",
      label: "Tipo",
      render: (row) => row.tipo_display || row.tipo || "—",
    },
  ];

  const stats = [
    {
      label: "Total Campos",
      count: productFields.length,
      icon: <Sliders className="icon-card" />,
    },
    {
      label: "Campos Activos",
      count: productFields.filter((f) => f.active).length,
      icon: <FaRegCheckCircle className="icon-card" />,
    },
  ];

  return (
    <section>
      <div className="table-container">
        <TitleCrud
          title="Gestión de Campos de Producto"
          icon={Sliders}
          description="Administra los campos descriptivos disponibles para los productos"
        />

        <SearchBox
          onRegisterClick={() => handleOpenModal()}
          registerLabel="Registrar Campo de Producto"
        />

        <CountCard stats={stats} />

        <DataTable
          columns={columns}
          data={productFields.filter((f) => f.active !== false)}
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
          <ProductFieldsForm
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
            productField={editingField}
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

export default ProductFields;
