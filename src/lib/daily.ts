const TZ = "America/Argentina/Buenos_Aires";

/** Fecha de "hoy" (YYYY-MM-DD) en horario argentino, igual para todos los jugadores. */
export function todayKey(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

export function prettyDate(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const s = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(y, m - 1, d));
  return s.charAt(0).toUpperCase() + s.slice(1);
}
