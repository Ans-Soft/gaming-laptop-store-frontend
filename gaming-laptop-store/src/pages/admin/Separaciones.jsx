import React, { useEffect, useState } from "react";
import "./../../styles/admin/dataTable.css";
import "./../../styles/global.css";
import { Lock, Package } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import { FaRegCheckCircle, FaCheck, FaTimes } from "react-icons/fa";
import TitleCrud from "../../components/admin/TitleCrud";
import SeparacionForm from "../../components/admin/SeparacionForm";
import {
  getSeparaciones,
  createSeparacion,
  updateSeparacion,
  activateSeparacion,
  deactivateSeparacion,
} from "../../services/SeparacionService";

const Separaciones = () => {
  const [showModal, setShowModal] = useState(false);
  const [separaciones, setSeparaciones] = useState([]);
  const [editingSeparacion, setEditingSeparacion] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSeparaciones();
  }, []);

  const fetchSeparaciones = async () => {
    try {
      const data = await getSeparaciones();
      setSeparaciones(data.separacion || data);
    } catch (error) {
      console.error("Error al obtener separaciones:", error);
    }
  };

  const handleOpenModal = (separacion = null) => {
    setEditingSeparacion(separacion);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditingSeparacion(null);
    setShowModal(false);
  };

  const handleSubmitSeparacion = async (data, id) => {
    try {
      if (id) {
        await updateSeparacion(id, data);
      } else {
        await createSeparacion(data);
      }
      handleCloseModal();
      fetchSeparaciones();
    } catch (error) {
      console.error("Error al guardar separación:", error);
    }
  };

  const handleActivate = async (separacion) => {
    if (window.confirm(`¿Estás seguro de activar esta separación?`)) {
      try {
        await activateSeparacion(separacion.id);
        fetchSeparaciones();
      } catch (error) {
        console.error("Error al activar separación:", error);
      }
    }
  };

  const handleDeactivate = async (separacion) => {
    if (window.confirm(`¿Estás seguro de desactivar esta separación?`)) {
      try {
        await deactivateSeparacion(separacion.id);
        fetchSeparaciones();
      } catch (error) {
        console.error("Error al desactivar separación:", error);
      }
    }
  };

  const filteredSeparaciones = separaciones.filter(
    (s) =>
      s.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.unidad_serial?.includes(searchTerm)
  );

  const columns = [
    { key: "cliente_nombre", label: "Cliente" },
    { key: "unidad_serial", label: "Serial" },
    {
      key: "valor_abono",
      label: "Valor Abono",
      render: (row) => `$${parseFloat(row.valor_abono).toFixed(2)}`,
    },
    { key: "fecha_separacion", label: "Fecha Separación" },
    { key: "fecha_maxima_compra", label: "Fecha Máxima" },
    {
      key: "estado",
      label: "Estado",
      render: (row) => (
        <span className={row.estado === "activa" ? "status-active" : "status-inactive"}>
          {row.estado.charAt(0).toUpperCase() + row.estado.slice(1)}
        </span>
      ),
    },
    {
      key: "active",
      label: "Activo",
      render: (row) => (
        <span className={row.active ? "status-active" : "status-inactive"}>
          {row.active ? "Sí" : "No"}
        </span>
      ),
    },
  ];

  const stats = [
    {
      label: "Total Separaciones",
      count: separaciones.length,
      icon: <Package className="icon-card" />,
    },
    {
      label: "Activas",
      count: separaciones.filter((s) => s.estado === "activa").length,
      icon: <FaRegCheckCircle className="icon-card" />,
    },
  ];

  return (
    <section>
      <div className="table-container">
        <TitleCrud
          title="Gestión de Separaciones"
          icon={Lock}
          description="Administra las reservas de unidades en stock"
        />

        <SearchBox
          onRegisterClick={() => handleOpenModal()}
          registerLabel="Registrar Nueva Separación"
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por cliente o serial..."
        />

        <CountCard stats={stats} />

        <DataTable
          columns={columns}
          data={filteredSeparaciones}
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
          <SeparacionForm
            onClose={handleCloseModal}
            onSubmit={handleSubmitSeparacion}
            separacion={editingSeparacion}
          />
        )}
      </div>
    </section>
  );
};

export default Separaciones;
