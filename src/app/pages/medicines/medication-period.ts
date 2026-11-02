import { isoToLocalDate } from '../../core/dates';

const format = (iso: string): string => isoToLocalDate(iso).toLocaleDateString('pt-BR');

/** Texto curto do período de uso de um medicamento. */
export function describePeriod(startDate: string | null, endDate: string | null): string {
  if (startDate && endDate) {
    return `${format(startDate)} a ${format(endDate)}`;
  }
  if (startDate) {
    return `Desde ${format(startDate)} · uso contínuo`;
  }
  if (endDate) {
    return `Até ${format(endDate)}`;
  }
  return 'Uso contínuo';
}
