import React, { useState, useEffect } from "react";
import { ShoppingCart, Edit, Trash2, Plus } from "lucide-react";
import ModalBase from "../../components/admin/ModalBase";
import * as ClienteService from "../../services/ClienteService";
import * as UnidadService from "../../services/UnidadService";
import "../../styles/admin/ventaForm.css";

const VentaForm = ({ onClose, onSubmit, venta }) => {
  const [formData, setFormData] = useState({
    cliente: "",
    notas: "",
    separacion: "",
    items_data: [],
  });

  const [clientes, setClientes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [selectedUnidad, setSelectedUnidad] = useState("");
  const [selectedPrecio, setSelectedPrecio] = useState("");

  const isEditMode = Boolean(venta);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const clientesData = await ClienteService.getClientes();
      setClientes(clientesData.cliente || []);

      const unidadesData = await UnidadService.getUnidades();
      setUnidades(unidadesData || []);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        cliente: venta.cliente,
        notas: venta.notas || "",
        separacion: venta.separacion || "",
        items_data: venta.items || [],
      });
    }
  }, [venta, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    if (!selectedUnidad || !selectedPrecio) {
      alert("Debe seleccionar unidad y precio");
      return;
    }

    const unidad = unidades.find((u) => u.id === parseInt(selectedUnidad));
    const newItem = {
      unidad_producto: parseInt(selectedUnidad),
      precio: parseFloat(selectedPrecio),
      unidad_serial: unidad?.serial,
      producto_nombre: unidad?.variante?.producto?.nombre,
    };

    setFormData((prev) => ({
      ...prev,
      items_data: [...prev.items_data, newItem],
    }));

    setSelectedUnidad("");
    setSelectedPrecio("");
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items_data: prev.items_data.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateItemPrice = (index, newPrice) => {
    setFormData((prev) => {
      const newItems = [...prev.items_data];
      newItems[index].precio = parseFloat(newPrice);
      return { ...prev, items_data: newItems };
    });
  };

  const handleSubmit = () => {
    if (!formData.cliente) {
      alert("Debe seleccionar un cliente");
      return;
    }
    if (formData.items_data.length === 0) {
      alert("Debe agregar al menos un item");
      return;
    }
    if (onSubmit) onSubmit(formData, venta?.id);
  };

  const total = formData.items_data.reduce((sum, item) => sum + parseFloat(item.precio || 0), 0);

  return (
    <ModalBase
      title={isEditMode ? "Editar Venta" : "Registrar Nueva Venta"}
      icon={isEditMode ? <Edit size={24} /> : <ShoppingCart size={24} />}
      subtitle={
        isEditMode
          ? "Actualiza la información de la venta"
          : "Completa la información para registrar una venta"
      }
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <div className="vf-form-grid">
        <div className="vf-form-group vf-full">
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

        <div className="vf-form-group vf-full">
          <label htmlFor="notas">Notas (opcional)</label>
          <textarea
            id="notas"
            name="notas"
            placeholder="Notas adicionales sobre la venta..."
            value={formData.notas}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="vf-items-section">
          <h4>Agregar Items</h4>
          <div className="vf-add-item">
            <div className="vf-add-item-group">
              <label htmlFor="selectedUnidad">Unidad</label>
              <select
                id="selectedUnidad"
                value={selectedUnidad}
                onChange={(e) => {
                  const unidad = unidades.find((u) => u.id === parseInt(e.target.value));
                  setSelectedUnidad(e.target.value);
                  if (unidad) {
                    setSelectedPrecio(unidad.precio);
                  }
                }}
              >
                <option value="">Selecciona una unidad...</option>
                {unidades
                  .filter((u) => u.estado_venta === "sin_vender")
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.serial} - {u.variante?.producto?.nombre}
                    </option>
                  ))}
              </select>
            </div>

            <div className="vf-add-item-group">
              <label htmlFor="selectedPrecio">Precio</label>
              <input
                id="selectedPrecio"
                type="number"
                step="0.01"
                placeholder="Precio"
                value={selectedPrecio}
                onChange={(e) => setSelectedPrecio(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="vf-add-btn"
              onClick={handleAddItem}
            >
              <Plus size={20} /> Agregar
            </button>
          </div>

          {formData.items_data.length > 0 && (
            <div className="vf-items-list">
              <h5>Items agregados:</h5>
              <table className="vf-items-table">
                <thead>
                  <tr>
                    <th>Serial</th>
                    <th>Producto</th>
                    <th>Precio</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items_data.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.unidad_serial}</td>
                      <td>{item.producto_nombre}</td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          value={item.precio}
                          onChange={(e) => handleUpdateItemPrice(idx, e.target.value)}
                          className="vf-price-input"
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="vf-delete-btn"
                          onClick={() => handleRemoveItem(idx)}
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="vf-total">
                <strong>Total: ${total.toFixed(2)}</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalBase>
  );
};

export default VentaForm;
