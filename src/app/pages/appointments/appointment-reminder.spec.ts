import { REMINDER_OPTIONS, reminderLabel, reminderOptionsFor } from './appointment-reminder';

describe('reminderLabel', () => {
  it('descreve na unidade mais natural', () => {
    expect(reminderLabel(0)).toBe('Na hora da consulta');
    expect(reminderLabel(15)).toBe('15 minutos antes');
    expect(reminderLabel(1)).toBe('1 minuto antes');
    expect(reminderLabel(60)).toBe('1 hora antes');
    expect(reminderLabel(180)).toBe('3 horas antes');
    expect(reminderLabel(1440)).toBe('1 dia antes');
    expect(reminderLabel(4320)).toBe('3 dias antes');
    expect(reminderLabel(90)).toBe('90 minutos antes');
  });
});

describe('reminderOptionsFor', () => {
  it('mantém as opções padrão para valores conhecidos ou ausentes', () => {
    expect(reminderOptionsFor(null)).toBe(REMINDER_OPTIONS);
    expect(reminderOptionsFor(60)).toBe(REMINDER_OPTIONS);
  });

  it('acrescenta a antecedência atual quando ela não é uma das padrão', () => {
    const options = reminderOptionsFor(90);

    expect(options.length).toBe(REMINDER_OPTIONS.length + 1);
    expect(options[options.length - 1]).toEqual({ value: '90', label: '90 minutos antes' });
  });
});
