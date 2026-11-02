import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { Medication, MedicationRequest } from '../../types/medication.type';
import { MedicinesService } from './medicines.service';

describe('MedicinesService', () => {
  let http: HttpTestingController;
  let service: MedicinesService;
  const url = `${environment.apiUrl}/medicines`;
  const medication: Medication = {
    id: 1,
    name: 'Losartana',
    dosage: '50 mg',
    times: ['08:00'],
    startDate: null,
    endDate: null,
    notes: null,
    active: true,
  };
  const request: MedicationRequest = {
    name: 'Losartana',
    dosage: '50 mg',
    times: ['08:00'],
    startDate: null,
    endDate: null,
    notes: null,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(MedicinesService);
  });

  afterEach(() => http.verify());

  it('busca a lista de bulas com GET /medicines/pdf', () => {
    let result: string[] = [];

    service.getMedicinesPDFs().subscribe((value) => (result = value));

    const req = http.expectOne(`${url}/pdf`);
    expect(req.request.method).toBe('GET');
    req.flush(['Paracetamol']);
    expect(result).toEqual(['Paracetamol']);
  });

  it('lista os medicamentos do usuário com GET /medicines/mine', () => {
    let result: Medication[] = [];

    service.getMine().subscribe((value) => (result = value));

    const req = http.expectOne(`${url}/mine`);
    expect(req.request.method).toBe('GET');
    req.flush([medication]);
    expect(result).toEqual([medication]);
  });

  it('cadastra com POST /medicines/mine', () => {
    let result: Medication | undefined;

    service.createMedication(request).subscribe((value) => (result = value));

    const req = http.expectOne(`${url}/mine`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(medication);
    expect(result).toEqual(medication);
  });

  it('atualiza com PUT /medicines/mine/{id}', () => {
    service.updateMedication(4, request).subscribe();

    const req = http.expectOne(`${url}/mine/4`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush(medication);
  });

  it('remove com DELETE /medicines/mine/{id}', () => {
    service.deleteMedication(4).subscribe();

    const req = http.expectOne(`${url}/mine/4`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
