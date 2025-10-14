import React, { useEffect, useState } from "react";
import "./../../styles/admin/dataTable.css";
import "./../../styles/global.css";
import { Package } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import DashboardHeader from "../../components/admin/DashboardHeader";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import { FaRegCheckCircle, FaRegUser } from "react-icons/fa";
import TitleCrud from "../../components/admin/TitleCrud";
import UsersForm from "../../components/admin/UsersForm";
import { getUsers, registerUser } from "../../services/UserService";

const Users = () => {
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);

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

  // Registrar usuario nuevo
  const handleRegisterUser = async (data) => {
    try {
      await registerUser(data);
      setShowModal(false);
      fetchUsers(); // refrescar tabla
    } catch (error) {
      console.error("Error al registrar usuario:", error);
    }
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
      count: users.length,
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
          onRegisterClick={() => setShowModal(true)}
          registerLabel="Registrar Usuario"
        />

        <CountCard stats={stats} />

        <DataTable
          columns={columns}
          data={users}
          rowKey="email"
          handleView={false}
          handleEdit={true}
          handleDelete={true}
        />

        {showModal && (
          <UsersForm
            onClose={() => setShowModal(false)}
            onSubmit={handleRegisterUser}
          />
        )}
      </div>
    </section>
  );
};

export default Users;
