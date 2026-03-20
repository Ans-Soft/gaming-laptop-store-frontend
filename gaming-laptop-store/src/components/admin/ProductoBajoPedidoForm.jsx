import React, { useState, useEffect } from "react";
import { Clock, Edit } from "lucide-react";
import ModalBase from "../../components/admin/ModalBase";
import * as ProductoService from "../../services/ProductoService";
import * as ClienteService from "../../services/ClienteService";
import "../../styles/admin/productoBajoPedidoForm.css";

const ProductoBajoPedidoForm = ({ onClose, onSubmit, producto }) => {
  const [formData, setFormData] = useState({
    producto: "",
    condicion: "nuevo",
    cliente: "",
    valor_abono: "",
    fecha_maxima_compra: "",
  });

  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);

  const isEditMode = Boolean(producto);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const productosData = await ProductoService.getProductos();
      setProductos(productosData.producto || []);

      const clientesData = await ClienteService.getClientes();
      setClientes(clientesData.cliente || []);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        producto: producto.producto || "",
        condicion: producto.condicion || "nuevo",
        cliente: producto.cliente,
        valor_abono: producto.valor_abono,
        fecha_maxima_compra: producto.fecha_maxima_compra,
      });
    }
  }, [producto, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (onSubmit) onSubmit(formData, producto?.id);
  };

  return (
    <ModalBase
      title={isEditMode ? "Editar Producto Bajo Pedido" : "Registrar Nuevo Producto Bajo Pedido"}
      icon={isEditMode ? <Edit size={24} /> : <Clock size={24} />}
      subtitle={
        isEditMode
          ? "Actualiza la información del producto bajo pedido"
          : "Completa la información del pedido del cliente"
      }
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <div className="pbp-form-grid">
        <div className="pbp-form-group">
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

        <div className="pbp-form-group">
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

        <div className="pbp-form-group pbp-full">
          <label htmlFor="cliente">
            Cliente <span className="required">*</span>
          </label>
          <select
            id="cliente"
            name="cliente"
            value={formData.cliente}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona un cliente...</option>
            {clientes.map((cli) => (
              <option key={cli.id} value={cli.id}>
                {cli.nombre_completo} ({cli.cedula})
              </option>
            ))}
          </select>
        </div>

        <div className="pbp-form-group">
          <label htmlFor="valor_abono">
            Valor Abono <span className="required">*</span>
          </label>
          <input
            id="valor_abono"
            name="valor_abono"
            type="number"
            step="0.01"
            placeholder="Ej: 500000.00"
            value={formData.valor_abono}
            onChange={handleChange}
            required
          />
        </div>

        <div className="pbp-form-group">
          <label htmlFor="fecha_maxima_compra">
            Fecha Máxima de Compra <span className="required">*</span>
          </label>
          <input
            id="fecha_maxima_compra"
            name="fecha_maxima_compra"
            type="date"
            value={formData.fecha_maxima_compra}
            onChange={handleChange}
            required
          />
        </div>
      </div>
    </ModalBase>
  );
};

export default ProductoBajoPedidoForm;
