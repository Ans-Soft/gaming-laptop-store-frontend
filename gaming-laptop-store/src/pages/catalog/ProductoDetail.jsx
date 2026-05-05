import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import api from "../../services/Api";
import urls, { BASE_URL } from "../../services/Urls";
import "../../styles/catalogCard.css";
import "../../styles/productoDetail.css";

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

function formatPrice(price) {
  const numeric = Number(price);
  if (isNaN(numeric)) return price;
  return "$" + numeric.toLocaleString("es-CO");
}

export default function ProductoDetail() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    Promise.all([
      api.get(urls.productosDetail(id)),
      api.get(urls.unidadesList, {
        params: { active: true, estado_venta: "sin_vender" },
      }),
    ])
      .then(([prodResp, unidadesResp]) => {
        if (!alive) return;
        const prod = prodResp.data.producto || prodResp.data;
        const unidadesAll = Array.isArray(unidadesResp.data)
          ? unidadesResp.data
          : unidadesResp.data.results ?? [];
        const unitsForProduct = unidadesAll.filter(
          (u) =>
            u.producto === prod.id &&
            ["en_stock", "viajando", "por_comprar"].includes(u.estado_producto)
        );
        setProducto(prod);
        setUnidades(unitsForProduct);
      })
      .catch((err) => alive && setError(err.message || "Error al cargar el producto"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="pd-root">
        <p className="pd-loading">Cargando producto...</p>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="pd-root">
        <Link to="/catalogo" className="pd-back">
          <ArrowLeft size={16} /> Volver al catálogo
        </Link>
        <p className="pd-error">{error || "Producto no encontrado."}</p>
      </div>
    );
  }

  const imagenes = producto.imagenes || [];
  const mainImage = imagenes[activeImage];
  const minPrice =
    unidades.length > 0 ? Math.min(...unidades.map((u) => Number(u.precio))) : null;

  const campos = producto.campo_valores || [];

  return (
    <div className="pd-root">
      <Link to="/catalogo" className="pd-back">
        <ArrowLeft size={16} /> Volver al catálogo
      </Link>

      <div className="pd-grid">
        {/* Image gallery */}
        <div className="pd-gallery">
          <div className="pd-main-image">
            {mainImage ? (
              <img src={resolveImageUrl(mainImage.url)} alt={producto.nombre} />
            ) : (
              <div className="pd-no-image">Sin imagen</div>
            )}
          </div>
          {imagenes.length > 1 && (
            <div className="pd-thumbs">
              {imagenes.map((img, i) => (
                <button
                  key={img.id || i}
                  className={`pd-thumb ${i === activeImage ? "pd-thumb--active" : ""}`}
                  onClick={() => setActiveImage(i)}
                >
                  <img src={resolveImageUrl(img.url)} alt={`${producto.nombre} ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="pd-info">
          {producto.marca_nombre && (
            <span className="pd-marca">{producto.marca_nombre}</span>
          )}
          <h1 className="pd-name">{producto.nombre}</h1>

          {minPrice !== null && (
            <div className="pd-price-row">
              <span className="pd-price">{formatPrice(minPrice)}</span>
              <span className="cc-stock cc-stock--en_stock">Disponible</span>
            </div>
          )}

          {producto.descripcion && (
            <p className="pd-desc">{producto.descripcion}</p>
          )}

          {campos.length > 0 && (
            <div className="pd-specs">
              <h3>Especificaciones</h3>
              <dl>
                {campos.map((c) => {
                  const value =
                    c.valor_texto ??
                    (c.valor_numero != null ? c.valor_numero : null) ??
                    (c.valor_booleano != null ? (c.valor_booleano ? "Sí" : "No") : null);
                  if (value == null || value === "") return null;
                  return (
                    <div key={c.id} className="pd-spec-row">
                      <dt>{c.campo_nombre || c.campo_producto_nombre}</dt>
                      <dd>{String(value)}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          )}

          <a
            className="cc-buy-btn pd-cta"
            href={buildWhatsAppUrl(producto.nombre)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ShoppingCart size={18} />
            Comprar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
