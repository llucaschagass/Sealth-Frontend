import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../../../components/icon/icon.component';
import { Appointment } from '../../../../types/appointment.type';
import { dateParts, longDate } from '../appointment-groups';
import { reminderLabel } from '../appointment-reminder';

@Component({
  selector: 'app-appointment-card',
  imports: [IconComponent],
  templateUrl: './appointment-card.component.html',
  styleUrl: './appointment-card.component.scss',
})
export class AppointmentCardComponent {
  @Input({ required: true }) appointment!: Appointment;
  /** Consultas passadas aparecem esmaecidas. */
  @Input() past = false;
  @Output() editRequest = new EventEmitter<Appointment>();
  @Output() cancelRequest = new EventEmitter<Appointment>();

  readonly dateParts = dateParts;
  readonly longDate = longDate;
  readonly reminderLabel = reminderLabel;

  get description(): string {
    return `consulta com ${this.appointment.doctor} em ${longDate(this.appointment.date)}`;
  }
}
