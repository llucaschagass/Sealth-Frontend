/** Medicamento do usuário como devolvido pela API (datas yyyy-MM-dd, horários HH:mm). */
export interface Medication {
  id: number;
  name: string;
  dosage: string;
  times: string[];
  startDate: string | null;
  endDate: string | null;
  notes: string | null;
  /** Falso quando o tratamento já terminou. */
  active: boolean;
}

export type MedicationRequest = Omit<Medication, 'id' | 'active'>;
