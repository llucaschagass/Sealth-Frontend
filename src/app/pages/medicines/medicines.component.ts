import { Component, inject } from '@angular/core';
import { SessionService } from '../../core/session.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MedicinesService } from '../../services/medicines.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-medicines',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './medicines.component.html',
  styleUrl: './medicines.component.scss'
})
export class MedicinesComponent {
  private readonly session = inject(SessionService);
  username: string = '';
  medicines: string[] = [];
  selectedMedicine: string = '';

  constructor(private router: Router, private medicinesService: MedicinesService) {}

  ngOnInit(): void {
    this.getMedicines()
    this.getUsernameFromLocalStorage();
  }
  
  redirectToHome(): void {
    this.router.navigate(['/home']);
    this.getMedicines();
  }

  confirmLogout(): void {
    Swal.fire({
      title: 'Você tem certeza?',
      text: 'Deseja realmente sair?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#046B46',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Certeza',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.session.logout();
      }
    });
  }

  getMedicines(): void {
    this.medicinesService.getMedicinesPDFs().subscribe(
      (medicines: string[]) => {
        this.medicines = medicines;
      },
      (error) => {
        console.error('Error fetching medicines:', error);
      }
    );
  }

  selectMedicine(medicine: string): void {
    this.selectedMedicine = medicine;
  }

  downloadPDF(medicine: string, event: Event): void {
    event.preventDefault(); // Prevenir o comportamento padrão do clique
    const lowercaseMedicine = medicine.toLowerCase(); 
    const pdfUrl = `/assets/pdf/${lowercaseMedicine}.pdf`;
    window.open(pdfUrl, '_blank'); // Abre o PDF em uma nova aba
  }
  
  getUsernameFromLocalStorage(): void {
    this.username = this.session.firstName;
  }
}
