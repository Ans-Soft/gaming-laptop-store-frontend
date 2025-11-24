import React, { useEffect, useState } from "react";
import "./../../styles/admin/dataTable.css";
import "./../../styles/global.css";
import { Package, Tag } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import DashboardHeader from "../../components/admin/DashboardHeader";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import { FaRegCheckCircle, FaCheck, FaTimes } from "react-icons/fa";
import TitleCrud from "../../components/admin/TitleCrud";
import BrandsForm from "../../components/admin/BrandsForm";
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

  const handleActivate = async (brand) => {
    if (window.confirm(`¿Estás seguro de activar la marca ${brand.name}?`)) {
      try {
        await activateBrand(brand.id);
        fetchBrands();
      } catch (error) {
        console.error("Error al activar marca:", error);
      }
    }
  };

  const handleDeactivate = async (brand) => {
    if (window.confirm(`¿Estás seguro de desactivar la marca ${brand.name}?`)) {
      try {
        await deactivateBrand(brand.id);
        fetchBrands();
      } catch (error) {
        console.error("Error al desactivar marca:", error);
      }
    }
  };

  const columns = [
    { key: "name", label: "Nombre" },
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
      <DashboardHeader />
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
          data={brands}
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
      </div>
    </section>
  );
};

export default Brands;
