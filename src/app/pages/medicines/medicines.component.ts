import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
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
import { TextFieldComponent } from '../../components/text-field/text-field.component';
import { applyServerErrors } from '../../core/form-errors';
import { parseTimes, timesList } from '../../core/times';
import { MedicinesService } from '../../services/medicines.service';
import { ApiError } from '../../../types/api-error.type';
import { Medication, MedicationRequest } from '../../../types/medication.type';
import { describePeriod } from './medication-period';
import { medicinePdfUrl } from './medicine-pdf';

interface MedicationFormValue {
  name: string;
  dosage: string;
  times: string;
  startDate: string;
  endDate: string;
  notes: string;
}

const EMPTY_FORM: MedicationFormValue = {
  name: '',
  dosage: '',
  times: '',
  startDate: '',
  endDate: '',
  notes: '',
};

@Component({
  selector: 'app-medicines',
  imports: [
    ReactiveFormsModule,
    AppShellComponent,
    IconComponent,
    ModalComponent,
    TextFieldComponent,
  ],
  templateUrl: './medicines.component.html',
  styleUrl: './medicines.component.scss',
})
export class MedicinesComponent implements OnInit {
  private readonly medicinesService = inject(MedicinesService);

  @ViewChild('formModal', { static: true }) private formModal!: ModalComponent;
  @ViewChild('deleteModal', { static: true }) private deleteModal!: ModalComponent;

  /** Bulas disponíveis para consulta. */
  readonly medicines = signal<string[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly pdfUrl = medicinePdfUrl;

  /** Medicamentos do usuário. */
  readonly mine = signal<Medication[]>([]);
  readonly mineLoading = signal(true);
  readonly mineError = signal<string | null>(null);
  readonly period = describePeriod;

  /** Medicamento em edição; nulo quando o diálogo está cadastrando um novo. */
  readonly editing = signal<Medication | null>(null);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);

  readonly toDelete = signal<Medication | null>(null);
  readonly deleting = signal(false);
  readonly deleteError = signal<string | null>(null);

  readonly form = inject(NonNullableFormBuilder).group(
    {
      name: ['', Validators.required],
      dosage: ['', Validators.required],
      times: ['', timesList],
      startDate: [''],
      endDate: [''],
      notes: [''],
    },
    { validators: periodConsistent },
  );

  ngOnInit(): void {
    this.load();
    this.loadMine();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.medicinesService.getMedicinesPDFs().subscribe({
      next: (medicines) => {
        this.medicines.set(medicines);
        this.loading.set(false);
      },
      error: (error: ApiError) => {
        this.error.set(error.message);
        this.loading.set(false);
      },
    });
  }

  loadMine(): void {
    this.mineLoading.set(true);
    this.mineError.set(null);
    this.medicinesService.getMine().subscribe({
      next: (mine) => {
        this.mine.set(mine);
        this.mineLoading.set(false);
      },
      error: (error: ApiError) => {
        this.mineError.set(error.message);
        this.mineLoading.set(false);
      },
    });
  }

  openCreate(): void {
    this.editing.set(null);
    this.resetForm(EMPTY_FORM);
    this.formModal.open();
  }

  openEdit(medication: Medication): void {
    this.editing.set(medication);
    this.resetForm({
      name: medication.name,
      dosage: medication.dosage,
      times: medication.times.join(', '),
      startDate: medication.startDate ?? '',
      endDate: medication.endDate ?? '',
      notes: medication.notes ?? '',
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
      ? this.medicinesService.updateMedication(editing.id, request)
      : this.medicinesService.createMedication(request);

    this.saving.set(true);
    this.formError.set(null);
    call.subscribe({
      next: () => {
        this.saving.set(false);
        this.formModal.close();
        // a ordem (em uso primeiro) é definida pelo backend, então recarrega a lista
        this.loadMine();
      },
      error: (error: ApiError) => {
        this.saving.set(false);
        this.formError.set(applyServerErrors(this.form, error));
      },
    });
  }

  askDelete(medication: Medication): void {
    this.toDelete.set(medication);
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
    this.medicinesService.deleteMedication(target.id).subscribe({
      next: () => {
        this.mine.update((list) => list.filter((m) => m.id !== target.id));
        this.deleting.set(false);
        this.deleteModal.close();
      },
      error: (error: ApiError) => {
        this.deleting.set(false);
        this.deleteError.set(error.message);
      },
    });
  }

  private resetForm(value: MedicationFormValue): void {
    this.form.reset(value);
    this.formError.set(null);
  }

  private toRequest(): MedicationRequest {
    const { name, dosage, times, startDate, endDate, notes } = this.form.getRawValue();
    return {
      name: name.trim(),
      dosage: dosage.trim(),
      times: parseTimes(times) ?? [],
      startDate: startDate || null,
      endDate: endDate || null,
      notes: notes.trim() || null,
    };
  }
}

/** A data de término não pode ser anterior à de início (datas ISO comparam como texto). */
function periodConsistent(group: AbstractControl): ValidationErrors | null {
  const start = String(group.get('startDate')?.value ?? '');
  const end = String(group.get('endDate')?.value ?? '');
  return start && end && end < start
    ? { period: 'A data de término não pode ser anterior à data de início' }
    : null;
}
