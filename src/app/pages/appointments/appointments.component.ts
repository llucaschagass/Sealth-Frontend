import { Component, OnInit, inject } from '@angular/core';
import { SessionService } from '../../core/session.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AppointmentsService } from '../../services/appointments.service';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.scss']
})
export class AppointmentsComponent implements OnInit {
  private readonly session = inject(SessionService);
  username: string = '';
  appointments: any[] = [];
  selectedAppointment: any = null;

  constructor(private router: Router, private appointmentsService: AppointmentsService) {}

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

  ngOnInit(): void {
    this.getUsernameFromLocalStorage();
    this.getAllAppointments();
  }

  getUsernameFromLocalStorage(): void {
    this.username = this.session.firstName;
  }

  getAllAppointments(): void {
    this.appointmentsService.getAllAppointments().subscribe(
      appointments => {
        this.appointments = appointments.map(appointment => {
          const parts = appointment.date.split('-');
          const year = parts[0];
          const month = parts[1];
          const day = parts[2];
          return {
            ...appointment,
            date: `${day}/${month}/${year}`
          };
        });
      },
      error => {
        console.error('Erro ao obter agendamentos:', error);
      }
    );
  }

  selectAppointment(appointment: any): void {
    this.selectedAppointment = appointment;
  }

  cancelAppointment(): void {
    if (this.selectedAppointment) {
      Swal.fire({
        title: 'Cancelar Consulta',
        text: 'Tem certeza que deseja cancelar a consulta selecionada?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#046B46',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não'
      }).then((result) => {
        if (result.isConfirmed) {
          this.appointmentsService.cancelAppointment(this.selectedAppointment.id).subscribe(
            () => {
              console.log('Consulta cancelada:', this.selectedAppointment);
              this.getAllAppointments();
              Swal.fire({
                title: 'Sucesso',
                text: 'Consulta cancelada com sucesso!',
                icon: 'success',
                confirmButtonColor: '#046B46',
                confirmButtonText: 'Ok',
              });
            },
            error => {
              console.error('Erro ao cancelar consulta:', error);
              Swal.fire({
                title: 'Erro',
                text: 'Ocorreu um erro ao cancelar a consulta.',
                icon: 'error',
                confirmButtonColor: '#046B46',
                confirmButtonText: 'OK'
              });
            }
          );
        }
      });
    } else {
      Swal.fire({
        title: 'Nenhuma Consulta Selecionada',
        text: 'Favor selecionar uma consulta antes de cancelar.',
        icon: 'error',
        confirmButtonColor: '#046B46',
        confirmButtonText: 'OK'
      });
    }
  }

  updateAppointment(): void {
    if (this.selectedAppointment) {
      Swal.fire({
        title: 'Atualizar Consulta',
        html: `
          <input id="doctor" class="swal2-input" placeholder="Médico" value="${this.selectedAppointment.doctor}">
          <input id="specialty" class="swal2-input" placeholder="Especialidade" value="${this.selectedAppointment.specialty}">
          <input id="date" class="swal2-input" placeholder="Data" value="${this.selectedAppointment.date}">
          <input id="location" class="swal2-input" placeholder="Local" value="${this.selectedAppointment.location ?? ''}">
          <input id="extraInfo" class="swal2-input" placeholder="Informações Extras" value="${this.selectedAppointment.extraInfo ?? ''}">
        `,
        showCancelButton: true,
        confirmButtonColor: '#046B46',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        showLoaderOnConfirm: true,
        preConfirm: () => {
          const doctor = (document.getElementById('doctor') as HTMLInputElement).value;
          const specialty = (document.getElementById('specialty') as HTMLInputElement).value;
          const date = (document.getElementById('date') as HTMLInputElement).value;
          const location = (document.getElementById('location') as HTMLInputElement).value;
          const extraInfo = (document.getElementById('extraInfo') as HTMLInputElement).value;

          const parts = date.split('/');
          const day = parts[0];
          const month = parts[1];
          const year = parts[2];
          const formattedDate = `${year}-${month}-${day}`;
          const updatedData = {
            doctor,
            specialty,
            date: formattedDate,
            location,
            extraInfo
          };
  
          return this.appointmentsService.updateAppointment(this.selectedAppointment.id, updatedData).toPromise();
        }
      }).then((result) => {
        if (result.isConfirmed) {
          console.log('Consulta atualizada com sucesso!');
          this.getAllAppointments();
          Swal.fire({
            title: 'Sucesso',
            text: 'Consulta atualizada com sucesso!',
            icon: 'success',
            confirmButtonColor: '#046B46',
            confirmButtonText: 'Ok',
          });
        }
      }).catch((error) => {
        console.error('Erro ao atualizar consulta:', error);
        Swal.fire({
          title: 'Erro',
          text: 'Erro ao atualizar consulta. Por favor, tente novamente.',
          icon: 'error',
          confirmButtonColor: '#046B46',
          confirmButtonText: 'Ok',
        });
      });
    } else {
      Swal.fire({
        title: 'Nenhuma Consulta Selecionada',
        text: 'Favor selecionar uma consulta antes de atualizar.',
        icon: 'error',
        confirmButtonColor: '#046B46',
        confirmButtonText: 'OK'
      });
    }
  }
  
  createAppointment(): void {
    Swal.fire({
      title: 'Nova Consulta',
      html: `
        <input id="doctor" class="swal2-input" placeholder="Médico">
        <input id="specialty" class="swal2-input" placeholder="Especialidade">
        <input id="date" class="swal2-input" placeholder="Data">
        <input id="location" class="swal2-input" placeholder="Local">
        <input id="extraInfo" class="swal2-input" placeholder="Informações Extras">
      `,
      showCancelButton: true,
      confirmButtonColor: '#046B46',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      preConfirm: () => {
        const doctor = (document.getElementById('doctor') as HTMLInputElement).value;
        const specialty = (document.getElementById('specialty') as HTMLInputElement).value;
        const date = (document.getElementById('date') as HTMLInputElement).value;
        const location = (document.getElementById('location') as HTMLInputElement).value;
        const extraInfo = (document.getElementById('extraInfo') as HTMLInputElement).value;
  
        const parts = date.split('/'); 
        const day = parts[0]; 
        const month = parts[1]; 
        const year = parts[2]; 
        const formattedDate = `${year}-${month}-${day}`; 
  
        const appointmentData = {
          doctor,
          specialty,
          date: formattedDate, 
          location,
          extraInfo
        };
  
        return this.appointmentsService.createAppointment(appointmentData).toPromise();
      }
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Consulta criada com sucesso!');
        this.getAllAppointments();
        Swal.fire({
          title: 'Sucesso',
          text: 'Consulta criada com sucesso!',
          icon: 'success',
          confirmButtonColor: '#046B46',
          confirmButtonText: 'Ok',
        });
      }
    }).catch((error) => {
      console.error('Erro ao criar consulta:', error);
      Swal.fire({
        title: 'Erro',
        text: 'Erro ao criar consulta. Por favor, tente novamente.',
        icon: 'error',
        confirmButtonColor: '#046B46',
        confirmButtonText: 'Ok',
      });
    });
  }
}