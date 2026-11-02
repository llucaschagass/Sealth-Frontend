import { IconName } from '../../components/icon/icon.component';
import { isoToLocalDate } from '../../core/dates';
import { Appointment } from '../../../types/appointment.type';
import { Vaccine } from '../../../types/vaccine.type';
import { STATUS_LABELS, formatDate } from '../vaccines/vaccine-status';

export type NoticeTone = 'danger' | 'warning' | 'info';

/** Aviso da home: algo que merece atenção, com destino para resolver. */
export interface Notice {
  key: string;
  icon: IconName;
  tone: NoticeTone;
  title: string;
  detail: string;
  /** Resumo curto da urgência (ex.: "Amanhã", "Reforço vencido"). */
  badge: string;
  path: string;
}

const TONE_ORDER: Record<NoticeTone, number> = { danger: 0, warning: 1, info: 2 };

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Dias de calendário entre hoje e a data (negativo se já passou). */
export function daysUntil(iso: string, now = new Date()): number {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((isoToLocalDate(iso).getTime() - today.getTime()) / MS_PER_DAY);
}

export function relativeDay(days: number): string {
  if (days <= 0) {
    return 'Hoje';
  }
  return days === 1 ? 'Amanhã' : `Em ${days} dias`;
}

function dayAndMonth(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' }).format(
    isoToLocalDate(iso),
  );
}

function appointmentNotice(appointment: Appointment, now: Date): Notice {
  const days = daysUntil(appointment.date, now);
  const when = appointment.time
    ? `${dayAndMonth(appointment.date)} às ${appointment.time}`
    : dayAndMonth(appointment.date);
  return {
    key: `appointment-${appointment.id}`,
    icon: 'calendar',
    tone: days <= 1 ? 'warning' : 'info',
    title: `Consulta com ${appointment.doctor}`,
    detail: `${appointment.specialty} · ${when}`,
    badge: relativeDay(days),
    path: '/appointment',
  };
}

function vaccineDetail(vaccine: Vaccine): string {
  switch (vaccine.status) {
    case 'DUE':
      return vaccine.nextDueDate
        ? `Venceu em ${formatDate(vaccine.nextDueDate)}`
        : 'Reforço vencido';
    case 'SOON':
      return vaccine.nextDueDate
        ? `Reforço em ${formatDate(vaccine.nextDueDate)}`
        : 'Reforço próximo';
    default:
      return vaccine.dosesTaken > 0
        ? `${vaccine.dosesTaken} de ${vaccine.totalDoses} ${vaccine.totalDoses === 1 ? 'dose' : 'doses'}`
        : 'Nenhuma dose registrada';
  }
}

function vaccineNotice(vaccine: Vaccine): Notice {
  return {
    key: `vaccine-${vaccine.code}`,
    icon: 'syringe',
    tone: vaccine.status === 'DUE' ? 'danger' : 'warning',
    title: vaccine.name,
    detail: vaccineDetail(vaccine),
    badge: STATUS_LABELS[vaccine.status],
    path: '/vaccines',
  };
}

/** Junta lembretes de consulta e alertas de vacina num só painel, do mais urgente ao menos. */
export function buildNotices(
  reminders: readonly Appointment[],
  vaccineAlerts: readonly Vaccine[],
  now = new Date(),
): Notice[] {
  return [...reminders.map((a) => appointmentNotice(a, now)), ...vaccineAlerts.map(vaccineNotice)]
    .map((notice, index) => ({ notice, index }))
    .sort((a, b) => TONE_ORDER[a.notice.tone] - TONE_ORDER[b.notice.tone] || a.index - b.index)
    .map(({ notice }) => notice);
}
