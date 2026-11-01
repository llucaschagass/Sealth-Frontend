import { isPastIso, isoToLocalDate } from '../../core/dates';
import { Appointment } from '../../../types/appointment.type';

export interface AppointmentGroups {
  /** De hoje em diante, da mais próxima para a mais distante. */
  upcoming: Appointment[];
  /** Já passaram, da mais recente para a mais antiga. */
  past: Appointment[];
}

export function groupAppointments(
  appointments: readonly Appointment[],
  now = new Date(),
): AppointmentGroups {
  const byDate = (a: Appointment, b: Appointment) => a.date.localeCompare(b.date);
  return {
    upcoming: appointments.filter((a) => !isPastIso(a.date, now)).sort(byDate),
    past: appointments.filter((a) => isPastIso(a.date, now)).sort((a, b) => byDate(b, a)),
  };
}

export interface DateParts {
  day: string;
  month: string;
  year: string;
}

export function dateParts(iso: string): DateParts {
  const date = isoToLocalDate(iso);
  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(date).replace('.', ''),
    year: String(date.getFullYear()),
  };
}

/** Texto completo da data, útil para nomes acessíveis (ex.: "1 de dezembro de 2026"). */
export function longDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(isoToLocalDate(iso));
}
