import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { MedicinesService } from './medicines.service';

describe('MedicinesService', () => {
  it('busca a lista com GET /medicines/pdf', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const http = TestBed.inject(HttpTestingController);
    let result: string[] = [];

    TestBed.inject(MedicinesService)
      .getMedicinesPDFs()
      .subscribe((value) => (result = value));

    const req = http.expectOne(`${environment.apiUrl}/medicines/pdf`);
    expect(req.request.method).toBe('GET');
    req.flush(['Paracetamol']);
    expect(result).toEqual(['Paracetamol']);
    http.verify();
  });
});
