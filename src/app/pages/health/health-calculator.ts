export type Sex = 'masculino' | 'feminino';

export interface HealthInput {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: Sex;
}

export type BmiCategory = 'Abaixo do peso' | 'Peso normal' | 'Sobrepeso' | 'Obesidade';
export type WeightStatus = 'abaixo' | 'dentro' | 'acima';

export interface HealthResult {
  bmi: number;
  bmiCategory: BmiCategory;
  waterLiters: number;
  /** Taxa metabólica basal: calorias gastas em repouso, sem contar atividade física. */
  restingKcal: number;
  idealWeightKg: number;
  /** Faixa de peso correspondente a um IMC entre 18,5 e 24,9 para a altura informada. */
  healthyRangeKg: { min: number; max: number };
  weightStatus: WeightStatus;
}

export const HEALTH_LIMITS = {
  weightKg: { min: 20, max: 400 },
  heightCm: { min: 50, max: 250 },
  age: { min: 1, max: 120 },
} as const;

const BMI_UNDERWEIGHT_BELOW = 18.5;
const BMI_NORMAL_BELOW = 25;
const BMI_OVERWEIGHT_BELOW = 30;
const BMI_HEALTHY_MAX = 24.9;

const WATER_ML_PER_KG: Record<Sex, number> = { masculino: 35, feminino: 31 };

/** Equação de Harris-Benedict revisada (Roza e Shizgal, 1984). */
const BMR_COEFFICIENTS: Record<Sex, { base: number; weight: number; height: number; age: number }> =
  {
    masculino: { base: 88.362, weight: 13.397, height: 4.799, age: 5.677 },
    feminino: { base: 447.593, weight: 9.247, height: 3.098, age: 4.33 },
  };

/** Estimativa clássica de peso ideal: (altura em cm - 100) x 0,9 para homens e (- 110) para mulheres. */
const IDEAL_WEIGHT_HEIGHT_OFFSET_CM: Record<Sex, number> = { masculino: 100, feminino: 110 };
const IDEAL_WEIGHT_FACTOR = 0.9;

export function calculateBmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function classifyBmi(bmi: number): BmiCategory {
  if (bmi < BMI_UNDERWEIGHT_BELOW) return 'Abaixo do peso';
  if (bmi < BMI_NORMAL_BELOW) return 'Peso normal';
  if (bmi < BMI_OVERWEIGHT_BELOW) return 'Sobrepeso';
  return 'Obesidade';
}

export function calculateHealth(input: HealthInput): HealthResult {
  const { weightKg, heightCm, age, sex } = input;
  const heightM = heightCm / 100;
  const bmi = calculateBmi(weightKg, heightCm);
  const healthyRangeKg = {
    min: BMI_UNDERWEIGHT_BELOW * heightM * heightM,
    max: BMI_HEALTHY_MAX * heightM * heightM,
  };
  const bmr = BMR_COEFFICIENTS[sex];

  return {
    bmi,
    bmiCategory: classifyBmi(bmi),
    waterLiters: (weightKg * WATER_ML_PER_KG[sex]) / 1000,
    restingKcal: bmr.base + bmr.weight * weightKg + bmr.height * heightCm - bmr.age * age,
    idealWeightKg: Math.max(
      0,
      (heightCm - IDEAL_WEIGHT_HEIGHT_OFFSET_CM[sex]) * IDEAL_WEIGHT_FACTOR,
    ),
    healthyRangeKg,
    weightStatus:
      weightKg < healthyRangeKg.min ? 'abaixo' : weightKg > healthyRangeKg.max ? 'acima' : 'dentro',
  };
}

export function normalizeSex(value: string): Sex {
  return value.trim().toLowerCase() === 'feminino' ? 'feminino' : 'masculino';
}

/** Converte o texto digitado (aceita vírgula decimal). Devolve NaN quando não é número. */
export function parseDecimal(text: string): number {
  const normalized = text.trim().replace(',', '.');
  return normalized === '' ? NaN : Number(normalized);
}

/** Valida e converte os campos do formulário; devolve null se algum valor estiver fora dos limites. */
export function parseHealthInput(raw: {
  weight: string;
  height: string;
  age: string;
  sex: Sex;
}): HealthInput | null {
  const weightKg = parseDecimal(raw.weight);
  const heightCm = parseDecimal(raw.height);
  const age = parseDecimal(raw.age);
  const within = (value: number, limit: { min: number; max: number }) =>
    value >= limit.min && value <= limit.max;

  if (
    !within(weightKg, HEALTH_LIMITS.weightKg) ||
    !within(heightCm, HEALTH_LIMITS.heightCm) ||
    !within(age, HEALTH_LIMITS.age)
  ) {
    return null;
  }
  return { weightKg, heightCm, age, sex: raw.sex };
}

const decimalFormat = (digits: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });

export function formatDecimal(value: number, digits = 1): string {
  return decimalFormat(digits).format(value);
}
