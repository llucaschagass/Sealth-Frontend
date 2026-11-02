import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Appointment } from '../../../../types/appointment.type';
import { AppointmentCardComponent } from './appointment-card.component';

const appointment: Appointment = {
  id: 1,
  date: '2026-12-01',
  time: null,
  doctor: 'Dra. Souza',
  specialty: 'Ortopedia',
  location: 'Hospital XYZ',
  extraInfo: 'Dores nas costas',
  reminderMinutes: null,
  reminderAt: null,
};

describe('AppointmentCardComponent', () => {
  let fixture: ComponentFixture<AppointmentCardComponent>;
  let component: AppointmentCardComponent;
  const element = (): HTMLElement => fixture.nativeElement;
  const button = (label: string): HTMLButtonElement =>
    Array.from(element().querySelectorAll('button')).find((b) =>
      b.getAttribute('aria-label')?.startsWith(label),
    )!;

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('appointment', appointment);
    fixture.detectChanges();
  });

  it('mostra médico, especialidade, local e observações', () => {
    const text = element().textContent;

    expect(text).toContain('Dra. Souza');
    expect(text).toContain('Ortopedia');
    expect(text).toContain('Hospital XYZ');
    expect(text).toContain('Dores nas costas');
  });

  it('não mostra horário nem lembrete quando não existem', () => {
    expect(element().querySelector('.appointment__time')).toBeNull();
    expect(element().textContent).not.toContain('Lembrete');
  });

  it('mostra o horário e a antecedência do lembrete', () => {
    fixture.componentRef.setInput('appointment', {
      ...appointment,
      time: '14:30',
      reminderMinutes: 1440,
      reminderAt: '2026-11-30T14:30:00',
    });
    fixture.detectChanges();

    expect(element().querySelector('.appointment__time')?.textContent).toContain('14:30');
    expect(element().textContent).toContain('Lembrete: 1 dia antes');
  });

  it('mostra o horário sem lembrete quando só ele foi informado', () => {
    fixture.componentRef.setInput('appointment', { ...appointment, time: '08:00' });
    fixture.detectChanges();

    expect(element().querySelector('.appointment__time')?.textContent).toContain('08:00');
    expect(element().textContent).not.toContain('Lembrete');
  });

  it('mostra a data correta em <time>, sem deslocar por fuso', () => {
    const time = element().querySelector('time')!;

    expect(time.getAttribute('datetime')).toBe('2026-12-01');
    expect(time.textContent).toContain('01');
    expect(time.textContent?.toLowerCase()).toContain('dez');
  });

  it('omite local e observações quando não existem', () => {
    fixture.componentRef.setInput('appointment', {
      ...appointment,
      location: null,
      extraInfo: null,
    });
    fixture.detectChanges();

    expect(element().querySelector('.appointment__meta')).toBeNull();
  });

  it('dá nomes acessíveis completos aos botões', () => {
    expect(button('Editar').getAttribute('aria-label')).toBe(
      'Editar consulta com Dra. Souza em 1 de dezembro de 2026',
    );
    expect(button('Cancelar').getAttribute('aria-label')).toBe(
      'Cancelar consulta com Dra. Souza em 1 de dezembro de 2026',
    );
  });

  it('emite editRequest com a consulta ao clicar em Editar', () => {
    const emitted: Appointment[] = [];
    component.editRequest.subscribe((a) => emitted.push(a));

    button('Editar').click();

    expect(emitted).toEqual([appointment]);
  });

  it('emite cancelRequest com a consulta ao clicar em Cancelar', () => {
    const emitted: Appointment[] = [];
    component.cancelRequest.subscribe((a) => emitted.push(a));

    button('Cancelar').click();

    expect(emitted).toEqual([appointment]);
  });

  it('esmaece consultas passadas', () => {
    fixture.componentRef.setInput('past', true);
    fixture.detectChanges();

    expect(element().querySelector('.appointment--past')).not.toBeNull();
  });
});
