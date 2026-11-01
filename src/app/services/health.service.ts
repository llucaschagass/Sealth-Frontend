import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HealthDefaultsResponse } from '../../types/health-response.type';

@Injectable({ providedIn: 'root' })
export class HealthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/health`;

  getHealthDefaults(): Observable<HealthDefaultsResponse> {
    return this.http.get<HealthDefaultsResponse>(`${this.apiUrl}/defaults`);
  }
}
