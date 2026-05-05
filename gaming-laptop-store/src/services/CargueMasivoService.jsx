import api from "./Api";
import urls from "./Urls";

export async function descargarPlantilla(tipoProductoId) {
  const response = await api.get(urls.cargueMasivoPlantilla(tipoProductoId), {
    responseType: "blob",
  });
  return response;
}

export async function subirCargueMasivo(tipoProductoId, archivo, dryRun = true) {
  const formData = new FormData();
  formData.append("tipo_producto", tipoProductoId);
  formData.append("archivo", archivo);
  formData.append("dry_run", dryRun ? "true" : "false");
  const response = await api.post(urls.cargueMasivo, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

/**
 * Persist edited rows from the preview. `rows` must be an array of
 * { fila, data: { nombre, descripcion, marca, <campos dinámicos>... } }.
 */
export async function confirmarRows(tipoProductoId, rows) {
  const response = await api.post(urls.cargueMasivoConfirmar, {
    tipo_producto: tipoProductoId,
    rows,
  });
  return response.data;
}

export async function uploadImagenesProducto(productoId, files) {
  const formData = new FormData();
  Array.from(files).slice(0, 10).forEach((f, i) => {
    formData.append(`image_${i}`, f);
  });
  const response = await api.post(
    urls.productoImagenesUpload(productoId),
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
}
