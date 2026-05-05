import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatMonthEs, shiftMonth, isFutureMonth } from '../formatters';
import './MonthSelector.css';

export default function MonthSelector({ value, onChange }) {
  const goPrev = () => onChange(shiftMonth(value, -1));
  const goNext = () => {
    const next = shiftMonth(value, +1);
    if (!isFutureMonth(next)) onChange(next);
  };
  const nextDisabled = isFutureMonth(shiftMonth(value, +1));

  return (
    <div className="ms-root">
      <button
        className="ms-btn"
        onClick={goPrev}
        aria-label="Mes anterior"
        type="button"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="ms-label">{formatMonthEs(value)}</span>
      <button
        className="ms-btn"
        onClick={goNext}
        aria-label="Mes siguiente"
        type="button"
        disabled={nextDisabled}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
