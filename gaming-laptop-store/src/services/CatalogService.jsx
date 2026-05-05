import api from "./Api"
import urls from "./Urls"

/**
 * Estados de producto que cuentan como "disponible" en catálogo público.
 * Una unidad sólo aparece en catálogo si está sin_vender y se encuentra en
 * alguno de estos tres estados logísticos:
 *   - en_stock      → ya en oficina local
 *   - viajando      → camino al país
 *   - por_comprar   → en oficina importadora, lista para retirar
 * Cualquier otro estado (por_reparar, en_reparacion, entregado, por_entregar)
 * indica que la unidad no es ofertable.
 */
const ESTADOS_DISPONIBLES = new Set(["en_stock", "viajando", "por_comprar"]);

/**
 * Fetch public products by merging two data sources:
 * 1. GET /products/productos/list/ — all active products
 * 2. GET /products/unidades/list/?active=true&estado_venta=sin_vender — units
 *
 * Solo aparecen en catálogo los productos con al menos una UnidadProducto
 * sin_vender cuyo estado_producto esté en ESTADOS_DISPONIBLES (es decir, que
 * estén "en inventario": viajando, en oficina importadora o en stock local).
 * @returns {Promise<Array>} Array of merged product catalog objects
 */
export const getPublicProductos = async () => {
  try {
    const [productosResp, unidadesResp] = await Promise.all([
      api.get(urls.productosList, { params: { active: true } }),
      api.get(urls.unidadesList, {
        params: { active: true, estado_venta: "sin_vender" },
      }),
    ])

    const productos = Array.isArray(productosResp.data)
      ? productosResp.data
      : productosResp.data.results ?? []
    const unidades = Array.isArray(unidadesResp.data)
      ? unidadesResp.data
      : unidadesResp.data.results ?? []

    // Group available units by producto_id. Discard any unidad whose
    // estado_producto is not in the available set (damaged, in repair,
    // already delivered, pending delivery, etc.).
    const unidadesByProducto = {}
    unidades
      .filter((u) => ESTADOS_DISPONIBLES.has(u.estado_producto))
      .forEach((u) => {
        if (!unidadesByProducto[u.producto]) {
          unidadesByProducto[u.producto] = []
        }
        unidadesByProducto[u.producto].push(u)
      })

    // Build the catalog and drop products without any available unit.
    return productos
      .map((producto) => {
        const productUnidades = unidadesByProducto[producto.id] || []
        if (productUnidades.length === 0) return null
        return {
          id: producto.id,
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          marca: producto.marca,
          imagenes: producto.imagenes,
          disponibilidad: "en_stock",
          precio: Math.min(...productUnidades.map((u) => u.precio)),
        }
      })
      .filter(Boolean)
  } catch (error) {
    console.error("Error fetching public productos:", error)
    return []
  }
}
