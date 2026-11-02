import { describePeriod } from './medication-period';

describe('describePeriod', () => {
  it('descreve período completo', () => {
    expect(describePeriod('2026-01-10', '2026-01-20')).toBe('10/01/2026 a 20/01/2026');
  });

  it('descreve só o início como uso contínuo', () => {
    expect(describePeriod('2026-01-10', null)).toBe('Desde 10/01/2026 · uso contínuo');
  });

  it('descreve só o término', () => {
    expect(describePeriod(null, '2026-01-20')).toBe('Até 20/01/2026');
  });

  it('sem datas é uso contínuo', () => {
    expect(describePeriod(null, null)).toBe('Uso contínuo');
  });
});
