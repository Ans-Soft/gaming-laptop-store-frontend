import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Landmark,
  User,
  UserCog,
  CalendarClock,
  Receipt,
  Percent,
  Plus,
  TableProperties,
  History,
  CalendarCheck,
} from "lucide-react";

import TitleCrud from "../../../components/admin/TitleCrud";
import MovimientoPrestamoForm from "../../../components/admin/MovimientoPrestamoForm";
import PagoRegularModal from "../../../components/admin/PagoRegularModal";
import { useResumen, useCreateMovimiento } from "./usePrestamo";
import { formatCOP2 } from "./prestamoUtils";
import "../../../styles/admin/prestamo.css";

const PrestamoDashboard = () => {
  const { data: resumen, isLoading, isError } = useResumen();
  const createMut = useCreateMovimiento();
  const [showModal, setShowModal] = useState(false);
  const [showPago, setShowPago] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (payload) => {
    setSubmitError(null);
    try {
      await createMut.mutateAsync(payload);
      setShowModal(false);
    } catch (err) {
      const data = err.response?.data;
      setSubmitError(
        data?.message ||
          (data && typeof data === "object"
            ? Object.values(data).flat().join(" ")
            : "No se pudo registrar el movimiento.")
      );
    }
  };

  if (isLoading) {
    return <section className="pr-page"><p className="pr-muted">Cargando resumen…</p></section>;
  }
  if (isError || !resumen) {
    return (
      <section className="pr-page">
        <p className="pr-error">No se pudo cargar el resumen del préstamo.</p>
      </section>
    );
  }
  if (resumen.configurado === false) {
    return (
      <section className="pr-page">
        <TitleCrud title="Control de Préstamo" icon={Landmark} description="Seguimiento de la deuda" />
        <p className="pr-muted">
          Aún no hay configuración sembrada. Ejecuta{" "}
          <code>python manage.py seed_prestamo</code> en el backend.
        </p>
      </section>
    );
  }

  const { amigo, dueno, banco, mes_en_curso, plazo } = resumen;

  return (
    <section className="pr-page">
      <TitleCrud
        title="Control de Préstamo"
        icon={Landmark}
        description={`Mes en curso: ${mes_en_curso} de ${plazo} · corte día ${resumen.fecha_corte}`}
      />

      <div className="pr-toolbar">
        <button className="pr-btn pr-btn--accent" onClick={() => setShowPago(true)}>
          <CalendarCheck size={16} /> Realizar pago regular
        </button>
        <button className="pr-btn pr-btn--primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Registrar abono
        </button>
        <Link to="/admin/prestamo/movimientos" className="pr-btn">
          <History size={16} /> Historial
        </Link>
        <Link to="/admin/prestamo/proyeccion" className="pr-btn">
          <TableProperties size={16} /> Proyección
        </Link>
      </div>

      {/* Saldos por tramo */}
      <div className="pr-cards">
        <article className="pr-card pr-card--amigo">
          <div className="pr-card-head"><User size={20} /><span>Amigo</span></div>
          <p className="pr-card-label">Saldo actual</p>
          <h2 className="pr-card-value">{formatCOP2(amigo.saldo_actual)}</h2>
          <div className="pr-card-foot">
            <div><Receipt size={14} /> Próxima cuota <b>{formatCOP2(amigo.proxima_cuota)}</b></div>
            <div><Percent size={14} /> Próximo 2% <b>{formatCOP2(amigo.proximo_2pct)}</b></div>
          </div>
        </article>

        <article className="pr-card pr-card--dueno">
          <div className="pr-card-head"><UserCog size={20} /><span>Dueño</span></div>
          <p className="pr-card-label">Saldo actual</p>
          <h2 className="pr-card-value">{formatCOP2(dueno.saldo_actual)}</h2>
          <div className="pr-card-foot">
            <div><Receipt size={14} /> Próxima cuota <b>{formatCOP2(dueno.proxima_cuota)}</b></div>
          </div>
        </article>

        <article className="pr-card pr-card--banco">
          <div className="pr-card-head"><Landmark size={20} /><span>Banco</span></div>
          <p className="pr-card-label">Saldo total</p>
          <h2 className="pr-card-value">{formatCOP2(banco.saldo_actual)}</h2>
          <div className="pr-card-foot">
            <div><CalendarClock size={14} /> Cuota total <b>{formatCOP2(banco.cuota_total)}</b></div>
          </div>
        </article>
      </div>

      {showModal && (
        <MovimientoPrestamoForm
          onClose={() => { setShowModal(false); setSubmitError(null); }}
          onSubmit={handleSubmit}
          isSubmitting={createMut.isPending}
          submitError={submitError}
        />
      )}

      {showPago && <PagoRegularModal onClose={() => setShowPago(false)} />}
    </section>
  );
};

export default PrestamoDashboard;
