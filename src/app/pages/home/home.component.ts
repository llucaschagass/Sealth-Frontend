import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppShellComponent } from '../../components/app-shell/app-shell.component';
import { IconComponent } from '../../components/icon/icon.component';
import { SessionService } from '../../core/session.service';
import { AppointmentsService } from '../../services/appointments.service';
import { VaccinesService } from '../../services/vaccines.service';
import { Appointment } from '../../../types/appointment.type';
import { Vaccine } from '../../../types/vaccine.type';
import { buildNotices } from './home-notices';
import { HOME_SECTIONS } from './home-sections';

@Component({
  selector: 'app-home',
  imports: [RouterLink, AppShellComponent, IconComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly vaccinesService = inject(VaccinesService);

  readonly sections = HOME_SECTIONS;
  readonly firstName = inject(SessionService).firstName;

  /** Consultas com lembrete em vigor. É um aviso extra: se falhar, a home segue sem ele. */
  readonly reminders = signal<Appointment[]>([]);

  /** Vacinas que pedem atenção (reforço vencido, esquema incompleto ou reforço próximo). */
  readonly vaccineAlerts = signal<Vaccine[]>([]);

  /** Os dois tipos de aviso num só painel, do mais urgente ao menos. */
  readonly notices = computed(() => buildNotices(this.reminders(), this.vaccineAlerts()));

  ngOnInit(): void {
    this.appointmentsService.getReminders().subscribe({
      next: (reminders) => this.reminders.set(reminders),
      error: () => this.reminders.set([]),
    });
    this.vaccinesService.getAlerts().subscribe({
      next: (alerts) => this.vaccineAlerts.set(alerts),
      error: () => this.vaccineAlerts.set([]),
    });
  }
}
