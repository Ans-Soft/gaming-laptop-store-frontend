import React, { useState, useEffect } from "react";
import { FileText, Plus, Edit, Eye, Trash2 } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import CountCard from "../../components/admin/CountCard";
import ReciboForm from "../../components/admin/ReciboForm";
import * as ReciboService from "../../services/ReciboService";
import "../../styles/admin/recibosPage.css";

const Recibos = () => {
  const [recibos, setRecibos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedRecibo, setSelectedRecibo] = useState(null);

  useEffect(() => {
    loadRecibos();
  }, []);

  const loadRecibos = async () => {
    setLoading(true);
    try {
      const data = await ReciboService.getRecibos();
      setRecibos(Array.isArray(data) ? data : data.recibos || []);
    } catch (error) {
      console.error("Error al cargar recibos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedRecibo(null);
    setShowModal(true);
  };

  const handleEdit = (recibo) => {
    setSelectedRecibo(recibo);
    setShowModal(true);
  };

  const handleView = (recibo) => {
    // Open receipt in new tab
    if (recibo.url) {
      window.open(recibo.url, "_blank");
    }
  };

  const handleDelete = async (recibo) => {
    if (!window.confirm(`¿Eliminar recibo #${recibo.id}?`)) return;
    try {
      // Implement delete if API supports it
      console.log("Eliminar recibo:", recibo.id);
    } catch (error) {
      console.error("Error al eliminar recibo:", error);
    }
  };

  const handleSubmit = async (formData, reciboId) => {
    try {
      if (reciboId) {
        // Update existing recibo
        await ReciboService.updateRecibo(reciboId, formData);
      } else {
        // Create new recibo
        await ReciboService.createRecibo(formData);
      }
      setShowModal(false);
      loadRecibos();
    } catch (error) {
      console.error("Error al guardar recibo:", error);
      alert("Error al guardar el recibo");
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
      key: "venta",
      label: "Venta",
      sortable: false,
      render: (value) => (value ? `Venta #${value}` : "N/A"),
    },
    {
      key: "separacion",
      label: "Separación",
      sortable: false,
      render: (value) => (value ? `Separación #${value}` : "N/A"),
    },
    {
      key: "fecha_documento",
      label: "Fecha del Documento",
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString("es-CO"),
    },
    {
      key: "url",
      label: "URL",
      sortable: false,
      render: (value) => (
        <a href={value} target="_blank" rel="noopener noreferrer" className="rp-link">
          Ver documento
        </a>
      ),
    },
  ];

  const actions = [
    {
      icon: Eye,
      label: "Abrir",
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
    <div className="rp-container">
      <div className="rp-header">
        <h1>Gestión de Recibos</h1>
        <button className="rp-btn-primary" onClick={handleCreateNew}>
          <Plus size={20} /> Nuevo Recibo
        </button>
      </div>

      <div className="rp-cards">
        <CountCard
          icon={FileText}
          label="Total de Recibos"
          value={recibos.length}
          color="#4f46e5"
        />
      </div>

      <div className="rp-table-container">
        <DataTable
          columns={columns}
          data={recibos}
          actions={actions}
          loading={loading}
          emptyMessage="No hay recibos registrados"
        />
      </div>

      {showModal && (
        <ReciboForm
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
          recibo={selectedRecibo}
        />
      )}
    </div>
  );
};

export default Recibos;
