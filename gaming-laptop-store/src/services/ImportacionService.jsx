import api from "./Api";
import urls from "./Urls";

export async function descargarPlantillaImportacion() {
  const response = await api.get(urls.importacionPlantilla, { responseType: "blob" });
  return response;
}

/**
 * Upload an importacion xlsx. Server returns the preview dict with
 *   matched / no_mapeado / fallidos
 * When dryRun=false, matched rows are persisted on the server.
 */
export async function subirImportacion(archivo, dryRun = true) {
  const formData = new FormData();
  formData.append("archivo", archivo);
  formData.append("dry_run", dryRun ? "true" : "false");
  const response = await api.post(urls.importacionCargar, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}
