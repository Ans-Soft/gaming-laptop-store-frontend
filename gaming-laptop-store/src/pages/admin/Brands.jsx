import React, { useEffect, useState } from "react";
import "./../../styles/admin/dataTable.css";
import "./../../styles/global.css";
import { Package, Tag } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import { FaRegCheckCircle, FaCheck, FaTimes } from "react-icons/fa";
import TitleCrud from "../../components/admin/TitleCrud";
import BrandsForm from "../../components/admin/BrandsForm";
import ConfirmModal from "../../components/admin/ConfirmModal";
import {
  getBrands,
  createBrand,
  updateBrand,
  activateBrand,
  deactivateBrand,
} from "../../services/BrandService";

const Brands = () => {
  const [showModal, setShowModal] = useState(false);
  const [brands, setBrands] = useState([]);
  const [editingBrand, setEditingBrand] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const data = await getBrands();
      setBrands(data);
    } catch (error) {
      console.error("Error al obtener marcas:", error);
    }
  };

  const handleOpenModal = (brand = null) => {
    setEditingBrand(brand);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditingBrand(null);
    setShowModal(false);
  };

  const handleSubmitBrand = async (data, id) => {
    try {
      if (id) {
        await updateBrand(id, data);
      } else {
        await createBrand(data);
      }
      handleCloseModal();
      fetchBrands();
    } catch (error) {
      console.error("Error al guardar marca:", error);
    }
  };

  const handleActivate = (brand) => {
    setConfirmDialog({
      title: `¿Activar la marca ${brand.name}?`,
      message: "La marca volverá a estar disponible en el sistema.",
      confirmLabel: "Sí, activar",
      isDestructive: false,
      onConfirm: async () => {
        try {
          await activateBrand(brand.id);
          fetchBrands();
        } catch (error) {
          console.error("Error al activar marca:", error);
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleDeactivate = (brand) => {
    setConfirmDialog({
      title: `¿Desactivar la marca ${brand.name}?`,
      message: "La marca quedará inactiva en el sistema.",
      confirmLabel: "Sí, desactivar",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deactivateBrand(brand.id);
          fetchBrands();
        } catch (error) {
          console.error("Error al desactivar marca:", error);
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const columns = [
    { key: "name", label: "Nombre" },
  ];

  const stats = [
    {
      label: "Total Marcas",
      count: brands.length,
      icon: <Package className="icon-card" />,
    },
    {
      label: "Marcas Activas",
      count: brands.filter((b) => b.active).length,
      icon: <FaRegCheckCircle className="icon-card" />,
    },
  ];

  return (
    <section>
      <div className="table-container ">
        <TitleCrud
          title="Gestión de Marcas"
          icon={Tag}
          description="Administra la lista de marcas de laptops"
        />

        <SearchBox
          onRegisterClick={() => handleOpenModal()}
          registerLabel="Registrar Marca"
        />

        <CountCard stats={stats} />

        <DataTable
          columns={columns}
          data={brands.filter((b) => b.active !== false)}
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
          <BrandsForm
            onClose={handleCloseModal}
            onSubmit={handleSubmitBrand}
            brand={editingBrand}
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

export default Brands;
