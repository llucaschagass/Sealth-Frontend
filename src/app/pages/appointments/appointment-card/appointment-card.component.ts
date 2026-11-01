import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../../../components/icon/icon.component';
import { Appointment } from '../../../../types/appointment.type';
import { dateParts, longDate } from '../appointment-groups';

@Component({
  selector: 'app-appointment-card',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './appointment-card.component.html',
  styleUrl: './appointment-card.component.scss',
})
export class AppointmentCardComponent {
  @Input({ required: true }) appointment!: Appointment;
  /** Consultas passadas aparecem esmaecidas. */
  @Input() past = false;
  @Output() edit = new EventEmitter<Appointment>();
  @Output() cancel = new EventEmitter<Appointment>();

  readonly dateParts = dateParts;
  readonly longDate = longDate;

  get description(): string {
    return `consulta com ${this.appointment.doctor} em ${longDate(this.appointment.date)}`;
  }
}
