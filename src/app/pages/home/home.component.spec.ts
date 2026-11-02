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

  describe('avisos', () => {
    const notices = () => Array.from(element().querySelectorAll<HTMLAnchorElement>('a.notice'));

    it('não mostra o painel quando não há nada que peça atenção', () => {
      create();

      expect(element().querySelector('.notices')).toBeNull();
    });

    it('mostra a consulta com lembrete em vigor, com link para as consultas', () => {
      service.getReminders.and.returnValue(of([reminder]));
      create();

      const [item] = notices();
      expect(item.textContent).toContain('Consulta com Dra. Souza');
      expect(item.textContent).toContain('Ortopedia');
      expect(item.textContent).toContain('1 de dezembro às 14:30');
      expect(item.getAttribute('href')).toBe('/appointment');
      expect(item.getAttribute('data-tone')).toBe('info');
    });

    it('mostra a vacina que pede atenção, com link para o calendário', () => {
      vaccines.getAlerts.and.returnValue(of([vaccineAlert]));
      create();

      const [item] = notices();
      expect(item.textContent).toContain('Difteria e tétano (dT)');
      expect(item.textContent).toContain('Venceu em 01/01/2025');
      expect(item.textContent).toContain('Reforço vencido');
      expect(item.getAttribute('href')).toBe('/vaccines');
      expect(item.getAttribute('data-tone')).toBe('danger');
    });

    it('junta os dois tipos num painel, com a contagem e o mais urgente primeiro', () => {
      service.getReminders.and.returnValue(of([reminder]));
      vaccines.getAlerts.and.returnValue(of([vaccineAlert]));
      create();

      expect(notices().map((a) => a.getAttribute('href'))).toEqual(['/vaccines', '/appointment']);
      expect(element().querySelector('.notices__count')?.textContent).toContain('2');
      expect(element().querySelector('#notices-title')?.textContent).toContain('Quadro de Avisos');
    });

    it('segue sem o painel quando os avisos não carregam', () => {
      service.getReminders.and.returnValue(
        throwError(() => ({ status: 0, message: 'Sem conexão.' })),
      );
      vaccines.getAlerts.and.returnValue(
        throwError(() => ({ status: 0, message: 'Sem conexão.' })),
      );
      create();

      expect(element().querySelector('.notices')).toBeNull();
      expect(element().querySelector('.sections')).not.toBeNull();
    });
  });
});
