import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SessionService } from '../../core/session.service';
import { AppointmentsService } from '../../services/appointments.service';
import { VaccinesService } from '../../services/vaccines.service';
import { Appointment } from '../../../types/appointment.type';
import { Vaccine } from '../../../types/vaccine.type';
import { HomeComponent } from './home.component';
import { HOME_SECTIONS } from './home-sections';
import { routes } from '../../app.routes';

const reminder: Appointment = {
  id: 1,
  date: '2026-12-01',
  time: '14:30',
  doctor: 'Dra. Souza',
  specialty: 'Ortopedia',
  location: null,
  extraInfo: null,
  reminderMinutes: 10080,
  reminderAt: '2026-11-24T14:30:00',
};

const vaccineAlert: Vaccine = {
  code: 'dt',
  name: 'Difteria e tétano (dT)',
  description: '',
  totalDoses: 3,
  dosesTaken: 3,
  lastDoseAt: '2015-01-01',
  nextDueDate: '2025-01-01',
  status: 'DUE',
  notice: null,
};

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let service: jasmine.SpyObj<AppointmentsService>;
  let vaccines: jasmine.SpyObj<VaccinesService>;
  const element = (): HTMLElement => fixture.nativeElement;

  beforeEach(() => {
    service = jasmine.createSpyObj<AppointmentsService>('AppointmentsService', ['getReminders']);
    service.getReminders.and.returnValue(of([]));
    vaccines = jasmine.createSpyObj<VaccinesService>('VaccinesService', ['getAlerts']);
    vaccines.getAlerts.and.returnValue(of([]));
    TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        { provide: AppointmentsService, useValue: service },
        { provide: VaccinesService, useValue: vaccines },
        {
          provide: SessionService,
          useValue: jasmine.createSpyObj('SessionService', ['logout'], { firstName: 'Ana' }),
        },
      ],
    });
  });

  const create = () => {
    fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
  };

  it('cumprimenta o usuário pelo primeiro nome', () => {
    create();

    expect(element().querySelector('.welcome h2')?.textContent).toContain('Olá, Ana!');
  });

  it('oferece um link real para cada seção', () => {
    create();
    const links = Array.from(element().querySelectorAll<HTMLAnchorElement>('a.tile'));

    expect(links.map((a) => a.getAttribute('href'))).toEqual(HOME_SECTIONS.map((s) => s.path));
  });

  it('todas as seções apontam para rotas existentes e protegidas', () => {
    const paths = routes.map((r) => `/${r.path}`);

    for (const section of HOME_SECTIONS) {
      expect(paths).withContext(section.path).toContain(section.path);
    }
  });

  describe('lembretes', () => {
    it('não mostra a seção quando não há lembretes em vigor', () => {
      create();

      expect(element().querySelector('.reminders')).toBeNull();
    });

    it('lista as consultas com lembrete em vigor, com link para as consultas', () => {
      service.getReminders.and.returnValue(of([reminder]));
      create();

      const item = element().querySelector('.reminders__item a');
      expect(item?.textContent).toContain('Dra. Souza');
      expect(item?.textContent).toContain('1 de dezembro de 2026');
      expect(item?.textContent).toContain('14:30');
      expect(item?.getAttribute('href')).toBe('/appointment');
    });

    it('segue sem a seção quando os lembretes não carregam', () => {
      service.getReminders.and.returnValue(
        throwError(() => ({ status: 0, message: 'Sem conexão.' })),
      );
      create();

      expect(element().querySelector('.reminders')).toBeNull();
      expect(element().querySelector('.sections')).not.toBeNull();
    });
  });

  describe('alertas de vacinação', () => {
    it('não mostra a seção quando nada pede atenção', () => {
      create();

      expect(element().querySelector('#vaccines-title')).toBeNull();
    });

    it('lista as vacinas que pedem atenção com um link para o calendário', () => {
      vaccines.getAlerts.and.returnValue(of([vaccineAlert]));
      create();

      const item = element().querySelector('#vaccines-title ~ .reminders__list a');
      expect(item?.textContent).toContain('Difteria e tétano (dT)');
      expect(item?.textContent).toContain('reforço vencido');
      expect(item?.getAttribute('href')).toBe('/vaccines');
    });

    it('segue sem a seção quando os alertas não carregam', () => {
      vaccines.getAlerts.and.returnValue(
        throwError(() => ({ status: 0, message: 'Sem conexão.' })),
      );
      create();

      expect(element().querySelector('#vaccines-title')).toBeNull();
      expect(element().querySelector('.sections')).not.toBeNull();
    });
  });
});
