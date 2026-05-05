import { useCallback, useMemo, useState } from "react";
import { computeDateRange } from "../utils/dateRangeFilter";
import { DateRangeContext } from "./dateRangeInternal";

export function DateRangeProvider({ children, defaultPreset = "mes_actual" }) {
  const initial = computeDateRange(defaultPreset) || { from: "", to: "" };
  const [preset, setPreset] = useState(defaultPreset);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);

  const setPresetAndRange = useCallback((p) => {
    setPreset(p);
    if (p !== "personalizado") {
      const range = computeDateRange(p);
      if (range) {
        setFrom(range.from);
        setTo(range.to);
      } else {
        // computeDateRange returns null only for "personalizado"; defensive fallback
        setFrom("");
        setTo("");
      }
    }
  }, []);

  const value = useMemo(
    () => ({
      preset,
      from,
      to,
      setPreset: setPresetAndRange,
      setFrom,
      setTo,
    }),
    [preset, from, to, setPresetAndRange]
  );

  return (
    <DateRangeContext.Provider value={value}>
      {children}
    </DateRangeContext.Provider>
  );
}
