import React, { useEffect, useState } from "react";
import { Eye, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaTimes, FaRegCheckCircle, FaChartLine } from "react-icons/fa";

import "./../../styles/admin/dataTable.css";
import "./../../styles/global.css";

import DataTable from "../../components/admin/DataTable";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import TitleCrud from "../../components/admin/TitleCrud";
import ConfirmModal from "../../components/admin/ConfirmModal";
import MonitoredProductForm from "../../components/admin/MonitoredProductForm";
import DealWatcherPauseBar from "../../components/admin/DealWatcherPauseBar";

import {
  getMonitoredProducts,
  createMonitoredProduct,
  updateMonitoredProduct,
  activateMonitoredProduct,
  deactivateMonitoredProduct,
} from "../../services/DealWatcherService";

const formatCop = (value) => {
  if (value == null) return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return `$${Math.round(n).toLocaleString("es-CO")}`;
};

const formatUsd = (value) => {
  if (value == null) return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return `$${n.toFixed(2)}`;
};

const MonitoredProducts = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const data = await getMonitoredProducts();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener productos vigilados:", error);
    }
  };

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setSubmitError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditingItem(null);
    setSubmitError(null);
    setShowModal(false);
  };

  const handleSubmit = async (payload, id) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (id) {
        await updateMonitoredProduct(id, payload);
      } else {
        await createMonitoredProduct(payload);
      }
      handleCloseModal();
      fetchItems();
    } catch (error) {
      console.error("Error al guardar producto vigilado:", error);
      const data = error.response?.data;
      let msg = "Ocurrió un error inesperado.";
      if (data?.message) msg = data.message;
      else if (data?.ebay_url) msg = `URL inválida: ${data.ebay_url[0] || data.ebay_url}`;
      else if (typeof data === "object" && data) {
        msg = Object.values(data).flat().join(" ");
      }
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivate = (row) => {
    setConfirmDialog({
      title: `¿Activar la vigilancia de "${row.nickname}"?`,
      message: "Volverá a procesarse en los chequeos automáticos.",
      confirmLabel: "Sí, activar",
      isDestructive: false,
      onConfirm: async () => {
        try {
          await activateMonitoredProduct(row.id);
          fetchItems();
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleDeactivate = (row) => {
    setConfirmDialog({
      title: `¿Pausar la vigilancia de "${row.nickname}"?`,
      message: "El producto dejará de procesarse hasta que lo actives de nuevo.",
      confirmLabel: "Sí, pausar",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deactivateMonitoredProduct(row.id);
          fetchItems();
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const columns = [
    { key: "nickname", label: "Apodo" },
    {
      key: "ebay_item_id",
      label: "Item ID",
      render: (row) => (
        <a
          href={row.ebay_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
        >
          {row.ebay_item_id}
          <ExternalLink size={12} />
        </a>
      ),
    },
    {
      key: "max_price_cop",
      label: "Máximo (COP)",
      render: (row) => formatCop(row.max_price_cop),
    },
    {
      key: "last_known_price_usd",
      label: "Último USD",
      render: (row) => formatUsd(row.last_known_price_usd),
    },
    {
      key: "last_known_seller",
      label: "Último seller",
      render: (row) => row.last_known_seller || "—",
    },
    {
      key: "last_seen_available_at",
      label: "Visto disponible",
      render: (row) =>
        row.last_seen_available_at
          ? new Date(row.last_seen_available_at).toLocaleString("es-CO")
          : "—",
    },
    {
      key: "active",
      label: "Estado",
      render: (row) => (row.active ? "Activo" : "Pausado"),
    },
  ];

  const stats = [
    {
      label: "Total Vigilados",
      count: items.length,
      icon: <Eye className="icon-card" />,
    },
    {
      label: "Activos",
      count: items.filter((i) => i.active).length,
      icon: <FaRegCheckCircle className="icon-card" />,
    },
  ];

  return (
    <section>
      <div className="table-container">
        <DealWatcherPauseBar />
        <TitleCrud
          title="Productos Vigilados"
          icon={Eye}
          description="Listings de eBay que el Deal Watcher monitorea cada 30 minutos"
        />

        <SearchBox
          onRegisterClick={() => handleOpenModal()}
          registerLabel="Vigilar Producto"
        />

        <CountCard stats={stats} />

        <DataTable
          columns={columns}
          data={items}
          rowKey="id"
          onEdit={handleOpenModal}
          customActions={[
            {
              icon: FaChartLine,
              handler: (row) => navigate(`/admin/deal-watcher/${row.id}`),
              show: () => true,
              title: "Ver historial",
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
              title: "Pausar",
            },
          ]}
        />

        {showModal && (
          <MonitoredProductForm
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
            product={editingItem}
            isSubmitting={isSubmitting}
            submitError={submitError}
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

export default MonitoredProducts;
