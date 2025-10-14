import React from "react";
import "./../../styles/admin/dataTable.css";
import "./../../styles/global.css";
import { Package } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import DashboardHeader from "../../components/admin/DashboardHeader";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import { FaRegCheckCircle, FaRegUser  } from "react-icons/fa";
import TitleCrud from "../../components/admin/TitleCrud";

const Users = () => {
  const users = [
    {
      id: 1,
      first_name: "Sara",
      last_name: "Martínez",
      email: "sara@gmail.com",
    },
    {
      id: 2,
      first_name: "Daniel",
      last_name: "Gómez",
      email: "daniel@gmail.com",
    },
    {
      id: 3,
      first_name: "Lucía",
      last_name: "Rodríguez",
      email: "lucia@gmail.com",
    },
    {
      id: 4,
      first_name: "Javier",
      last_name: "López",
      email: "javier@gmail.com",
    },
  ];

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

        <SearchBox />

        <CountCard stats={stats} />

        <DataTable columns={columns} data={users} />
      </div>
    </section>
  );
};

export default Users;
