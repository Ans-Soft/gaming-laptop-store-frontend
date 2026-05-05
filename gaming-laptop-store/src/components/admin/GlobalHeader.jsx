import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { CalendarRange, DollarSign } from "lucide-react";
import { useTRMList } from "../../hooks/queries/useLookups";
import { useDateRange } from "../../hooks/useDateRange";
import { DATE_RANGE_PRESETS } from "../../utils/dateRangeFilter";
import logo from "../../assets/logo.png";
import "../../styles/admin/globalHeader.css";

const formatCOP = (v) =>
  v != null ? "$" + Number(v).toLocaleString("es-CO") : "—";

export default function GlobalHeader() {
  const { preset, from, to, setPreset, setFrom, setTo } = useDateRange();

  const trmQuery = useTRMList(30);

  const trmList = Array.isArray(trmQuery.data)
    ? trmQuery.data
    : trmQuery.data?.results ?? [];
  const trmToday = trmList[0];
  const trmChartData = [...trmList]
    .reverse()
    .map((t) => ({ fecha: t.fecha, valor: Number(t.valor_cop) }));

  return (
    <header className="gh-root" role="banner">
      <div className="gh-left">
        <Link to="/admin" className="gh-logo">
          <img src={logo} alt="Patecnológicos" className="gh-logo-img" />
          <span className="gh-logo-text">Patecnológicos</span>
        </Link>
      </div>

      <div className="gh-center">
        <div className="gh-date-group">
          <CalendarRange size={16} className="gh-icon-muted" />
          <select
            className="gh-select"
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
          >
            {DATE_RANGE_PRESETS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="gh-date-input"
            value={from}
            disabled={preset !== "personalizado"}
            onChange={(e) => setFrom(e.target.value)}
          />
          <span className="gh-date-sep">→</span>
          <input
            type="date"
            className="gh-date-input"
            value={to}
            disabled={preset !== "personalizado"}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
      </div>

      <div className="gh-right">
        <div className="gh-trm">
          <div className="gh-trm-label">
            <DollarSign size={14} />
            <span>TRM</span>
          </div>
          <div className="gh-trm-value">
            {trmToday
              ? formatCOP(trmToday.valor_cop)
              : trmQuery.isLoading
              ? "..."
              : "—"}
          </div>
          {trmChartData.length > 1 && (
            <div className="gh-trm-spark">
              <ResponsiveContainer width={120} height={30}>
                <LineChart data={trmChartData}>
                  <Tooltip
                    formatter={(v) => formatCOP(v)}
                    labelFormatter={(l) => `Fecha: ${l}`}
                    contentStyle={{ fontSize: 11 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="valor"
                    stroke="#4f46e5"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
