import React from "react";
import {
  Cpu,
  CircuitBoard,
  MemoryStick,
  HardDrive,
  MonitorPlay,
  Monitor,
  Layers,
  Cable,
  Zap,
  Plug,
  BatteryCharging,
  Usb,
  Box,
} from "lucide-react";
import "../../../styles/admin/promoCard.css";

const ICON_MAP = {
  cpu: Cpu,
  motherboard: CircuitBoard,
  mobo: CircuitBoard,
  board: CircuitBoard,
  gpu: MonitorPlay,
  ram: MemoryStick,
  ssd: HardDrive,
  storage: HardDrive,
  hdd: HardDrive,
  screen: Monitor,
  pantalla: Monitor,
  vram: Layers,
  bus: Cable,
  tdp: Zap,
  power: BatteryCharging,
  psu: BatteryCharging,
  fuente: BatteryCharging,
  plug: Plug,
  ports: Usb,
};

function PromoSpecIcon({ slug }) {
  const Cmp = (slug && ICON_MAP[slug.toLowerCase()]) || Box;
  return <Cmp className="pc-spec-icon" strokeWidth={1.6} />;
}

const TEMPLATE_URL = "/promo-assets/plantilla_productos.jpg";

function formatCOP(n) {
  if (typeof n !== "number") n = Number(n) || 0;
  return `$${n.toLocaleString("es-CO")}`;
}

export function computeRandomDiscount(precio) {
  let min, max;
  if (precio < 1_500_000) [min, max] = [500_000, 700_000];
  else if (precio < 2_500_000) [min, max] = [700_000, 900_000];
  else [min, max] = [900_000, 1_000_000];
  const ahorro = Math.round((min + Math.random() * (max - min)) / 50_000) * 50_000;
  return { precio_anterior: precio + ahorro, ahorro };
}

export default function PromoCard({ unidad, mes }) {
  const { precio_anterior, ahorro } = computeRandomDiscount(unidad.precio);

  const marca = (unidad.marca_nombre || "").trim();
  const nombre = (unidad.producto_nombre || "").trim();
  const tituloProducto = (
    nombre.toLowerCase().startsWith(marca.toLowerCase())
      ? nombre
      : `${marca} ${nombre}`.trim()
  ).toUpperCase();

  return (
    <div className="pc-card">
      <img
        className="pc-bg"
        src={TEMPLATE_URL}
        alt=""
        crossOrigin="anonymous"
      />

      <div className="pc-header">
        <div className="pc-month">{mes || ""}</div>
        <div className="pc-special">¡OFERTA ESPECIAL!</div>
      </div>

      <div className="pc-specs">
        {(unidad.specs || []).slice(0, 5).map((s, i) => (
          <div key={i} className="pc-spec-row">
            <PromoSpecIcon slug={s.icono_slug} />
            <span className="pc-spec-text">{s.label}</span>
          </div>
        ))}
      </div>

      {unidad.entrega_label && (
        <div className="pc-entrega">{unidad.entrega_label}</div>
      )}

      <div className="pc-product-title">{tituloProducto}</div>
      {unidad.condicion_label && unidad.condicion !== "nuevo" && (
        <div className="pc-product-condicion">¡{unidad.condicion_label}!</div>
      )}

      <div className="pc-product-image-wrap">
        {unidad.imagen_principal_url ? (
          <img
            src={unidad.imagen_principal_url}
            alt={tituloProducto}
            className="pc-product-image"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="pc-product-image pc-product-image-fallback">
            Sin imagen
          </div>
        )}
      </div>

      <div className="pc-price-old">{formatCOP(precio_anterior)}</div>
      <div className="pc-price-new">{formatCOP(unidad.precio)}</div>
      <div className="pc-price-savings">
        Ahorra: {formatCOP(ahorro).replace("$", "")}
      </div>
    </div>
  );
}
