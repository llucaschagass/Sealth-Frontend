import { NgTemplateOutlet } from '@angular/common';
import { Component, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AppShellComponent } from '../../components/app-shell/app-shell.component';
import { IconComponent } from '../../components/icon/icon.component';
import { ModalComponent } from '../../components/modal/modal.component';
import {
  SelectFieldComponent,
  SelectOption,
} from '../../components/select-field/select-field.component';
import { TextFieldComponent } from '../../components/text-field/text-field.component';
import { todayIso } from '../../core/dates';
import { applyServerErrors } from '../../core/form-errors';
import { VaccinesService } from '../../services/vaccines.service';
import { ApiError } from '../../../types/api-error.type';
import {
  VaccinationOverview,
  VaccinationRecord,
  Vaccine,
  VaccineStatus,
} from '../../../types/vaccine.type';
import { STATUS_LABELS, dosesSummary, formatDate, groupVaccines } from './vaccine-status';

/** A dose já foi tomada, então a data não pode estar no futuro (datas ISO comparam como texto). */
const notInFuture: ValidatorFn = (control) =>
  String(control.value ?? '') > todayIso() ? { future: true } : null;

@Component({
  selector: 'app-vaccines',
  imports: [
    NgTemplateOutlet,
    ReactiveFormsModule,
    RouterLink,
    AppShellComponent,
    IconComponent,
    ModalComponent,
    SelectFieldComponent,
    TextFieldComponent,
  ],
  templateUrl: './vaccines.component.html',
  styleUrl: './vaccines.component.scss',
})
export class VaccinesComponent implements OnInit {
  private readonly vaccinesService = inject(VaccinesService);

  @ViewChild('doseModal', { static: true }) private doseModal!: ModalComponent;
  @ViewChild('deleteModal', { static: true }) private deleteModal!: ModalComponent;

  readonly overview = signal<VaccinationOverview | null>(null);
  readonly records = signal<VaccinationRecord[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);

  readonly groups = computed(() => groupVaccines(this.overview()?.vaccines ?? []));
  readonly vaccineOptions = computed<SelectOption[]>(() => [
    { value: '', label: 'Selecione a vacina' },
    ...(this.overview()?.vaccines ?? []).map((v) => ({ value: v.code, label: v.name })),
  ]);

  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);

  readonly toDelete = signal<VaccinationRecord | null>(null);
  readonly deleting = signal(false);
  readonly deleteError = signal<string | null>(null);

  readonly statusLabel = (status: VaccineStatus): string => STATUS_LABELS[status];
  readonly dosesSummary = dosesSummary;
  readonly formatDate = formatDate;

  readonly form = inject(NonNullableFormBuilder).group({
    vaccineCode: ['', Validators.required],
    takenAt: ['', [Validators.required, notInFuture]],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.fetch(() => this.loading.set(false));
  }

  openDose(vaccine?: Vaccine): void {
    this.form.reset({ vaccineCode: vaccine?.code ?? '', takenAt: '' });
    this.formError.set(null);
    this.doseModal.open();
  }

  closeDose(): void {
    this.doseModal.close();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.formError.set(null);
    this.vaccinesService.addRecord(this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.doseModal.close();
        // a situação de cada vacina é calculada pelo backend, então recarrega tudo
        this.fetch();
      },
      error: (error: ApiError) => {
        this.saving.set(false);
        this.formError.set(applyServerErrors(this.form, error));
      },
    });
  }

  askDelete(record: VaccinationRecord): void {
    this.toDelete.set(record);
    this.deleteError.set(null);
    this.deleteModal.open();
  }

  closeDelete(): void {
    this.deleteModal.close();
  }

  confirmDelete(): void {
    const target = this.toDelete();
    if (!target) {
      return;
    }

    this.deleting.set(true);
    this.vaccinesService.deleteRecord(target.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteModal.close();
        this.fetch();
      },
      error: (error: ApiError) => {
        this.deleting.set(false);
        this.deleteError.set(error.message);
      },
    });
  }

  private fetch(done?: () => void): void {
    forkJoin({
      overview: this.vaccinesService.getOverview(),
      records: this.vaccinesService.getRecords(),
    }).subscribe({
      next: ({ overview, records }) => {
        this.overview.set(overview);
        this.records.set(records);
        done?.();
      },
      error: (error: ApiError) => {
        this.loadError.set(error.message);
        done?.();
      },
    });
  }
}
