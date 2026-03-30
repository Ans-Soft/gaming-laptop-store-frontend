import React, { useEffect, useState } from "react";
import "./../../styles/admin/dataTable.css";
import "./../../styles/global.css";
import { Truck } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import { FaRegCheckCircle, FaCheck, FaTimes } from "react-icons/fa";
import TitleCrud from "../../components/admin/TitleCrud";
import SuppliersForm from "../../components/admin/SuppliersForm";
import ConfirmModal from "../../components/admin/ConfirmModal";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  activateSupplier,
  deactivateSupplier,
} from "../../services/SupplierService";

/**
 * Admin page for managing suppliers (Proveedor).
 * Provides full CRUD: list, create, edit, activate, and deactivate.
 * Deactivation is blocked by the API when active variants reference the supplier.
 */
const Suppliers = () => {
  const [showModal, setShowModal] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const data = await getSuppliers();
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
    }
  };

  const handleOpenModal = (supplier = null) => {
    setEditingSupplier(supplier);
    setSubmitError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditingSupplier(null);
    setSubmitError(null);
    setShowModal(false);
  };

  const handleSubmit = async (data, id) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (id) {
        await updateSupplier(id, data);
      } else {
        await createSupplier(data);
      }
      handleCloseModal();
      fetchSuppliers();
    } catch (error) {
      console.error("Error al guardar proveedor:", error);
      const errorMessage =
        error.response?.data?.message || "Ocurrió un error inesperado.";
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivate = (supplier) => {
    setConfirmDialog({
      title: `¿Activar el proveedor "${supplier.nombre}"?`,
      message: "El proveedor volverá a estar disponible en el sistema.",
      confirmLabel: "Sí, activar",
      isDestructive: false,
      onConfirm: async () => {
        try {
          await activateSupplier(supplier.id);
          fetchSuppliers();
        } catch (error) {
          console.error("Error al activar proveedor:", error);
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleDeactivate = (supplier) => {
    setConfirmDialog({
      title: `¿Desactivar el proveedor "${supplier.nombre}"?`,
      message: "El proveedor quedará inactivo en el sistema.",
      confirmLabel: "Sí, desactivar",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deactivateSupplier(supplier.id);
          fetchSuppliers();
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || "No se pudo desactivar el proveedor.";
          alert(errorMessage);
          console.error("Error al desactivar proveedor:", error);
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const columns = [
    { key: "nombre", label: "Nombre" },
    { key: "slug", label: "Slug" },
  ];

  const stats = [
    {
      label: "Total Proveedores",
      count: suppliers.length,
      icon: <Truck className="icon-card" />,
    },
    {
      label: "Proveedores Activos",
      count: suppliers.filter((s) => s.active).length,
      icon: <FaRegCheckCircle className="icon-card" />,
    },
  ];

  return (
    <section>
      <div className="table-container">
        <TitleCrud
          title="Gestión de Proveedores"
          icon={Truck}
          description="Administra los proveedores disponibles para las variantes de producto"
        />

        <SearchBox
          onRegisterClick={() => handleOpenModal()}
          registerLabel="Registrar Proveedor"
        />

        <CountCard stats={stats} />

        <DataTable
          columns={columns}
          data={suppliers.filter((s) => s.active !== false)}
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
          <SuppliersForm
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
            supplier={editingSupplier}
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

export default Suppliers;
