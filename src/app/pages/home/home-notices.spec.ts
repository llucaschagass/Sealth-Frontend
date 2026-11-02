import { Appointment } from '../../../types/appointment.type';
import { Vaccine, VaccineStatus } from '../../../types/vaccine.type';
import { buildNotices, daysUntil, relativeDay } from './home-notices';

const now = new Date(2026, 10, 2, 15, 30); // 02/11/2026, à tarde

const appointment = (id: number, date: string, time: string | null = '14:30'): Appointment => ({
  id,
  date,
  time,
  doctor: 'Dra. Souza',
  specialty: 'Ortopedia',
  location: null,
  extraInfo: null,
  reminderMinutes: 10080,
  reminderAt: null,
});

const vaccine = (
  code: string,
  status: VaccineStatus,
  overrides: Partial<Vaccine> = {},
): Vaccine => ({
  code,
  name: `Vacina ${code}`,
  description: '',
  totalDoses: 3,
  dosesTaken: 0,
  lastDoseAt: null,
  nextDueDate: null,
  status,
  notice: null,
  ...overrides,
});

describe('daysUntil', () => {
  it('conta dias de calendário, ignorando o horário atual', () => {
    expect(daysUntil('2026-11-02', now)).toBe(0);
    expect(daysUntil('2026-11-03', now)).toBe(1);
    expect(daysUntil('2026-11-10', now)).toBe(8);
    expect(daysUntil('2026-11-01', now)).toBe(-1);
  });
});

describe('relativeDay', () => {
  it('usa palavras para hoje e amanhã', () => {
    expect(relativeDay(0)).toBe('Hoje');
    expect(relativeDay(-2)).toBe('Hoje');
    expect(relativeDay(1)).toBe('Amanhã');
    expect(relativeDay(5)).toBe('Em 5 dias');
  });
});

describe('buildNotices', () => {
  it('devolve lista vazia sem lembretes nem alertas', () => {
    expect(buildNotices([], [], now)).toEqual([]);
  });

  it('descreve a consulta com especialidade, dia, horário e urgência', () => {
    const [notice] = buildNotices([appointment(1, '2026-11-05')], [], now);

    expect(notice).toEqual({
      key: 'appointment-1',
      icon: 'calendar',
      tone: 'info',
      title: 'Consulta com Dra. Souza',
      detail: 'Ortopedia · 5 de novembro às 14:30',
      badge: 'Em 3 dias',
      path: '/appointment',
    });
  });

  it('destaca consultas de hoje e de amanhã', () => {
    const [today, tomorrow] = buildNotices(
      [appointment(1, '2026-11-02'), appointment(2, '2026-11-03')],
      [],
      now,
    );

    expect(today.tone).toBe('warning');
    expect(today.badge).toBe('Hoje');
    expect(tomorrow.tone).toBe('warning');
    expect(tomorrow.badge).toBe('Amanhã');
  });

  it('omite o horário quando a consulta não tem', () => {
    const [notice] = buildNotices([appointment(1, '2026-11-05', null)], [], now);

    expect(notice.detail).toBe('Ortopedia · 5 de novembro');
  });

  it('descreve cada situação de vacina', () => {
    const notices = buildNotices(
      [],
      [
        vaccine('a', 'DUE', { nextDueDate: '2026-01-10' }),
        vaccine('b', 'DUE'),
        vaccine('c', 'SOON', { nextDueDate: '2026-11-12' }),
        vaccine('d', 'SOON'),
        vaccine('e', 'PENDING', { dosesTaken: 2 }),
        vaccine('f', 'PENDING', { totalDoses: 1, dosesTaken: 0 }),
        vaccine('g', 'PENDING', { totalDoses: 1, dosesTaken: 1 }),
      ],
      now,
    );

    expect(notices.map((n) => n.detail)).toEqual([
      'Venceu em 10/01/2026',
      'Reforço vencido',
      'Reforço em 12/11/2026',
      'Reforço próximo',
      '2 de 3 doses',
      'Nenhuma dose registrada',
      '1 de 1 dose',
    ]);
    expect(notices[0]).toEqual(
      jasmine.objectContaining({
        key: 'vaccine-a',
        icon: 'syringe',
        tone: 'danger',
        title: 'Vacina a',
        badge: 'Reforço vencido',
        path: '/vaccines',
      }),
    );
    expect(notices[2].tone).toBe('warning');
    expect(notices[2].badge).toBe('Reforço em breve');
  });

  it('ordena do mais urgente ao menos, mantendo a ordem original entre iguais', () => {
    const notices = buildNotices(
      [appointment(1, '2026-11-20'), appointment(2, '2026-11-03')],
      [vaccine('p', 'PENDING'), vaccine('d', 'DUE')],
      now,
    );

    expect(notices.map((n) => n.key)).toEqual([
      'vaccine-d',
      'appointment-2',
      'vaccine-p',
      'appointment-1',
    ]);
  });
});
