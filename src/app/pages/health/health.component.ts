import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppShellComponent } from '../../components/app-shell/app-shell.component';
import { TextFieldComponent } from '../../components/text-field/text-field.component';
import { numberBetween } from '../../core/validators';
import { HealthService } from '../../services/health.service';
import { ApiError } from '../../../types/api-error.type';
import {
  HEALTH_LIMITS,
  Sex,
  calculateHealth,
  formatDecimal,
  normalizeSex,
  parseHealthInput,
} from './health-calculator';

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

  readonly form = inject(NonNullableFormBuilder).group({
    weight: ['', [Validators.required, numberBetween(...minMax(HEALTH_LIMITS.weightKg))]],
    height: ['', [Validators.required, numberBetween(...minMax(HEALTH_LIMITS.heightCm))]],
    age: ['', [Validators.required, numberBetween(...minMax(HEALTH_LIMITS.age))]],
    sex: ['masculino' as Sex, Validators.required],
  });

  private readonly changes = toSignal(this.form.valueChanges);

  /** Resultados recalculados a cada alteração; nulo enquanto houver campo inválido. */
  readonly result = computed(() => {
    this.changes(); // dependência: o computed só reavalia quando o formulário muda
    const input = parseHealthInput(this.form.getRawValue());
    return input ? calculateHealth(input) : null;
  });

  ngOnInit(): void {
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
