import React, { useState, useEffect } from "react";
import { ShoppingCart, Edit, AlertCircle } from "lucide-react";
import ModalBase from "../../components/admin/ModalBase";
import * as ProductoService from "../../services/ProductoService";
import * as SupplierService from "../../services/SupplierService";
import * as TRMService from "../../services/TRMService";
import "../../styles/admin/ordenCompraForm.css";

const OrdenCompraForm = ({ onClose, onSubmit, orden, preselectedProducto }) => {
  const [formData, setFormData] = useState({
    producto: preselectedProducto?.id ? preselectedProducto.id.toString() : "",
    condicion: "nuevo",
    proveedor: "",
    numero_orden: "",
    numero_tracking: "",
    costo_compra: "",
    costo_importacion: "",
    porcentaje_impuesto: "2",
    precio_venta: "",
    estado_logistico: "viajando",
  });

  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [impuestoPreview, setImpuestoPreview] = useState(0);
  const [trm, setTrm] = useState(null);
  const [costCurrency, setCostCurrency] = useState("usd");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const isEditMode = Boolean(orden);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setDataError(null);

      // Fetch productos - ListAPIView returns array directly
      const productosData = await ProductoService.getProductos();
      console.log("Productos response:", productosData);

      let productosList = [];
      if (Array.isArray(productosData)) {
        productosList = productosData;
      } else if (productosData.producto && Array.isArray(productosData.producto)) {
        productosList = productosData.producto;
      } else if (productosData.productos && Array.isArray(productosData.productos)) {
        productosList = productosData.productos;
      } else if (typeof productosData === "object" && productosData !== null) {
        console.warn("Unexpected productos response format:", productosData);
      }

      setProductos(productosList);
      console.log("Loaded productos:", productosList.length);

      // Fetch suppliers
      const proveedoresData = await SupplierService.getSuppliers();
      console.log("Suppliers response:", proveedoresData);
      let proveedoresList = Array.isArray(proveedoresData)
        ? proveedoresData
        : (proveedoresData.proveedor || proveedoresData.proveedores || []);
      setProveedores(proveedoresList);

      // Fetch TRM
      try {
        const trmData = await TRMService.getTRM();
        console.log("TRM response:", trmData);
        const latest = trmData.trm_history?.[0];
        setTrm(latest ? parseFloat(latest.valor_cop) : null);
      } catch (trmError) {
        console.warn("Warning: Could not fetch TRM, continuing without conversion", trmError);
        setTrm(null);
      }
    } catch (error) {
      console.error("Error al obtener datos:", error);
      setDataError("Error al cargar los datos. Por favor, recarga la página.");
    } finally {
      setIsLoading(false);
    }
  };

  // Recalculate impuesto and suggested price when currency toggle changes
  useEffect(() => {
    if (formData.costo_compra) {
      const pct = parseFloat(formData.porcentaje_impuesto || 2) / 100;
      const valueUsd = costCurrency === "cop" && trm
        ? parseFloat(formData.costo_compra) / trm
        : parseFloat(formData.costo_compra);
      const impuesto = valueUsd * pct;
      setImpuestoPreview(isNaN(impuesto) ? 0 : impuesto);
      recalcSuggestedPrice(formData.costo_compra, formData.costo_importacion, impuesto, costCurrency);
    }
  }, [costCurrency]);

  const recalcSuggestedPrice = (costoCompra, costoImportacion, impuesto, currency) => {
    if (!trm) return;
    const compraUsd = currency === "cop" ? parseFloat(costoCompra || 0) / trm : parseFloat(costoCompra || 0);
    const importUsd = currency === "cop" ? parseFloat(costoImportacion || 0) / trm : parseFloat(costoImportacion || 0);
    const totalUsd = compraUsd + importUsd + impuesto;
    const sugerido = Math.round((totalUsd * trm * 1.2 - 90000) / 100000) * 100000 + 90000;
    if (sugerido > 0) {
      setFormData((prev) => ({ ...prev, precio_venta: sugerido.toString() }));
    }
  };

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        producto: orden.producto || "",
        condicion: orden.condicion || "nuevo",
        proveedor: orden.proveedor || "",
        numero_orden: orden.numero_orden,
        numero_tracking: orden.numero_tracking || "",
        costo_compra: orden.costo_compra,
        costo_importacion: orden.costo_importacion || "",
        porcentaje_impuesto: orden.porcentaje_impuesto?.toString() || "2",
        precio_venta: "",
        estado_logistico: orden.estado_logistico,
      });
      setImpuestoPreview(parseFloat(orden.impuesto_importacion) || 0);
    }
  }, [orden, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "costo_compra" || name === "costo_importacion" || name === "porcentaje_impuesto") {
        const compraVal = name === "costo_compra" ? value : prev.costo_compra;
        const importVal = name === "costo_importacion" ? value : prev.costo_importacion;
        const pctVal = name === "porcentaje_impuesto" ? value : prev.porcentaje_impuesto;

        const pct = parseFloat(pctVal || 2) / 100;
        const compraUsd = costCurrency === "cop" && trm
          ? parseFloat(compraVal || 0) / trm
          : parseFloat(compraVal || 0);
        const importUsd = costCurrency === "cop" && trm
          ? parseFloat(importVal || 0) / trm
          : parseFloat(importVal || 0);
        const impuesto = compraUsd * pct;

        setImpuestoPreview(isNaN(impuesto) ? 0 : impuesto);

        if (trm && compraUsd > 0) {
          const totalUsd = compraUsd + importUsd + impuesto;
          const sugerido = Math.round((totalUsd * trm * 1.2 - 90000) / 100000) * 100000 + 90000;
          if (sugerido > 0) updated.precio_venta = sugerido.toString();
        }
      }

      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }

      return updated;
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.producto) newErrors.producto = "Selecciona un producto";
    if (!formData.condicion) newErrors.condicion = "Selecciona una condición";
    if (!formData.costo_compra) newErrors.costo_compra = "Ingresa el costo de compra";
    if (parseFloat(formData.costo_compra) <= 0) newErrors.costo_compra = "El costo debe ser mayor a 0";
    if (!formData.proveedor) newErrors.proveedor = "Selecciona un proveedor";
    if (!formData.numero_orden) newErrors.numero_orden = "Ingresa el número de orden";
    if (formData.porcentaje_impuesto !== "" && parseFloat(formData.porcentaje_impuesto) < 0)
      newErrors.porcentaje_impuesto = "El porcentaje no puede ser negativo";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const compraUsd = costCurrency === "cop" && trm
      ? (parseFloat(formData.costo_compra) / trm).toFixed(6)
      : formData.costo_compra;
    const importacionUsd = formData.costo_importacion !== ""
      ? costCurrency === "cop" && trm
        ? (parseFloat(formData.costo_importacion) / trm).toFixed(6)
        : formData.costo_importacion
      : null;

    const payload = {
      ...formData,
      costo_compra: compraUsd,
      costo_importacion: importacionUsd,
      precio_venta: formData.precio_venta !== "" ? formData.precio_venta : null,
    };

    try {
      if (onSubmit) {
        await onSubmit(payload, orden?.id);
      }
    } catch (error) {
      console.error("Error al enviar orden:", error);
      setSubmitError(
        error.response?.data?.message ||
        "Error al guardar la orden. Por favor, intenta de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <ModalBase
      title={isEditMode ? "Editar Orden de Compra" : "Registrar Nueva Orden de Compra"}
      icon={isEditMode ? <Edit size={24} /> : <ShoppingCart size={24} />}
      subtitle={
        isEditMode
          ? "Actualiza la información de la orden"
          : "Completa la información de la orden de compra"
      }
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    >
      {dataError && (
        <div className="ocf-error-banner">
          <AlertCircle size={18} />
          <span>{dataError}</span>
        </div>
      )}

      {submitError && (
        <div className="ocf-error-banner">
          <AlertCircle size={18} />
          <span>{submitError}</span>
        </div>
      )}

      {isLoading ? (
        <div className="ocf-loading">Cargando datos...</div>
      ) : (
        <div className="ocf-form-container">
          {/* Section 1: Producto */}
          <fieldset className="ocf-section">
            <legend className="ocf-section-title">1. Producto</legend>
            <div className="ocf-form-grid">
              <div className="form-group">
                <label htmlFor="producto">
                  Producto <span className="required">*</span>
                </label>
                <select
                  id="producto"
                  name="producto"
                  value={formData.producto}
                  onChange={handleChange}
                  className={errors.producto ? "input-error" : ""}
                  disabled={productos.length === 0}
                >
                  <option value="">
                    {productos.length === 0
                      ? "Cargando productos..."
                      : "Selecciona un producto..."}
                  </option>
                  {productos.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.nombre || `Producto ${prod.id}`}
                    </option>
                  ))}
                </select>
                {errors.producto && (
                  <span className="ocf-error-text">{errors.producto}</span>
                )}
                {!isLoading && productos.length === 0 && (
                  <span className="ocf-hint">
                    ⚠️ No hay productos registrados en el sistema
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="condicion">
                  Condición <span className="required">*</span>
                </label>
                <select
                  id="condicion"
                  name="condicion"
                  value={formData.condicion}
                  onChange={handleChange}
                  className={errors.condicion ? "input-error" : ""}
                >
                  <option value="nuevo">Nuevo</option>
                  <option value="open_box">Open Box</option>
                  <option value="refurbished">Refurbished</option>
                  <option value="usado">Usado</option>
                </select>
                {errors.condicion && (
                  <span className="ocf-error-text">{errors.condicion}</span>
                )}
              </div>

            </div>
          </fieldset>

          {/* Section 2: Logística */}
          <fieldset className="ocf-section">
            <legend className="ocf-section-title">2. Logística</legend>
            <div className="ocf-form-grid">
              <div className="form-group">
                <label htmlFor="estado_logistico">
                  Estado Logístico <span className="required">*</span>
                </label>
                <select
                  id="estado_logistico"
                  name="estado_logistico"
                  value={formData.estado_logistico}
                  onChange={handleChange}
                >
                  <option value="viajando">Viajando</option>
                  <option value="en_oficina_importadora">
                    En Oficina Importadora
                  </option>
                  <option value="en_oficina">En Oficina (Tienda)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="proveedor">
                  Proveedor <span className="required">*</span>
                </label>
                <select
                  id="proveedor"
                  name="proveedor"
                  value={formData.proveedor}
                  onChange={handleChange}
                  className={errors.proveedor ? "input-error" : ""}
                  disabled={proveedores.length === 0}
                >
                  <option value="">
                    {proveedores.length === 0
                      ? "No hay proveedores"
                      : "Selecciona un proveedor..."}
                  </option>
                  {proveedores.map((prov) => (
                    <option key={prov.id} value={prov.id}>
                      {prov.nombre}
                    </option>
                  ))}
                </select>
                {errors.proveedor && (
                  <span className="ocf-error-text">{errors.proveedor}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="numero_orden">
                  Número de Orden <span className="required">*</span>
                </label>
                <input
                  id="numero_orden"
                  name="numero_orden"
                  type="text"
                  placeholder="Ej: PO-2024-001"
                  value={formData.numero_orden}
                  onChange={handleChange}
                  className={errors.numero_orden ? "input-error" : ""}
                />
                {errors.numero_orden && (
                  <span className="ocf-error-text">{errors.numero_orden}</span>
                )}
              </div>
            </div>
          </fieldset>

          {/* Section 3: Costos */}
          <fieldset className="ocf-section">
            <legend className="ocf-section-title">3. Costos</legend>
            <div className="ocf-currency-toggle-row">
              <span className="ocf-currency-label">Moneda de entrada:</span>
              <div className="ocf-currency-toggle" role="radiogroup" aria-label="Seleccionar moneda">
                <button
                  type="button"
                  role="radio"
                  aria-checked={costCurrency === "usd"}
                  className={`ocf-currency-btn${costCurrency === "usd" ? " active" : ""}`}
                  onClick={() => setCostCurrency("usd")}
                >
                  USD
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={costCurrency === "cop"}
                  className={`ocf-currency-btn${costCurrency === "cop" ? " active" : ""}`}
                  onClick={() => setCostCurrency("cop")}
                >
                  COP
                </button>
              </div>
            </div>
            <div className="ocf-form-grid">
              <div className="form-group">
                <label htmlFor="costo_compra">
                  Costo de Compra ({costCurrency.toUpperCase()}) <span className="required">*</span>
                </label>
                <input
                  id="costo_compra"
                  name="costo_compra"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={costCurrency === "usd" ? "Ej: 500.00" : "Ej: 2000000"}
                  value={formData.costo_compra}
                  onChange={handleChange}
                  className={errors.costo_compra ? "input-error" : ""}
                />
                {errors.costo_compra && (
                  <span className="ocf-error-text">{errors.costo_compra}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="costo_importacion">
                  Costo de Importación ({costCurrency.toUpperCase()})
                </label>
                <input
                  id="costo_importacion"
                  name="costo_importacion"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={costCurrency === "usd" ? "Ej: 50.00" : "Ej: 200000"}
                  value={formData.costo_importacion}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="porcentaje_impuesto">
                  Impuesto de importación (%)
                  <span className="ocf-hint"> — 0 si no aplica</span>
                </label>
                <input
                  id="porcentaje_impuesto"
                  name="porcentaje_impuesto"
                  type="number"
                  step="0.01"
                  placeholder="Ej: 2"
                  value={formData.porcentaje_impuesto}
                  onChange={handleChange}
                  className={errors.porcentaje_impuesto ? "input-error" : ""}
                />
                {errors.porcentaje_impuesto && (
                  <span className="ocf-error-text">{errors.porcentaje_impuesto}</span>
                )}
              </div>

              {!isEditMode && (
                <div className="form-group">
                  <label htmlFor="precio_venta">
                    Precio de Venta (COP)
                    <span className="ocf-hint"> — se guardará en la unidad</span>
                  </label>
                  <input
                    id="precio_venta"
                    name="precio_venta"
                    type="number"
                    step="any"
                    min="0"
                    placeholder="Auto-calculado si se deja vacío"
                    value={formData.precio_venta}
                    onChange={handleChange}
                  />
                </div>
              )}

            </div>

            {/* Cost Summary */}
            <div className="ocf-cost-summary">
              <div className="ocf-cost-header">
                <span className="ocf-col-label" style={{ textAlign: "left" }}>Concepto</span>
                <span className="ocf-col-label">Ingresado ({costCurrency.toUpperCase()})</span>
                <span className="ocf-col-label">Convertido ({costCurrency === "usd" ? "COP" : "USD"})</span>
              </div>

              <div className="ocf-cost-row">
                <span className="ocf-cost-label">Costo de Compra:</span>
                <span className="ocf-cost-amount">
                  {costCurrency === "usd"
                    ? `$${parseFloat(formData.costo_compra || 0).toFixed(2)}`
                    : `$${parseFloat(formData.costo_compra || 0).toLocaleString("es-CO", { maximumFractionDigits: 0 })}`
                  }
                </span>
                <span className="ocf-cost-amount ocf-cop">
                  {trm
                    ? costCurrency === "usd"
                      ? `$${(parseFloat(formData.costo_compra || 0) * trm).toLocaleString("es-CO", { maximumFractionDigits: 0 })}`
                      : `$${(parseFloat(formData.costo_compra || 0) / trm).toFixed(2)}`
                    : "—"
                  }
                </span>
              </div>

              <div className="ocf-cost-row">
                <span className="ocf-cost-label">
                  Impuesto ({formData.porcentaje_impuesto || 2}%):
                </span>
                <span className="ocf-cost-amount">
                  {costCurrency === "usd"
                    ? `$${impuestoPreview.toFixed(2)}`
                    : trm ? `$${(impuestoPreview * trm).toLocaleString("es-CO", { maximumFractionDigits: 0 })}` : "—"
                  }
                </span>
                <span className="ocf-cost-amount ocf-cop">
                  {trm
                    ? costCurrency === "usd"
                      ? `$${(impuestoPreview * trm).toLocaleString("es-CO", { maximumFractionDigits: 0 })}`
                      : `$${impuestoPreview.toFixed(2)}`
                    : "—"
                  }
                </span>
              </div>

              {formData.costo_importacion && (
                <div className="ocf-cost-row">
                  <span className="ocf-cost-label">Costo de Importación:</span>
                  <span className="ocf-cost-amount">
                    {costCurrency === "usd"
                      ? `$${parseFloat(formData.costo_importacion).toFixed(2)}`
                      : `$${parseFloat(formData.costo_importacion).toLocaleString("es-CO", { maximumFractionDigits: 0 })}`
                    }
                  </span>
                  <span className="ocf-cost-amount ocf-cop">
                    {trm
                      ? costCurrency === "usd"
                        ? `$${(parseFloat(formData.costo_importacion) * trm).toLocaleString("es-CO", { maximumFractionDigits: 0 })}`
                        : `$${(parseFloat(formData.costo_importacion) / trm).toFixed(2)}`
                      : "—"
                    }
                  </span>
                </div>
              )}

              <div className="ocf-cost-row ocf-cost-total">
                <span className="ocf-cost-label">Costo Total Est.:</span>
                <span className="ocf-cost-amount">
                  {(() => {
                    const compra = parseFloat(formData.costo_compra || 0);
                    const importacion = parseFloat(formData.costo_importacion || 0);
                    if (costCurrency === "usd") {
                      return `$${(compra + impuestoPreview + importacion).toFixed(2)}`;
                    } else {
                      return `$${(compra + (impuestoPreview * (trm || 0)) + importacion).toLocaleString("es-CO", { maximumFractionDigits: 0 })}`;
                    }
                  })()}
                </span>
                <span className="ocf-cost-amount ocf-cop">
                  {trm ? (() => {
                    const compra = parseFloat(formData.costo_compra || 0);
                    const importacion = parseFloat(formData.costo_importacion || 0);
                    if (costCurrency === "usd") {
                      return `$${((compra + impuestoPreview + importacion) * trm).toLocaleString("es-CO", { maximumFractionDigits: 0 })}`;
                    } else {
                      return `$${((compra / trm) + impuestoPreview + (importacion / trm)).toFixed(2)}`;
                    }
                  })() : "—"}
                </span>
              </div>

              {trm && <p className="ocf-trm-note">TRM utilizada: $ {trm.toLocaleString("es-CO")} COP/USD</p>}
            </div>
          </fieldset>

          {/* Section 4: Seguimiento */}
          <fieldset className="ocf-section">
            <legend className="ocf-section-title">4. Seguimiento</legend>
            <div className="ocf-form-grid">
              <div className="form-group ocf-full">
                <label htmlFor="numero_tracking">
                  Número de Seguimiento
                  <span className="ocf-hint"> (opcional)</span>
                </label>
                <input
                  id="numero_tracking"
                  name="numero_tracking"
                  type="text"
                  placeholder="Ej: 123456789"
                  value={formData.numero_tracking}
                  onChange={handleChange}
                />
              </div>
            </div>
          </fieldset>
        </div>
      )}
    </ModalBase>
  );
};

export default OrdenCompraForm;
