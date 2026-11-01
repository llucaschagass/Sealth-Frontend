import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginResponse } from '../../types/login-response.type';
import { SessionService } from '../core/session.service';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap((response) => this.session.start(response)));
  }

  signup(name: string, email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/register`, { name, email, password })
      .pipe(tap((response) => this.session.start(response)));
  }
}
