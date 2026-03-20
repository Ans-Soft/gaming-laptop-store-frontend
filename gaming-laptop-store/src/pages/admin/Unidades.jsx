import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../../styles/admin/dataTable.css";
import "../../styles/global.css";
import { Box } from "lucide-react";
import { FaCheck, FaTimes } from "react-icons/fa";
import DataTable from "../../components/admin/DataTable";
import SearchBox from "../../components/admin/SearchBox";
import CountCard from "../../components/admin/CountCard";
import TitleCrud from "../../components/admin/TitleCrud";
import UnidadProductoForm from "../../components/admin/UnidadProductoForm";
import ModalBase from "../../components/admin/ModalBase";
import BreadcrumbNav from "../../components/admin/BreadcrumbNav";
import * as ProductoService from "../../services/ProductoService";

import {
  getUnidades,
  getUnidadDetail,
  createUnidad,
  updateUnidad,
  activateUnidad,
  deactivateUnidad,
} from "../../services/UnidadService";

const ESTADO_VENTA_LABELS = {
  sin_vender: "Sin Vender",
  separado: "Separado",
  vendido: "Vendido",
  por_encargo: "Por Encargo",
  entregado_garantia: "Entregado Garantía",
  danado: "Dañado",
  solicitud_metodo_aliado: "Método Aliado",
};

const ESTADO_VENTA_COLORS = {
  sin_vender: { bg: "#f3f4f6", color: "#374151" },
  separado: { bg: "#e9d5ff", color: "#581c87" },
  vendido: { bg: "#d1fae5", color: "#065f46" },
  por_encargo: { bg: "#fef3c7", color: "#92400e" },
  entregado_garantia: { bg: "#bfdbfe", color: "#1e40af" },
  danado: { bg: "#fee2e2", color: "#991b1b" },
  solicitud_metodo_aliado: { bg: "#e0e7ff", color: "#312e81" },
};

const ESTADO_PRODUCTO_LABELS = {
  en_stock: "En Stock",
  viajando: "Viajando",
  por_comprar: "Por Comprar",
  por_entregar: "Por Entregar",
  entregado: "Entregado",
  por_reparar: "Por Reparar",
  en_reparacion: "En Reparación",
};

const ESTADO_PRODUCTO_COLORS = {
  en_stock: { bg: "#d1fae5", color: "#065f46" },
  viajando: { bg: "#fef3c7", color: "#92400e" },
  por_comprar: { bg: "#e9d5ff", color: "#581c87" },
  por_entregar: { bg: "#bfdbfe", color: "#1e40af" },
  entregado: { bg: "#dbeafe", color: "#1e40af" },
  por_reparar: { bg: "#fed7aa", color: "#92400e" },
  en_reparacion: { bg: "#f87171", color: "#991b1b" },
};

const formatCOP = (value) => "$" + Number(value).toLocaleString("es-CO");

/**
 * Unidades admin page.
 * Lists all UnidadProducto records with global list + CRUD actions.
 * Supports optional ?variante_id= query parameter to pre-filter by variant.
 * Delegates create/edit to UnidadProductoForm inside ModalBase.
 */
const Unidades = () => {
  const [searchParams] = useSearchParams();
  const filterVarianteId = searchParams.get("variante_id") || null;

  const [unidades, setUnidades] = useState([]);
  const [editingUnidad, setEditingUnidad] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // When creating from filtered context, auto-fill variante_id
  const [contextVarianteId, setContextVarianteId] = useState(
    filterVarianteId ? Number(filterVarianteId) : null
  );
  const [contextVarianteNombre, setContextVarianteNombre] = useState(null);
  const [contextProductoNombre, setContextProductoNombre] = useState(null);

  // Product selector mini-modal (shown before UnidadProductoForm when no
  // context product is set, i.e. user lands directly on /admin/unidades)
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [productSelectorList, setProductSelectorList] = useState([]);
  const [productSelectorValue, setProductSelectorValue] = useState("");
  const [condicionSelectorValue, setCondicionSelectorValue] = useState("nuevo");
  const [productSelectorError, setProductSelectorError] = useState(null);

  const CONDICIONES = ["nuevo", "open_box", "refurbished", "usado"];

  useEffect(() => {
    fetchUnidades();
  }, [filterVarianteId]);

  const fetchUnidades = async () => {
    try {
      const data = await getUnidades(
        filterVarianteId ? Number(filterVarianteId) : null
      );
      setUnidades(data);
      // Derive variant and product names from first result when filtering
      if (filterVarianteId && data.length > 0) {
        setContextVarianteNombre(data[0].variante_nombre || null);
        setContextProductoNombre(data[0].producto_nombre || null);
      }
    } catch (error) {
      console.error("Error cargando unidades:", error);
    }
  };

  const handleOpenModal = async (unidad = null) => {
    setSubmitError(null);
    if (unidad) {
      // Edit mode: fetch full detail
      try {
        const detail = await getUnidadDetail(unidad.id);
        setEditingUnidad(detail);
      } catch (error) {
        console.error("Error cargando detalle de unidad:", error);
        setEditingUnidad(unidad);
      }
      setShowModal(true);
    } else {
      // Create mode: if there's a pre-selected variant from URL, open form directly
      // Otherwise, show variant selector
      setEditingUnidad(null);
      if (contextVarianteId) {
        // Variant is already set from URL parameter - open form directly
        setShowModal(true);
      } else {
        // No product selected - show selector to choose one
        try {
          const data = await ProductoService.getProductos();
          setProductSelectorList(data.filter((p) => p.active));
        } catch (err) {
          console.error("Error cargando productos:", err);
          setProductSelectorList([]);
        }
        setProductSelectorValue("");
        setCondicionSelectorValue("nuevo");
        setProductSelectorError(null);
        setShowProductSelector(true);
      }
    }
  };

  const handleProductSelectorConfirm = () => {
    if (!productSelectorValue) {
      setProductSelectorError("Selecciona un producto para continuar.");
      return;
    }
    const selected = productSelectorList.find(
      (p) => p.id === Number(productSelectorValue)
    );
    setContextVarianteId(Number(productSelectorValue)); // Reuse for producto ID
    setContextVarianteNombre(
      selected
        ? `${selected.nombre} (${condicionSelectorValue})`
        : null
    );
    setShowProductSelector(false);
    setShowModal(true);
  };

  const handleProductSelectorClose = () => {
    setShowProductSelector(false);
    setProductSelectorValue("");
    setCondicionSelectorValue("nuevo");
    setProductSelectorError(null);
  };

  const handleCloseModal = () => {
    setEditingUnidad(null);
    setSubmitError(null);
    setShowModal(false);
    // If not operating in a URL-filtered context, clear the variant selection
    // so the next "Nueva Unidad" click shows the selector again.
    if (!filterVarianteId) {
      setContextVarianteId(null);
      setContextVarianteNombre(null);
    }
  };

  const handleSubmit = async (payload, id) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (id) {
        await updateUnidad(id, payload);
      } else {
        await createUnidad(payload);
      }
      handleCloseModal();
      fetchUnidades();
    } catch (error) {
      console.error("Error al guardar unidad:", error);
      const errors = error.response?.data;
      if (errors) {
        const formatted = Object.entries(errors)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join("; ");
        setSubmitError(`Error: ${formatted}`);
      } else {
        setSubmitError("No se pudo completar la operación. Verifica tu conexión e intenta de nuevo.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivate = async (unidad) => {
    if (
      window.confirm(
        `Activar unidad con serial "${unidad.serial}"?\n` +
        "El estado y precio de la variante padre se actualizarán automáticamente."
      )
    ) {
      try {
        await activateUnidad(unidad.id);
        fetchUnidades();
      } catch (error) {
        console.error("Error al activar unidad:", error);
      }
    }
  };

  const handleDeactivate = async (unidad) => {
    if (
      window.confirm(
        `Desactivar unidad con serial "${unidad.serial}"?\n` +
        "El estado y precio de la variante padre se actualizarán automáticamente."
      )
    ) {
      try {
        await deactivateUnidad(unidad.id);
        fetchUnidades();
      } catch (error) {
        console.error("Error al desactivar unidad:", error);
      }
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    {
      key: "serial",
      label: "Serial",
      render: (row) => (
        <code
          style={{
            fontFamily: "Courier New, monospace",
            backgroundColor: "#f3f4f6",
            padding: "0.25rem 0.5rem",
            borderRadius: "4px",
            fontSize: "0.85em",
            fontWeight: "600",
          }}
        >
          {row.serial}
        </code>
      ),
    },
    {
      key: "variante_nombre",
      label: "Variante",
      render: (row) => (
        <span style={{ fontSize: "0.85em", color: "#4b5563" }}>
          {row.variante_nombre}
        </span>
      ),
    },
    {
      key: "precio",
      label: "Precio",
      render: (row) => formatCOP(row.precio),
    },
    {
      key: "estado_venta",
      label: "Estado Venta",
      render: (row) => {
        const colors = ESTADO_VENTA_COLORS[row.estado_venta] || { bg: "#f3f4f6", color: "#374151" };
        return (
          <span
            style={{
              display: "inline-block",
              padding: "0.35rem 0.75rem",
              borderRadius: "20px",
              fontSize: "0.8rem",
              fontWeight: "600",
              backgroundColor: colors.bg,
              color: colors.color,
            }}
          >
            {ESTADO_VENTA_LABELS[row.estado_venta] || row.estado_venta}
          </span>
        );
      },
    },
    {
      key: "estado_producto",
      label: "Estado Producto",
      render: (row) => {
        const colors = ESTADO_PRODUCTO_COLORS[row.estado_producto] || { bg: "#f3f4f6", color: "#374151" };
        return (
          <span
            style={{
              display: "inline-block",
              padding: "0.35rem 0.75rem",
              borderRadius: "20px",
              fontSize: "0.8rem",
              fontWeight: "600",
              backgroundColor: colors.bg,
              color: colors.color,
            }}
          >
            {ESTADO_PRODUCTO_LABELS[row.estado_producto] || row.estado_producto}
          </span>
        );
      },
    },
    {
      key: "active",
      label: "Activo",
      render: (row) => (
        <span
          style={{
            display: "inline-block",
            padding: "0.35rem 0.75rem",
            borderRadius: "20px",
            fontSize: "0.8rem",
            fontWeight: "600",
            backgroundColor: row.active ? "#d1fae5" : "#fee2e2",
            color: row.active ? "#065f46" : "#991b1b",
          }}
        >
          {row.active ? "Activo" : "Inactivo"}
        </span>
      ),
    },
  ];

  const stats = [
    {
      label: "Unidades",
      count: unidades.length,
      icon: <Box className="icon-card" />,
    },
    {
      label: "Activas",
      count: unidades.filter((u) => u.active).length,
      icon: <Box className="icon-card" />,
    },
    {
      label: "Sin Vender",
      count: unidades.filter((u) => u.estado_venta === "sin_vender").length,
      icon: <Box className="icon-card" />,
    },
    {
      label: "En Stock",
      count: unidades.filter((u) => u.estado_producto === "en_stock").length,
      icon: <Box className="icon-card" />,
    },
  ];

  return (
    <section>
      <div className="table-container">
        {filterVarianteId && contextVarianteNombre && contextProductoNombre && (
          <BreadcrumbNav
            segments={[
              { label: "Productos", path: "/admin/productos" },
              { label: contextProductoNombre, path: `/admin/variantes?producto_id=` },
              { label: "Variantes", path: `/admin/variantes` },
              { label: contextVarianteNombre, path: `/admin/unidades?variante_id=${filterVarianteId}` },
            ]}
          />
        )}

        <TitleCrud
          title="Unidades de Producto"
          icon={Box}
          description={
            filterVarianteId && contextVarianteNombre
              ? `Mostrando unidades de: ${contextVarianteNombre}`
              : "Administra las unidades físicas de cada variante (serial, estado y precio individual)"
          }
        />

        <SearchBox
          onRegisterClick={() => handleOpenModal()}
          registerLabel="Nueva Unidad"
        />

        <CountCard stats={stats} />

        <DataTable
          columns={columns}
          data={unidades}
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

        {/* Product selector: shown before UnidadProductoForm when no
            context product is set and the user clicks "Nueva Unidad" */}
        {showProductSelector && (
          <ModalBase
            title="Seleccionar Producto y Condición"
            icon={<Box size={24} />}
            subtitle="Elige el producto y condición para la nueva unidad"
            onClose={handleProductSelectorClose}
            onSubmit={handleProductSelectorConfirm}
          >
            <div style={{ minWidth: "300px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group">
                <label htmlFor="up-product-select">
                  Producto <span style={{ color: "#c0392b" }}>*</span>
                </label>
                <select
                  id="up-product-select"
                  value={productSelectorValue}
                  onChange={(e) => {
                    setProductSelectorValue(e.target.value);
                    if (productSelectorError) setProductSelectorError(null);
                  }}
                >
                  <option value="">-- Selecciona un producto --</option>
                  {productSelectorList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="up-condicion-select">
                  Condición <span style={{ color: "#c0392b" }}>*</span>
                </label>
                <select
                  id="up-condicion-select"
                  value={condicionSelectorValue}
                  onChange={(e) => setCondicionSelectorValue(e.target.value)}
                >
                  {CONDICIONES.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              {productSelectorError && (
                <span
                  style={{
                    fontSize: "0.78rem",
                    color: "#c0392b",
                    marginTop: "2px",
                    display: "block",
                  }}
                >
                  {productSelectorError}
                </span>
              )}
            </div>
          </ModalBase>
        )}

        {showModal && (
          <UnidadProductoForm
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
            unidad={editingUnidad}
            varianteId={contextVarianteId}
            varianteNombre={contextVarianteNombre}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        )}
      </div>
    </section>
  );
};

export default Unidades;
