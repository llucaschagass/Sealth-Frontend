import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  VaccinationOverview,
  VaccinationRecord,
  VaccinationRecordRequest,
  Vaccine,
} from '../../types/vaccine.type';

@Injectable({ providedIn: 'root' })
export class VaccinesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/vaccines`;

  /** Calendário completo com a situação de cada vacina para o usuário. */
  getOverview(): Observable<VaccinationOverview> {
    return this.http.get<VaccinationOverview>(this.apiUrl);
  }

  /** Só o que pede atenção (reforço vencido, esquema incompleto ou reforço próximo), do mais urgente. */
  getAlerts(): Observable<Vaccine[]> {
    return this.http.get<Vaccine[]>(`${this.apiUrl}/alerts`);
  }

  /** Doses registradas, da mais recente para a mais antiga. */
  getRecords(): Observable<VaccinationRecord[]> {
    return this.http.get<VaccinationRecord[]>(`${this.apiUrl}/records`);
  }

  addRecord(request: VaccinationRecordRequest): Observable<VaccinationRecord> {
    return this.http.post<VaccinationRecord>(`${this.apiUrl}/records`, request);
  }

  deleteRecord(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/records/${id}`);
  }
}
