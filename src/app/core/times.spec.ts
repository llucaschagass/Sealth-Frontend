import { FormControl } from '@angular/forms';
import { parseTimes, timesList } from './times';

const hours = (count: number): string =>
  Array.from({ length: count }, (_, i) => `${String(i).padStart(2, '0')}:00`).join(' ');

describe('parseTimes', () => {
  it('aceita separadores variados, completa o zero e ordena sem repetir', () => {
    expect(parseTimes('20:00, 8:30;08:30  06:05')).toEqual(['06:05', '08:30', '20:00']);
  });

  it('devolve lista vazia para texto vazio', () => {
    expect(parseTimes('  ')).toEqual([]);
  });

  it('rejeita horários inválidos', () => {
    expect(parseTimes('24:00')).toBeNull();
    expect(parseTimes('12:60')).toBeNull();
    expect(parseTimes('8h')).toBeNull();
    expect(parseTimes('08:00, abc')).toBeNull();
  });
});

describe('timesList', () => {
  const validate = (value: string) => timesList(new FormControl(value));

  it('aceita de 1 a 12 horários', () => {
    expect(validate('08:00')).toBeNull();
    expect(validate(hours(12))).toBeNull();
  });

  it('exige ao menos um', () => {
    expect(validate('')).toEqual({ required: true });
  });

  it('rejeita formato inválido e excesso de horários', () => {
    expect(validate('25:00')).toEqual({ times: true });
    expect(validate(hours(13))).toEqual({ times: true });
  });
});
