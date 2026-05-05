import { useEffect, useState } from "react";
import {
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Save,
} from "lucide-react";
import NotifyModal from "../../components/admin/NotifyModal";
import {
  descargarPlantillaImportacion,
  subirImportacion,
} from "../../services/ImportacionService";
import "../../styles/admin/cargueMasivo.css";

const formatCOP = (v) =>
  v == null || v === "" ? "—" : "$" + Number(v).toLocaleString("es-CO");

/**
 * CargarImportaciones — bulk update OrdenCompra cost + logistic state from a
 * byorderbox-style import file. Two phases:
 *   1) Download template + upload + dry-run preview.
 *   2) Confirm — server applies estado_logistico='en_oficina_importadora'
 *      and writes costo_importacion to each matched order.
 *
 * Rows that don't match an order (because the tracking is not in the system)
 * are surfaced in the "No identificados" tab so the user can investigate.
 */
export default function CargarImportaciones({ onCommitted } = {}) {
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [committed, setCommitted] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingCommit, setLoadingCommit] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [activeTab, setActiveTab] = useState("matched");
  const [notify, setNotify] = useState(null);

  useEffect(() => {
    setPreview(null);
    setCommitted(null);
    setActiveTab("matched");
  }, [archivo]);

  const handleDownload = async () => {
    setLoadingTemplate(true);
    try {
      const response = await descargarPlantillaImportacion();
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Plantilla_Importaciones.xlsx";
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

  const runUpload = async (dryRun) => {
    if (!archivo) return;
    const setLoading = dryRun ? setLoadingPreview : setLoadingCommit;
    setLoading(true);
    try {
      const result = await subirImportacion(archivo, dryRun);
      if (dryRun) {
        setPreview(result);
        setCommitted(null);
        setActiveTab("matched");
      } else {
        setCommitted(result);
        setNotify({
          variant: "success",
          title: "Importación cargada",
          message: `${result.matched.length} órdenes actualizadas, ${result.no_mapeado.length} no identificadas, ${result.fallidos.length} con errores.`,
        });
        // Notify the parent so the orders listado refetches and reflects the
        // new estado_logistico / costo_importacion immediately.
        if (typeof onCommitted === "function" && result.matched.length > 0) {
          onCommitted();
        }
      }
    } catch (error) {
      setNotify({
        variant: "error",
        title: dryRun ? "Error al previsualizar" : "Error al cargar",
        message:
          error.response?.data?.error ||
          "No se pudo procesar el archivo. Verifica que sea el formato correcto.",
      });
    } finally {
      setLoading(false);
    }
  };

  const result = committed || preview;

  return (
    <section className="cm-root cm-root--embedded">
      {/* Step 1 — Plantilla */}
      <div className="cm-card">
        <div className="cm-step">
          <span className="cm-step-number">1</span>
          <div className="cm-step-body">
            <h2>Descarga la plantilla</h2>
            <p>
              La plantilla trae las tres columnas que el sistema espera:{" "}
              <strong>Numero de tracking</strong>, <strong>Descripcion</strong>{" "}
              y <strong>Valor importacion (COP)</strong>. Puedes copiar las
              filas directo del correo de la importadora.
            </p>
            <div className="cm-row">
              <button
                className="cm-btn cm-btn-secondary"
                onClick={handleDownload}
                disabled={loadingTemplate}
              >
                <Download size={16} />
                {loadingTemplate ? "Generando..." : "Descargar plantilla"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2 — Subir */}
      <div className="cm-card">
        <div className="cm-step">
          <span className="cm-step-number">2</span>
          <div className="cm-step-body">
            <h2>Sube el archivo y previsualiza</h2>
            <p>
              El sistema busca cada fila por <strong>número de tracking</strong>{" "}
              en las órdenes existentes. Las que matcheen pasarán a estado{" "}
              <em>en oficina importadora</em> con su nuevo{" "}
              <em>costo de importación</em>; las que no, se listan aparte para
              que las identifiques manualmente.
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
                onClick={() => runUpload(true)}
                disabled={!archivo || loadingPreview}
              >
                <Eye size={16} />
                {loadingPreview ? "Procesando..." : "Previsualizar"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {result && (
        <ImportacionPreview
          result={result}
          committed={!!committed}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onConfirm={() => runUpload(false)}
          loadingCommit={loadingCommit}
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
// Preview
// ---------------------------------------------------------------------------

function ImportacionPreview({
  result,
  committed,
  activeTab,
  setActiveTab,
  onConfirm,
  loadingCommit,
}) {
  const { matched, no_mapeado: noMapeado, fallidos } = result;
  const canConfirm = !committed && matched.length > 0;

  return (
    <div className="cm-card">
      <div className="cm-step">
        <span className="cm-step-number">3</span>
        <div className="cm-step-body" style={{ width: "100%" }}>
          <h2>{committed ? "Resultado de la carga" : "Previsualización"}</h2>
          <p>
            {committed
              ? "Estas son las órdenes actualizadas. Revisa los no identificados para asociarlos manualmente."
              : "Revisa los resultados antes de confirmar. Las filas no identificadas no se crean — solo se reportan."}
          </p>

          <div className="cm-preview-summary">
            <span className="cm-pill cm-pill-success">
              <CheckCircle2 size={14} /> {matched.length}{" "}
              {committed ? "actualizadas" : "se actualizarán"}
            </span>
            <span className="cm-pill cm-pill-warn">
              <AlertTriangle size={14} /> {noMapeado.length} no identificadas
            </span>
            <span className="cm-pill cm-pill-error">
              <XCircle size={14} /> {fallidos.length} con errores
            </span>
          </div>

          <div className="cm-tabs">
            <button
              className={`cm-tab ${activeTab === "matched" ? "active" : ""}`}
              onClick={() => setActiveTab("matched")}
            >
              {committed ? "Actualizadas" : "Por actualizar"} ({matched.length})
            </button>
            <button
              className={`cm-tab ${activeTab === "no_mapeado" ? "active" : ""}`}
              onClick={() => setActiveTab("no_mapeado")}
            >
              No identificadas ({noMapeado.length})
            </button>
            <button
              className={`cm-tab ${activeTab === "fallidos" ? "active" : ""}`}
              onClick={() => setActiveTab("fallidos")}
            >
              Errores ({fallidos.length})
            </button>
          </div>

          <div className="cm-table-wrap">
            {activeTab === "matched" && <MatchedTable rows={matched} />}
            {activeTab === "no_mapeado" && <NoMapeadoTable rows={noMapeado} />}
            {activeTab === "fallidos" && <ErroresTable rows={fallidos} />}
          </div>

          {!committed && (
            <div className="cm-confirm-bar">
              {!canConfirm && (
                <span
                  className="cm-banner cm-banner-info"
                  style={{ marginRight: "auto" }}
                >
                  No hay órdenes para actualizar.
                </span>
              )}
              <button
                className="cm-btn cm-btn-success"
                onClick={onConfirm}
                disabled={!canConfirm || loadingCommit}
              >
                <Save size={16} />
                {loadingCommit
                  ? "Guardando..."
                  : `Confirmar y actualizar ${matched.length}`}
              </button>
            </div>
          )}
          {committed && (
            <div className="cm-confirm-bar">
              <span
                className="cm-banner cm-banner-success"
                style={{ marginRight: "auto" }}
              >
                <CheckCircle2 size={16} /> Importación finalizada.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MatchedTable({ rows }) {
  if (!rows.length)
    return <div className="cm-empty">Ninguna fila coincidió con órdenes existentes.</div>;
  return (
    <table className="cm-table">
      <thead>
        <tr>
          <th>Fila</th>
          <th>Tracking</th>
          <th>Descripción</th>
          <th>N° Orden</th>
          <th>Producto</th>
          <th>Costo anterior</th>
          <th>Costo nuevo</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td>{r.fila}</td>
            <td>
              <code
                style={{
                  fontFamily: "Courier New, monospace",
                  background: "var(--icon-bg)",
                  padding: "0.18rem 0.45rem",
                  borderRadius: "4px",
                  fontSize: "0.8rem",
                }}
              >
                {r.data?.numero_tracking || "—"}
              </code>
            </td>
            <td>{r.data?.descripcion || "—"}</td>
            <td>{r.numero_orden}</td>
            <td>{r.producto_nombre}</td>
            <td style={{ color: "#64748b" }}>{formatCOP(r.costo_anterior)}</td>
            <td style={{ fontWeight: 700, color: "var(--primary-color)" }}>
              {formatCOP(r.costo_nuevo)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function NoMapeadoTable({ rows }) {
  if (!rows.length)
    return (
      <div className="cm-empty">
        Todos los trackings se identificaron correctamente.
      </div>
    );
  return (
    <table className="cm-table">
      <thead>
        <tr>
          <th>Fila</th>
          <th>Tracking</th>
          <th>Descripción</th>
          <th>Valor</th>
          <th>Motivo</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} style={{ background: "#fffbeb" }}>
            <td>{r.fila}</td>
            <td>
              <code
                style={{
                  fontFamily: "Courier New, monospace",
                  background: "#fef3c7",
                  padding: "0.18rem 0.45rem",
                  borderRadius: "4px",
                  fontSize: "0.8rem",
                  color: "#92400e",
                }}
              >
                {r.data?.numero_tracking || "—"}
              </code>
            </td>
            <td>{r.data?.descripcion || "—"}</td>
            <td>{formatCOP(r.data?.valor_importacion_cop)}</td>
            <td style={{ color: "#92400e", fontSize: "0.83rem" }}>
              No se encontró ninguna orden con ese tracking. Verifica el número
              o registra el tracking en la orden correspondiente.
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ErroresTable({ rows }) {
  if (!rows.length) return <div className="cm-empty">Sin errores.</div>;
  return (
    <table className="cm-table">
      <thead>
        <tr>
          <th>Fila</th>
          <th>Tracking</th>
          <th>Errores</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td>{r.fila}</td>
            <td>{r.data?.numero_tracking || "—"}</td>
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
  );
}
