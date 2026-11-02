import { ValidatorFn } from '@angular/forms';

export const MAX_TIMES = 12;

/**
 * Converte "8:00, 20:00" em ["08:00", "20:00"], sem repetições e em ordem.
 * Devolve null quando algum item não é um horário válido.
 */
export function parseTimes(text: string): string[] | null {
  const tokens = text.split(/[\s,;]+/).filter(Boolean);
  const times: string[] = [];
  for (const token of tokens) {
    const match = /^(\d{1,2}):(\d{2})$/.exec(token);
    if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) {
      return null;
    }
    times.push(`${match[1].padStart(2, '0')}:${match[2]}`);
  }
  return [...new Set(times)].sort();
}

/** Exige de 1 a 12 horários válidos. */
export const timesList: ValidatorFn = (control) => {
  const times = parseTimes(String(control.value ?? ''));
  if (times === null || times.length > MAX_TIMES) {
    return { times: true };
  }
  return times.length === 0 ? { required: true } : null;
};
