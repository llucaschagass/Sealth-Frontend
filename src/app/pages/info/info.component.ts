import { Component, inject } from '@angular/core';
import { SessionService } from '../../core/session.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [],
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss'
})
export class InfoComponent {
  private readonly session = inject(SessionService);
  constructor(private router: Router) {}
  
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

  username: string = '';
  
  ngOnInit(): void {
    this.getUsernameFromLocalStorage();
  }
  
  getUsernameFromLocalStorage(): void {
    this.username = this.session.firstName;
  }

}
