import React, { useState, useEffect, useRef } from "react";
import { ShoppingCart, Edit, Trash2, Plus, UserPlus, Users, Search } from "lucide-react";
import ModalBase from "../../components/admin/ModalBase";
import * as ClienteService from "../../services/ClienteService";
import * as UnidadService from "../../services/UnidadService";
import api from "../../services/Api";
import urls from "../../services/Urls";
import "../../styles/admin/ventaForm.css";

const EMPTY_NUEVO_CLIENTE = {
  nombre_completo: "",
  cedula: "",
  celular: "",
  correo: "",
  direccion: "",
  departamento: "",
  ciudad: "",
};

const VentaForm = ({ onClose, onSubmit, venta, preselectedUnidadId }) => {
  const [formData, setFormData] = useState({
    cliente: "",
    notas: "",
    separacion: "",
    items_data: [],
    estado_entrega: "por_entregar",
  });

  const [clienteMode, setClienteMode] = useState("existente"); // "existente" | "nuevo"
  const [nuevoCliente, setNuevoCliente] = useState({ ...EMPTY_NUEVO_CLIENTE });
  const [nuevoClienteErrors, setNuevoClienteErrors] = useState({});

  const [clientes, setClientes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [selectedUnidad, setSelectedUnidad] = useState("");
  const [selectedPrecio, setSelectedPrecio] = useState("");
  const [unidadSearch, setUnidadSearch] = useState("");
  const [showUnidadDropdown, setShowUnidadDropdown] = useState(false);
  const unidadSearchRef = useRef(null);

  const today = new Date().toISOString().split("T")[0];
  const [invoiceData, setInvoiceData] = useState({
    payment_method: "",
    due_date: today,
  });

  const isEditMode = Boolean(venta);

  useEffect(() => {
    fetchData();
  }, []);

  // Close unit search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (unidadSearchRef.current && !unidadSearchRef.current.contains(e.target)) {
        setShowUnidadDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      const [clientesData, unidadesData, deptosData, ciudadesData] = await Promise.all([
        ClienteService.getClientes(),
        UnidadService.getUnidades(),
        api.get(urls.departamentosList).then((r) => r.data),
        api.get(urls.ciudadesList).then((r) => r.data),
      ]);

      setClientes(Array.isArray(clientesData) ? clientesData : (clientesData.clientes || []));
      setUnidades(unidadesData || []);
      setDepartamentos(Array.isArray(deptosData) ? deptosData : (deptosData.departamentos || []));
      setCiudades(Array.isArray(ciudadesData) ? ciudadesData : (ciudadesData.ciudades || []));

      if (preselectedUnidadId) {
        const preUnit = (unidadesData || []).find((u) => u.id === preselectedUnidadId);
        if (preUnit) {
          setFormData((prev) => ({
            ...prev,
            items_data: [
              {
                unidad_producto: preUnit.id,
                precio: parseFloat(preUnit.precio),
                unidad_serial: preUnit.serial,
                producto_nombre: preUnit.producto_nombre,
              },
            ],
          }));
        }
      }
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
        estado_entrega: venta.estado_entrega || "por_entregar",
      });
    }
  }, [venta, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNuevoClienteChange = (e) => {
    const { name, value } = e.target;
    setNuevoCliente((prev) => ({ ...prev, [name]: value }));
    if (nuevoClienteErrors[name]) {
      setNuevoClienteErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
    // Reset ciudad when departamento changes
    if (name === "departamento") {
      setNuevoCliente((prev) => ({ ...prev, departamento: value, ciudad: "" }));
    }
  };

  const validateNuevoCliente = () => {
    const errs = {};
    if (!nuevoCliente.nombre_completo.trim()) errs.nombre_completo = "Requerido";
    if (!nuevoCliente.cedula.trim()) errs.cedula = "Requerido";
    if (!nuevoCliente.celular.trim()) errs.celular = "Requerido";
    if (!nuevoCliente.correo.trim()) errs.correo = "Requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoCliente.correo)) errs.correo = "Correo inválido";
    if (!nuevoCliente.direccion.trim()) errs.direccion = "Requerido";
    if (!nuevoCliente.departamento) errs.departamento = "Requerido";
    if (!nuevoCliente.ciudad) errs.ciudad = "Requerido";
    setNuevoClienteErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Unidades available: sin_vender and not already added
  const selectedIds = formData.items_data.map((i) => i.unidad_producto);
  const availableUnidades = unidades.filter(
    (u) => u.estado_venta === "sin_vender" && !selectedIds.includes(u.id)
  );
  const filteredDropdownUnidades = unidadSearch.trim()
    ? availableUnidades.filter((u) => {
        const term = unidadSearch.toLowerCase();
        return (
          u.serial?.toLowerCase().includes(term) ||
          u.producto_nombre?.toLowerCase().includes(term)
        );
      })
    : availableUnidades;

  const handleSelectUnidad = (unidad) => {
    setSelectedUnidad(String(unidad.id));
    setSelectedPrecio(unidad.precio);
    setUnidadSearch(`${unidad.serial} - ${unidad.producto_nombre}`);
    setShowUnidadDropdown(false);
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
      producto_nombre: unidad?.producto_nombre,
    };
    setFormData((prev) => ({ ...prev, items_data: [...prev.items_data, newItem] }));
    setSelectedUnidad("");
    setSelectedPrecio("");
    setUnidadSearch("");
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

  const handleSubmit = async () => {
    if (formData.items_data.length === 0) {
      alert("Debe agregar al menos un item");
      return;
    }

    let clienteId = formData.cliente;

    if (clienteMode === "nuevo") {
      if (!validateNuevoCliente()) return;
      try {
        const res = await ClienteService.createCliente({
          nombre_completo: nuevoCliente.nombre_completo.trim(),
          cedula: nuevoCliente.cedula.trim(),
          celular: nuevoCliente.celular.trim(),
          correo: nuevoCliente.correo.trim(),
          direccion: nuevoCliente.direccion.trim(),
          departamento: parseInt(nuevoCliente.departamento),
          ciudad: parseInt(nuevoCliente.ciudad),
        });
        clienteId = res.cliente?.id || res.id;
      } catch (error) {
        const data = error.response?.data;
        if (data) {
          const msgs = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join("; ");
          alert(`Error al crear cliente: ${msgs}`);
        } else {
          alert("Error al crear el cliente");
        }
        return;
      }
    } else {
      if (!clienteId) {
        alert("Debe seleccionar un cliente");
        return;
      }
    }

    if (!isEditMode) {
      if (!invoiceData.payment_method) { alert("Debe seleccionar el método de pago"); return; }
      if (!invoiceData.due_date) { alert("Debe seleccionar la fecha de la factura"); return; }
    }

    if (onSubmit) onSubmit({ ...formData, cliente: clienteId, estado_entrega: formData.estado_entrega }, venta?.id, isEditMode ? null : invoiceData);
  };

  const total = formData.items_data.reduce((sum, item) => sum + parseFloat(item.precio || 0), 0);
  const ciudadesFiltradas = nuevoCliente.departamento
    ? ciudades.filter((c) => String(c.departamento) === String(nuevoCliente.departamento))
    : [];

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
      className="vf-modal-wide"
    >
      <div className="vf-form-grid">

        {/* ── Cliente toggle ── */}
        <div className="vf-form-group vf-full">
          <div className="vf-client-toggle">
            <button
              type="button"
              className={`vf-toggle-btn${clienteMode === "existente" ? " active" : ""}`}
              onClick={() => setClienteMode("existente")}
            >
              <Users size={15} /> Cliente existente
            </button>
            <button
              type="button"
              className={`vf-toggle-btn${clienteMode === "nuevo" ? " active" : ""}`}
              onClick={() => setClienteMode("nuevo")}
            >
              <UserPlus size={15} /> Nuevo cliente
            </button>
          </div>
        </div>

        {/* ── Cliente existente ── */}
        {clienteMode === "existente" && (
          <div className="vf-form-group vf-full">
            <label htmlFor="cliente">
              Cliente <span className="required">*</span>
            </label>
            <select id="cliente" name="cliente" value={formData.cliente} onChange={handleChange} required>
              <option value="">Selecciona un cliente...</option>
              {clientes.map((cli) => (
                <option key={cli.id} value={cli.id}>
                  {cli.nombre_completo} ({cli.cedula})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ── Nuevo cliente fields ── */}
        {clienteMode === "nuevo" && (
          <div className="vf-nuevo-cliente vf-full">
            <div className="vf-nuevo-cliente-grid">
              <div className="form-group">
                <label>Nombre completo <span className="required">*</span></label>
                <input
                  name="nombre_completo"
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  value={nuevoCliente.nombre_completo}
                  onChange={handleNuevoClienteChange}
                />
                {nuevoClienteErrors.nombre_completo && <span className="vf-field-error">{nuevoClienteErrors.nombre_completo}</span>}
              </div>

              <div className="form-group">
                <label>Cédula <span className="required">*</span></label>
                <input
                  name="cedula"
                  type="text"
                  placeholder="Ej: 1234567890"
                  value={nuevoCliente.cedula}
                  onChange={handleNuevoClienteChange}
                />
                {nuevoClienteErrors.cedula && <span className="vf-field-error">{nuevoClienteErrors.cedula}</span>}
              </div>

              <div className="form-group">
                <label>Celular <span className="required">*</span></label>
                <input
                  name="celular"
                  type="text"
                  placeholder="Ej: 3001234567"
                  value={nuevoCliente.celular}
                  onChange={handleNuevoClienteChange}
                />
                {nuevoClienteErrors.celular && <span className="vf-field-error">{nuevoClienteErrors.celular}</span>}
              </div>

              <div className="form-group">
                <label>Correo <span className="required">*</span></label>
                <input
                  name="correo"
                  type="email"
                  placeholder="Ej: juan@email.com"
                  value={nuevoCliente.correo}
                  onChange={handleNuevoClienteChange}
                />
                {nuevoClienteErrors.correo && <span className="vf-field-error">{nuevoClienteErrors.correo}</span>}
              </div>

              <div className="form-group vf-nc-full">
                <label>Dirección <span className="required">*</span></label>
                <input
                  name="direccion"
                  type="text"
                  placeholder="Ej: Calle 123 #45-67"
                  value={nuevoCliente.direccion}
                  onChange={handleNuevoClienteChange}
                />
                {nuevoClienteErrors.direccion && <span className="vf-field-error">{nuevoClienteErrors.direccion}</span>}
              </div>

              <div className="form-group">
                <label>Departamento <span className="required">*</span></label>
                <select name="departamento" value={nuevoCliente.departamento} onChange={handleNuevoClienteChange}>
                  <option value="">Selecciona...</option>
                  {departamentos.map((d) => (
                    <option key={d.id} value={d.id}>{d.nombre}</option>
                  ))}
                </select>
                {nuevoClienteErrors.departamento && <span className="vf-field-error">{nuevoClienteErrors.departamento}</span>}
              </div>

              <div className="form-group">
                <label>Ciudad <span className="required">*</span></label>
                <select
                  name="ciudad"
                  value={nuevoCliente.ciudad}
                  onChange={handleNuevoClienteChange}
                  disabled={!nuevoCliente.departamento}
                >
                  <option value="">
                    {nuevoCliente.departamento ? "Selecciona..." : "Selecciona depto. primero"}
                  </option>
                  {ciudadesFiltradas.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
                {nuevoClienteErrors.ciudad && <span className="vf-field-error">{nuevoClienteErrors.ciudad}</span>}
              </div>
            </div>
          </div>
        )}

        {/* ── Notas ── */}
        <div className="vf-form-group vf-full">
          <label htmlFor="notas">Notas (opcional)</label>
          <textarea
            id="notas"
            name="notas"
            placeholder="Notas adicionales..."
            value={formData.notas}
            onChange={handleChange}
            rows="1"
            className="vf-notas-compact"
          />
        </div>

        {/* ── Estado de Entrega ── */}
        <div className="vf-form-group vf-full">
          <label>Estado de Entrega</label>
          <div className="vf-client-toggle">
            <button
              type="button"
              className={`vf-toggle-btn${formData.estado_entrega === "por_entregar" ? " active" : ""}`}
              onClick={() => setFormData((prev) => ({ ...prev, estado_entrega: "por_entregar" }))}
            >
              Por Entregar
            </button>
            <button
              type="button"
              className={`vf-toggle-btn${formData.estado_entrega === "entregado" ? " active" : ""}`}
              onClick={() => setFormData((prev) => ({ ...prev, estado_entrega: "entregado" }))}
            >
              Entregado
            </button>
          </div>
        </div>

        {/* ── Items ── */}
        <div className="vf-items-section">
          <h4>{isEditMode ? "Items de la venta" : "Agregar Items"}</h4>
          {!isEditMode && <div className="vf-add-item">
            <div className="vf-add-item-group vf-add-item-full">
              <label htmlFor="unidadSearch">Unidad</label>
              <div className="vf-search-wrapper" ref={unidadSearchRef}>
                <Search size={16} className="vf-search-icon" />
                <input
                  id="unidadSearch"
                  type="text"
                  placeholder="Buscar por serial o producto..."
                  value={unidadSearch}
                  onChange={(e) => {
                    setUnidadSearch(e.target.value);
                    setSelectedUnidad("");
                    setSelectedPrecio("");
                    setShowUnidadDropdown(true);
                  }}
                  onFocus={() => setShowUnidadDropdown(true)}
                  autoComplete="off"
                />
                {showUnidadDropdown && filteredDropdownUnidades.length > 0 && (
                  <div className="vf-search-dropdown">
                    {filteredDropdownUnidades.slice(0, 8).map((u) => (
                      <div
                        key={u.id}
                        className="vf-search-option"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectUnidad(u);
                        }}
                      >
                        <code className="vf-search-option-serial">{u.serial}</code>
                        <span className="vf-search-option-name">{u.producto_nombre}</span>
                        <span className="vf-search-option-price">${Number(u.precio).toLocaleString("es-CO")}</span>
                      </div>
                    ))}
                  </div>
                )}
                {showUnidadDropdown && unidadSearch.trim() && filteredDropdownUnidades.length === 0 && (
                  <div className="vf-search-dropdown">
                    <div className="vf-search-no-results">Sin resultados</div>
                  </div>
                )}
              </div>
            </div>

            <div className="vf-add-item-row">
              <div className="vf-add-item-group vf-add-item-precio">
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

              <button type="button" className="vf-add-btn" onClick={handleAddItem}>
                <Plus size={18} /> Agregar
              </button>
            </div>
          </div>}

          <div className="vf-items-list">
            {formData.items_data.length === 0 ? (
              <div className="vf-empty-state">
                <ShoppingCart size={28} strokeWidth={1.5} />
                <p>No hay items agregados</p>
              </div>
            ) : (
              <>
                <table className="vf-items-table">
                  <thead>
                    <tr>
                      <th>Serial</th>
                      <th>Producto</th>
                      <th>Precio</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items_data.map((item, idx) => (
                      <tr key={idx}>
                        <td><code className="vf-serial-code">{item.unidad_serial}</code></td>
                        <td>
                          <span className="vf-product-name" title={item.producto_nombre}>
                            {item.producto_nombre}
                          </span>
                        </td>
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
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="vf-total">
                  <strong>Total: ${total.toLocaleString("es-CO", { maximumFractionDigits: 0 })}</strong>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Datos de Factura (solo en modo crear) ── */}
        {!isEditMode && (
          <div className="vf-items-section" style={{ borderTop: "1px solid var(--fourth-color)", paddingTop: "1.25rem", marginTop: "0.5rem" }}>
            <h4>Datos de Factura</h4>
            <div className="vf-form-grid" style={{ marginBottom: 0 }}>
              <div className="vf-form-group">
                <label>Método de Pago <span className="required">*</span></label>
                <select
                  value={invoiceData.payment_method}
                  onChange={(e) => setInvoiceData((p) => ({ ...p, payment_method: e.target.value }))}
                >
                  <option value="">Selecciona...</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div className="vf-form-group">
                <label>Fecha de Factura <span className="required">*</span></label>
                <input
                  type="date"
                  value={invoiceData.due_date}
                  onChange={(e) => setInvoiceData((p) => ({ ...p, due_date: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </ModalBase>
  );
};

export default VentaForm;
