import React, { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { FaCheck, FaTimes, FaRegCheckCircle } from "react-icons/fa";

import "./../../styles/admin/dataTable.css";
import "./../../styles/global.css";

import DataTable from "../../components/admin/DataTable";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import TitleCrud from "../../components/admin/TitleCrud";
import ConfirmModal from "../../components/admin/ConfirmModal";
import TrustedSellerForm from "../../components/admin/TrustedSellerForm";
import DealWatcherPauseBar from "../../components/admin/DealWatcherPauseBar";

import {
  getTrustedSellers,
  createTrustedSeller,
  updateTrustedSeller,
  activateTrustedSeller,
  deactivateTrustedSeller,
} from "../../services/DealWatcherService";

const TrustedSellers = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const data = await getTrustedSellers();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener sellers:", error);
    }
  };

  const handleOpenModal = (seller = null) => {
    setEditing(seller);
    setSubmitError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditing(null);
    setSubmitError(null);
    setShowModal(false);
  };

  const handleSubmit = async (payload, id) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (id) {
        await updateTrustedSeller(id, payload);
      } else {
        await createTrustedSeller(payload);
      }
      handleCloseModal();
      fetchItems();
    } catch (error) {
      console.error("Error al guardar seller:", error);
      const data = error.response?.data;
      let msg = "Ocurrió un error inesperado.";
      if (data?.message) msg = data.message;
      else if (data?.username) msg = `Username inválido: ${data.username[0] || data.username}`;
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
      title: `¿Activar seller "${row.username}"?`,
      message: "Las ofertas de este seller volverán a disparar alertas.",
      confirmLabel: "Sí, activar",
      isDestructive: false,
      onConfirm: async () => {
        try {
          await activateTrustedSeller(row.id);
          fetchItems();
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleDeactivate = (row) => {
    setConfirmDialog({
      title: `¿Desactivar seller "${row.username}"?`,
      message: "Las ofertas de este seller dejarán de disparar alertas.",
      confirmLabel: "Sí, desactivar",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deactivateTrustedSeller(row.id);
          fetchItems();
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const columns = [
    { key: "username", label: "Username" },
    { key: "display_name", label: "Nombre visible", render: (r) => r.display_name || "—" },
    { key: "notes", label: "Notas", render: (r) => r.notes || "—" },
    { key: "active", label: "Estado", render: (r) => (r.active ? "Activo" : "Inactivo") },
  ];

  const stats = [
    {
      label: "Total Sellers",
      count: items.length,
      icon: <ShieldCheck className="icon-card" />,
    },
    {
      label: "Sellers Activos",
      count: items.filter((s) => s.active).length,
      icon: <FaRegCheckCircle className="icon-card" />,
    },
  ];

  return (
    <section>
      <div className="table-container">
        <DealWatcherPauseBar />
        <TitleCrud
          title="Sellers Confiables"
          icon={ShieldCheck}
          description="Usuarios de eBay cuyas ofertas activan las alertas del Deal Watcher"
        />

        <SearchBox
          onRegisterClick={() => handleOpenModal()}
          registerLabel="Registrar Seller"
        />

        <CountCard stats={stats} />

        <DataTable
          columns={columns}
          data={items}
          rowKey="id"
          onEdit={handleOpenModal}
          customActions={[
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
          <TrustedSellerForm
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
            seller={editing}
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

export default TrustedSellers;
