import React, { useEffect, useState } from "react";
import "./../../styles/admin/dataTable.css";
import "./../../styles/global.css";
import { Package } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import { FaRegCheckCircle, FaRegUser, FaCheck, FaTimes } from "react-icons/fa";
import TitleCrud from "../../components/admin/TitleCrud";
import UsersForm from "../../components/admin/UsersForm";
import ConfirmModal from "../../components/admin/ConfirmModal";
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
  const [confirmDialog, setConfirmDialog] = useState(null);

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

  const handleActivate = (user) => {
    setConfirmDialog({
      title: `¿Activar a ${user.first_name}?`,
      message: "El usuario volverá a tener acceso al sistema.",
      confirmLabel: "Sí, activar",
      isDestructive: false,
      onConfirm: async () => {
        try {
          await activateUser(user.id);
          fetchUsers();
        } catch (error) {
          console.error("Error al activar usuario:", error);
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleDeactivate = (user) => {
    setConfirmDialog({
      title: `¿Desactivar a ${user.first_name}?`,
      message: "El usuario perderá acceso al sistema.",
      confirmLabel: "Sí, desactivar",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deactivateUser(user.id);
          fetchUsers();
        } catch (error) {
          console.error("Error al desactivar usuario:", error);
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const columns = [
    { key: "first_name", label: "Nombre" },
    { key: "last_name", label: "Apellido" },
    { key: "email", label: "Correo electrónico" },
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
          data={users.filter((u) => u.is_active !== false)}
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

export default Users;
