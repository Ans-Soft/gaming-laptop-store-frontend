import api from "./Api"
import urls from "./Urls"

/**
 * Fetch public products from the Hito-6 catalog endpoint.
 * GET /products/catalogo/ → array plano (AllowAny, no token required).
 *
 * Maps the API response to the shape consumed by Catalog.jsx and CatalogCard:
 *   id, nombre, nombre_base, descripcion,
 *   marca (object { id, nombre, slug } — slug = String(id) for brand filter),
 *   marca_nombre, tipo_producto, tipo_producto_nombre,
 *   campo_valores, imagenes,
 *   disponibilidad (mapped from disponibilidad_catalogo),
 *   precio (Number or null).
 */
export const getPublicProductos = async () => {
  try {
    const resp = await api.get(urls.catalogoList)
    const items = Array.isArray(resp.data) ? resp.data : resp.data.results ?? []

    return items.map((item) => ({
      id: item.id,
      nombre: item.nombre,
      nombre_base: item.nombre_base,
      descripcion: item.descripcion,
      // Build a marca object compatible with the brand filter in Catalog.jsx,
      // which expects marca.slug and marca.nombre. The new endpoint only
      // returns marca (integer id) + marca_nombre, so we use String(id) as slug.
      marca: {
        id: item.marca,
        nombre: item.marca_nombre,
        slug: String(item.marca),
      },
      marca_nombre: item.marca_nombre,
      tipo_producto: item.tipo_producto,
      tipo_producto_nombre: item.tipo_producto_nombre,
      campo_valores: item.campo_valores || [],
      imagenes: item.imagenes || [],
      // CatalogCard reads `disponibilidad`; backend sends `disponibilidad_catalogo`.
      disponibilidad: item.disponibilidad_catalogo,
      // DRF serializes DecimalField as string; convert to Number (or null).
      precio: item.precio != null ? Number(item.precio) : null,
    }))
  } catch (error) {
    console.error("Error fetching public productos:", error)
    return []
  }
}
