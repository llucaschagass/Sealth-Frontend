import { Component, OnInit, inject } from '@angular/core';
import { SessionService } from '../../core/session.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { HealthService } from '../../services/health.service';
import { HealthDefaultsResponse } from '../../../types/health-response.type';
import { ApiError } from '../../../types/api-error.type';

@Component({
  selector: 'app-health',
  standalone: true,
  templateUrl: './health.component.html',
  styleUrls: ['./health.component.scss']
})
export class HealthComponent implements OnInit {
  private readonly session = inject(SessionService);
  userPeso: number = 0; 
  userAltura: number = 0; 
  userIdade: number = 0; 
  userSexo: string = ''; 
  userImc: number = 0; 
  aguaRecomendada: number = 0; 
  caloriasDiarias: number = 0; 
  pesoIdeal: number = 0;
  userImcEvaluation: string = "";
  userWeightStatus: string = "";

  constructor(private router: Router, private healthService: HealthService) {}

  ngOnInit(): void {
    this.getHealthDefaults();
    this.getUsernameFromLocalStorage();
  }

  getHealthDefaults(): void {
    this.healthService.getHealthDefaults().subscribe({
      next: (defaults: HealthDefaultsResponse) => {
        this.userPeso = defaults.weight;
        this.userAltura = defaults.height;
        this.userIdade = defaults.age;
        this.userSexo = defaults.sex;
        this.updateCalculations();
      },
      error: (error: ApiError) => {
        Swal.fire({
          title: 'Erro',
          text: error.message,
          icon: 'error',
          confirmButtonColor: '#046B46',
        });
      },
    });
  }

  updateCalculations(): void {
    this.calcularImc();
    this.calcularAguaRecomendada();
    this.calcularCaloriasDiarias();
    this.calcularPesoIdeal();
    this.avaliarIMC();
    this.avaliarPeso();
  }

  calcularImc(): void {
    this.userImc = this.userPeso / (this.userAltura * this.userAltura);
  }

  calcularAguaRecomendada(): void {
    if (this.userSexo === 'masculino') {
      this.aguaRecomendada = (this.userPeso * 35) /1000;
    } else {
      this.aguaRecomendada = (this.userPeso * 31) /1000;
    }
  }

  calcularCaloriasDiarias(): void {
    if (this.userSexo === 'masculino') {
        this.caloriasDiarias = 88.362 + (13.397 * this.userPeso) + (4.799 * this.userAltura * 100) - (5.677 * this.userIdade);
    } else {
        this.caloriasDiarias = 447.593 + (9.247 * this.userPeso) + (3.098 * this.userAltura * 100) - (4.330 * this.userIdade);
    }
    this.caloriasDiarias = this.caloriasDiarias / 1000; 
  }

  calcularPesoIdeal(): void {
    if (this.userSexo === 'masculino') {
      this.pesoIdeal = (this.userAltura * 100 - 100) * 0.9;
    } else {
      this.pesoIdeal = (this.userAltura * 100 - 110) * 0.9;
    }
  }

  avaliarIMC(): void {
    if (this.userImc < 18.5) {
      this.userImcEvaluation = "Abaixo do Peso";
    } else if (this.userImc >= 18.5 && this.userImc < 25) {
      this.userImcEvaluation = "Peso Normal";
    } else if (this.userImc >= 25 && this.userImc < 30) {
      this.userImcEvaluation = "Sobrepeso";
    } else {
      this.userImcEvaluation = "Obesidade";
    }
  }

  avaliarPeso(): void {
    if (this.userPeso < 60) {
      this.userWeightStatus = "Abaixo do Peso Ideal";
    } else if (this.userPeso >= 60 && this.userPeso <= 80) {
      this.userWeightStatus = "Peso Ideal";
    } else {
      this.userWeightStatus = "Acima do Peso Ideal";
    }
  }

  username: string = '';

  getUsernameFromLocalStorage(): void {
    this.username = this.session.firstName;
  }

  redirectToHome(): void {
    this.router.navigate(['/home']);
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
}
