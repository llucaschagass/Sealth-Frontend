import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { HealthRecord, HealthRecordRequest } from '../../types/health-record.type';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let http: HttpTestingController;
  let service: HealthService;
  const url = `${environment.apiUrl}/health`;
  const record: HealthRecord = {
    id: 1,
    measuredAt: '2026-11-02T12:00:00Z',
    weightKg: 70,
    heightCm: 175,
    age: 30,
    sex: 'masculino',
    systolic: null,
    diastolic: null,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(HealthService);
  });

  afterEach(() => http.verify());

  it('busca os padrões com GET /health/defaults', () => {
    let result: unknown;

    service.getHealthDefaults().subscribe((value) => (result = value));

    const req = http.expectOne(`${url}/defaults`);
    expect(req.request.method).toBe('GET');
    req.flush({ weight: 70, height: 1.75, age: 30, sex: 'masculino' });
    expect(result).toEqual({ weight: 70, height: 1.75, age: 30, sex: 'masculino' });
  });

  it('lista o histórico com GET /health/records', () => {
    let result: unknown;

    service.getRecords().subscribe((value) => (result = value));

    const req = http.expectOne(`${url}/records`);
    expect(req.request.method).toBe('GET');
    req.flush([record]);
    expect(result).toEqual([record]);
  });

  it('registra uma medição com POST /health/records', () => {
    const body: HealthRecordRequest = {
      weightKg: 70,
      heightCm: 175,
      age: 30,
      sex: 'masculino',
      systolic: 120,
      diastolic: 80,
    };
    let result: unknown;

    service.createRecord(body).subscribe((value) => (result = value));

    const req = http.expectOne(`${url}/records`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(record);
    expect(result).toEqual(record);
  });

  it('remove uma medição com DELETE /health/records/{id}', () => {
    let done = false;

    service.deleteRecord(7).subscribe(() => (done = true));

    const req = http.expectOne(`${url}/records/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
    expect(done).toBeTrue();
  });
});
