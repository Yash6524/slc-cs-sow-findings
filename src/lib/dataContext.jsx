import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { subscribeSow } from "./data";
import { sortTickets, ticketsToList } from "./constants";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [meta, setMeta] = useState(null);
  const [ticketsMap, setTicketsMap] = useState({});
  const [empty, setEmpty] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeSow((state) => {
      setMeta(state.meta);
      setTicketsMap(state.tickets || {});
      setEmpty(Boolean(state.empty));
      setError(state.error || null);
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = useMemo(() => {
    const list = sortTickets(ticketsToList(ticketsMap));
    return {
      meta,
      ticketsMap,
      tickets: list,
      bugs: list.filter((t) => t.type === "bug"),
      enhancements: list.filter((t) => t.type === "enhancement"),
      empty,
      error,
      loading,
      getTicket(key) {
        return ticketsMap?.[key] || null;
      }
    };
  }, [meta, ticketsMap, empty, error, loading]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useSowData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useSowData must be used within DataProvider");
  return ctx;
}
