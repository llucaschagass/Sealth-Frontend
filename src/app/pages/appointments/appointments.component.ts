import { Component, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AppShellComponent } from '../../components/app-shell/app-shell.component';
import { IconComponent } from '../../components/icon/icon.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { SelectFieldComponent } from '../../components/select-field/select-field.component';
import { TextFieldComponent } from '../../components/text-field/text-field.component';
import { applyServerErrors } from '../../core/form-errors';
import { AppointmentsService } from '../../services/appointments.service';
import { ApiError } from '../../../types/api-error.type';
import { Appointment, AppointmentRequest } from '../../../types/appointment.type';
import { AppointmentCardComponent } from './appointment-card/appointment-card.component';
import { groupAppointments, longDate } from './appointment-groups';
import { REMINDER_OPTIONS, reminderOptionsFor } from './appointment-reminder';

interface AppointmentFormValue {
  date: string;
  time: string;
  doctor: string;
  specialty: string;
  location: string;
  extraInfo: string;
  /** Antecedência do lembrete em minutos, como texto; vazio significa sem lembrete. */
  reminder: string;
}

@Component({
  selector: 'app-appointments',
  imports: [
    ReactiveFormsModule,
    AppShellComponent,
    AppointmentCardComponent,
    IconComponent,
    ModalComponent,
    SelectFieldComponent,
    TextFieldComponent,
  ],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.scss',
})
export class AppointmentsComponent implements OnInit {
  private readonly appointmentsService = inject(AppointmentsService);

  @ViewChild('formModal', { static: true }) private formModal!: ModalComponent;
  @ViewChild('cancelModal', { static: true }) private cancelModal!: ModalComponent;

  readonly appointments = signal<Appointment[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly groups = computed(() => groupAppointments(this.appointments()));

  /** Consulta em edição; nulo quando o diálogo está criando uma nova. */
  readonly editing = signal<Appointment | null>(null);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);

  readonly toCancel = signal<Appointment | null>(null);
  readonly cancelling = signal(false);
  readonly cancelError = signal<string | null>(null);

  readonly longDate = longDate;
  readonly reminderOptions = signal(REMINDER_OPTIONS);

  readonly form = inject(NonNullableFormBuilder).group(
    {
      date: ['', Validators.required],
      time: [''],
      doctor: ['', Validators.required],
      specialty: ['', Validators.required],
      location: [''],
      extraInfo: [''],
      reminder: [''],
    },
    { validators: reminderNeedsTime },
  );

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.appointmentsService.getAllAppointments().subscribe({
      next: (appointments) => {
        this.appointments.set(appointments);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.loadError.set(error.message);
        this.loading.set(false);
      },
    });
  }

  openCreate(): void {
    this.editing.set(null);
    this.reminderOptions.set(REMINDER_OPTIONS);
    this.resetForm({
      date: '',
      time: '',
      doctor: '',
      specialty: '',
      location: '',
      extraInfo: '',
      reminder: '',
    });
    this.formModal.open();
  }

  openEdit(appointment: Appointment): void {
    this.editing.set(appointment);
    this.reminderOptions.set(reminderOptionsFor(appointment.reminderMinutes));
    this.resetForm({
      date: appointment.date,
      time: appointment.time ?? '',
      doctor: appointment.doctor,
      specialty: appointment.specialty,
      location: appointment.location ?? '',
      extraInfo: appointment.extraInfo ?? '',
      reminder: appointment.reminderMinutes === null ? '' : String(appointment.reminderMinutes),
    });
    this.formModal.open();
  }

  closeForm(): void {
    this.formModal.close();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const editing = this.editing();
    const request = this.toRequest();
    const call = editing
      ? this.appointmentsService.updateAppointment(editing.id, request)
      : this.appointmentsService.createAppointment(request);

    this.saving.set(true);
    this.formError.set(null);
    call.subscribe({
      next: (saved) => {
        this.appointments.update((list) =>
          editing ? list.map((a) => (a.id === saved.id ? saved : a)) : [...list, saved],
        );
        this.saving.set(false);
        this.formModal.close();
      },
      error: (error: ApiError) => {
        this.saving.set(false);
        this.formError.set(applyServerErrors(this.form, error));
      },
    });
  }

  askCancel(appointment: Appointment): void {
    this.toCancel.set(appointment);
    this.cancelError.set(null);
    this.cancelModal.open();
  }

  closeCancel(): void {
    this.cancelModal.close();
  }

  confirmCancel(): void {
    const target = this.toCancel();
    if (!target) {
      return;
    }

    this.cancelling.set(true);
    this.appointmentsService.cancelAppointment(target.id).subscribe({
      next: () => {
        this.appointments.update((list) => list.filter((a) => a.id !== target.id));
        this.cancelling.set(false);
        this.cancelModal.close();
      },
      error: (error: ApiError) => {
        this.cancelling.set(false);
        this.cancelError.set(error.message);
      },
    });
  }

  private resetForm(value: AppointmentFormValue): void {
    this.form.reset(value);
    this.formError.set(null);
  }

  private toRequest(): AppointmentRequest {
    const { date, time, doctor, specialty, location, extraInfo, reminder } =
      this.form.getRawValue();
    return {
      date,
      time: time || null,
      doctor: doctor.trim(),
      specialty: specialty.trim(),
      location: location.trim() || null,
      extraInfo: extraInfo.trim() || null,
      reminderMinutes: reminder === '' ? null : Number(reminder),
    };
  }
}

/** O lembrete é calculado a partir do horário, então só vale quando ele é informado. */
function reminderNeedsTime(group: AbstractControl): ValidationErrors | null {
  const time = String(group.get('time')?.value ?? '');
  const reminder = String(group.get('reminder')?.value ?? '');
  return reminder !== '' && time === ''
    ? { reminder: 'Informe o horário da consulta para usar o lembrete' }
    : null;
}
