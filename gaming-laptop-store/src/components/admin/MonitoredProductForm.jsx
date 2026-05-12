import React, { useState, useEffect } from "react";
import { Eye, Edit } from "lucide-react";
import ModalBase from "./ModalBase";
import "../../styles/admin/brandsForm.css";

/**
 * Form modal for creating / editing a Deal Watcher MonitoredProduct.
 * The eBay item id is auto-extracted on save by the backend; the form
 * does not show or accept it.
 */
const MonitoredProductForm = ({
  onClose,
  onSubmit,
  product,
  isSubmitting,
  submitError,
}) => {
  const isEditMode = Boolean(product);
  const [formData, setFormData] = useState({
    nickname: "",
    ebay_url: "",
    max_price_cop: "",
  });

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        nickname: product.nickname || "",
        ebay_url: product.ebay_url || "",
        max_price_cop:
          product.max_price_cop != null ? String(product.max_price_cop) : "",
      });
    } else {
      setFormData({ nickname: "", ebay_url: "", max_price_cop: "" });
    }
  }, [product, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!onSubmit) return;
    const payload = {
      nickname: formData.nickname.trim(),
      ebay_url: formData.ebay_url.trim(),
      max_price_cop: formData.max_price_cop,
    };
    onSubmit(payload, product?.id);
  };

  return (
    <ModalBase
      title={isEditMode ? "Editar Producto Vigilado" : "Vigilar Nuevo Producto"}
      icon={isEditMode ? <Edit size={24} /> : <Eye size={24} />}
      subtitle={
        isEditMode
          ? "Actualiza el listing o el precio máximo"
          : "Pega la URL del listing en eBay y define tu precio máximo en COP"
      }
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    >
      {submitError && <div className="form-error-banner">{submitError}</div>}

      <div className="form-grid">
        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="nickname">
            Apodo <span className="required">*</span>
          </label>
          <input
            id="nickname"
            name="nickname"
            type="text"
            placeholder="Ej: Acer Nitro V 5050"
            value={formData.nickname}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="ebay_url">
            URL del listing en eBay <span className="required">*</span>
          </label>
          <input
            id="ebay_url"
            name="ebay_url"
            type="url"
            placeholder="https://www.ebay.com/itm/127565054305"
            value={formData.ebay_url}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
          <small style={{ color: "#64748b", fontSize: "12px" }}>
            El item id se extrae automáticamente al guardar.
          </small>
        </div>

        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="max_price_cop">
            Precio máximo (COP) <span className="required">*</span>
          </label>
          <input
            id="max_price_cop"
            name="max_price_cop"
            type="number"
            min="0"
            step="1"
            placeholder="2500000"
            value={formData.max_price_cop}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
          <small style={{ color: "#64748b", fontSize: "12px" }}>
            Tope all-in en COP (incluye envío, impuestos, 4×1000 y comisión).
          </small>
        </div>
      </div>
    </ModalBase>
  );
};

export default MonitoredProductForm;
