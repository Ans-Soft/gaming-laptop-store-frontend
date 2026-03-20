import React, { useState, useEffect } from "react";
import { ShoppingCart, Edit } from "lucide-react";
import ModalBase from "../../components/admin/ModalBase";
import * as ProductoService from "../../services/ProductoService";
import * as SupplierService from "../../services/SupplierService";
import * as ClienteService from "../../services/ClienteService";
import * as ProductoBajoPedidoService from "../../services/ProductoBajoPedidoService";
import "../../styles/admin/ordenCompraForm.css";

const OrdenCompraForm = ({ onClose, onSubmit, orden }) => {
  const [formData, setFormData] = useState({
    producto: "",
    condicion: "nuevo",
    tipo: "compra_externa",
    proveedor: "",
    cliente: "",
    numero_orden: "",
    numero_tracking: "",
    costo_compra: "",
    costo_importacion: "",
    estado_logistico: "viajando",
    estado_venta_unidad: "sin_vender",
    estado_producto_unidad: "en_stock",
    producto_bajo_pedido_id: "",
  });

  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productosBajoPedido, setProductosBajoPedido] = useState([]);
  const [impuestoPreview, setImpuestoPreview] = useState(0);

  const isEditMode = Boolean(orden);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const productosData = await ProductoService.getProductos();
      setProductos(productosData.producto || []);

      const proveedoresData = await SupplierService.getSuppliers();
      setProveedores(proveedoresData || []);

      const clientesData = await ClienteService.getClientes();
      setClientes(clientesData.cliente || []);

      const pbpData = await ProductoBajoPedidoService.getProductosBajoPedido();
      setProductosBajoPedido(pbpData.producto_bajo_pedido || []);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        producto: orden.producto || "",
        condicion: orden.condicion || "nuevo",
        tipo: orden.tipo,
        proveedor: orden.proveedor || "",
        cliente: orden.cliente || "",
        numero_orden: orden.numero_orden,
        numero_tracking: orden.numero_tracking || "",
        costo_compra: orden.costo_compra,
        costo_importacion: orden.costo_importacion || "",
        estado_logistico: orden.estado_logistico,
        estado_venta_unidad: "sin_vender",
        estado_producto_unidad: "en_stock",
        producto_bajo_pedido_id: "",
      });
      setImpuestoPreview(orden.impuesto_importacion);
    }
  }, [orden, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto-calculate import tax when cost changes
      if (name === "costo_compra" && value) {
        const impuesto = parseFloat(value) * 0.02;
        setImpuestoPreview(isNaN(impuesto) ? 0 : impuesto);
      }

      // Update estado_venta_unidad when producto_bajo_pedido is selected
      if (name === "producto_bajo_pedido_id" && value) {
        updated.estado_venta_unidad = "por_encargo";
      }

      return updated;
    });
  };

  const handleSubmit = () => {
    if (onSubmit) onSubmit(formData, orden?.id);
  };

  const isExternalPurchase = formData.tipo === "compra_externa";

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
    >
      <div className="ocf-form-grid">
        <div className="ocf-form-group">
          <label htmlFor="producto">
            Producto <span className="required">*</span>
          </label>
          <select
            id="producto"
            name="producto"
            value={formData.producto}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona un producto...</option>
            {productos.map((prod) => (
              <option key={prod.id} value={prod.id}>
                {prod.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="ocf-form-group">
          <label htmlFor="condicion">
            Condición <span className="required">*</span>
          </label>
          <select
            id="condicion"
            name="condicion"
            value={formData.condicion}
            onChange={handleChange}
            required
          >
            <option value="nuevo">Nuevo</option>
            <option value="open_box">Open Box</option>
            <option value="refurbished">Refurbished</option>
            <option value="usado">Usado</option>
          </select>
        </div>

        <div className="ocf-form-group ocf-full">
          <label htmlFor="tipo">
            Tipo de Compra <span className="required">*</span>
          </label>
          <select
            id="tipo"
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            required
          >
            <option value="compra_externa">Compra Externa</option>
            <option value="canje_cliente">Canje de Cliente</option>
          </select>
        </div>

        <div className="ocf-form-group">
          <label htmlFor="estado_logistico">
            Estado Logístico <span className="required">*</span>
          </label>
          <select
            id="estado_logistico"
            name="estado_logistico"
            value={formData.estado_logistico}
            onChange={handleChange}
            required
          >
            <option value="viajando">Viajando</option>
            <option value="en_oficina_importadora">En Oficina de Importadora</option>
            <option value="en_oficina">En Oficina (Tienda)</option>
          </select>
        </div>

        <div className="ocf-form-group">
          <label htmlFor="estado_venta_unidad">
            Estado de Venta Inicial
          </label>
          <select
            id="estado_venta_unidad"
            name="estado_venta_unidad"
            value={formData.estado_venta_unidad}
            onChange={handleChange}
          >
            <option value="sin_vender">Sin Vender</option>
            <option value="bajo_pedido">Bajo Pedido</option>
            <option value="por_encargo">Por Encargo</option>
          </select>
        </div>

        <div className="ocf-form-group ocf-full">
          <label htmlFor="producto_bajo_pedido_id">
            Vinculado a Producto Bajo Pedido (opcional)
          </label>
          <select
            id="producto_bajo_pedido_id"
            name="producto_bajo_pedido_id"
            value={formData.producto_bajo_pedido_id}
            onChange={handleChange}
          >
            <option value="">Sin vincular</option>
            {productosBajoPedido
              .filter((pbp) => pbp.estado === "por_comprar")
              .map((pbp) => (
                <option key={pbp.id} value={pbp.id}>
                  {pbp.cliente_nombre} - {pbp.variante_nombre}
                </option>
              ))}
          </select>
        </div>

        {isExternalPurchase && (
          <>
            <div className="ocf-form-group ocf-full">
              <label htmlFor="proveedor">
                Proveedor <span className="required">*</span>
              </label>
              <select
                id="proveedor"
                name="proveedor"
                value={formData.proveedor}
                onChange={handleChange}
                required={isExternalPurchase}
              >
                <option value="">Selecciona un proveedor...</option>
                {proveedores.map((prov) => (
                  <option key={prov.id} value={prov.id}>
                    {prov.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="ocf-form-group ocf-full">
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
                required={isExternalPurchase}
              />
            </div>
          </>
        )}

        {!isExternalPurchase && (
          <div className="ocf-form-group ocf-full">
            <label htmlFor="cliente">
              Cliente <span className="required">*</span>
            </label>
            <select
              id="cliente"
              name="cliente"
              value={formData.cliente}
              onChange={handleChange}
              required={!isExternalPurchase}
            >
              <option value="">Selecciona un cliente...</option>
              {clientes.map((cli) => (
                <option key={cli.id} value={cli.id}>
                  {cli.nombre_completo} ({cli.cedula})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="ocf-form-group">
          <label htmlFor="costo_compra">
            Costo de Compra (USD) <span className="required">*</span>
          </label>
          <input
            id="costo_compra"
            name="costo_compra"
            type="number"
            step="0.01"
            placeholder="Ej: 500.00"
            value={formData.costo_compra}
            onChange={handleChange}
            required
          />
        </div>

        <div className="ocf-form-group">
          <label>Impuesto (2%)</label>
          <div className="ocf-preview">
            ${isNaN(impuestoPreview) ? "0.00" : impuestoPreview.toFixed(2)}
          </div>
        </div>

        <div className="ocf-form-group">
          <label htmlFor="costo_importacion">
            Costo de Importación (opcional)
          </label>
          <input
            id="costo_importacion"
            name="costo_importacion"
            type="number"
            step="0.01"
            placeholder="Ej: 50.00"
            value={formData.costo_importacion}
            onChange={handleChange}
          />
        </div>

        <div className="ocf-form-group ocf-full">
          <label htmlFor="numero_tracking">
            Número de Seguimiento (opcional)
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
    </ModalBase>
  );
};

export default OrdenCompraForm;
