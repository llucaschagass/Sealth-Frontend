import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HealthDefaultsResponse } from '../../types/health-response.type';
import { HealthRecord, HealthRecordRequest } from '../../types/health-record.type';

@Injectable({ providedIn: 'root' })
export class HealthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/health`;

  getHealthDefaults(): Observable<HealthDefaultsResponse> {
    return this.http.get<HealthDefaultsResponse>(`${this.apiUrl}/defaults`);
  }

  /** Histórico do usuário, da medição mais recente para a mais antiga. */
  getRecords(): Observable<HealthRecord[]> {
    return this.http.get<HealthRecord[]>(`${this.apiUrl}/records`);
  }

  createRecord(request: HealthRecordRequest): Observable<HealthRecord> {
    return this.http.post<HealthRecord>(`${this.apiUrl}/records`, request);
  }

  deleteRecord(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/records/${id}`);
  }
}
