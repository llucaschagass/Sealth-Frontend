import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AppShellComponent } from '../../components/app-shell/app-shell.component';
import { TextFieldComponent } from '../../components/text-field/text-field.component';
import { describeError } from '../../core/api-error';
import { applyServerErrors } from '../../core/form-errors';
import { numberBetween } from '../../core/validators';
import { HealthService } from '../../services/health.service';
import { ApiError } from '../../../types/api-error.type';
import { HealthRecord } from '../../../types/health-record.type';
import {
  HEALTH_LIMITS,
  Sex,
  calculateHealth,
  formatDecimal,
  normalizeSex,
  parseDecimal,
  parseHealthInput,
} from './health-calculator';

const BLOOD_PRESSURE_LIMITS = {
  systolic: { min: 50, max: 300 },
  diastolic: { min: 30, max: 200 },
} as const;

@Component({
  selector: 'app-health',
  imports: [ReactiveFormsModule, AppShellComponent, TextFieldComponent],
  templateUrl: './health.component.html',
  styleUrl: './health.component.scss',
})
export class HealthComponent implements OnInit {
  private readonly healthService = inject(HealthService);

  readonly limits = HEALTH_LIMITS;
  readonly format = formatDecimal;
  readonly loadError = signal<string | null>(null);

  readonly records = signal<HealthRecord[]>([]);
  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly saved = signal(false);
  readonly historyError = signal<string | null>(null);

  readonly form = inject(NonNullableFormBuilder).group(
    {
      weight: ['', [Validators.required, numberBetween(...minMax(HEALTH_LIMITS.weightKg))]],
      height: ['', [Validators.required, numberBetween(...minMax(HEALTH_LIMITS.heightCm))]],
      age: ['', [Validators.required, numberBetween(...minMax(HEALTH_LIMITS.age))]],
      sex: ['masculino' as Sex, Validators.required],
      systolic: ['', numberBetween(...minMax(BLOOD_PRESSURE_LIMITS.systolic))],
      diastolic: ['', numberBetween(...minMax(BLOOD_PRESSURE_LIMITS.diastolic))],
    },
    { validators: bloodPressureConsistent },
  );

  private readonly changes = toSignal(this.form.valueChanges);

  /** Resultados recalculados a cada alteração; nulo enquanto houver campo inválido. */
  readonly result = computed(() => {
    this.changes(); // dependência: o computed só reavalia quando o formulário muda
    const input = parseHealthInput(this.form.getRawValue());
    return input ? calculateHealth(input) : null;
  });

  readonly history = computed(() =>
    this.records().map((record) => ({
      ...record,
      bmi: calculateHealth(record).bmi,
      date: new Date(record.measuredAt).toLocaleDateString('pt-BR'),
    })),
  );

  ngOnInit(): void {
    this.healthService.getRecords().subscribe({
      next: (records) => {
        this.records.set(records);
        if (records.length > 0) {
          this.fillFromRecord(records[0]);
        } else {
          this.loadDefaults();
        }
      },
      error: (error: ApiError) => {
        this.loadError.set(error.message);
        this.loadDefaults();
      },
    });
  }

  save(): void {
    this.form.markAllAsTouched();
    const input = parseHealthInput(this.form.getRawValue());
    if (this.form.invalid || !input) {
      return;
    }
    const { systolic, diastolic } = this.form.getRawValue();
    this.saving.set(true);
    this.saveError.set(null);
    this.saved.set(false);
    this.healthService
      .createRecord({
        weightKg: input.weightKg,
        heightCm: input.heightCm,
        age: Math.round(input.age),
        sex: input.sex,
        systolic: systolic.trim() === '' ? null : parseDecimal(systolic),
        diastolic: diastolic.trim() === '' ? null : parseDecimal(diastolic),
      })
      .subscribe({
        next: (record) => {
          this.records.update((records) => [record, ...records]);
          this.saving.set(false);
          this.saved.set(true);
        },
        error: (error: ApiError) => {
          this.saving.set(false);
          this.saveError.set(applyServerErrors(this.form, error));
        },
      });
  }

  remove(id: number): void {
    this.historyError.set(null);
    this.healthService.deleteRecord(id).subscribe({
      next: () => this.records.update((records) => records.filter((record) => record.id !== id)),
      error: (error: unknown) => this.historyError.set(describeError(error)),
    });
  }

  private fillFromRecord(record: HealthRecord): void {
    this.form.patchValue({
      weight: String(record.weightKg),
      height: String(record.heightCm),
      age: String(record.age),
      sex: normalizeSex(record.sex),
      systolic: record.systolic === null ? '' : String(record.systolic),
      diastolic: record.diastolic === null ? '' : String(record.diastolic),
    });
  }

  /** Sem medições salvas, parte de valores de exemplo do backend. */
  private loadDefaults(): void {
    this.healthService.getHealthDefaults().subscribe({
      next: (defaults) =>
        this.form.patchValue({
          weight: String(defaults.weight),
          height: String(Math.round(defaults.height * 100)),
          age: String(defaults.age),
          sex: normalizeSex(defaults.sex),
        }),
      error: (error: ApiError) => this.loadError.set(error.message),
    });
  }
}

function minMax(limit: { min: number; max: number }): [number, number] {
  return [limit.min, limit.max];
}

/** A pressão arterial é opcional, mas precisa vir completa e com sistólica maior que a diastólica. */
function bloodPressureConsistent(group: AbstractControl): ValidationErrors | null {
  const systolic = String(group.get('systolic')?.value ?? '').trim();
  const diastolic = String(group.get('diastolic')?.value ?? '').trim();
  if (systolic === '' && diastolic === '') {
    return null;
  }
  if (systolic === '' || diastolic === '') {
    return { bloodPressure: 'Informe a pressão sistólica e a diastólica' };
  }
  return parseDecimal(systolic) > parseDecimal(diastolic)
    ? null
    : { bloodPressure: 'A pressão sistólica deve ser maior que a diastólica' };
}
