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
 * Map a disponibilidad key to availability display text and BEM modifier class.
 * @param {string} disponibilidad - "en_stock", "bajo_pedido", or "sin_existencias"
 * @returns {{ text: string, className: string }}
 */
function getAvailabilityDisplay(disponibilidad) {
  const map = {
    en_stock: { text: "Disponible", className: "cc-stock cc-stock--en_stock" },
    bajo_pedido: { text: "Bajo Pedido", className: "cc-stock cc-stock--bajo_pedido" },
    sin_existencias: { text: "Sin existencias", className: "cc-stock cc-stock--sin_existencias" },
  }
  return map[disponibilidad] || { text: "No disponible", className: "cc-stock" }
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
 * CatalogCard component — displays a single producto in the catalog grid.
 * Props:
 *   producto {Object} - A merged ProductoCatalogo object from CatalogService
 */
const CatalogCard = ({ producto }) => {
  const { imagenes, precio, disponibilidad, nombre, categorias } = producto

  const firstImage = imagenes?.[0]
  const imageSrc = firstImage ? resolveImageUrl(firstImage.url) : null
  const imageAlt = firstImage?.alt_text || nombre || "Producto"

  const categoryName = categorias?.[0]?.nombre ?? null
  const productName = nombre ?? "Producto"

  const availabilityDisplay = getAvailabilityDisplay(disponibilidad)

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
        {precio !== null && (
          <span className="cc-price-badge" aria-label={`Precio: ${formatPrice(precio)}`}>
            {formatPrice(precio)}
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="cc-body">
        {/* Category chip */}
        {categoryName && (
          <span className="cc-category">{categoryName}</span>
        )}

        {/* Product name */}
        <h3 className="cc-name">{productName}</h3>

        {/* Stock status */}
        <span className={availabilityDisplay.className}>
          {availabilityDisplay.text}
        </span>

        {/* WhatsApp CTA button */}
        <a
          className="cc-buy-btn"
          href={buildWhatsAppUrl(productName)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Comprar ${productName} por WhatsApp`}
        >
          Comprar
        </a>
      </div>
    </article>
  )
}

export default CatalogCard
