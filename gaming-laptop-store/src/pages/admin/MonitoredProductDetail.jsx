import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { ArrowLeft, ExternalLink, Eye } from "lucide-react";

import "./../../styles/global.css";
import "./../../styles/admin/dataTable.css";

import {
  getMonitoredProduct,
  getMonitoredProductHistory,
} from "../../services/DealWatcherService";
import DealWatcherPauseBar from "../../components/admin/DealWatcherPauseBar";

const fmtCop = (v) => {
  if (v == null) return "—";
  const n = Number(v);
  return Number.isNaN(n) ? String(v) : `$${Math.round(n).toLocaleString("es-CO")}`;
};

const fmtUsd = (v) => {
  if (v == null) return "—";
  const n = Number(v);
  return Number.isNaN(n) ? String(v) : `$${n.toFixed(2)}`;
};

const fmtDateTime = (s) => (s ? new Date(s).toLocaleString("es-CO") : "—");

function ChartTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0].payload;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 6,
        padding: "8px 12px",
        fontSize: 12,
        boxShadow: "0 4px 12px rgba(10,22,40,0.08)",
      }}
    >
      <div style={{ color: "#0A1628", fontWeight: 600, marginBottom: 4 }}>{row.label}</div>
      <div style={{ color: "#475569" }}>USD: <strong>{fmtUsd(row.price_usd)}</strong></div>
      <div style={{ color: "#475569" }}>Seller: {row.seller_username || "—"}</div>
      <div style={{ color: row.was_available ? "#16a34a" : "#dc2626" }}>
        {row.was_available ? "Disponible" : "Sin stock"}
      </div>
      {row.triggered_notification && (
        <div style={{ color: "#2563eb", marginTop: 4 }}>🔔 Notificación enviada</div>
      )}
    </div>
  );
}

const StatBox = ({ label, value }) => (
  <div
    style={{
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: 8,
      padding: "12px 16px",
      minWidth: 160,
    }}
  >
    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 16, color: "#0A1628", fontWeight: 600 }}>{value}</div>
  </div>
);

const MonitoredProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([getMonitoredProduct(id), getMonitoredProductHistory(id, 200)])
      .then(([p, h]) => {
        if (!active) return;
        setProduct(p);
        setHistory(Array.isArray(h) ? h : []);
        setError(null);
      })
      .catch((e) => {
        if (!active) return;
        console.error("Error cargando detalle Deal Watcher:", e);
        setError("No se pudo cargar el detalle del producto.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const chartData = useMemo(() => {
    // Backend returns newest-first; chart wants oldest-first.
    return [...history]
      .filter((c) => c.price_usd != null)
      .reverse()
      .map((c) => ({
        ts: new Date(c.checked_at).getTime(),
        label: new Date(c.checked_at).toLocaleString("es-CO", {
          dateStyle: "short",
          timeStyle: "short",
        }),
        price_usd: Number(c.price_usd),
        was_available: c.was_available,
        seller_username: c.seller_username,
        triggered_notification: c.triggered_notification,
      }));
  }, [history]);

  const triggeredTimes = useMemo(
    () => chartData.filter((d) => d.triggered_notification).map((d) => d.ts),
    [chartData],
  );

  if (loading) {
    return (
      <section style={{ padding: 24 }}>
        <p>Cargando…</p>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section style={{ padding: 24 }}>
        <p style={{ color: "#dc2626" }}>{error || "Producto no encontrado"}</p>
        <Link to="/admin/deal-watcher">← Volver</Link>
      </section>
    );
  }

  return (
    <section style={{ padding: 24 }}>
      <DealWatcherPauseBar />
      <div style={{ marginBottom: 16 }}>
        <Link
          to="/admin/deal-watcher"
          style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#475569" }}
        >
          <ArrowLeft size={16} /> Volver a la lista
        </Link>
      </div>

      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <Eye size={28} style={{ color: "#0A1628" }} />
        <div>
          <h1 style={{ margin: 0, color: "#0A1628" }}>{product.nickname}</h1>
          <a
            href={product.ebay_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, color: "#2563eb" }}
          >
            eBay item {product.ebay_item_id}
            <ExternalLink size={12} />
          </a>
        </div>
      </header>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <StatBox label="Precio máximo (COP)" value={fmtCop(product.max_price_cop)} />
        <StatBox label="Último USD" value={fmtUsd(product.last_known_price_usd)} />
        <StatBox label="Último seller" value={product.last_known_seller || "—"} />
        <StatBox
          label="Visto disponible"
          value={fmtDateTime(product.last_seen_available_at)}
        />
        <StatBox
          label="Última notificación"
          value={fmtDateTime(product.last_notified_at)}
        />
        <StatBox label="Estado" value={product.active ? "Activo" : "Pausado"} />
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <h2 style={{ margin: "0 0 12px", fontSize: 16, color: "#0A1628" }}>
          Histórico de precio (USD)
        </h2>
        {chartData.length === 0 ? (
          <p style={{ color: "#94a3b8", textAlign: "center", padding: 32 }}>
            Aún no hay chequeos registrados para este producto.
          </p>
        ) : (
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 10, right: 24, bottom: 6, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(10,22,40,0.06)" vertical={false} />
                <XAxis
                  dataKey="ts"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  scale="time"
                  tickFormatter={(t) => new Date(t).toLocaleDateString("es-CO", { month: "short", day: "numeric" })}
                  tick={{ fontSize: 11, fill: "#4A6580" }}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(10,22,40,0.08)" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#4A6580" }}
                  tickFormatter={(v) => `$${v}`}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(10,22,40,0.08)" }}
                  width={48}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(10,22,40,0.12)" }} />
                {triggeredTimes.map((t) => (
                  <ReferenceLine
                    key={t}
                    x={t}
                    stroke="#2563eb"
                    strokeDasharray="3 3"
                    strokeOpacity={0.5}
                  />
                ))}
                <Line
                  type="monotone"
                  dataKey="price_usd"
                  stroke="#2979C8"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: "#2979C8", stroke: "#fff", strokeWidth: 1 }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="table-container">
        <h2 style={{ margin: "0 0 12px", fontSize: 16, color: "#0A1628" }}>
          Últimos chequeos
        </h2>
        <div className="table">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Disp.</th>
                <th>USD</th>
                <th>COP</th>
                <th>Seller</th>
                <th>Confiable</th>
                <th>Notificó</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "1.5rem", color: "#9ca3af" }}>
                    Sin chequeos.
                  </td>
                </tr>
              ) : (
                history.slice(0, 50).map((c) => (
                  <tr key={c.id}>
                    <td>{fmtDateTime(c.checked_at)}</td>
                    <td>{c.was_available ? "Sí" : "No"}</td>
                    <td>{fmtUsd(c.price_usd)}</td>
                    <td>{fmtCop(c.price_cop_calculated)}</td>
                    <td>{c.seller_username || "—"}</td>
                    <td>{c.seller_is_trusted ? "Sí" : "No"}</td>
                    <td>{c.triggered_notification ? "🔔" : "—"}</td>
                    <td style={{ color: c.error_message ? "#dc2626" : "inherit", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {c.error_message || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default MonitoredProductDetail;
