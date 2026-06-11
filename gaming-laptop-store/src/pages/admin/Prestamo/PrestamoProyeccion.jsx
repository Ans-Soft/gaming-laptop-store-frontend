import React, { useMemo } from "react";
import { TableProperties } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import TitleCrud from "../../../components/admin/TitleCrud";
import { useProyeccion, useResumen } from "./usePrestamo";
import { formatCOP, formatCOP2 } from "./prestamoUtils";
import "../../../styles/admin/prestamo.css";

const PrestamoProyeccion = () => {
  const { data: proyeccion = [], isLoading } = useProyeccion();
  const { data: resumen } = useResumen();
  const mesActual = resumen?.mes_en_curso;

  const chartData = useMemo(
    () =>
      proyeccion.map((p) => ({
        mes: p.mes,
        Amigo: Number(p.amigo.saldo_final),
        Dueño: Number(p.dueno.saldo_final),
        Banco: Number(p.banco.saldo_final),
      })),
    [proyeccion]
  );

  return (
    <section className="pr-page">
      <TitleCrud
        title="Proyección"
        icon={TableProperties}
        description="Tabla mes a mes hasta el final del plazo. Los abonos la modifican."
      />

      {isLoading ? (
        <p className="pr-muted">Cargando proyección…</p>
      ) : (
        <>
          <div className="pr-chart">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis
                  tickFormatter={(v) => formatCOP(v)}
                  width={90}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip formatter={(v) => formatCOP2(v)} labelFormatter={(l) => `Mes ${l}`} />
                <Legend />
                <Line type="monotone" dataKey="Banco" stroke="#0A6FA8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Amigo" stroke="#2979C8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Dueño" stroke="#7ED4F7" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="pr-table-wrap">
            <table className="pr-table">
              <thead>
                <tr>
                  <th rowSpan={2}>Mes</th>
                  <th colSpan={3}>Amigo</th>
                  <th colSpan={2}>Dueño</th>
                  <th>Banco</th>
                </tr>
                <tr>
                  <th>Saldo ini.</th>
                  <th>Cuota</th>
                  <th>2%</th>
                  <th>Saldo ini.</th>
                  <th>Cuota</th>
                  <th>Saldo fin</th>
                </tr>
              </thead>
              <tbody>
                {proyeccion.map((p) => (
                  <tr key={p.mes} className={p.mes === mesActual ? "pr-row--actual" : ""}>
                    <td>{p.mes}</td>
                    <td>{formatCOP2(p.amigo.saldo_inicial)}</td>
                    <td>{formatCOP2(p.amigo.cuota)}</td>
                    <td>{formatCOP2(p.amigo.comision)}</td>
                    <td>{formatCOP2(p.dueno.saldo_inicial)}</td>
                    <td>{formatCOP2(p.dueno.cuota)}</td>
                    <td>{formatCOP2(p.banco.saldo_final)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
};

export default PrestamoProyeccion;
