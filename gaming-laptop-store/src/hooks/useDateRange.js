import { useContext } from "react";
import { DateRangeContext } from "../contexts/dateRangeInternal";

export function useDateRange() {
  const ctx = useContext(DateRangeContext);
  if (!ctx) {
    throw new Error("useDateRange must be used inside <DateRangeProvider>");
  }
  return ctx;
}
