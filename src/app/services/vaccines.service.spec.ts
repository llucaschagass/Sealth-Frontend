import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { VaccinesService } from './vaccines.service';

describe('VaccinesService', () => {
  const base = `${environment.apiUrl}/vaccines`;
  let service: VaccinesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    });
    service = TestBed.inject(VaccinesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('busca o calendário com GET /vaccines', () => {
    let result: unknown;

    service.getOverview().subscribe((value) => (result = value));

    const req = http.expectOne(base);
    expect(req.request.method).toBe('GET');
    req.flush({ ageYears: 30, vaccines: [] });
    expect(result).toEqual({ ageYears: 30, vaccines: [] });
  });

  it('busca os alertas com GET /vaccines/alerts', () => {
    service.getAlerts().subscribe();

    const req = http.expectOne(`${base}/alerts`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('lista as doses com GET /vaccines/records', () => {
    service.getRecords().subscribe();

    const req = http.expectOne(`${base}/records`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('registra uma dose com POST /vaccines/records', () => {
    const body = { vaccineCode: 'influenza', takenAt: '2026-04-10' };
    let result: unknown;

    service.addRecord(body).subscribe((value) => (result = value));

    const req = http.expectOne(`${base}/records`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    const saved = { id: 1, ...body, vaccineName: 'Gripe (influenza)' };
    req.flush(saved);
    expect(result).toEqual(saved);
  });

  it('remove uma dose com DELETE /vaccines/records/{id}', () => {
    service.deleteRecord(5).subscribe();

    const req = http.expectOne(`${base}/records/5`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
