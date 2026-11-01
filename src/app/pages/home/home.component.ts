import { Component, OnInit, inject } from '@angular/core';
import { SessionService } from '../../core/session.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private readonly session = inject(SessionService);

  username: string = '';
  

  constructor(private router: Router) { }

  
  ngOnInit(): void {
    this.getUsernameFromLocalStorage();
  }
  
  
  openInfoComponent() {
    this.router.navigate(['/info']);
  }
  openConfigComponent(){
    this.router.navigate(['/config']);
  }
  openHealthComponent(){
    this.router.navigate(['/health']);
  }
  openAppointmentsComponent(){
    this.router.navigate(['/appointment']);
  }
  openMedicinesComponent(){
    this.router.navigate(['/medicines']);
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

    
  getUsernameFromLocalStorage(): void {
    this.username = this.session.firstName;
  }
}
