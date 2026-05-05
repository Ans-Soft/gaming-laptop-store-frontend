import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, ArrowUpRight } from "lucide-react";
import { BASE_URL } from "../../services/Urls";
import "../../styles/catalogCard.css";

const WHATSAPP_NUMBER = "573012661811";

function resolveImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${BASE_URL}${path}`;
}

function buildWhatsAppUrl(modelName) {
  const message = `Hola, estaba viendo su página y me interesó el siguiente producto ${modelName}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Map a disponibilidad key to availability display text and BEM modifier class.
 * - "en_stock" appears for any unit considered in inventory (en_stock,
 *   viajando, por_comprar). The actual logistics state filtering is done in
 *   CatalogService.
 */
function getAvailabilityDisplay(disponibilidad) {
  const map = {
    en_stock: { text: "Disponible", className: "cc-stock cc-stock--en_stock" },
    bajo_pedido: { text: "Bajo Pedido", className: "cc-stock cc-stock--bajo_pedido" },
    sin_existencias: { text: "Sin existencias", className: "cc-stock cc-stock--sin_existencias" },
  };
  return map[disponibilidad] || { text: "No disponible", className: "cc-stock" };
}

function formatPrice(price) {
  const numeric = Number(price);
  if (isNaN(numeric)) return price;
  return "$" + numeric.toLocaleString("es-CO");
}

const CatalogCard = ({ producto }) => {
  const { id, imagenes, precio, disponibilidad, nombre } = producto;

  const firstImage = imagenes?.[0];
  const imageSrc = firstImage ? resolveImageUrl(firstImage.url) : null;
  const productName = nombre ?? "Producto";
  const imageAlt = firstImage?.alt_text || productName;

  const availabilityDisplay = getAvailabilityDisplay(disponibilidad);

  return (
    <article className="cc-card">
      {/* Image — clean, no overlay */}
      <Link to={`/producto/${id}`} className="cc-image-link" aria-label={`Ver detalle de ${productName}`}>
        <div className="cc-image-wrap">
          {imageSrc ? (
            <img className="cc-image" src={imageSrc} alt={imageAlt} loading="lazy" />
          ) : (
            <div className="cc-image-placeholder" aria-label="Sin imagen disponible">
              Sin imagen
            </div>
          )}
        </div>
      </Link>

      {/* Card body */}
      <div className="cc-body">
        <h3 className="cc-name" title={productName}>
          {productName}
        </h3>

        {/* Status + price aligned on the same line, sitting just above the
            actions. Status badge on the left, price on the right. */}
        <div className="cc-meta-row">
          <span className={availabilityDisplay.className}>
            {availabilityDisplay.text}
          </span>
          {precio !== null && precio !== undefined && (
            <span className="cc-price" aria-label={`Precio: ${formatPrice(precio)}`}>
              {formatPrice(precio)}
            </span>
          )}
        </div>

        {/* Two CTAs side by side: primary = comprar (WhatsApp), secondary = detalle */}
        <div className="cc-actions">
          <a
            className="cc-buy-btn"
            href={buildWhatsAppUrl(productName)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Comprar ${productName} por WhatsApp`}
          >
            <ShoppingCart size={16} />
            Comprar
          </a>
          <Link
            className="cc-detail-btn"
            to={`/producto/${id}`}
            aria-label={`Ver detalle de ${productName}`}
          >
            Ver detalle
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default CatalogCard;
