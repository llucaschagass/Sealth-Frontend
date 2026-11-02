import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { AppointmentRequest } from '../../types/appointment.type';
import { AppointmentsService } from './appointments.service';

describe('AppointmentsService', () => {
  const base = `${environment.apiUrl}/appointments`;
  const request: AppointmentRequest = {
    date: '2026-12-01',
    time: '14:30',
    doctor: 'Dra. Souza',
    specialty: 'Ortopedia',
    location: null,
    extraInfo: 'Levar exames',
    reminderMinutes: 60,
  };
  let service: AppointmentsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    });
    service = TestBed.inject(AppointmentsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('cria com POST /create enviando o corpo', () => {
    service.createAppointment(request).subscribe();

    const req = http.expectOne(`${base}/create`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush({ id: 1, ...request, reminderAt: null });
  });

  it('lista com GET /all', () => {
    service.getAllAppointments().subscribe();

    const req = http.expectOne(`${base}/all`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('busca os lembretes em vigor com GET /reminders', () => {
    let result: unknown;

    service.getReminders().subscribe((value) => (result = value));

    const req = http.expectOne(`${base}/reminders`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
    expect(result).toEqual([]);
  });

  it('atualiza com PUT /{id}/update usando extraInfo (não extraInformation)', () => {
    service.updateAppointment(7, request).subscribe();

    const req = http.expectOne(`${base}/7/update`);
    expect(req.request.method).toBe('PUT');
    expect(Object.keys(req.request.body)).toContain('extraInfo');
    expect(Object.keys(req.request.body)).not.toContain('extraInformation');
    req.flush({ id: 7, ...request, reminderAt: null });
  });

  it('cancela com DELETE /{id}/cancel', () => {
    service.cancelAppointment(7).subscribe();

    const req = http.expectOne(`${base}/7/cancel`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
