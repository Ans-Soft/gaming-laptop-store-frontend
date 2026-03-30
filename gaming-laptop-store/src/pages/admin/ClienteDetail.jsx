import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Clock } from "lucide-react";
import DataTable from "../../components/admin/DataTable";
import * as ClienteService from "../../services/ClienteService";
import * as VentaService from "../../services/VentaService";
import * as SeparacionService from "../../services/SeparacionService";
import "../../styles/admin/clienteDetail.css";

const getInitials = (name) => {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0]?.[0]?.toUpperCase() || "?";
};

const getAvatarColor = (name) => {
  const colors = ["#4f46e5", "#0891b2", "#059669", "#d97706", "#dc2626", "#7c3aed", "#db2777"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const ClienteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState(null);
  const [ventas, setVentas] = useState([]);
  const [separaciones, setSeparaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ventas");

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const clienteData = await ClienteService.getClienteDetail(id);
      setCliente(clienteData.cliente || clienteData);

      const ventasData = await VentaService.getVentas();
      const clientVentas = (Array.isArray(ventasData) ? ventasData : ventasData.ventas || []).filter(
        (v) => v.cliente === parseInt(id)
      );
      setVentas(clientVentas);

      const separacionesData = await SeparacionService.getSeparaciones();
      const clientSeparaciones = (Array.isArray(separacionesData) ? separacionesData : separacionesData.separaciones || []).filter(
        (s) => s.cliente === parseInt(id)
      );
      setSeparaciones(clientSeparaciones);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="cd-container">Cargando...</div>;
  }

  if (!cliente) {
    return <div className="cd-container">Cliente no encontrado</div>;
  }

  const ventasColumns = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (value) => `#${value}`,
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

  const separacionesColumns = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (value) => `#${value}`,
    },
    {
      key: "fecha_separacion",
      label: "Fecha Separación",
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString("es-CO"),
    },
    {
      key: "estado",
      label: "Estado",
      sortable: true,
      render: (value) => {
        const estados = {
          activa: "Activa",
          expirada: "Expirada",
          cancelada: "Cancelada",
          completada: "Completada",
        };
        return estados[value] || value;
      },
    },
    {
      key: "valor_abono",
      label: "Valor Abono",
      sortable: true,
      render: (value) => `$${parseFloat(value || 0).toFixed(2)}`,
    },
    {
      key: "fecha_maxima_compra",
      label: "Fecha Máxima",
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString("es-CO"),
    },
  ];

  return (
    <div className="cd-container">
      <div className="cd-header">
        <button
          className="cd-back-btn"
          onClick={() => navigate("/admin/clientes")}
          aria-label="Volver al listado de clientes"
        >
          <ArrowLeft size={18} />
          <span>Clientes</span>
        </button>
      </div>

      <div className="cd-info-card">
        <div className="cd-info-header">
          <div
            className="cd-avatar"
            style={{ backgroundColor: getAvatarColor(cliente.nombre_completo) }}
          >
            {getInitials(cliente.nombre_completo)}
          </div>
          <div className="cd-info-content">
            <h2>{cliente.nombre_completo}</h2>
            <p className="cd-subtitle">
              CC {cliente.cedula} &middot; {cliente.ciudad_nombre || "Sin ciudad"}, {cliente.departamento_nombre || ""}
            </p>
          </div>
        </div>

        <div className="cd-info-grid">
          <div className="cd-info-item">
            <label>Cédula</label>
            <p>{cliente.cedula}</p>
          </div>
          <div className="cd-info-item">
            <label>Celular</label>
            <p>
              <a href={`tel:${cliente.celular}`} className="cd-link">
                {cliente.celular}
              </a>
            </p>
          </div>
          <div className="cd-info-item">
            <label>Correo</label>
            <p>
              <a href={`mailto:${cliente.correo}`} className="cd-link">
                {cliente.correo}
              </a>
            </p>
          </div>
          <div className="cd-info-item">
            <label>Ciudad</label>
            <p>{cliente.ciudad_nombre || "N/A"}</p>
          </div>
          <div className="cd-info-item">
            <label>Departamento</label>
            <p>{cliente.departamento_nombre || "N/A"}</p>
          </div>
          <div className="cd-info-item">
            <label>Dirección</label>
            <p>{cliente.direccion}</p>
          </div>
        </div>
      </div>

      <div className="cd-tabs">
        <button
          className={`cd-tab ${activeTab === "ventas" ? "cd-tab--active" : ""}`}
          onClick={() => setActiveTab("ventas")}
        >
          <ShoppingCart size={18} />
          Ventas ({ventas.length})
        </button>
        <button
          className={`cd-tab ${activeTab === "separaciones" ? "cd-tab--active" : ""}`}
          onClick={() => setActiveTab("separaciones")}
        >
          <Clock size={18} />
          Separaciones ({separaciones.length})
        </button>
      </div>

      <div className="cd-content">
        {activeTab === "ventas" && (
          <div className="cd-table-container">
            {ventas.length === 0 ? (
              <div className="cd-empty-state">
                <ShoppingCart size={48} strokeWidth={1} />
                <p className="cd-empty-title">Sin ventas registradas</p>
                <p className="cd-empty-desc">
                  Este cliente aún no tiene compras. Puedes crear una desde el módulo de ventas.
                </p>
                <button
                  className="cd-empty-action"
                  onClick={() => navigate("/admin/ventas")}
                >
                  Ir a Ventas
                </button>
              </div>
            ) : (
              <DataTable
                columns={ventasColumns}
                data={ventas}
                emptyMessage="No hay ventas registradas para este cliente"
              />
            )}
          </div>
        )}

        {activeTab === "separaciones" && (
          <div className="cd-table-container">
            {separaciones.length === 0 ? (
              <div className="cd-empty-state">
                <Clock size={48} strokeWidth={1} />
                <p className="cd-empty-title">Sin separaciones registradas</p>
                <p className="cd-empty-desc">
                  Este cliente no tiene separaciones. Puedes crear una desde el módulo de separaciones.
                </p>
                <button
                  className="cd-empty-action"
                  onClick={() => navigate("/admin/separaciones")}
                >
                  Ir a Separaciones
                </button>
              </div>
            ) : (
              <DataTable
                columns={separacionesColumns}
                data={separaciones}
                emptyMessage="No hay separaciones registradas para este cliente"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClienteDetail;
