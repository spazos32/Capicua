const TZ = "America/Argentina/Buenos_Aires";

/** Fecha de "hoy" (YYYY-MM-DD) en horario argentino, igual para todos los jugadores. */
export function todayKey(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

/** Segundos que faltan para la medianoche argentina (cuando cambian los puzzles). */
export function secondsToNextDay(): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return 86400 - (get("hour") * 3600 + get("minute") * 60 + get("second"));
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
