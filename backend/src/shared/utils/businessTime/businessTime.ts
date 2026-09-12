// Zona horaria del negocio: Colombia (UTC-5, sin horario de verano).
// Todos los bordes de día se calculan contra el reloj del negocio, no el del servidor,
// para que "hoy" y los filtros por fecha no se corran según la zona del servidor (p. ej. UTC).
const BUSINESS_TZ_OFFSET_MS = -5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const getCalendarParts = (value: string | Date): { y: number; m: number; d: number } => {
  if (typeof value === 'string') {
    const match = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/.exec(value);
    if (match) return { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
  }

  const instant = value instanceof Date ? value : new Date(value);
  const wall = new Date(instant.getTime() + BUSINESS_TZ_OFFSET_MS);
  return { y: wall.getUTCFullYear(), m: wall.getUTCMonth() + 1, d: wall.getUTCDate() };
};

export const startOfDay = (value: string | Date): Date => {
  const { y, m, d } = getCalendarParts(value);
  return new Date(Date.UTC(y, m - 1, d) - BUSINESS_TZ_OFFSET_MS);
};

export const endOfDay = (value: string | Date): Date => {
  return new Date(startOfDay(value).getTime() + DAY_MS - 1);
};

export const getBusinessDayRange = (ref: Date = new Date()) => {
  const start = startOfDay(ref);
  return { start, end: new Date(start.getTime() + DAY_MS - 1) };
};