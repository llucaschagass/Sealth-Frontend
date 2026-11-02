import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SessionService } from '../../core/session.service';
import { toIsoDate } from '../../core/dates';
import { AppointmentsService } from '../../services/appointments.service';
import { Appointment } from '../../../types/appointment.type';
import { AppointmentsComponent } from './appointments.component';

const daysFromNow = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
};

const appointment = (id: number, date: string, doctor = `Dr. ${id}`): Appointment => ({
  id,
  date,
  doctor,
  specialty: 'Cardiologia',
  location: 'Hospital ABC',
  extraInfo: null,
});

describe('AppointmentsComponent', () => {
  let fixture: ComponentFixture<AppointmentsComponent>;
  let component: AppointmentsComponent;
  let service: jasmine.SpyObj<AppointmentsService>;
  const element = (): HTMLElement => fixture.nativeElement;
  const cards = () => element().querySelectorAll('app-appointment-card');

  beforeEach(() => {
    service = jasmine.createSpyObj<AppointmentsService>('AppointmentsService', [
      'getAllAppointments',
      'createAppointment',
      'updateAppointment',
      'cancelAppointment',
    ]);
    TestBed.configureTestingModule({
      imports: [AppointmentsComponent],
      providers: [
        { provide: AppointmentsService, useValue: service },
        provideRouter([]),
        {
          provide: SessionService,
          useValue: jasmine.createSpyObj('SessionService', ['logout'], { firstName: 'Ana' }),
        },
      ],
    });
  });

  const create = (list: Appointment[]) => {
    service.getAllAppointments.and.returnValue(of(list));
    fixture = TestBed.createComponent(AppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const fillForm = () =>
    component.form.setValue({
      date: daysFromNow(10),
      doctor: ' Dra. Souza ',
      specialty: 'Ortopedia',
      location: '',
      extraInfo: '  ',
    });

  it('separa próximas e anteriores em seções distintas', () => {
    create([appointment(1, daysFromNow(-5)), appointment(2, daysFromNow(5))]);

    expect(element().querySelector('#upcoming-title')).not.toBeNull();
    expect(element().querySelector('#past-title')).not.toBeNull();
    expect(cards().length).toBe(2);
  });

  it('mostra o estado vazio com chamada para cadastrar', () => {
    create([]);

    expect(element().querySelector('.empty')?.textContent).toContain('ainda não tem consultas');
  });

  it('mostra o erro de carregamento e tenta novamente', () => {
    service.getAllAppointments.and.returnValues(
      throwError(() => ({ status: 0, message: 'Sem conexão.' })),
      of([appointment(1, daysFromNow(2))]),
    );
    fixture = TestBed.createComponent(AppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(element().querySelector('.retry')?.textContent).toContain('Sem conexão.');

    element().querySelector<HTMLButtonElement>('.retry button')!.click();
    fixture.detectChanges();

    expect(cards().length).toBe(1);
  });

  describe('integração com os cartões', () => {
    const cardButton = (index: number): HTMLButtonElement =>
      cards()[0].querySelectorAll<HTMLButtonElement>('.appointment__actions button')[index];

    it('clicar em Editar no cartão abre o formulário com os dados da consulta', () => {
      const existing = appointment(1, daysFromNow(3), 'Dr. Clique');
      create([existing]);

      cardButton(0).click();
      fixture.detectChanges();

      expect(component.editing()).toEqual(existing);
      expect(element().querySelectorAll('dialog[open]').length).toBe(1);
      expect(component.form.controls.doctor.value).toBe('Dr. Clique');
    });

    it('clicar em Cancelar no cartão abre a confirmação para aquela consulta', () => {
      const existing = appointment(1, daysFromNow(3), 'Dr. Clique');
      create([existing]);

      cardButton(1).click();
      fixture.detectChanges();

      expect(component.toCancel()).toEqual(existing);
      expect(element().querySelector('dialog[open]')?.textContent).toContain('Dr. Clique');
    });
  });

  describe('criar', () => {
    it('não envia formulário inválido', () => {
      create([]);
      component.openCreate();

      component.save();

      expect(service.createAppointment).not.toHaveBeenCalled();
      expect(component.form.controls.date.touched).toBeTrue();
    });

    it('envia dados normalizados (sem espaços; opcionais vazios viram null) e adiciona à lista', () => {
      create([]);
      component.openCreate();
      fillForm();
      const date = component.form.controls.date.value;
      service.createAppointment.and.returnValue(of(appointment(9, date, 'Dra. Souza')));

      component.save();
      fixture.detectChanges();

      expect(service.createAppointment).toHaveBeenCalledWith({
        date,
        doctor: 'Dra. Souza',
        specialty: 'Ortopedia',
        location: null,
        extraInfo: null,
      });
      expect(component.appointments().map((a) => a.id)).toEqual([9]);
      expect(cards().length).toBe(1);
    });

    it('leva o erro de campo do backend para o formulário e mantém o diálogo aberto', () => {
      create([]);
      component.openCreate();
      fillForm();
      service.createAppointment.and.returnValue(
        throwError(() => ({
          status: 400,
          message: 'Dados inválidos',
          fieldErrors: { doctor: 'O médico é obrigatório' },
        })),
      );

      component.save();

      expect(component.form.controls.doctor.errors).toEqual({ server: 'O médico é obrigatório' });
      expect(component.saving()).toBeFalse();
      expect(component.appointments()).toEqual([]);
    });
  });

  describe('editar', () => {
    it('carrega os dados da consulta no formulário (null vira vazio)', () => {
      const existing = appointment(1, daysFromNow(3));
      create([existing]);

      component.openEdit(existing);

      expect(component.editing()).toBe(existing);
      expect(component.form.getRawValue()).toEqual({
        date: existing.date,
        doctor: 'Dr. 1',
        specialty: 'Cardiologia',
        location: 'Hospital ABC',
        extraInfo: '',
      });
    });

    it('atualiza apenas a consulta editada', () => {
      const first = appointment(1, daysFromNow(3));
      const second = appointment(2, daysFromNow(6));
      create([first, second]);
      component.openEdit(first);
      component.form.patchValue({ doctor: 'Dr. Novo' });
      service.updateAppointment.and.returnValue(of({ ...first, doctor: 'Dr. Novo' }));

      component.save();

      expect(service.updateAppointment).toHaveBeenCalledWith(
        1,
        jasmine.objectContaining({ doctor: 'Dr. Novo' }),
      );
      expect(component.appointments().map((a) => a.doctor)).toEqual(['Dr. Novo', 'Dr. 2']);
      expect(service.createAppointment).not.toHaveBeenCalled();
    });
  });

  describe('diálogos', () => {
    const openDialogs = () => element().querySelectorAll('dialog[open]').length;
    const headings = () =>
      Array.from(element().querySelectorAll('dialog h2')).map((h) => h.textContent?.trim());

    it('o título do formulário muda entre criar e editar', () => {
      const existing = appointment(1, daysFromNow(3));
      create([existing]);

      component.openCreate();
      fixture.detectChanges();
      expect(headings()).toContain('Nova consulta');

      component.closeForm();
      component.openEdit(existing);
      fixture.detectChanges();
      expect(headings()).toContain('Editar consulta');
    });

    it('abre e fecha o formulário', () => {
      create([]);

      component.openCreate();
      expect(openDialogs()).toBe(1);

      component.closeForm();
      expect(openDialogs()).toBe(0);
    });

    it('abre e fecha a confirmação de cancelamento', () => {
      const target = appointment(1, daysFromNow(3));
      create([target]);

      component.askCancel(target);
      expect(openDialogs()).toBe(1);

      component.closeCancel();
      expect(openDialogs()).toBe(0);
    });

    it('limpa erros antigos ao reabrir o formulário', () => {
      create([]);
      component.formError.set('erro antigo');

      component.openCreate();

      expect(component.formError()).toBeNull();
    });
  });

  describe('falhas ao editar', () => {
    it('mostra o erro do backend e preserva a lista', () => {
      const existing = appointment(1, daysFromNow(3));
      create([existing]);
      component.openEdit(existing);
      service.updateAppointment.and.returnValue(
        throwError(() => ({ status: 404, message: 'Consulta não encontrada' })),
      );

      component.save();

      expect(component.formError()).toBe('Consulta não encontrada');
      expect(component.appointments()).toEqual([existing]);
      expect(component.saving()).toBeFalse();
    });
  });

  describe('cancelar', () => {
    it('não chama a API se nenhuma consulta foi escolhida', () => {
      create([appointment(1, daysFromNow(3))]);

      component.confirmCancel();

      expect(service.cancelAppointment).not.toHaveBeenCalled();
    });

    it('só remove depois da confirmação', () => {
      const target = appointment(1, daysFromNow(3));
      create([target]);

      component.askCancel(target);
      expect(service.cancelAppointment).not.toHaveBeenCalled();
      expect(component.appointments().length).toBe(1);

      service.cancelAppointment.and.returnValue(of(undefined));
      component.confirmCancel();

      expect(service.cancelAppointment).toHaveBeenCalledWith(1);
      expect(component.appointments()).toEqual([]);
    });

    it('mantém a consulta e mostra o erro quando o cancelamento falha', () => {
      const target = appointment(1, daysFromNow(3));
      create([target]);
      component.askCancel(target);
      service.cancelAppointment.and.returnValue(
        throwError(() => ({ status: 404, message: 'Consulta não encontrada' })),
      );

      component.confirmCancel();

      expect(component.appointments().length).toBe(1);
      expect(component.cancelError()).toBe('Consulta não encontrada');
      expect(component.cancelling()).toBeFalse();
    });
  });
});
