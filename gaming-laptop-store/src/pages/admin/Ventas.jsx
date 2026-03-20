import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Plus, Edit, Eye, Trash2 } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import CountCard from "../../components/admin/CountCard";
import VentaForm from "../../components/admin/VentaForm";
import * as VentaService from "../../services/VentaService";
import "../../styles/admin/ventasPage.css";

const Ventas = () => {
  const navigate = useNavigate();
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState(null);

  useEffect(() => {
    loadVentas();
  }, []);

  const loadVentas = async () => {
    setLoading(true);
    try {
      const data = await VentaService.getVentas();
      setVentas(Array.isArray(data) ? data : data.ventas || []);
    } catch (error) {
      console.error("Error al cargar ventas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedVenta(null);
    setShowModal(true);
  };

  const handleEdit = (venta) => {
    setSelectedVenta(venta);
    setShowModal(true);
  };

  const handleView = (venta) => {
    navigate(`/admin/ventas/${venta.id}`);
  };

  const handleDelete = async (venta) => {
    if (!window.confirm(`¿Eliminar venta #${venta.id}?`)) return;
    try {
      // Implement delete if API supports it
      console.log("Eliminar venta:", venta.id);
    } catch (error) {
      console.error("Error al eliminar venta:", error);
    }
  };

  const handleSubmit = async (formData, ventaId) => {
    try {
      if (ventaId) {
        // Update existing venta
        await VentaService.updateVenta(ventaId, formData);
      } else {
        // Create new venta
        await VentaService.createVenta(formData);
      }
      setShowModal(false);
      loadVentas();
    } catch (error) {
      console.error("Error al guardar venta:", error);
      alert("Error al guardar la venta");
    }
  };

  const columns = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (value) => `#${value}`,
    },
    {
      key: "cliente_nombre",
      label: "Cliente",
      sortable: true,
    },
    {
      key: "fecha",
      label: "Fecha",
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString("es-CO"),
    },
    {
      key: "total",
      label: "Total",
      sortable: true,
      render: (value) => `$${parseFloat(value || 0).toFixed(2)}`,
    },
    {
      key: "items_count",
      label: "Items",
      sortable: false,
      render: (value) => value || 0,
    },
    {
      key: "notas",
      label: "Notas",
      sortable: false,
      render: (value) => (value ? value.substring(0, 30) + "..." : "Sin notas"),
    },
  ];

  const actions = [
    {
      icon: Eye,
      label: "Ver",
      onClick: handleView,
      color: "#4f46e5",
    },
    {
      icon: Edit,
      label: "Editar",
      onClick: handleEdit,
      color: "#f59e0b",
    },
    {
      icon: Trash2,
      label: "Eliminar",
      onClick: handleDelete,
      color: "#ef4444",
    },
  ];

  return (
    <div className="vp-container">
      <div className="vp-header">
        <h1>Gestión de Ventas</h1>
        <button className="vp-btn-primary" onClick={handleCreateNew}>
          <Plus size={20} /> Nueva Venta
        </button>
      </div>

      <div className="vp-cards">
        <CountCard
          icon={ShoppingCart}
          label="Total de Ventas"
          value={ventas.length}
          color="#4f46e5"
        />
        <CountCard
          icon={ShoppingCart}
          label="Ingresos Totales"
          value={`$${ventas.reduce((sum, v) => sum + parseFloat(v.total || 0), 0).toFixed(2)}`}
          color="#10b981"
        />
      </div>

      <div className="vp-table-container">
        <DataTable
          columns={columns}
          data={ventas}
          actions={actions}
          loading={loading}
          emptyMessage="No hay ventas registradas"
        />
      </div>

      {showModal && (
        <VentaForm
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
          venta={selectedVenta}
        />
      )}
    </div>
  );
};

export default Ventas;
