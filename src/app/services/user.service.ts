import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UpdateUserRequest, UserResponse } from '../../types/user.type';
import { SessionService } from '../core/session.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);
  private readonly apiUrl = `${environment.apiUrl}/user`;

  getUserData(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/${this.session.userId}`);
  }

  updateUserData(data: UpdateUserRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/update/${this.session.userId}`, data);
  }
}
