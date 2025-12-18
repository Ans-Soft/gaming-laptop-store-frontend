import React, { useEffect, useState } from "react";
import "./../../styles/admin/dataTable.css";
import "./../../styles/global.css";
import { Package } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import DashboardHeader from "../../components/admin/DashboardHeader";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import { FaRegCheckCircle, FaRegUser, FaCheck, FaTimes } from "react-icons/fa";
import TitleCrud from "../../components/admin/TitleCrud";
import UsersForm from "../../components/admin/UsersForm";
import {
  getUsers,
  registerUser,
  updateUser,
  activateUser,
  deactivateUser,
} from "../../services/UserService";

const Users = () => {
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  const handleOpenModal = (user = null) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditingUser(null);
    setShowModal(false);
  };

  const handleSubmitUser = async (data, id) => {
    try {
      if (id) {
        await updateUser(id, data);
      } else {
        await registerUser(data);
      }
      handleCloseModal();
      fetchUsers();
    } catch (error) {
      console.error("Error al guardar usuario:", error);
    }
  };

  const handleActivate = async (user) => {
    console.log("Activating user:", user);
    if (window.confirm(`¿Estás seguro de activar a ${user.first_name}?`)) {
      try {
        await activateUser(user.id);
        fetchUsers();
      } catch (error) {
        console.error("Error al activar usuario:", error);
      }
    }
  };

  const handleDeactivate = async (user) => {
    console.log("Deactivating user:", user);
    if (window.confirm(`¿Estás seguro de desactivar a ${user.first_name}?`)) {
      try {
        await deactivateUser(user.id);
        fetchUsers();
      } catch (error) {
        console.error("Error al desactivar usuario:", error);
      }
    }
  };

  const columns = [
    { key: "first_name", label: "Nombre" },
    { key: "last_name", label: "Apellido" },
    { key: "email", label: "Correo electrónico" },
    {
      key: "is_active",
      label: "Estado",
      render: (row) => (
        <span className={row.is_active ? "status-active" : "status-inactive"}>
          {row.is_active ? "Activo" : "Inactivo"}
        </span>
      ),
    },
  ];

  const stats = [
    {
      label: "Total Usuarios",
      count: users.length,
      icon: <Package className="icon-card" />,
    },
    {
      label: "Usuarios Activos",
      count: users.filter((u) => u.is_active).length,
      icon: <FaRegCheckCircle className="icon-card" />,
    },
  ];

  return (
    <section>
      <DashboardHeader />
      <div className="table-container ">
        <TitleCrud
          title="Gestión de Usuarios"
          icon={FaRegUser}
          description="Administra la lista de usuarios registrados"
        />

        <SearchBox
          onRegisterClick={() => handleOpenModal()}
          registerLabel="Registrar Usuario"
        />

        <CountCard stats={stats} />

        <DataTable
          columns={columns}
          data={users}
          rowKey="id"
          onEdit={handleOpenModal}
          customActions={[
            {
              icon: FaCheck,
              handler: handleActivate,
              show: (row) => !row.is_active,
              title: "Activar",
            },
            {
              icon: FaTimes,
              handler: handleDeactivate,
              show: (row) => row.is_active,
              title: "Desactivar",
            },
          ]}
        />

        {showModal && (
          <UsersForm
            onClose={handleCloseModal}
            onSubmit={handleSubmitUser}
            user={editingUser}
          />
        )}
      </div>
    </section>
  );
};

export default Users;
