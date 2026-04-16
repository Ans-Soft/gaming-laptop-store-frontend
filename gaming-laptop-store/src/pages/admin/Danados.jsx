import React, { useEffect, useState } from "react";
import {
  Wrench,
  PlayCircle,
  CheckCircle,
  AlertTriangle,
  Package,
  ShoppingCart,
  Lock,
} from "lucide-react";
import "./../../styles/admin/dataTable.css";
import "./../../styles/global.css";
import "./../../styles/admin/danados.css";
import TitleCrud from "../../components/admin/TitleCrud";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import DataTable from "../../components/admin/DataTable";
import ConfirmModal from "../../components/admin/ConfirmModal";
import NotifyModal from "../../components/admin/NotifyModal";
import * as ReparacionService from "../../services/ReparacionService";

const ORIGEN_LABELS = {
  stock: "Stock",
  venta: "Venta",
  separacion: "Separación",
};

const Danados = () => {
  const [reparaciones, setReparaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [notify, setNotify] = useState(null);

  useEffect(() => {
    loadReparaciones();
  }, []);

  const loadReparaciones = async () => {
    setLoading(true);
    try {
      const data = await ReparacionService.getReparaciones();
      setReparaciones(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error("Error al cargar reparaciones:", error);
      setNotify({
        variant: "error",
        title: "Error al cargar",
        message: "No se pudieron cargar las reparaciones. Intenta nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleIniciar = (row) => {
    setConfirmDialog({
      title: "¿Iniciar reparación?",
      message: `La unidad ${row.serial} pasará a estado "En Reparación".`,
      confirmLabel: "Sí, iniciar",
      isDestructive: false,
      onConfirm: async () => {
        try {
          await ReparacionService.iniciarReparacion(row.id);
          setConfirmDialog(null);
          loadReparaciones();
          setNotify({
            variant: "success",
            title: "Reparación iniciada",
            message: `La unidad ${row.serial} quedó en reparación.`,
          });
        } catch (error) {
          const msg =
            error.response?.data?.error ||
            "No se pudo iniciar la reparación.";
          setConfirmDialog(null);
          setNotify({ variant: "error", title: "Error", message: msg });
        }
      },
    });
  };

  const handleCompletar = (row) => {
    const destino =
      row.origen === "venta"
        ? "quedará vendida y lista para entregar al cliente"
        : row.origen === "separacion"
        ? "volverá a estar separada para el cliente"
        : "volverá al stock disponible";

    setConfirmDialog({
      title: "¿Completar reparación?",
      message: `La unidad ${row.serial} ${destino}.`,
      confirmLabel: "Sí, completar",
      isDestructive: false,
      onConfirm: async () => {
        try {
          await ReparacionService.completarReparacion(row.id);
          setConfirmDialog(null);
          loadReparaciones();
          setNotify({
            variant: "success",
            title: "Reparación completada",
            message: `La unidad ${row.serial} salió del pipeline de reparación.`,
          });
        } catch (error) {
          const msg =
            error.response?.data?.error ||
            "No se pudo completar la reparación.";
          setConfirmDialog(null);
          setNotify({ variant: "error", title: "Error", message: msg });
        }
      },
    });
  };

  const formatDate = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    return d.toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const filtered = reparaciones.filter((r) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.trim().toLowerCase();
    return (
      (r.serial || "").toLowerCase().includes(q) ||
      (r.producto_nombre || "").toLowerCase().includes(q) ||
      (r.cliente_nombre || "").toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      key: "origen",
      label: "Origen",
      render: (row) => (
        <span className={`status-badge dan-origen-${row.origen}`}>
          {ORIGEN_LABELS[row.origen] || row.origen}
        </span>
      ),
    },
    {
      key: "serial",
      label: "Serial",
      render: (row) => (
        <code
          style={{
            fontFamily: "Courier New, monospace",
            backgroundColor: "var(--icon-bg)",
            padding: "0.25rem 0.5rem",
            borderRadius: "4px",
            fontSize: "0.82rem",
            fontWeight: 600,
          }}
        >
          {row.serial}
        </code>
      ),
    },
    {
      key: "producto_nombre",
      label: "Producto",
      render: (row) => (
        <span style={{ fontWeight: 600 }}>{row.producto_nombre || "—"}</span>
      ),
    },
    {
      key: "cliente_nombre",
      label: "Cliente",
      render: (row) => row.cliente_nombre || <span style={{ color: "#94a3b8" }}>—</span>,
    },
    {
      key: "descripcion_dano",
      label: "Descripción",
      render: (row) => {
        const desc = row.descripcion_dano || "";
        if (!desc) return <span style={{ color: "#94a3b8" }}>—</span>;
        const truncated = desc.length > 50 ? desc.substring(0, 50) + "…" : desc;
        return (
          <span title={desc} style={{ fontSize: "0.85rem" }}>
            {truncated}
          </span>
        );
      },
    },
    {
      key: "fecha_reporte_dano",
      label: "Reportado",
      render: (row) => formatDate(row.fecha_reporte_dano),
    },
    {
      key: "estado_producto",
      label: "Estado",
      render: (row) => (
        <span className={`status-badge dan-estado-${row.estado_producto.replace("_", "-")}`}>
          {row.estado_producto_display || row.estado_producto}
        </span>
      ),
    },
  ];

  const customActions = [
    {
      icon: PlayCircle,
      handler: handleIniciar,
      show: (row) => row.estado_producto === "por_reparar",
      title: "Iniciar Reparación",
    },
    {
      icon: CheckCircle,
      handler: handleCompletar,
      show: (row) => row.estado_producto === "en_reparacion",
      title: "Completar Reparación",
    },
  ];

  const porReparar = reparaciones.filter((r) => r.estado_producto === "por_reparar").length;
  const enReparacion = reparaciones.filter((r) => r.estado_producto === "en_reparacion").length;
  const desdeStock = reparaciones.filter((r) => r.origen === "stock").length;
  const desdeVenta = reparaciones.filter((r) => r.origen === "venta").length;
  const desdeSep = reparaciones.filter((r) => r.origen === "separacion").length;

  const stats = [
    {
      label: "Total en Reparación",
      count: reparaciones.length,
      icon: (
        <Wrench
          className="icon-card"
          style={{ stroke: "#92400e", color: "#92400e", backgroundColor: "#fef3c7" }}
        />
      ),
    },
    {
      label: "Por Reparar",
      count: porReparar,
      icon: (
        <AlertTriangle
          className="icon-card"
          style={{ stroke: "#b91c1c", color: "#b91c1c", backgroundColor: "#fee2e2" }}
        />
      ),
    },
    {
      label: "En Reparación",
      count: enReparacion,
      icon: (
        <PlayCircle
          className="icon-card"
          style={{ stroke: "#1e40af", color: "#1e40af", backgroundColor: "#dbeafe" }}
        />
      ),
    },
    {
      label: "Desde Stock",
      count: desdeStock,
      icon: (
        <Package
          className="icon-card"
          style={{ stroke: "#6b21a8", color: "#6b21a8", backgroundColor: "#f3e8ff" }}
        />
      ),
    },
    {
      label: "Desde Venta",
      count: desdeVenta,
      icon: (
        <ShoppingCart
          className="icon-card"
          style={{ stroke: "#3730a3", color: "#3730a3", backgroundColor: "#e0e7ff" }}
        />
      ),
    },
    {
      label: "Desde Separación",
      count: desdeSep,
      icon: (
        <Lock
          className="icon-card"
          style={{ stroke: "#92400e", color: "#92400e", backgroundColor: "#fef3c7" }}
        />
      ),
    },
  ];

  return (
    <section>
      <div className="table-container">
        <TitleCrud
          title="Equipos Dañados"
          icon={Wrench}
          description="Monitorea las unidades en el flujo de reparación"
        />

        <SearchBox
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por serial, producto o cliente..."
        />

        <CountCard stats={stats} />

        <DataTable
          columns={columns}
          data={filtered}
          rowKey="id"
          showEdit={false}
          customActions={customActions}
          loading={loading}
        />

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

        {notify && (
          <NotifyModal
            variant={notify.variant}
            title={notify.title}
            message={notify.message}
            onClose={() => setNotify(null)}
          />
        )}
      </div>
    </section>
  );
};

export default Danados;
