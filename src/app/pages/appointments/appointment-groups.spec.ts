import { Appointment } from '../../../types/appointment.type';
import { dateParts, groupAppointments, longDate } from './appointment-groups';

const make = (id: number, date: string, time: string | null = null): Appointment => ({
  id,
  date,
  time,
  doctor: `Dr. ${id}`,
  specialty: 'Clínico',
  location: null,
  extraInfo: null,
  reminderMinutes: null,
  reminderAt: null,
});

describe('appointment-groups', () => {
  const now = new Date(2026, 10, 15, 10, 0); // 15/11/2026

  it('separa próximas e anteriores, tratando hoje como próxima', () => {
    const { upcoming, past } = groupAppointments(
      [make(1, '2026-11-14'), make(2, '2026-11-15'), make(3, '2026-11-16')],
      now,
    );

    expect(upcoming.map((a) => a.id)).toEqual([2, 3]);
    expect(past.map((a) => a.id)).toEqual([1]);
  });

  it('ordena próximas da mais próxima para a mais distante', () => {
    const { upcoming } = groupAppointments(
      [make(1, '2027-01-10'), make(2, '2026-11-20'), make(3, '2026-12-05')],
      now,
    );

    expect(upcoming.map((a) => a.id)).toEqual([2, 3, 1]);
  });

  it('no mesmo dia ordena pelo horário, deixando as sem horário por último', () => {
    const { upcoming } = groupAppointments(
      [make(1, '2026-11-20'), make(2, '2026-11-20', '15:00'), make(3, '2026-11-20', '07:30')],
      now,
    );

    expect(upcoming.map((a) => a.id)).toEqual([3, 2, 1]);
  });

  it('ordena anteriores da mais recente para a mais antiga', () => {
    const { past } = groupAppointments(
      [make(1, '2026-01-10'), make(2, '2026-11-01'), make(3, '2026-06-05')],
      now,
    );

    expect(past.map((a) => a.id)).toEqual([2, 3, 1]);
  });

  it('não altera a lista original', () => {
    const original = [make(1, '2027-01-10'), make(2, '2026-11-20')];

    groupAppointments(original, now);

    expect(original.map((a) => a.id)).toEqual([1, 2]);
  });

  it('dateParts mostra o dia certo (sem deslocar por fuso horário)', () => {
    expect(dateParts('2026-12-01')).toEqual({ day: '01', month: 'dez', year: '2026' });
    expect(dateParts('2026-01-31').day).toBe('31');
  });

  it('longDate escreve a data por extenso em português', () => {
    expect(longDate('2026-12-01')).toBe('1 de dezembro de 2026');
  });
});
