import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MedicinesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/medicines`;

  getMedicinesPDFs(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/pdf`);
  }
}
