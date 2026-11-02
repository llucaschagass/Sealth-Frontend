import { isoToLocalDate } from '../../core/dates';
import { Vaccine, VaccineStatus } from '../../../types/vaccine.type';

export const STATUS_LABELS: Record<VaccineStatus, string> = {
  DUE: 'Reforço vencido',
  PENDING: 'Pendente',
  SOON: 'Reforço em breve',
  UP_TO_DATE: 'Em dia',
  NOT_APPLICABLE: 'Fora da faixa de idade',
};

export interface VaccineGroups {
  /** Reforço vencido, esquema incompleto ou reforço próximo. */
  attention: Vaccine[];
  upToDate: Vaccine[];
  notApplicable: Vaccine[];
}

const NEEDS_ATTENTION: readonly VaccineStatus[] = ['DUE', 'PENDING', 'SOON'];

/** Separa o calendário por prioridade, mantendo a ordem original dentro de cada grupo. */
export function groupVaccines(vaccines: readonly Vaccine[]): VaccineGroups {
  return {
    attention: vaccines.filter((v) => NEEDS_ATTENTION.includes(v.status)),
    upToDate: vaccines.filter((v) => v.status === 'UP_TO_DATE'),
    notApplicable: vaccines.filter((v) => v.status === 'NOT_APPLICABLE'),
  };
}

export function formatDate(iso: string): string {
  return isoToLocalDate(iso).toLocaleDateString('pt-BR');
}

/** Resumo do progresso do esquema, ex.: "2 de 3 doses". */
export function dosesSummary(vaccine: Vaccine): string {
  const taken = vaccine.dosesTaken;
  if (vaccine.status === 'NOT_APPLICABLE' || taken === 0) {
    return `${vaccine.totalDoses} ${vaccine.totalDoses === 1 ? 'dose' : 'doses'} no esquema`;
  }
  return `${Math.min(taken, vaccine.totalDoses)} de ${vaccine.totalDoses} ${
    vaccine.totalDoses === 1 ? 'dose' : 'doses'
  }`;
}
