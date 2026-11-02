import { Vaccine, VaccineStatus } from '../../../types/vaccine.type';
import { STATUS_LABELS, dosesSummary, formatDate, groupVaccines } from './vaccine-status';

const vaccine = (
  code: string,
  status: VaccineStatus,
  overrides: Partial<Vaccine> = {},
): Vaccine => ({
  code,
  name: code,
  description: '',
  totalDoses: 3,
  dosesTaken: 0,
  lastDoseAt: null,
  nextDueDate: null,
  status,
  notice: null,
  ...overrides,
});

describe('groupVaccines', () => {
  it('separa o que pede atenção, o que está em dia e o que não se aplica', () => {
    const groups = groupVaccines([
      vaccine('a', 'UP_TO_DATE'),
      vaccine('b', 'DUE'),
      vaccine('c', 'NOT_APPLICABLE'),
      vaccine('d', 'PENDING'),
      vaccine('e', 'SOON'),
    ]);

    expect(groups.attention.map((v) => v.code)).toEqual(['b', 'd', 'e']);
    expect(groups.upToDate.map((v) => v.code)).toEqual(['a']);
    expect(groups.notApplicable.map((v) => v.code)).toEqual(['c']);
  });

  it('devolve grupos vazios sem vacinas', () => {
    expect(groupVaccines([])).toEqual({ attention: [], upToDate: [], notApplicable: [] });
  });
});

describe('STATUS_LABELS', () => {
  it('tem um texto para cada situação', () => {
    expect(Object.keys(STATUS_LABELS).sort()).toEqual(
      ['DUE', 'NOT_APPLICABLE', 'PENDING', 'SOON', 'UP_TO_DATE'].sort(),
    );
  });
});

describe('formatDate', () => {
  it('formata sem deslocar por fuso', () => {
    expect(formatDate('2026-12-01')).toBe('01/12/2026');
  });
});

describe('dosesSummary', () => {
  it('mostra o progresso do esquema', () => {
    expect(dosesSummary(vaccine('a', 'PENDING', { dosesTaken: 2 }))).toBe('2 de 3 doses');
  });

  it('limita ao total quando há mais doses registradas (ex.: gripe anual)', () => {
    expect(dosesSummary(vaccine('a', 'UP_TO_DATE', { totalDoses: 1, dosesTaken: 4 }))).toBe(
      '1 de 1 dose',
    );
  });

  it('sem doses ou fora da faixa, descreve o esquema', () => {
    expect(dosesSummary(vaccine('a', 'PENDING'))).toBe('3 doses no esquema');
    expect(dosesSummary(vaccine('a', 'NOT_APPLICABLE', { totalDoses: 1 }))).toBe(
      '1 dose no esquema',
    );
  });
});
