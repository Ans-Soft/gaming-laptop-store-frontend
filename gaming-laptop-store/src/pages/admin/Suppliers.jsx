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

  const handleActivate = async (supplier) => {
    if (window.confirm(`¿Activar el proveedor "${supplier.nombre}"?`)) {
      try {
        await activateSupplier(supplier.id);
        fetchSuppliers();
      } catch (error) {
        console.error("Error al activar proveedor:", error);
      }
    }
  };

  const handleDeactivate = async (supplier) => {
    if (window.confirm(`¿Desactivar el proveedor "${supplier.nombre}"?`)) {
      try {
        await deactivateSupplier(supplier.id);
        fetchSuppliers();
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "No se pudo desactivar el proveedor.";
        alert(errorMessage);
        console.error("Error al desactivar proveedor:", error);
      }
    }
  };

  const columns = [
    { key: "nombre", label: "Nombre" },
    { key: "slug", label: "Slug" },
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
          data={suppliers}
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
      </div>
    </section>
  );
};

export default Suppliers;
