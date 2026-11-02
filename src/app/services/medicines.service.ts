import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Medication, MedicationRequest } from '../../types/medication.type';

@Injectable({ providedIn: 'root' })
export class MedicinesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/medicines`;

  getMedicinesPDFs(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/pdf`);
  }

  /** Medicamentos do usuário: os em uso primeiro, depois os encerrados. */
  getMine(): Observable<Medication[]> {
    return this.http.get<Medication[]>(`${this.apiUrl}/mine`);
  }

  createMedication(request: MedicationRequest): Observable<Medication> {
    return this.http.post<Medication>(`${this.apiUrl}/mine`, request);
  }

  updateMedication(id: number, request: MedicationRequest): Observable<Medication> {
    return this.http.put<Medication>(`${this.apiUrl}/mine/${id}`, request);
  }

  deleteMedication(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/mine/${id}`);
  }
}
