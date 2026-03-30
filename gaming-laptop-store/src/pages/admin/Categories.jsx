import React, { useEffect, useState } from "react";
import "./../../styles/admin/dataTable.css";
import "./../../styles/global.css";
import { Package, Tag } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import { FaRegCheckCircle, FaCheck, FaTimes } from "react-icons/fa";
import TitleCrud from "../../components/admin/TitleCrud";
import CategoriesForm from "../../components/admin/CategoriesForm";
import ConfirmModal from "../../components/admin/ConfirmModal";

import {
  getCategories,
  createCategory,
  updateCategory,
  activateCategory,
  deactivateCategory,
} from "../../services/CategoryService";

const Categories = () => {
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
    }
  };

  const handleOpenModal = (category = null) => {
    setEditingCategory(category);
    setSubmitError(null); 
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditingCategory(null);
    setSubmitError(null);
    setShowModal(false);
  };

  const handleSubmitCategory = async (data, id) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (id) {
        await updateCategory(id, data);
      } else {
        await createCategory(data);
      }
      handleCloseModal();
      fetchCategories();
    } catch (error) {
      console.error("Error al guardar categoría:", error);
      const errorMessage =
        error.response?.data?.message || "Ocurrió un error inesperado.";
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivate = (category) => {
    setConfirmDialog({
      title: `¿Activar la categoría ${category.name}?`,
      message: "La categoría volverá a estar disponible en el sistema.",
      confirmLabel: "Sí, activar",
      isDestructive: false,
      onConfirm: async () => {
        try {
          await activateCategory(category.id);
          fetchCategories();
        } catch (error) {
          console.error("Error:", error);
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleDeactivate = (category) => {
    setConfirmDialog({
      title: `¿Desactivar la categoría ${category.name}?`,
      message: "La categoría quedará inactiva en el sistema.",
      confirmLabel: "Sí, desactivar",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deactivateCategory(category.id);
          fetchCategories();
        } catch (error) {
          console.error("Error:", error);
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const columns = [
    { key: "name", label: "Nombre" },
    { key: "slug", label: "Slug" },
  ];

  const stats = [
    {
      label: "Total Categorías",
      count: categories.length,
      icon: <Package className="icon-card" />,
    },
    {
      label: "Categorías Activas",
      count: categories.filter((c) => c.active).length,
      icon: <FaRegCheckCircle className="icon-card" />,
    },
  ];

  return (
    <section>
      <div className="table-container ">
        <TitleCrud
          title="Gestión de Categorías"
          icon={Tag}
          description="Administra las categorías disponibles"
        />

        <SearchBox
          onRegisterClick={() => handleOpenModal()}
          registerLabel="Registrar Categoría"
        />

        <CountCard stats={stats} />

        <DataTable
          columns={columns}
          data={categories.filter((c) => c.active !== false)}
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
          <CategoriesForm
            onClose={handleCloseModal}
            onSubmit={handleSubmitCategory}
            category={editingCategory}
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

export default Categories;
