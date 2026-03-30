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
import ConfirmModal from "../../components/admin/ConfirmModal";
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
  const [confirmDialog, setConfirmDialog] = useState(null);

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

  const handleActivate = (separacion) => {
    setConfirmDialog({
      title: "¿Activar esta separación?",
      message: "La separación volverá a estar activa en el sistema.",
      confirmLabel: "Sí, activar",
      isDestructive: false,
      onConfirm: async () => {
        try {
          await activateSeparacion(separacion.id);
          fetchSeparaciones();
        } catch (error) {
          console.error("Error al activar separación:", error);
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleDeactivate = (separacion) => {
    setConfirmDialog({
      title: "¿Desactivar esta separación?",
      message: "La separación quedará inactiva en el sistema.",
      confirmLabel: "Sí, desactivar",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deactivateSeparacion(separacion.id);
          fetchSeparaciones();
        } catch (error) {
          console.error("Error al desactivar separación:", error);
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const filteredSeparaciones = separaciones.filter(
    (s) =>
      s.active !== false &&
      (s.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.unidad_serial?.includes(searchTerm))
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

export default Separaciones;
