import { useEffect, useState } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { uploadImagenesProducto } from "../../services/CargueMasivoService";
import "../../styles/admin/cargueMasivo.css";

const MAX_IMAGES = 10;

/**
 * Modal to upload up to 10 images for a single producto. Used by the bulk
 * upload page after products are created. Calls onUploaded(newCount) on
 * success so the parent can update the count badge.
 */
export default function BulkImagesModal({ producto, onClose, onUploaded }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const remaining = MAX_IMAGES - (producto.imagenes_count || 0);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    const allowed = selected.slice(0, remaining);
    setFiles(allowed);
    setError(
      selected.length > allowed.length
        ? `Solo se permiten ${remaining} imagen${remaining === 1 ? "" : "es"} más para este producto.`
        : null
    );
  };

  const handleSubmit = async () => {
    if (!files.length) return;
    setLoading(true);
    setError(null);
    try {
      const result = await uploadImagenesProducto(producto.id, files);
      onUploaded?.(result.imagenes_count);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "No se pudieron subir las imágenes. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cm-modal-backdrop" onClick={onClose}>
      <div className="cm-modal" onClick={(e) => e.stopPropagation()}>
        <header className="cm-modal-header">
          <div>
            <h3>Subir imágenes</h3>
            <p className="cm-modal-sub">{producto.nombre}</p>
          </div>
          <button className="cm-modal-close" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </header>

        <div className="cm-modal-body">
          <p className="cm-modal-info">
            Selecciona hasta {remaining} imagen{remaining === 1 ? "" : "es"} (este
            producto tiene {producto.imagenes_count || 0} de {MAX_IMAGES}).
          </p>

          <label className="cm-image-picker">
            <Upload size={16} />
            <span>Elegir imágenes</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              disabled={remaining <= 0}
            />
          </label>

          {error && <div className="cm-banner cm-banner-error">{error}</div>}

          <div className="cm-image-grid">
            {previews.length === 0 && (
              <div className="cm-image-empty">
                <ImageIcon size={28} />
                <span>No has elegido imágenes aún</span>
              </div>
            )}
            {previews.map((url, i) => (
              <div key={i} className="cm-image-thumb">
                <img src={url} alt={`preview ${i + 1}`} />
              </div>
            ))}
          </div>
        </div>

        <footer className="cm-modal-footer">
          <button className="cm-btn cm-btn-secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button
            className="cm-btn cm-btn-success"
            onClick={handleSubmit}
            disabled={!files.length || loading}
          >
            <Upload size={16} />
            {loading
              ? "Subiendo..."
              : `Subir ${files.length} imagen${files.length === 1 ? "" : "es"}`}
          </button>
        </footer>
      </div>
    </div>
  );
}
