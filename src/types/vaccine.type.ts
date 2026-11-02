/** Situação de uma vacina para o usuário, da mais para a menos urgente. */
export type VaccineStatus = 'DUE' | 'PENDING' | 'SOON' | 'UP_TO_DATE' | 'NOT_APPLICABLE';

/** Vacina do calendário com a situação do usuário (datas yyyy-MM-dd). */
export interface Vaccine {
  code: string;
  name: string;
  description: string;
  totalDoses: number;
  dosesTaken: number;
  lastDoseAt: string | null;
  /** Só existe para vacinas com reforço e esquema completo. */
  nextDueDate: string | null;
  status: VaccineStatus;
  notice: string | null;
}

export interface VaccinationOverview {
  /** Idade da última medição de saúde; nula enquanto o usuário não tiver nenhuma. */
  ageYears: number | null;
  vaccines: Vaccine[];
}

export interface VaccinationRecord {
  id: number;
  vaccineCode: string;
  vaccineName: string;
  takenAt: string;
}

export type VaccinationRecordRequest = Pick<VaccinationRecord, 'vaccineCode' | 'takenAt'>;
