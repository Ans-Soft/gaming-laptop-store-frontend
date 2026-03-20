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

  const handleActivate = async (cliente) => {
    if (window.confirm(`¿Estás seguro de activar al cliente ${cliente.nombre_completo}?`)) {
      try {
        await activateCliente(cliente.id);
        fetchClientes();
      } catch (error) {
        console.error("Error al activar cliente:", error);
      }
    }
  };

  const handleDeactivate = async (cliente) => {
    if (window.confirm(`¿Estás seguro de desactivar al cliente ${cliente.nombre_completo}?`)) {
      try {
        await deactivateCliente(cliente.id);
        fetchClientes();
      } catch (error) {
        console.error("Error al desactivar cliente:", error);
      }
    }
  };

  const handleView = (cliente) => {
    navigate(`/admin/clientes/${cliente.id}`);
  };

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.cedula.includes(searchTerm) ||
      cliente.correo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: "nombre_completo", label: "Nombre" },
    { key: "cedula", label: "Cédula" },
    { key: "celular", label: "Celular" },
    { key: "correo", label: "Correo" },
    { key: "ciudad", label: "Ciudad" },
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
      </div>
    </section>
  );
};

export default Clientes;
