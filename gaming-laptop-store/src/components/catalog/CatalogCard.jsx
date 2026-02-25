import React from "react"
import { BASE_URL } from "../../services/Urls"
import "../../styles/catalogCard.css"

const WHATSAPP_NUMBER = "573012661811"

/**
 * Resolve an image path to an absolute URL.
 * If the path already starts with "http", return it as-is.
 * Otherwise, prepend the Django backend base URL.
 * @param {string} path - Relative or absolute image path
 * @returns {string} Absolute URL
 */
function resolveImageUrl(path) {
  if (!path) return null
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  return `${BASE_URL}${path}`
}

/**
 * Build a WhatsApp wa.me link with a pre-filled message.
 * @param {string} modelName - Product model name to include in the message
 * @returns {string} Full WhatsApp URL
 */
function buildWhatsAppUrl(modelName) {
  const message = `Hola, estaba viendo su página y me interesó el siguiente producto ${modelName}`
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

/**
 * Map a stock_status key to a BEM modifier class name.
 * @param {string} status - Raw stock_status value from the API
 * @returns {string} CSS class string
 */
function stockStatusClass(status) {
  const valid = ["en_stock", "en_camino", "por_importacion", "sin_stock"]
  return valid.includes(status) ? `cc-stock cc-stock--${status}` : "cc-stock"
}

/**
 * Format a numeric price string into Colombian peso display format.
 * @param {string|number} price - Price value from API
 * @returns {string} Formatted string e.g. "$1.500.000"
 */
function formatPrice(price) {
  const numeric = Number(price)
  if (isNaN(numeric)) return price
  return "$" + numeric.toLocaleString("es-CO")
}

/**
 * CatalogCard component — displays a single product variant in the catalog grid.
 * Props:
 *   variant {Object} - A ProductVariant object from the API
 */
const CatalogCard = ({ variant }) => {
  const { base_product, price, stock_status, stock_status_display } = variant

  const firstImage = base_product?.images?.[0]
  const imageSrc = firstImage ? resolveImageUrl(firstImage.imagen) : null
  const imageAlt = firstImage?.alt_text || base_product?.model_name || "Producto"

  const categoryName = base_product?.categories?.[0]?.name ?? null
  const modelName = base_product?.model_name ?? "Producto"

  return (
    <article className="cc-card">
      {/* Image section */}
      <div className="cc-image-wrap">
        {imageSrc ? (
          <img
            className="cc-image"
            src={imageSrc}
            alt={imageAlt}
            loading="lazy"
          />
        ) : (
          <div className="cc-image-placeholder" aria-label="Sin imagen disponible">
            Sin imagen
          </div>
        )}

        {/* Price badge — absolute top-right over the image */}
        <span className="cc-price-badge" aria-label={`Precio: ${formatPrice(price)}`}>
          {formatPrice(price)}
        </span>
      </div>

      {/* Card body */}
      <div className="cc-body">
        {/* Category chip */}
        {categoryName && (
          <span className="cc-category">{categoryName}</span>
        )}

        {/* Product name */}
        <h3 className="cc-name">{modelName}</h3>

        {/* Stock status */}
        <span className={stockStatusClass(stock_status)}>
          {stock_status_display}
        </span>

        {/* WhatsApp CTA button */}
        <a
          className="cc-buy-btn"
          href={buildWhatsAppUrl(modelName)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Comprar ${modelName} por WhatsApp`}
        >
          Comprar
        </a>
      </div>
    </article>
  )
}

export default CatalogCard
