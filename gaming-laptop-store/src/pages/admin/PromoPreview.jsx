import React, { useState } from "react";
import PromoCard from "../../components/admin/promo/PromoCard";
import PromoCover from "../../components/admin/promo/PromoCover";
import api from "../../services/Api";
import urls from "../../services/Urls";
import { removeWhiteBackground } from "../../utils/imageBgRemoval";

async function processImages(data) {
  const next = { ...data, unidades: [...(data.unidades || [])] };
  await Promise.all(
    next.unidades.map(async (u, i) => {
      if (u.imagen_principal_url) {
        const processed = await removeWhiteBackground(u.imagen_principal_url);
        next.unidades[i] = { ...u, imagen_principal_url: processed };
      }
    })
  );
  // The cover template already contains the product mosaic; no need to
  // pre-process portada.fotos_mosaico.
  return next;
}

const MOCK_DATA = {
  mes: "MAYO",
  unidades: [
    {
      id: 1,
      producto_nombre: "Office Pro",
      marca_nombre: "Patecnologicos",
      condicion: "nuevo",
      condicion_label: "NUEVO",
      estado_producto: "en_stock",
      entrega_label: "Entrega inmediata!",
      precio: 1990000,
      imagen_principal_url: "/promo-assets/logo.png",
      specs: [
        { orden_promo: 1, icono_slug: "cpu", label: "AMD Ryzen 7 5700G" },
        { orden_promo: 2, icono_slug: "motherboard", label: "MSI A520M-A Pro" },
        { orden_promo: 3, icono_slug: "ram", label: "RAM 16GB DDR4" },
        { orden_promo: 4, icono_slug: "ssd", label: "1 TB NVMe W11 Home" },
        { orden_promo: 5, icono_slug: "power", label: "Unitec ATX-750W" },
      ],
    },
    {
      id: 2,
      producto_nombre: "Predator Helios 16",
      marca_nombre: "Acer",
      condicion: "open_box",
      condicion_label: "OPEN BOX",
      estado_producto: "viajando",
      entrega_label: "Llega: 22 de Mayo",
      precio: 6800000,
      imagen_principal_url: "/promo-assets/logo.png",
      specs: [
        { orden_promo: 1, icono_slug: "cpu", label: "Intel i9 14900HX" },
        { orden_promo: 2, icono_slug: "gpu", label: "RTX 4080 12GB" },
        { orden_promo: 3, icono_slug: "ram", label: "32GB DDR5 5600" },
        { orden_promo: 4, icono_slug: "ssd", label: "1TB NVMe Gen4" },
        { orden_promo: 5, icono_slug: "screen", label: '16" QHD+ 240Hz' },
      ],
    },
    {
      id: 3,
      producto_nombre: "RTX 4070 Super Gaming OC",
      marca_nombre: "Gigabyte",
      condicion: "nuevo",
      condicion_label: "NUEVO",
      estado_producto: "en_oficina_importadora",
      entrega_label: "Llega: 18 de Mayo",
      precio: 2750000,
      imagen_principal_url: "/promo-assets/logo.png",
      specs: [
        { orden_promo: 1, icono_slug: "gpu", label: "RTX 4070 Super" },
        { orden_promo: 2, icono_slug: "vram", label: "12GB GDDR6X" },
        { orden_promo: 3, icono_slug: "bus", label: "192-bit Bus" },
        { orden_promo: 4, icono_slug: "tdp", label: "220W TDP" },
        { orden_promo: 5, icono_slug: "ports", label: "3x DP 1x HDMI" },
      ],
    },
  ],
  portada: {
    titulo: "CATÁLOGO PATECNOLOGICOS PROMOCIONES MAYO",
    fotos_mosaico: [
      "/promo-assets/logo.png",
      "/promo-assets/logo.png",
      "/promo-assets/logo.png",
      "/promo-assets/logo.png",
    ],
    instagram: "patecnologicos",
    whatsapp: "3012661811",
  },
};

const CARD_PX = 2160;
const SCALE = 0.25;
const PREVIEW_BOX = {
  width: CARD_PX * SCALE,
  height: CARD_PX * SCALE,
  overflow: "hidden",
  borderRadius: 12,
  boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
};

const Stage = ({ children }) => (
  <div style={PREVIEW_BOX}>
    <div style={{ transform: `scale(${SCALE})`, transformOrigin: "top left" }}>
      {children}
    </div>
  </div>
);

export default function PromoPreview() {
  const [data, setData] = useState(MOCK_DATA);
  const [mode, setMode] = useState("mock");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadReal = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(urls.promoCardsData);
      const processed = await processImages(res.data);
      setData(processed);
      setMode("real");
    } catch (err) {
      console.error(err);
      setError(
        "No se pudieron cargar los datos reales. Asegúrate de estar logueado y de que el backend esté corriendo."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadMock = () => {
    setData(MOCK_DATA);
    setMode("mock");
    setError(null);
  };

  return (
    <div
      style={{
        padding: "24px 32px",
        background: "#0f0f1a",
        minHeight: "100vh",
        color: "#fff",
        fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>
            Vista previa de imágenes promocionales
          </h1>
          <p style={{ margin: "6px 0 0", color: "#9ca3af", fontSize: 14 }}>
            Modo: <strong style={{ color: mode === "real" ? "#10b981" : "#f59e0b" }}>
              {mode === "real" ? "Datos reales" : "Datos mock"}
            </strong>{" "}
            — {data.unidades.length} unidad{data.unidades.length !== 1 && "es"} · escala {SCALE * 100}%
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={loadMock}
            disabled={mode === "mock"}
            style={btnStyle(mode === "mock")}
          >
            Datos mock
          </button>
          <button
            onClick={loadReal}
            disabled={loading}
            style={btnStyle(false, true)}
          >
            {loading ? "Cargando..." : "Cargar datos reales"}
          </button>
        </div>
      </header>

      {error && (
        <div
          style={{
            background: "#7f1d1d",
            border: "1px solid #ef4444",
            padding: "10px 14px",
            borderRadius: 8,
            marginBottom: 20,
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      <section style={{ marginBottom: 36 }}>
        <h2 style={sectionTitle}>Portada (00-portada.png)</h2>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Stage>
            <PromoCover portada={data.portada} />
          </Stage>
        </div>
      </section>

      <section>
        <h2 style={sectionTitle}>
          Tarjetas de unidad (mostrando {Math.min(data.unidades.length, 6)} de {data.unidades.length})
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(auto-fit, minmax(${CARD_PX * SCALE}px, 1fr))`,
            gap: 30,
            justifyItems: "center",
          }}
        >
          {data.unidades.slice(0, 6).map((u) => (
            <Stage key={u.id}>
              <PromoCard unidad={u} mes={data.mes} />
            </Stage>
          ))}
        </div>
        {data.unidades.length === 0 && (
          <p style={{ color: "#9ca3af", textAlign: "center", padding: "40px 0" }}>
            No hay unidades para mostrar.
          </p>
        )}
      </section>
    </div>
  );
}

const sectionTitle = {
  margin: "0 0 16px",
  fontSize: 18,
  fontWeight: 600,
  color: "#e5e7eb",
  borderBottom: "1px solid #1f2937",
  paddingBottom: 8,
};

function btnStyle(active, primary = false) {
  return {
    padding: "8px 16px",
    borderRadius: 8,
    border: "none",
    fontSize: 14,
    fontWeight: 600,
    cursor: active ? "default" : "pointer",
    color: "#fff",
    background: active
      ? "#374151"
      : primary
      ? "linear-gradient(135deg, #6d28d9, #2563eb)"
      : "#1f2937",
    opacity: active ? 0.7 : 1,
  };
}
