import api from "./Api"
import urls from "./Urls"

/**
 * Fetch public products by merging three data sources:
 * 1. GET /products/productos/list/ — all active products
 * 2. GET /products/unidades/list/?active=true&estado_venta=sin_vender — in-stock units
 * 3. GET /products/variantes/list/?active=true — active BajoPedido records
 *
 * Merges them into ProductoCatalogo shape and applies availability rules.
 * @param {Object} priceParams - Optional server-side price filters (price_min, price_max)
 * @returns {Promise<Array>} Array of merged product catalog objects
 */
export const getPublicProductos = async (priceParams = {}) => {
  try {
    // Fetch all three data sources in parallel
    const [productosResp, unidadesResp, bajoPedidosResp] = await Promise.all([
      api.get(urls.productosList, { params: { active: true } }),
      api.get(urls.unidadesList, {
        params: { active: true, estado_venta: "sin_vender" },
      }),
      api.get(urls.bajoPedidoList, { params: { active: true } }),
    ])

    const productos = Array.isArray(productosResp.data)
      ? productosResp.data
      : productosResp.data.results ?? []
    const unidades = Array.isArray(unidadesResp.data)
      ? unidadesResp.data
      : unidadesResp.data.results ?? []
    const bajoPedidos = Array.isArray(bajoPedidosResp.data)
      ? bajoPedidosResp.data
      : bajoPedidosResp.data.results ?? []

    // Group units by producto_id for quick lookup
    const unidadesByProducto = {}
    unidades.forEach((u) => {
      if (!unidadesByProducto[u.producto]) {
        unidadesByProducto[u.producto] = []
      }
      unidadesByProducto[u.producto].push(u)
    })

    // Group bajoPedidos by producto_id
    const bajoPedidosByProducto = {}
    bajoPedidos.forEach((bp) => {
      if (!bajoPedidosByProducto[bp.producto]) {
        bajoPedidosByProducto[bp.producto] = []
      }
      bajoPedidosByProducto[bp.producto].push(bp)
    })

    // Merge into ProductoCatalogo shape
    const catalogo = productos.map((producto) => {
      const productUnidades = unidadesByProducto[producto.id] || []
      const productBajoPedidos = bajoPedidosByProducto[producto.id] || []

      // Determine availability
      let disponibilidad = "sin_existencias"
      let precio = null

      if (productUnidades.length > 0) {
        // Has in-stock units
        disponibilidad = "en_stock"
        precio = Math.min(...productUnidades.map((u) => u.precio))
      } else if (
        productBajoPedidos.some((bp) => bp.estado === "activo")
      ) {
        // No units but has active BajoPedido
        disponibilidad = "bajo_pedido"
        // Use the lowest active BajoPedido price
        const activeBPs = productBajoPedidos.filter((bp) => bp.estado === "activo")
        if (activeBPs.length > 0) {
          precio = Math.min(...activeBPs.map((bp) => bp.precio))
        }
      }

      return {
        id: producto.id,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        marca: producto.marca,
        categorias: producto.categorias,
        imagenes: producto.imagenes,
        disponibilidad,
        precio,
      }
    })

    return catalogo
  } catch (error) {
    console.error("Error fetching public productos:", error)
    return []
  }
}
