import { useEffect, useMemo, useState } from "react";
import {
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Save,
  Image as ImageIcon,
} from "lucide-react";
import NotifyModal from "../../components/admin/NotifyModal";
import BulkImagesModal from "../../components/admin/BulkImagesModal";
import { getProductTypes } from "../../services/ProductTypeService";
import { getProductTypeDetail } from "../../services/ProductTypeService";
import {
  descargarPlantilla,
  subirCargueMasivo,
  confirmarRows,
} from "../../services/CargueMasivoService";
import "../../styles/admin/cargueMasivo.css";

/**
 * Status discrimination for an editable preview row.
 * 'creado'   → row will be created (no errors, name is new)
 * 'ignorado' → name already exists in DB
 * 'fallido'  → has validation errors
 */
const STATUS_BADGES = {
  creado: { label: "Nuevo", className: "cm-badge-nuevo" },
  ignorado: { label: "Ya existe", className: "cm-badge-dup" },
  fallido: { label: "Error", className: "cm-badge-error" },
};

const FIXED_COLS = ["nombre", "descripcion", "marca"];

export default function CargueMasivo({ onCommitted } = {}) {
  const [tipos, setTipos] = useState([]);
  const [tipoId, setTipoId] = useState("");
  const [tipoCampos, setTipoCampos] = useState([]); // dynamic fields with type info
  const [archivo, setArchivo] = useState(null);

  // Phase 2 — editable preview
  const [previewRows, setPreviewRows] = useState(null); // [{status, fila, errores, data, motivo}]
  // Phase 3 — post-commit
  const [committed, setCommitted] = useState(null);

  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingCommit, setLoadingCommit] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [notify, setNotify] = useState(null);
  const [imagesTarget, setImagesTarget] = useState(null);

  useEffect(() => {
    let alive = true;
    getProductTypes()
      .then((data) => {
        const list = Array.isArray(data) ? data : data.tipo_producto || data.tipos || [];
        if (alive) setTipos(list.filter((t) => t.active !== false));
      })
      .catch(() => alive && setTipos([]));
    return () => {
      alive = false;
    };
  }, []);

  // Load the dynamic fields for the selected tipo so we can render type-aware
  // editors (e.g. select for booleano, type=number for numero).
  useEffect(() => {
    if (!tipoId) {
      setTipoCampos([]);
      return;
    }
    let alive = true;
    getProductTypeDetail(tipoId)
      .then((data) => {
        const detail = data.tipo_producto || data;
        const campos = (detail.campos || []).map((c) => ({
          nombre: c.campo_nombre,
          tipo: c.campo_tipo,
          required: c.required,
        }));
        if (alive) setTipoCampos(campos);
      })
      .catch(() => alive && setTipoCampos([]));
    return () => {
      alive = false;
    };
  }, [tipoId]);

  const tipoSeleccionado = useMemo(
    () => tipos.find((t) => String(t.id) === String(tipoId)) || null,
    [tipos, tipoId]
  );

  // Reset everything when tipo or archivo changes
  useEffect(() => {
    setPreviewRows(null);
    setCommitted(null);
  }, [tipoId, archivo]);

  // ── Step 1 — Plantilla ────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!tipoId) return;
    setLoadingTemplate(true);
    try {
      const response = await descargarPlantilla(tipoId);
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = (tipoSeleccionado?.nombre || "Plantilla").replace(/\s+/g, "_");
      a.download = `Plantilla_${safeName}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setNotify({
        variant: "error",
        title: "Error al descargar",
        message:
          error.response?.data?.error ||
          "No se pudo generar la plantilla. Intenta nuevamente.",
      });
    } finally {
      setLoadingTemplate(false);
    }
  };

  // ── Step 2 — Subir + previsualizar ────────────────────────────────────────
  const handlePreview = async () => {
    if (!tipoId || !archivo) return;
    setLoadingPreview(true);
    try {
      const result = await subirCargueMasivo(tipoId, archivo, true);
      // Flatten the three groups into one array with a status field so we
      // render them in a single editable table.
      const rows = [
        ...(result.creados || []).map((r) => ({ ...r, status: "creado" })),
        ...(result.ignorados || []).map((r) => ({ ...r, status: "ignorado" })),
        ...(result.fallidos || []).map((r) => ({ ...r, status: "fallido" })),
      ].sort((a, b) => (a.fila ?? 0) - (b.fila ?? 0));
      setPreviewRows(rows);
      setCommitted(null);
    } catch (error) {
      setNotify({
        variant: "error",
        title: "Error al previsualizar",
        message:
          error.response?.data?.error ||
          (typeof error.response?.data === "string" ? error.response.data : null) ||
          "No se pudo procesar el archivo. Verifica que sea el formato correcto.",
      });
    } finally {
      setLoadingPreview(false);
    }
  };

  const updateCell = (rowIndex, key, value) => {
    setPreviewRows((rows) => {
      const next = [...rows];
      next[rowIndex] = {
        ...next[rowIndex],
        data: { ...next[rowIndex].data, [key]: value },
      };
      return next;
    });
  };

  // ── Step 3 — Confirmar ────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!previewRows) return;
    // Send only rows the user wants to create. Ignorados (already exist) are
    // dropped. Fallidos are also sent — server re-validates and may now
    // accept them after edits.
    const rowsToSend = previewRows
      .filter((r) => r.status !== "ignorado")
      .map((r) => ({ fila: r.fila, data: r.data }));

    if (rowsToSend.length === 0) {
      setNotify({
        variant: "info",
        title: "Sin filas para crear",
        message: "Todas las filas son duplicados que ya existen.",
      });
      return;
    }

    setLoadingCommit(true);
    try {
      const result = await confirmarRows(tipoId, rowsToSend);
      setCommitted(result);
      if (result.fallidos.length > 0) {
        setNotify({
          variant: "warning",
          title: "Carga parcial",
          message: `${result.creados.length} creados, ${result.fallidos.length} con errores.`,
        });
      } else {
        setNotify({
          variant: "success",
          title: "Carga completada",
          message: `${result.creados.length} producto${result.creados.length === 1 ? "" : "s"} creado${result.creados.length === 1 ? "" : "s"} correctamente.`,
        });
      }
      // Notify the parent so the productos catalog refetches and shows the
      // new rows immediately without requiring a manual reload.
      if (typeof onCommitted === "function" && result.creados.length > 0) {
        onCommitted();
      }
    } catch (error) {
      setNotify({
        variant: "error",
        title: "Error al cargar",
        message:
          error.response?.data?.error ||
          "No se pudo guardar. Intenta nuevamente.",
      });
    } finally {
      setLoadingCommit(false);
    }
  };

  // Image upload completion — bump the count locally and ping the parent
  // so any product list it might be showing also refreshes its image data.
  const handleImagesUploaded = (productoId, newCount) => {
    setCommitted((c) =>
      c
        ? {
            ...c,
            creados: c.creados.map((p) =>
              p.id === productoId ? { ...p, imagenes_count: newCount } : p
            ),
          }
        : c
    );
    if (typeof onCommitted === "function") {
      onCommitted();
    }
  };

  return (
    <section className="cm-root cm-root--embedded">
      {/* Step 1 — Selección de tipo + plantilla */}
      <div className="cm-card">
        <div className="cm-step">
          <span className="cm-step-number">1</span>
          <div className="cm-step-body">
            <h2>Selecciona el tipo de producto y descarga la plantilla</h2>
            <p>
              Cada tipo tiene sus propias columnas dinámicas. La plantilla incluye
              un encabezado con el nombre del campo y una segunda fila con el tipo
              de dato esperado (texto, número o booleano) — los datos se llenan
              desde la fila 3 en adelante.
            </p>
            <div className="cm-row">
              <select
                className="cm-select"
                value={tipoId}
                onChange={(e) => setTipoId(e.target.value)}
              >
                <option value="">Selecciona un tipo...</option>
                {tipos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
              <button
                className="cm-btn cm-btn-secondary"
                onClick={handleDownload}
                disabled={!tipoId || loadingTemplate}
              >
                <Download size={16} />
                {loadingTemplate ? "Generando..." : "Descargar plantilla"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2 — subir archivo + previsualizar */}
      <div className="cm-card">
        <div className="cm-step">
          <span className="cm-step-number">2</span>
          <div className="cm-step-body">
            <h2>Sube el archivo y previsualiza</h2>
            <p>
              Llena la plantilla con los productos a cargar. En la previsualización
              podrás <strong>editar cada celda</strong> para corregir errores
              antes de confirmar — no necesitas volver a subir el Excel.
            </p>
            <div className="cm-row">
              <input
                type="file"
                className="cm-input-file"
                accept=".xlsx"
                onChange={(e) => setArchivo(e.target.files?.[0] || null)}
              />
              <button
                className="cm-btn cm-btn-primary"
                onClick={handlePreview}
                disabled={!tipoId || !archivo || loadingPreview}
              >
                <Eye size={16} />
                {loadingPreview ? "Procesando..." : "Previsualizar"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editable preview — phase 2 */}
      {previewRows && !committed && (
        <EditablePreview
          rows={previewRows}
          campos={tipoCampos}
          onCellChange={updateCell}
          onConfirm={handleConfirm}
          loadingCommit={loadingCommit}
        />
      )}

      {/* Post-commit — phase 3 */}
      {committed && (
        <CommittedPanel
          result={committed}
          onUploadImages={(p) => setImagesTarget(p)}
        />
      )}

      {imagesTarget && (
        <BulkImagesModal
          producto={imagesTarget}
          onClose={() => setImagesTarget(null)}
          onUploaded={(newCount) => handleImagesUploaded(imagesTarget.id, newCount)}
        />
      )}

      {notify && (
        <NotifyModal
          variant={notify.variant}
          title={notify.title}
          message={notify.message}
          onClose={() => setNotify(null)}
        />
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Editable preview
// ---------------------------------------------------------------------------

function EditablePreview({ rows, campos, onCellChange, onConfirm, loadingCommit }) {
  const counts = rows.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    },
    { creado: 0, ignorado: 0, fallido: 0 }
  );

  const allCols = [
    { key: "nombre", label: "Nombre", tipo: "texto" },
    { key: "descripcion", label: "Descripción", tipo: "texto" },
    { key: "marca", label: "Marca", tipo: "texto" },
    ...campos.map((c) => ({ key: c.nombre, label: c.nombre, tipo: c.tipo })),
  ];

  const canConfirm = counts.creado > 0 || counts.fallido > 0;

  return (
    <div className="cm-card">
      <div className="cm-step">
        <span className="cm-step-number">3</span>
        <div className="cm-step-body" style={{ width: "100%" }}>
          <h2>Previsualización editable</h2>
          <p>
            Revisa los datos extraídos del Excel. Cada celda es editable —
            corrige lo necesario y luego confirma para guardar.
          </p>

          <div className="cm-preview-summary">
            <span className="cm-pill cm-pill-success">
              <CheckCircle2 size={14} /> {counts.creado} se crearán
            </span>
            <span className="cm-pill cm-pill-warn">
              <AlertTriangle size={14} /> {counts.ignorado} ya existen
            </span>
            <span className="cm-pill cm-pill-error">
              <XCircle size={14} /> {counts.fallido} con errores
            </span>
          </div>

          <div className="cm-table-wrap">
            <table className="cm-table cm-table--editable">
              <thead>
                <tr>
                  <th>Fila</th>
                  <th>Estado</th>
                  {allCols.map((c) => (
                    <th key={c.key}>{c.label}</th>
                  ))}
                  <th>Errores</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const badge = STATUS_BADGES[row.status];
                  const disabled = row.status === "ignorado";
                  return (
                    <tr key={idx} className={`cm-tr-${row.status}`}>
                      <td>{row.fila ?? "—"}</td>
                      <td>
                        <span className={`cm-badge ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                      {allCols.map((c) => (
                        <td key={c.key}>
                          <CellEditor
                            tipo={c.tipo}
                            value={row.data?.[c.key] ?? ""}
                            disabled={disabled}
                            onChange={(v) => onCellChange(idx, c.key, v)}
                          />
                        </td>
                      ))}
                      <td>
                        {row.errores && row.errores.length > 0 ? (
                          <ul className="cm-error-list">
                            {row.errores.map((e, i) => (
                              <li key={i}>{e}</li>
                            ))}
                          </ul>
                        ) : row.status === "ignorado" ? (
                          <span style={{ color: "#92400e", fontSize: "0.82rem" }}>
                            Producto con el mismo nombre ya existe
                          </span>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="cm-confirm-bar">
            <span style={{ marginRight: "auto", fontSize: "0.85rem", color: "#64748b" }}>
              Las filas duplicadas (Ya existe) se ignoran al confirmar.
            </span>
            <button
              className="cm-btn cm-btn-success"
              onClick={onConfirm}
              disabled={!canConfirm || loadingCommit}
            >
              <Save size={16} />
              {loadingCommit
                ? "Guardando..."
                : `Confirmar y crear ${counts.creado + counts.fallido}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CellEditor({ tipo, value, disabled, onChange }) {
  if (tipo === "booleano") {
    return (
      <select
        className="cm-cell-input"
        value={String(value ?? "")}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">—</option>
        <option value="true">Sí</option>
        <option value="false">No</option>
      </select>
    );
  }
  return (
    <input
      type={tipo === "numero" ? "number" : "text"}
      step={tipo === "numero" ? "any" : undefined}
      className="cm-cell-input"
      value={value ?? ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

// ---------------------------------------------------------------------------
// Post-commit panel — created products + image upload
// ---------------------------------------------------------------------------

function CommittedPanel({ result, onUploadImages }) {
  return (
    <div className="cm-card">
      <div className="cm-step">
        <span className="cm-step-number">4</span>
        <div className="cm-step-body" style={{ width: "100%" }}>
          <h2>Productos creados</h2>
          <p>
            {result.creados.length} producto{result.creados.length === 1 ? "" : "s"} se
            registraron correctamente. Sube imágenes a cada uno (hasta 10 por producto).
          </p>

          {result.creados.length === 0 ? (
            <div className="cm-empty">No se creó ningún producto.</div>
          ) : (
            <ul className="cm-created-list">
              {result.creados.map((p) => (
                <li key={p.id} className="cm-created-row">
                  <div className="cm-created-info">
                    <span className="cm-created-id">#{p.id}</span>
                    <span className="cm-created-name">{p.nombre}</span>
                    <span className="cm-created-marca">{p.marca_nombre}</span>
                    <span className="cm-created-imgs">
                      <ImageIcon size={13} /> {p.imagenes_count || 0}/10
                    </span>
                  </div>
                  <button
                    className="cm-btn cm-btn-primary"
                    onClick={() => onUploadImages(p)}
                    disabled={(p.imagenes_count || 0) >= 10}
                  >
                    <ImageIcon size={14} />
                    Subir imágenes
                  </button>
                </li>
              ))}
            </ul>
          )}

          {result.fallidos && result.fallidos.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <h3 style={{ fontSize: "0.95rem", margin: "0 0 0.5rem", color: "#991b1b" }}>
                Filas con errores ({result.fallidos.length})
              </h3>
              <table className="cm-table">
                <thead>
                  <tr>
                    <th>Fila</th>
                    <th>Nombre</th>
                    <th>Errores</th>
                  </tr>
                </thead>
                <tbody>
                  {result.fallidos.map((r, i) => (
                    <tr key={i}>
                      <td>{r.fila ?? "—"}</td>
                      <td>{r.nombre || "—"}</td>
                      <td>
                        <ul className="cm-error-list">
                          {(r.errores || []).map((e, j) => (
                            <li key={j}>{e}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
