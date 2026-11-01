import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Appointment, AppointmentRequest } from '../../types/appointment.type';

@Injectable({ providedIn: 'root' })
export class AppointmentsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/appointments`;

  createAppointment(data: AppointmentRequest): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.apiUrl}/create`, data);
  }

  getAllAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/all`);
  }

  updateAppointment(id: number, data: AppointmentRequest): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/${id}/update`, data);
  }

  cancelAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/cancel`);
  }
}
