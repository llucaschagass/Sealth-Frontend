import { Sex } from '../app/pages/health/health-calculator';

/** Medição como devolvida pela API (`measuredAt` em ISO-8601, altura em cm). */
export interface HealthRecord {
  id: number;
  measuredAt: string;
  weightKg: number;
  heightCm: number;
  age: number;
  sex: Sex;
  systolic: number | null;
  diastolic: number | null;
}

export type HealthRecordRequest = Omit<HealthRecord, 'id' | 'measuredAt'>;
