import React, { useEffect, useState } from "react";
import { Package } from "lucide-react";
import ModalBase from "./ModalBase";
import { getProductVariants } from "../../services/ProductVariant";
import "../../styles/admin/variantsList.css";

const CONDITION_LABELS = {
  nuevo: "Nuevo",
  open_box: "Open Box",
  refurbished: "Refurbished",
  usado: "Usado",
};

const STOCK_LABELS = {
  en_stock: "En Stock",
  en_camino: "En Camino",
  por_importacion: "Por Importación",
  sin_stock: "Sin Stock",
};

const STOCK_CLASS = {
  en_stock: "vl-badge--green",
  en_camino: "vl-badge--amber",
  por_importacion: "vl-badge--purple",
  sin_stock: "vl-badge--red",
};

const formatMoney = (value) =>
  "$" + Number(value).toLocaleString("en-US");

const VariantsList = ({ baseProduct, onClose }) => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const all = await getProductVariants();
        setVariants(all.filter((v) => v.base_product.id === baseProduct.id));
      } catch (error) {
        console.error("Error cargando variantes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVariants();
  }, [baseProduct.id]);

  const count = variants.length;

  return (
    <ModalBase
      title="Variantes"
      icon={<Package size={24} />}
      subtitle={`${baseProduct.model_name} — ${count} variante${count !== 1 ? "s" : ""} registrada${count !== 1 ? "s" : ""}`}
      onClose={onClose}
      cancelLabel="Cerrar"
    >
      {loading ? (
        <div className="vl-loading">Cargando variantes...</div>
      ) : count === 0 ? (
        <div className="vl-empty">
          <Package size={40} strokeWidth={1.2} className="vl-empty-icon" />
          <p className="vl-empty-title">Sin variantes</p>
          <p className="vl-empty-desc">
            Este producto base no tiene variantes registradas todavía.
          </p>
        </div>
      ) : (
        <table className="vl-table">
          <thead>
            <tr>
              <th>Condición</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Pub.</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v) => (
              <tr key={v.id}>
                <td>{CONDITION_LABELS[v.condition] || v.condition}</td>
                <td>{formatMoney(v.price)}</td>
                <td>
                  <span className={`vl-badge ${STOCK_CLASS[v.stock_status] || ""}`}>
                    {STOCK_LABELS[v.stock_status] || v.stock_status}
                  </span>
                </td>
                <td>
                  <span className={v.active ? "vl-status vl-status--active" : "vl-status vl-status--inactive"}>
                    {v.active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className={v.is_published ? "vl-yes" : "vl-no"}>
                  {v.is_published ? "Sí" : "No"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </ModalBase>
  );
};

export default VariantsList;
