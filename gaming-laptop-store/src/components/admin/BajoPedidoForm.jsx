import React, { useState, useEffect } from "react";
import { ShoppingCart, Edit, Link, Tag, DollarSign, Package } from "lucide-react";
import ModalBase from "../../components/admin/ModalBase";
import * as ProductoService from "../../services/ProductoService";
import * as SupplierService from "../../services/SupplierService";
import "../../styles/admin/bajoPedidoForm.css";

const CONDICIONES = [
  { value: "nuevo",       label: "Nuevo" },
  { value: "open_box",    label: "Open Box" },
  { value: "refurbished", label: "Refurbished" },
  { value: "usado",       label: "Usado" },
];

const BajoPedidoForm = ({ onClose, onSubmit, bajoPedido }) => {
  const [formData, setFormData] = useState({
    producto: "",
    condicion: "nuevo",
    precio: "",
    enlace_proveedor: "",
    proveedor: "",
  });

  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(bajoPedido);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const productosData = await ProductoService.getProductos();
      setProductos(
        Array.isArray(productosData)
          ? productosData
          : productosData.producto ?? productosData.results ?? []
      );

      const proveedoresData = await SupplierService.getSuppliers();
      setProveedores(
        Array.isArray(proveedoresData)
          ? proveedoresData
          : proveedoresData.proveedor ?? proveedoresData.results ?? []
      );
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        producto: bajoPedido.producto || "",
        condicion: bajoPedido.condicion || "nuevo",
        precio: bajoPedido.precio ?? "",
        enlace_proveedor: bajoPedido.enlace_proveedor || "",
        proveedor: bajoPedido.proveedor || "",
      });
    }
  }, [bajoPedido, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Build a payload that matches the backend serializers:
      // - create expects `producto_id` + required `precio`
      // - update does NOT accept producto_id (product can't change)
      // - empty proveedor must be null (PK field), not ""
      const payload = {
        condicion: formData.condicion,
        enlace_proveedor: formData.enlace_proveedor || "",
        proveedor: formData.proveedor ? Number(formData.proveedor) : null,
      };
      if (formData.precio !== "" && formData.precio !== null) {
        payload.precio = Number(formData.precio);
      }
      if (!isEditMode) {
        payload.producto_id = Number(formData.producto);
      }
      await onSubmit(payload, bajoPedido?.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Derived display for edit mode status badge ── */
  const estadoMeta = {
    activo:         { label: "Activo",          cls: "bpf-status--active" },
    sin_existencias:{ label: "Sin existencias", cls: "bpf-status--empty" },
    inactivo:       { label: "Inactivo",        cls: "bpf-status--inactive" },
  };

  return (
    <ModalBase
      title={isEditMode ? "Editar variante" : "Nueva variante"}
      icon={isEditMode ? <Edit size={22} /> : <ShoppingCart size={22} />}
      subtitle={
        isEditMode
          ? "Actualiza la información del listing de bajo pedido"
          : "Registra un nuevo listing de sourcing bajo demanda"
      }
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <div className="bpf-form">

        {/* ── Sección 1: Producto + Condición ── */}
        <div className="bpf-section">
          <div className="bpf-section-label">
            <Package size={14} />
            <span>Producto</span>
          </div>
          <div className="bpf-grid-2">

            <div className="bpf-field bpf-col-2">
              <label htmlFor="bpf-producto" className="bpf-label">
                Producto
                {!isEditMode && <span className="bpf-required">*</span>}
              </label>
              {isEditMode ? (
                /* En edición el producto no puede cambiar — mostrar como readonly */
                <div className="bpf-readonly-value">
                  {productos.find((p) => String(p.id) === String(formData.producto))?.nombre
                    ?? (formData.producto ? `ID ${formData.producto}` : "—")}
                </div>
              ) : (
                <select
                  id="bpf-producto"
                  name="producto"
                  value={formData.producto}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="bpf-input"
                >
                  <option value="">Selecciona un producto...</option>
                  {productos.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.nombre}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="bpf-field">
              <label htmlFor="bpf-condicion" className="bpf-label">
                Condición <span className="bpf-required">*</span>
              </label>
              <select
                id="bpf-condicion"
                name="condicion"
                value={formData.condicion}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="bpf-input"
              >
                {CONDICIONES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado (solo edición) */}
            {isEditMode && bajoPedido && (
              <div className="bpf-field">
                <label className="bpf-label">Estado actual</label>
                <div className="bpf-status-display">
                  {(() => {
                    const meta = estadoMeta[bajoPedido.estado] ?? { label: bajoPedido.estado, cls: "" };
                    return <span className={`bpf-status-badge ${meta.cls}`}>{meta.label}</span>;
                  })()}
                  <span className="bpf-hint">Gestionado por el sync diario</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Sección 2: Precio + Proveedor ── */}
        <div className="bpf-section">
          <div className="bpf-section-label">
            <DollarSign size={14} />
            <span>Precio y proveedor</span>
          </div>
          <div className="bpf-grid-2">

            <div className="bpf-field">
              <label htmlFor="bpf-precio" className="bpf-label">
                Precio (COP)
                {!isEditMode && <span className="bpf-required">*</span>}
              </label>
              <input
                id="bpf-precio"
                name="precio"
                type="number"
                min="0"
                step="1"
                placeholder="Ej: 5 000 000"
                value={formData.precio}
                onChange={handleChange}
                required={!isEditMode}
                disabled={isSubmitting}
                className="bpf-input"
              />
              <span className="bpf-hint">
                {isEditMode
                  ? "Sobreescribe el precio; el sync diario puede ajustarlo si hay enlace eBay."
                  : "Precio base. El sync diario lo ajustará si hay enlace eBay."}
              </span>
            </div>

            <div className="bpf-field">
              <label htmlFor="bpf-proveedor" className="bpf-label">
                Proveedor
              </label>
              <select
                id="bpf-proveedor"
                name="proveedor"
                value={formData.proveedor}
                onChange={handleChange}
                disabled={isSubmitting}
                className="bpf-input"
              >
                <option value="">Sin proveedor asignado</option>
                {proveedores.map((prov) => (
                  <option key={prov.id} value={prov.id}>
                    {prov.nombre}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* ── Sección 3: Enlace eBay (ancho completo) ── */}
        <div className="bpf-section bpf-section--last">
          <div className="bpf-section-label">
            <Link size={14} />
            <span>Enlace del listing</span>
          </div>

          <div className="bpf-field">
            <label htmlFor="bpf-enlace" className="bpf-label">
              URL del proveedor (eBay u otro)
            </label>
            <input
              id="bpf-enlace"
              name="enlace_proveedor"
              type="url"
              placeholder="https://www.ebay.com/itm/..."
              value={formData.enlace_proveedor}
              onChange={handleChange}
              disabled={isSubmitting}
              className="bpf-input bpf-input--url"
            />
            <span className="bpf-hint">
              Si se deja vacío, el precio no será actualizado automáticamente por el sync de bajo pedido.
            </span>
          </div>
        </div>

      </div>
    </ModalBase>
  );
};

export default BajoPedidoForm;
