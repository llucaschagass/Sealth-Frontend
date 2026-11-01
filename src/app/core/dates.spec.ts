import { isPastIso, isoToLocalDate, todayIso, toIsoDate } from './dates';

describe('dates', () => {
  it('isoToLocalDate mantém o dia independentemente do fuso', () => {
    const date = isoToLocalDate('2026-12-01');

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(11);
    expect(date.getDate()).toBe(1);
  });

  it('toIsoDate preenche mês e dia com zero à esquerda', () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('é reversível: toIsoDate(isoToLocalDate(x)) === x', () => {
    for (const iso of ['2026-01-01', '2026-02-28', '2028-02-29', '2026-12-31']) {
      expect(toIsoDate(isoToLocalDate(iso))).toBe(iso);
    }
  });

  it('todayIso usa a data local informada', () => {
    expect(todayIso(new Date(2026, 10, 1, 23, 59))).toBe('2026-11-01');
  });

  it('isPastIso considera hoje como ainda por vir', () => {
    const now = new Date(2026, 10, 1, 12, 0);

    expect(isPastIso('2026-10-31', now)).toBeTrue();
    expect(isPastIso('2026-11-01', now)).toBeFalse();
    expect(isPastIso('2026-11-02', now)).toBeFalse();
  });
});
