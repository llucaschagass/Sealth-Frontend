import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { HealthService } from './health.service';

describe('HealthService', () => {
  it('busca os padrões com GET /health/defaults', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    });
    const http = TestBed.inject(HttpTestingController);
    let result: unknown;

    TestBed.inject(HealthService)
      .getHealthDefaults()
      .subscribe((value) => (result = value));

    const req = http.expectOne(`${environment.apiUrl}/health/defaults`);
    expect(req.request.method).toBe('GET');
    req.flush({ weight: 70, height: 1.75, age: 30, sex: 'masculino' });
    expect(result).toEqual({ weight: 70, height: 1.75, age: 30, sex: 'masculino' });
    http.verify();
  });
});
