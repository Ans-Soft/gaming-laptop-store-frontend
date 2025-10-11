import React from "react";
import "./../../styles/admin/dataTable.css";
import { Plus, Package, Search } from "lucide-react";
import DataTable from "../../components/admin/DataTable";

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

  const totalUsers = users.length;
  const totalActive = users.length; // Cuando tenga la conexión con backend determinar activos/inactivos

  const columns = [
    { key: "first_name", label: "Nombre" },
    { key: "last_name", label: "Apellido" },
    { key: "email", label: "Correo electrónico" },
  ];

  return (
    <div className="table-container">
      <div className="table-header">
        <div>
          <h1>
            <Package size={28} /> Gestión de Usuarios
          </h1>
          <p>Administra la lista de usuarios registrados</p>
        </div>
      </div>

      <div className="table-filters">
        <div className="search-box">
          <Search size={18} />
          <input type="text" placeholder="Buscar por nombre o email..." />
        </div>
        <button className="btn-register">
          <Plus size={18} /> Registrar Usuario
        </button>
      </div>

      <div className="table-stats">
        <div className="stat-card">
          <Package size={20} />
          <div>
            <p>Total Usuarios</p>
            <h3>{totalUsers}</h3>
          </div>
        </div>
        <div className="stat-card">
          <Package size={20} />
          <div>
            <p>Total Usuarios Activos</p>
            <h3>{totalActive}</h3>
          </div>
        </div>
      </div>

      
      <DataTable columns={columns} data={users} />
    </div>
  );
};

export default Users;
