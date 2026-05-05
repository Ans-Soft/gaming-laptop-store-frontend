import { useCallback, useMemo } from 'react';
import {
  useKpis,
  useSalesTimeline,
  useSalesOrdersStatus,
  usePurchaseOrdersStatus,
  useReservations,
  useImportsExpenses,
} from './api';
import {
  formatCOP,
  formatCOPCompact,
  formatPct,
  currentMonthStr,
} from './formatters';
import { useDateRange } from '../../../hooks/useDateRange';
import KpiCard from './components/KpiCard';
import DamagedKpiCard from './components/DamagedKpiCard';
import MonthSelector from './components/MonthSelector';
import SalesTimelineChart from './components/SalesTimelineChart';
import StatusDonut from './components/StatusDonut';
import ReservationsTable from './components/ReservationsTable';
import ImportsExpensesChart from './components/ImportsExpensesChart';
import './Dashboard.css';

// Brand-aligned palette for charts. Sourced from --primary-color family in
// global.css to keep the dashboard visually consistent with the rest of admin.
const SALES_DONUT_COLORS = {
  por_entregar: '#1AABF5', // primary-bright
  entregado: '#2979C8',    // primary-color
};
const PURCHASE_DONUT_COLORS = {
  viajando: '#2979C8',                 // primary-color
  en_oficina_importadora: '#7ED4F7',   // third-color
  en_oficina: '#0A6FA8',               // cta-hover (deeper blue)
};

function deltaSubtitle(delta) {
  // null delta → omit subtitle entirely (avoids visual noise of repeating
  // "Sin datos del mes anterior" across multiple cards).
  if (delta == null) return null;
  const txt = `${formatPct(delta)} vs mes anterior`;
  if (delta > 0) return { text: txt, color: 'success' };
  if (delta < 0) return { text: txt, color: 'danger' };
  return { text: txt, color: 'muted' };
}

export default function Dashboard() {
  // Dashboard month is derived from the global header date range, so the
  // global selector and the in-page MonthSelector stay in sync. Picking a
  // month here also updates the global range (used by every other page).
  const { from, setFrom, setTo, setPreset } = useDateRange();
  const month = useMemo(
    () => (from ? from.substring(0, 7) : currentMonthStr()),
    [from]
  );
  const setMonth = useCallback(
    (newMonth) => {
      const [y, m] = newMonth.split('-').map(Number);
      const lastDay = new Date(y, m, 0).getDate();
      setPreset('personalizado');
      setFrom(`${newMonth}-01`);
      setTo(`${newMonth}-${String(lastDay).padStart(2, '0')}`);
    },
    [setPreset, setFrom, setTo]
  );

  const kpisQ = useKpis(month);
  const timelineQ = useSalesTimeline(month);
  const salesStatusQ = useSalesOrdersStatus(month);
  const purchaseStatusQ = usePurchaseOrdersStatus(month);
  const reservationsQ = useReservations();
  const importsQ = useImportsExpenses(month);

  const k = kpisQ.data;

  // KPI 1 — Ventas
  const ventasDelta = deltaSubtitle(k?.ventas_mes?.delta_pct);
  const ventasValor = Number(k?.ventas_mes?.valor) || 0;

  // KPI 2 — Ganancia
  const gananciaDelta = deltaSubtitle(k?.ganancia_neta?.delta_pct);
  const gananciaValor = Number(k?.ganancia_neta?.valor) || 0;

  // KPI 3 — Órdenes por entregar
  const pendingValor = k?.ordenes_por_entregar?.valor ?? 0;
  const atrasadas = k?.ordenes_por_entregar?.atrasadas_2_dias || 0;
  const pendingSubtitle =
    atrasadas > 0
      ? { text: `${atrasadas} atrasadas +2 días`, color: 'danger' }
      : null; // omit when "Al día" — less noise

  // KPI 4 — Inventario
  const invValor = Number(k?.valor_inventario?.valor) || 0;
  const invCount = k?.valor_inventario?.cantidad_equipos ?? 0;

  // KPI 5 — Equipos viajando
  const viajandoCantidad = k?.equipos_viajando?.cantidad ?? 0;
  const viajandoValor = Number(k?.equipos_viajando?.valor_en_camino) || 0;

  // Donut totals — surface in the center for at-a-glance value.
  const salesTotal =
    (salesStatusQ.data?.por_entregar || 0) +
    (salesStatusQ.data?.entregado || 0);
  const purchaseTotal =
    (purchaseStatusQ.data?.viajando || 0) +
    (purchaseStatusQ.data?.en_oficina_importadora || 0) +
    (purchaseStatusQ.data?.en_oficina || 0);

  return (
    <div className="db-root">
      <header className="db-header">
        <div className="db-title-group">
          <h1 className="db-title">Dashboard general</h1>
          <span className="db-period-label">Período</span>
        </div>
        <MonthSelector value={month} onChange={setMonth} />
      </header>

      {/* Row 1 — 3 KPIs */}
      <div className="db-grid db-grid--3">
        <KpiCard
          label="Ventas del mes"
          value={formatCOP(ventasValor)}
          isZero={ventasValor === 0}
          subtitle={ventasDelta?.text}
          subtitleColor={ventasDelta?.color}
          to="/admin/ventas"
          isLoading={kpisQ.isLoading}
          isError={kpisQ.isError}
          onRetry={kpisQ.refetch}
        />
        <KpiCard
          label="Ganancia neta"
          value={formatCOP(gananciaValor)}
          isZero={gananciaValor === 0}
          subtitle={gananciaDelta?.text}
          subtitleColor={gananciaDelta?.color}
          to="/admin/ganancia-neta"
          isLoading={kpisQ.isLoading}
          isError={kpisQ.isError}
          onRetry={kpisQ.refetch}
        />
        <KpiCard
          label="Órdenes por entregar"
          value={pendingValor}
          isZero={pendingValor === 0}
          subtitle={pendingSubtitle?.text}
          subtitleColor={pendingSubtitle?.color}
          to="/admin/ordenes-envio"
          isLoading={kpisQ.isLoading}
          isError={kpisQ.isError}
          onRetry={kpisQ.refetch}
        />
      </div>

      {/* Row 2 — equal-width grid (1fr 1fr 1fr) */}
      <div className="db-grid db-grid--3">
        <KpiCard
          label="Valor del inventario"
          value={formatCOP(invValor)}
          isZero={invValor === 0}
          subtitle={`${invCount} equipo${invCount === 1 ? '' : 's'}`}
          subtitleColor="muted"
          to="/admin/inventario"
          isLoading={kpisQ.isLoading}
          isError={kpisQ.isError}
          onRetry={kpisQ.refetch}
        />
        <KpiCard
          label="Equipos viajando"
          value={viajandoCantidad}
          isZero={viajandoCantidad === 0}
          subtitle={`${formatCOPCompact(viajandoValor)} en camino`}
          subtitleColor="muted"
          to="/admin/ordenes-compra"
          isLoading={kpisQ.isLoading}
          isError={kpisQ.isError}
          onRetry={kpisQ.refetch}
        />
        <DamagedKpiCard
          total={k?.equipos_danados?.total ?? 0}
          estadoReparacion={k?.equipos_danados?.estado_reparacion}
          origenDano={k?.equipos_danados?.origen_dano}
          to="/admin/equipos-danados"
          isLoading={kpisQ.isLoading}
          isError={kpisQ.isError}
          onRetry={kpisQ.refetch}
        />
      </div>

      {/* Row 3 — Sales timeline */}
      <SalesTimelineChart
        actual={timelineQ.data?.actual}
        anterior={timelineQ.data?.anterior}
        isLoading={timelineQ.isLoading}
        isError={timelineQ.isError}
        onRetry={timelineQ.refetch}
      />

      {/* Row 4 — Two donuts with central total */}
      <div className="db-grid db-grid--2">
        <StatusDonut
          title="Ventas — por estado de entrega"
          centerValue={salesTotal}
          centerLabel={salesTotal === 1 ? 'venta' : 'ventas'}
          data={[
            { label: 'Por entregar', value: salesStatusQ.data?.por_entregar || 0, color: SALES_DONUT_COLORS.por_entregar },
            { label: 'Entregado', value: salesStatusQ.data?.entregado || 0, color: SALES_DONUT_COLORS.entregado },
          ]}
          isLoading={salesStatusQ.isLoading}
          isError={salesStatusQ.isError}
          onRetry={salesStatusQ.refetch}
        />
        <StatusDonut
          title="Compras — por estado logístico"
          centerValue={purchaseTotal}
          centerLabel={purchaseTotal === 1 ? 'orden' : 'órdenes'}
          data={[
            { label: 'Viajando', value: purchaseStatusQ.data?.viajando || 0, color: PURCHASE_DONUT_COLORS.viajando },
            { label: 'En oficina importadora', value: purchaseStatusQ.data?.en_oficina_importadora || 0, color: PURCHASE_DONUT_COLORS.en_oficina_importadora },
            { label: 'En oficina', value: purchaseStatusQ.data?.en_oficina || 0, color: PURCHASE_DONUT_COLORS.en_oficina },
          ]}
          isLoading={purchaseStatusQ.isLoading}
          isError={purchaseStatusQ.isError}
          onRetry={purchaseStatusQ.refetch}
        />
      </div>

      {/* Row 5 — Reservations */}
      <ReservationsTable
        data={reservationsQ.data || []}
        isLoading={reservationsQ.isLoading}
        isError={reservationsQ.isError}
        onRetry={reservationsQ.refetch}
      />

      {/* Row 6 — Imports & expenses */}
      <ImportsExpensesChart
        data={importsQ.data || []}
        isLoading={importsQ.isLoading}
        isError={importsQ.isError}
        onRetry={importsQ.refetch}
      />
    </div>
  );
}
