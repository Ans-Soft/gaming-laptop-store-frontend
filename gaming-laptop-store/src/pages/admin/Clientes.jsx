import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../../styles/admin/dataTable.css";
import "./../../styles/global.css";
import { Users, Package, Eye } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import { FaRegCheckCircle, FaCheck, FaTimes } from "react-icons/fa";
import TitleCrud from "../../components/admin/TitleCrud";
import ClientesForm from "../../components/admin/ClientesForm";
import ConfirmModal from "../../components/admin/ConfirmModal";
import {
  getClientes,
  createCliente,
  updateCliente,
  activateCliente,
  deactivateCliente,
} from "../../services/ClienteService";

const Clientes = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [editingCliente, setEditingCliente] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDialog, setConfirmDialog] = useState(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const data = await getClientes();
      setClientes(data.cliente || data);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
    }
  };

  const handleOpenModal = (cliente = null) => {
    setEditingCliente(cliente);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditingCliente(null);
    setShowModal(false);
  };

  const handleSubmitCliente = async (data, id) => {
    try {
      if (id) {
        await updateCliente(id, data);
      } else {
        await createCliente(data);
      }
      handleCloseModal();
      fetchClientes();
    } catch (error) {
      console.error("Error al guardar cliente:", error);
    }
  };

  const handleActivate = (cliente) => {
    setConfirmDialog({
      title: `¿Activar al cliente ${cliente.nombre_completo}?`,
      message: "El cliente volverá a estar activo en el sistema.",
      confirmLabel: "Sí, activar",
      isDestructive: false,
      onConfirm: async () => {
        try {
          await activateCliente(cliente.id);
          fetchClientes();
        } catch (error) {
          console.error("Error al activar cliente:", error);
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleDeactivate = (cliente) => {
    setConfirmDialog({
      title: `¿Desactivar al cliente ${cliente.nombre_completo}?`,
      message: "El cliente quedará inactivo en el sistema.",
      confirmLabel: "Sí, desactivar",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deactivateCliente(cliente.id);
          fetchClientes();
        } catch (error) {
          console.error("Error al desactivar cliente:", error);
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleView = (cliente) => {
    navigate(`/admin/clientes/${cliente.id}`);
  };

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.active !== false &&
      (cliente.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.cedula.includes(searchTerm) ||
      cliente.correo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns = [
    { key: "nombre_completo", label: "Nombre" },
    { key: "cedula", label: "Cédula" },
    { key: "celular", label: "Celular" },
    { key: "correo", label: "Correo" },
    { key: "ciudad", label: "Ciudad" },
  ];

  const stats = [
    {
      label: "Total Clientes",
      count: clientes.length,
      icon: <Package className="icon-card" />,
    },
    {
      label: "Clientes Activos",
      count: clientes.filter((c) => c.active).length,
      icon: <FaRegCheckCircle className="icon-card" />,
    },
  ];

  return (
    <section>
      <div className="table-container">
        <TitleCrud
          title="Gestión de Clientes"
          icon={Users}
          description="Administra la base de datos de clientes"
        />

        <SearchBox
          onRegisterClick={() => handleOpenModal()}
          registerLabel="Registrar Cliente"
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por nombre, cédula o correo..."
        />

        <CountCard stats={stats} />

        <DataTable
          columns={columns}
          data={filteredClientes}
          rowKey="id"
          onEdit={handleOpenModal}
          customActions={[
            {
              icon: Eye,
              handler: handleView,
              show: () => true,
              title: "Ver Detalles",
            },
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
          <ClientesForm
            onClose={handleCloseModal}
            onSubmit={handleSubmitCliente}
            cliente={editingCliente}
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

export default Clientes;
