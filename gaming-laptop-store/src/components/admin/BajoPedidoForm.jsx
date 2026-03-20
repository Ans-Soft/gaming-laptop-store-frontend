import React, { useState, useEffect } from "react";
import { ShoppingCart, Edit } from "lucide-react";
import ModalBase from "../../components/admin/ModalBase";
import * as ProductoService from "../../services/ProductoService";
import * as SupplierService from "../../services/SupplierService";
import "../../styles/admin/bajoPedidoForm.css";

const BajoPedidoForm = ({ onClose, onSubmit, bajoPedido }) => {
  const [formData, setFormData] = useState({
    producto: "",
    condicion: "nuevo",
    enlace_proveedor: "",
    proveedor: "",
  });

  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(bajoPedido);

  const CONDICIONES = ["nuevo", "open_box", "refurbished", "usado"];
  const ESTADOS = ["activo", "sin_existencias", "inactivo"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const productosData = await ProductoService.getProductos();
      setProductos(productosData.producto || []);

      const proveedoresData = await SupplierService.getSuppliers();
      setProveedores(proveedoresData || []);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        producto: bajoPedido.producto || "",
        condicion: bajoPedido.condicion || "nuevo",
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
      await onSubmit(formData, bajoPedido?.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalBase
      title={isEditMode ? "Editar Bajo Pedido" : "Registrar Nuevo Bajo Pedido"}
      icon={isEditMode ? <Edit size={24} /> : <ShoppingCart size={24} />}
      subtitle={
        isEditMode
          ? "Actualiza la información del sourcing bajo pedido"
          : "Completa la información para sourcing en demanda"
      }
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <div className="bpf-form-grid">
        <div className="bpf-form-group">
          <label htmlFor="producto">
            Producto <span className="required">*</span>
          </label>
          <select
            id="producto"
            name="producto"
            value={formData.producto}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          >
            <option value="">Selecciona un producto...</option>
            {productos.map((prod) => (
              <option key={prod.id} value={prod.id}>
                {prod.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="bpf-form-group">
          <label htmlFor="condicion">
            Condición <span className="required">*</span>
          </label>
          <select
            id="condicion"
            name="condicion"
            value={formData.condicion}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          >
            {CONDICIONES.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1).replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <div className="bpf-form-group bpf-full">
          <label htmlFor="enlace_proveedor">
            Enlace del Proveedor (URL eBay)
          </label>
          <input
            id="enlace_proveedor"
            name="enlace_proveedor"
            type="url"
            placeholder="Ej: https://ebay.com/itm/..."
            value={formData.enlace_proveedor}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          <small style={{ color: "#666", marginTop: "4px", display: "block" }}>
            Si está vacío, el precio no será actualizado por Celery
          </small>
        </div>

        <div className="bpf-form-group">
          <label htmlFor="proveedor">
            Proveedor
          </label>
          <select
            id="proveedor"
            name="proveedor"
            value={formData.proveedor}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            <option value="">-- Sin proveedor --</option>
            {proveedores.map((prov) => (
              <option key={prov.id} value={prov.id}>
                {prov.nombre}
              </option>
            ))}
          </select>
        </div>

        {isEditMode && bajoPedido && (
          <>
            <div className="bpf-form-group">
              <label>Precio Actual (COP)</label>
              <div className="bpf-preview">
                ${Number(bajoPedido.precio).toLocaleString("es-CO")}
              </div>
              <small style={{ color: "#666", marginTop: "4px", display: "block" }}>
                Actualizado automáticamente por Celery
              </small>
            </div>

            <div className="bpf-form-group">
              <label>Estado</label>
              <div className="bpf-preview">
                {bajoPedido.estado === "activo" && (
                  <span style={{ color: "#059669", fontWeight: "600" }}>✓ Activo</span>
                )}
                {bajoPedido.estado === "sin_existencias" && (
                  <span style={{ color: "#dc2626", fontWeight: "600" }}>Sin Existencias</span>
                )}
                {bajoPedido.estado === "inactivo" && (
                  <span style={{ color: "#6b7280", fontWeight: "600" }}>Inactivo</span>
                )}
              </div>
              <small style={{ color: "#666", marginTop: "4px", display: "block" }}>
                Asignado automáticamente por Celery
              </small>
            </div>
          </>
        )}
      </div>
    </ModalBase>
  );
};

export default BajoPedidoForm;
