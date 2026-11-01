/**
 * Datas da API chegam como "yyyy-MM-dd". `new Date("2026-12-01")` é interpretado como UTC e,
 * em fusos negativos (Brasil), mostraria o dia anterior. Aqui sempre se constrói a data local.
 */
export function isoToLocalDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function todayIso(now = new Date()): string {
  return toIsoDate(now);
}

/** Datas ISO são comparáveis como texto. Hoje conta como "ainda por vir". */
export function isPastIso(iso: string, now = new Date()): boolean {
  return iso < todayIso(now);
}
