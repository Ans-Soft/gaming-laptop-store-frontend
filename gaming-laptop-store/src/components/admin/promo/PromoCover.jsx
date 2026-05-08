import React from "react";
import "../../../styles/admin/promoCover.css";

const TEMPLATE_URL = "/promo-assets/portada.jpg";

export default function PromoCover({ portada }) {
  const titulo = (
    portada?.titulo || "CATÁLOGO PATECNOLOGICOS PROMOCIONES"
  ).toUpperCase();

  return (
    <div className="pcv-card">
      <img
        className="pcv-bg"
        src={TEMPLATE_URL}
        alt=""
        crossOrigin="anonymous"
      />

      <div className="pcv-title">{titulo}</div>
    </div>
  );
}
