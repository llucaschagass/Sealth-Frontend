export interface ReminderOption {
  /** Antecedência em minutos, como texto (valor de um <select>); vazio significa sem lembrete. */
  value: string;
  label: string;
}

export const NO_REMINDER: ReminderOption = { value: '', label: 'Sem lembrete' };

/** Antecedências oferecidas no formulário (o backend aceita de 0 a 10080 minutos). */
export const REMINDER_OPTIONS: readonly ReminderOption[] = [
  NO_REMINDER,
  { value: '0', label: 'Na hora da consulta' },
  { value: '15', label: '15 minutos antes' },
  { value: '30', label: '30 minutos antes' },
  { value: '60', label: '1 hora antes' },
  { value: '120', label: '2 horas antes' },
  { value: '1440', label: '1 dia antes' },
  { value: '2880', label: '2 dias antes' },
  { value: '10080', label: '1 semana antes' },
];

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 1440;

function plural(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? '' : 's'}`;
}

/** Texto curto para qualquer antecedência, inclusive as que não estão em REMINDER_OPTIONS. */
export function reminderLabel(minutes: number): string {
  if (minutes === 0) {
    return 'Na hora da consulta';
  }
  if (minutes % MINUTES_PER_DAY === 0) {
    return `${plural(minutes / MINUTES_PER_DAY, 'dia')} antes`;
  }
  if (minutes % MINUTES_PER_HOUR === 0) {
    return `${plural(minutes / MINUTES_PER_HOUR, 'hora')} antes`;
  }
  return `${plural(minutes, 'minuto')} antes`;
}

/** Opções do formulário; inclui a antecedência atual quando ela não é uma das padrão. */
export function reminderOptionsFor(minutes: number | null): readonly ReminderOption[] {
  const current = minutes === null ? null : String(minutes);
  if (current === null || REMINDER_OPTIONS.some((option) => option.value === current)) {
    return REMINDER_OPTIONS;
  }
  return [...REMINDER_OPTIONS, { value: current, label: reminderLabel(minutes as number) }];
}
