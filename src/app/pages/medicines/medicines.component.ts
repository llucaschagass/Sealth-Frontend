import { Component, OnInit, inject, signal } from '@angular/core';
import { AppShellComponent } from '../../components/app-shell/app-shell.component';
import { IconComponent } from '../../components/icon/icon.component';
import { MedicinesService } from '../../services/medicines.service';
import { ApiError } from '../../../types/api-error.type';
import { medicinePdfUrl } from './medicine-pdf';

@Component({
  selector: 'app-medicines',
  imports: [AppShellComponent, IconComponent],
  templateUrl: './medicines.component.html',
  styleUrl: './medicines.component.scss',
})
export class MedicinesComponent implements OnInit {
  private readonly medicinesService = inject(MedicinesService);

  readonly medicines = signal<string[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly pdfUrl = medicinePdfUrl;

  ngOnInit(): void {
    this.load();
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
}
